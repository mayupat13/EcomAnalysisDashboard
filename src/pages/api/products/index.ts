import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
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

  // POST - Create a new product
  if (req.method === 'POST') {
    try {
      const { name, description, price, stock, category, images, sku } = req.body;

      // Validate input
      if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
      }

      // Create new product
      const newProduct = await Product.create({
        name,
        description,
        price,
        stock: stock || 0,
        category,
        images: images || [],
        sku,
      });

      return res.status(201).json({ product: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ message: 'An error occurred while creating the product' });
    }
  }

  // GET - List products
  if (req.method === 'GET') {
    try {
      const {
        page = 1,
        limit = 10,
        q,
        category,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Build query
      const query: any = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
        ];
      }
      if (category) {
        query.category = category;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Get products
      const products = await Product.find(query).sort(sort).skip(skip).limit(Number(limit)).lean();

      // Get total count
      const totalCount = await Product.countDocuments(query);

      return res.status(200).json({
        products,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      });
    } catch (error) {
      console.error('Error listing products:', error);
      return res.status(500).json({ message: 'An error occurred while fetching products' });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
