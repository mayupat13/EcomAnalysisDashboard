import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { refreshToken } = req.body;

    // Check if refresh token is provided
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as jwt.JwtPayload;

      // Find user by ID from token payload
      const user = await User.findById(decoded.userId);

      // Check if user exists and the refresh token matches what's in the database
      if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Create payload for new tokens
      const payload = {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };

      // Generate new access token
      const newAccessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
      });

      // Generate new refresh token
      const newRefreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      });

      // Update refresh token in database
      user.refreshToken = newRefreshToken;
      await user.save();

      // Return new tokens
      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      // If token verification fails
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ message: 'An error occurred during token refresh' });
  }
}
