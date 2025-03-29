import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, verifyPassword } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  const { id } = req.query;
  const userId = id as string;
  
  // Check if user is updating their own profile or is an admin
  const isAuthorized = (session.user as any).id === userId || (session.user as any).role === 'admin';
  
  if (!isAuthorized) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  await dbConnect();
  
  // GET - Get user details
  if (req.method === 'GET') {
    try {
      const user = await User.findById(userId).select('-password').lean();
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error getting user:', error);
      return res.status(500).json({ message: 'An error occurred while fetching the user' });
    }
  }
  
  // PUT - Update user profile
  if (req.method === 'PUT') {
    try {
      const { name, email } = req.body;
      
      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      
      // Check if email already exists for another user
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name, email },
        { new: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ user: updatedUser });
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ message: 'An error occurred while updating the user' });
    }
  }
  
  // DELETE - Delete user (admin only)
  if (req.method === 'DELETE') {
    try {
      // Only admin can delete users
      if ((session.user as any).role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete users' });
      }
      
      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json({ message: 'An error occurred while deleting the user' });
    }
  }
  
  // For other HTTP methods
  return res.status(405).json({ message: 'Method not allowed' });
}
