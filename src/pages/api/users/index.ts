import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  await dbConnect();
  
  // POST - Create a new user (register)
  if (req.method === 'POST') {
    try {
      const { name, email, password, role = 'user' } = req.body;
      
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });
      
      // Remove password from response
      const user = newUser.toObject();
      delete user.password;
      
      return res.status(201).json({ user });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ message: 'An error occurred while creating the user' });
    }
  }
  
  // GET - List users (admin only)
  if (req.method === 'GET') {
    try {
      // Check authentication and authorization
      if (!session) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      if ((session.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      const { page = 1, limit = 10, q } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      // Build query
      const query: any = {};
      if (q) {
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } }
        ];
      }
      
      // Get users (exclude password)
      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();
      
      // Get total count
      const totalCount = await User.countDocuments(query);
      
      return res.status(200).json({
        users,
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      });
    } catch (error) {
      console.error('Error listing users:', error);
      return res.status(500).json({ message: 'An error occurred while fetching users' });
    }
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
