import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { withAuth } from '@/lib/middleware';
import { AuthenticatedRequest } from '@/lib/middleware';

// Sample data in case the database doesn't have data
import { products, customers, orders, salesData as mockSalesData } from '@/data';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Get total stats - try to fetch from DB first or use sample data
    let totalProducts = 0;
    let totalOrders = 0;
    let totalCustomers = 0;
    let totalRevenue = 0;

    try {
      // Attempt to get data from the database
      totalProducts = await Product.countDocuments({});
      totalOrders = await Order.countDocuments({});
      totalCustomers = await Customer.countDocuments({});

      // Calculate total revenue
      const dbOrders = await Order.find({}).select('totalAmount');
      totalRevenue = dbOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    } catch (error) {
      console.error('Error fetching data from DB:', error);
      // If error or no data, we'll use the sample data
    }

    // If no data in DB, use sample data
    if (totalProducts === 0 && totalOrders === 0 && totalCustomers === 0) {
      console.log('Using sample data for dashboard stats');
      totalProducts = products.length;
      totalOrders = orders.length;
      totalCustomers = customers.length;

      // Calculate total revenue from sample orders
      totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    }

    // Get recent orders
    let recentOrders = [];
    try {
      recentOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('customer', 'name email')
        .lean();
    } catch (error) {
      console.error('Error fetching recent orders:', error);

      // Use sample orders if DB fetch fails
      recentOrders = orders
        .map((order) => {
          const customerIdStr = order.customer as unknown as string;
          const customer = customers.find((c) => c._id === customerIdStr);

          return {
            ...order,
            customer: {
              name: customer?.name || 'Unknown',
              email: customer?.email || 'unknown@example.com',
            },
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
    }

    // Get low stock products
    let lowStockProducts = [];
    try {
      lowStockProducts = await Product.find({ stock: { $lt: 10 } })
        .sort({ stock: 1 })
        .limit(5)
        .lean();
    } catch (error) {
      console.error('Error fetching low stock products:', error);

      // Use sample products if DB fetch fails
      lowStockProducts = products
        .filter((product) => product.stock < 10)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
    }

    return res.status(200).json({
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
      },
      recentOrders,
      lowStockProducts,
      salesData: mockSalesData, // For now, we just use the mock sales data
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
}

export default withAuth(handler);
