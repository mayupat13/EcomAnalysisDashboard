import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Types
export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    userId: string;
    email: string;
    name: string;
    role: string;
  };
}

type ApiHandler = (
  req: AuthenticatedRequest,
  res: NextApiResponse,
) => Promise<void | NextApiResponse>;

/**
 * Authentication middleware to verify JWT
 */
export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        // Add user data to request
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        };

        // Continue to the API handler
        return handler(req, res);
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
}

/**
 * Role-based authorization middleware
 */
export function withRole(handler: ApiHandler, roles: string[]): ApiHandler {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // First authenticate the request
    return withAuth(async (req, res) => {
      // Check if the authenticated user has the required role
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      // User has the required role, proceed to the handler
      return handler(req, res);
    })(req, res);
  };
}
