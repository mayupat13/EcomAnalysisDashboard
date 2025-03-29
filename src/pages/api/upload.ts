import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable, { File, Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to allow formidable to parse the request
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Check authentication
  if (!session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
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
