import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import jwt from 'jsonwebtoken';

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication via session or JWT token
  let isAuthenticated = false;

  // Check for session first (next-auth)
  const session = await getSession({ req });
  if (session) {
    isAuthenticated = true;
  }
  // If no session, check for JWT token in Authorization header
  else {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET);
        isAuthenticated = true;
      }
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Check authentication
  if (!isAuthenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  await dbConnect();

  // POST - Create a new order
  if (req.method === 'POST') {
    try {
      const {
        customer,
        items,
        shippingAddress,
        billingAddress,
        paymentMethod,
        status = 'Pending',
      } = req.body;

      // Validate input
      if (!customer || !items || items.length === 0) {
        return res.status(400).json({ message: 'Customer and at least one item are required' });
      }

      // Verify customer exists
      const customerExists = await Customer.findById(customer);
      if (!customerExists) {
        return res.status(400).json({ message: 'Customer not found' });
      }

      // Verify products exist and calculate totals
      let subtotal = 0;
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.product} not found` });
        }

        // Check stock
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for product ${product.name}. Available: ${product.stock}`,
          });
        }

        // Update stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity },
        });

        // Add to subtotal
        subtotal += product.price * item.quantity;

        // Add product price to item
        item.price = product.price;
      }

      // Calculate tax and total
      const tax = subtotal * 0.07; // 7% tax example
      const shipping = 10; // Flat shipping fee example
      const totalAmount = subtotal + tax + shipping;

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

      // Create new order
      const newOrder = await Order.create({
        orderNumber,
        customer,
        items,
        subtotal,
        tax,
        shipping,
        totalAmount,
        shippingAddress,
        billingAddress,
        paymentMethod,
        status,
      });

      // Populate customer data for the response
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('customer', 'name email')
        .populate('items.product', 'name sku');

      return res.status(201).json({ order: populatedOrder });
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ message: 'An error occurred while creating the order' });
    }
  }

  // GET - List orders
  if (req.method === 'GET') {
    try {
      console.log('GET /api/orders - Processing request with query:', req.query);

      const {
        page = 1,
        limit = 10,
        q,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      // Validate query parameters
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        console.error('GET /api/orders - Invalid page or limit parameters:', { page, limit });
        return res.status(400).json({
          message: 'Invalid page or limit parameters. Both must be positive numbers.',
        });
      }

      const skip = (pageNum - 1) * limitNum;
      console.log('GET /api/orders - Using pagination:', { pageNum, limitNum, skip });

      // Build query
      const query: any = {};
      if (q) {
        query.$or = [{ orderNumber: { $regex: q, $options: 'i' } }];
      }
      if (status) {
        query.status = status;
      }

      console.log('GET /api/orders - Query filter:', JSON.stringify(query));

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      console.log('GET /api/orders - Sort criteria:', sort);

      // Establish database connection
      await dbConnect();
      console.log('GET /api/orders - Database connected');

      try {
        // Get total count first (separate try/catch for better error isolation)
        const totalCount = await Order.countDocuments(query);
        console.log('GET /api/orders - Total count:', totalCount);

        // Get orders with less data first to ensure it works
        const orders = await Order.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('orderNumber status totalAmount createdAt') // Only select necessary fields
          .lean();

        console.log(`GET /api/orders - Successfully retrieved ${orders.length} orders`);

        // Try populating customer data separately to isolate any reference issues
        const populatedOrders = [];
        for (const order of orders) {
          try {
            // Only populate basic customer info
            const customer = order.customer
              ? await Customer.findById(order.customer).select('name email').lean()
              : null;

            populatedOrders.push({
              ...order,
              customer: customer || { name: 'Unknown', email: 'unknown' },
            });
          } catch (customerError) {
            console.error('GET /api/orders - Error populating customer:', customerError);
            // Continue with unpopulated order
            populatedOrders.push({
              ...order,
              customer: { name: 'Error loading customer', email: '' },
            });
          }
        }

        return res.status(200).json({
          orders: populatedOrders,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        });
      } catch (dbError: any) {
        console.error('GET /api/orders - Database operation error:', dbError);
        return res.status(500).json({
          message: 'Database operation failed while fetching orders',
          error: dbError.message,
        });
      }
    } catch (error: any) {
      console.error('GET /api/orders - Unexpected error:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while fetching orders',
        error: error.message,
      });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
