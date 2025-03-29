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

  const { id } = req.query;
  const productId = id as string;

  await dbConnect();

  // GET - Get product details
  if (req.method === 'GET') {
    try {
      const product = await Product.findById(productId).lean();

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ product });
    } catch (error) {
      console.error('Error getting product:', error);
      return res.status(500).json({ message: 'An error occurred while fetching the product' });
    }
  }

  // PUT - Update product
  if (req.method === 'PUT') {
    try {
      const { name, description, price, stock, category, images, sku } = req.body;

      // Validate input
      if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
      }

      // Update product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          name,
          description,
          price,
          stock,
          category,
          images,
          sku,
        },
        { new: true },
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ product: updatedProduct });
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ message: 'An error occurred while updating the product' });
    }
  }

  // DELETE - Delete product
  if (req.method === 'DELETE') {
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);

      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ message: 'An error occurred while deleting the product' });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
