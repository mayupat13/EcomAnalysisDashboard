import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  await dbConnect();

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get distinct categories
    const categories = await Product.distinct('category');

    // Filter out null/empty categories and sort alphabetically
    const validCategories = categories
      .filter((category) => category && category.trim() !== '')
      .sort();

    return res.status(200).json({ categories: validCategories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ message: 'An error occurred while fetching categories' });
  }
}
