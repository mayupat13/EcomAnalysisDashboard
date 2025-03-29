import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
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

  // POST - Create a new customer
  if (req.method === 'POST') {
    try {
      const { name, email, phone, address } = req.body;

      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      // Check if email already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this email already exists' });
      }

      // Create new customer
      const newCustomer = await Customer.create({
        name,
        email,
        phone,
        address,
      });

      return res.status(201).json({ customer: newCustomer });
    } catch (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({ message: 'An error occurred while creating the customer' });
    }
  }

  // GET - List customers
  if (req.method === 'GET') {
    try {
      console.log('GET /api/customers - Processing request with query:', req.query);

      const { page = 1, limit = 10, q, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      // Validate query parameters
      const pageNum = Number(page);
      const limitNum = Number(limit);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        console.error('GET /api/customers - Invalid page or limit parameters:', { page, limit });
        return res.status(400).json({
          message: 'Invalid page or limit parameters. Both must be positive numbers.',
        });
      }

      const skip = (pageNum - 1) * limitNum;
      console.log('GET /api/customers - Using pagination:', { pageNum, limitNum, skip });

      // Build query
      const query: any = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } },
        ];
      }

      console.log('GET /api/customers - Query filter:', JSON.stringify(query));

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      console.log('GET /api/customers - Sort criteria:', sort);

      // Ensure DB connection
      await dbConnect();
      console.log('GET /api/customers - Database connected');

      try {
        // Get total count first
        const totalCount = await Customer.countDocuments(query);
        console.log('GET /api/customers - Total count:', totalCount);

        // Get customers
        const customers = await Customer.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('name email phone createdAt') // Only select necessary fields
          .lean();

        console.log(`GET /api/customers - Successfully retrieved ${customers.length} customers`);

        return res.status(200).json({
          customers,
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
        });
      } catch (dbError: any) {
        console.error('GET /api/customers - Database operation error:', dbError);
        return res.status(500).json({
          message: 'Database operation failed while fetching customers',
          error: dbError.message,
        });
      }
    } catch (error: any) {
      console.error('GET /api/customers - Unexpected error:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while fetching customers',
        error: error.message,
      });
    }
  }

  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
