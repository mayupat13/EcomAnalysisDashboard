import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// JWT Secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Disable the default body parser to allow formidable to parse the request
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Only allow POST for actual uploads
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check authentication via session or JWT token
  let isAuthenticated = false;

  console.log('Upload endpoint: Processing request');
  console.log('Upload endpoint: Headers present:', Object.keys(req.headers).join(', '));
  console.log(
    'Upload endpoint: Authorization header present:',
    req.headers.authorization ? 'Yes' : 'No',
  );
  console.log('Upload endpoint: Cookie header present:', req.headers.cookie ? 'Yes' : 'No');

  // Check for session first (next-auth)
  const session = await getSession({ req });
  if (session) {
    isAuthenticated = true;
    console.log('Upload endpoint: Authenticated via session');
  }
  // If no session, check for JWT token in Authorization header
  else {
    try {
      const authHeader = req.headers.authorization;
      console.log(
        'Upload endpoint: Authorization header:',
        authHeader ? authHeader.substring(0, 15) + '...' : 'None',
      );

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET);
        isAuthenticated = true;
        console.log('Upload endpoint: Authenticated via JWT token');
      } else {
        console.log('Upload endpoint: No valid Authorization header found');
      }
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }

  // Check authentication
  if (!isAuthenticated) {
    console.log('Upload endpoint: Authentication failed');
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Parse the incoming form
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    return new Promise<void>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
          console.error('Error parsing form:', err);
          res.status(500).json({ message: 'Error uploading files' });
          return resolve();
        }

        try {
          const uploadedFiles = files.files;
          if (!uploadedFiles) {
            res.status(400).json({ message: 'No files uploaded' });
            return resolve();
          }

          // Handle single file or multiple files
          const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

          // Process each file and generate URLs
          const fileUrls = fileArray.map((file: File) => {
            const fileName = file.newFilename;
            // Convert to a public URL
            return `/uploads/${fileName}`;
          });

          // Return the URLs to the client
          res.status(200).json({
            message: 'Files uploaded successfully',
            urls: fileUrls,
          });
          return resolve();
        } catch (error) {
          console.error('Error processing uploads:', error);
          res.status(500).json({ message: 'Error processing uploads' });
          return resolve();
        }
      });
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}
