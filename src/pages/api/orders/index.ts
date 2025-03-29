import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Customer from '@/models/Customer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
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
        status = 'Pending'
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
            message: `Not enough stock for product ${product.name}. Available: ${product.stock}` 
          });
        }
        
        // Update stock
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stock: -item.quantity }
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
      const { page = 1, limit = 10, q, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build query
      const query: any = {};
      if (q) {
        query.$or = [
          { orderNumber: { $regex: q, $options: 'i' } }
        ];
      }
      if (status) {
        query.status = status;
      }
      
      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      
      // Get orders
      const orders = await Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('customer', 'name email')
        .lean();
      
      // Get total count
      const totalCount = await Order.countDocuments(query);
      
      return res.status(200).json({
        orders,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      });
    } catch (error) {
      console.error('Error listing orders:', error);
      return res.status(500).json({ message: 'An error occurred while fetching orders' });
    }
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
