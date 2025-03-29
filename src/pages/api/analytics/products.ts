import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
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

  // GET - Get product analytics
  if (req.method === 'GET') {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period as string) || 30;

      // Calculate the date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get top selling products
      const topSellingProducts = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalSold: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            _id: 1,
            name: '$productDetails.name',
            sku: '$productDetails.sku',
            totalSold: 1,
            totalRevenue: 1,
          },
        },
      ]);

      // Get product category distribution
      const categoryDistribution = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.product',
            foreignField: '_id',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.category',
            count: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Get low stock products
      const lowStockProducts = await Product.find({
        stock: { $lt: 10 },
      })
        .sort({ stock: 1 })
        .limit(10)
        .lean();

      // Get inventory value
      const inventory = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStockCount: { $sum: '$stock' },
            totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          },
        },
      ]);

      return res.status(200).json({
        topSellingProducts,
        categoryDistribution,
        lowStockProducts: JSON.parse(JSON.stringify(lowStockProducts)),
        inventory: inventory[0] || {
          totalProducts: 0,
          totalStockCount: 0,
          totalInventoryValue: 0,
        },
      });
    } catch (error) {
      console.error('Error getting product analytics:', error);
      return res
        .status(500)
        .json({ message: 'An error occurred while fetching product analytics' });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
