import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
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
      const { page = 1, limit = 10, q, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build query
      const query: any = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { phone: { $regex: q, $options: 'i' } }
        ];
      }
      
      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
      
      // Get customers
      const customers = await Customer.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean();
      
      // Get total count
      const totalCount = await Customer.countDocuments(query);
      
      return res.status(200).json({
        customers,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      });
    } catch (error) {
      console.error('Error listing customers:', error);
      return res.status(500).json({ message: 'An error occurred while fetching customers' });
    }
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
