import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// JWT Refresh Secret for token verification
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { refreshToken } = req.body;

    // If no refresh token provided, just return success
    if (!refreshToken) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    try {
      // Verify refresh token to get user ID
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;

      // Find user and clear refresh token from database
      const user = await User.findById(decoded.userId);
      if (user) {
        user.refreshToken = '';
        await user.save();
      }
    } catch (error) {
      // If token verification fails, we still want to proceed with logout
      console.warn('Invalid refresh token during logout:', error);
    }

    // Always return success for logout
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout' });
  }
}
