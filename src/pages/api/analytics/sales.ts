import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
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

  // GET - Get sales analytics
  if (req.method === 'GET') {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string) || 30;

      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Generate date labels for the period
      const dateLabels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });

      // Get daily revenue data
      const revenueData = await Promise.all(
        dateLabels.map(async (date) => {
          const startOfDay = new Date(date);
          const endOfDay = new Date(date);
          endOfDay.setDate(endOfDay.getDate() + 1);

          const dailyOrders = await Order.find({
            createdAt: {
              $gte: startOfDay,
              $lt: endOfDay,
            },
          }).select('totalAmount');

          return dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        }),
      );

      // Get total revenue for the period
      const totalRevenue = revenueData.reduce((sum, amount) => sum + amount, 0);

      // Get order count for the period
      const orderCount = await Order.countDocuments({
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Calculate average order value
      const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

      // Get sales by status
      const salesByStatus = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            total: { $sum: '$totalAmount' },
          },
        },
      ]);

      // Format date labels for display (MM/DD)
      const formattedLabels = dateLabels.map((date) => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });

      return res.status(200).json({
        labels: formattedLabels,
        revenue: revenueData,
        totalRevenue,
        orderCount,
        averageOrderValue,
        salesByStatus,
      });
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return res.status(500).json({ message: 'An error occurred while fetching sales analytics' });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
