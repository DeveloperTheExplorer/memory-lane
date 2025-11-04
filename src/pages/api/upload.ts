import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { readFileSync } from 'fs';
import { UploadService } from '../../server/services/upload.service';

// Disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadResponse = {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    publicUrl: string;
  };
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
  }

  try {
    // Parse the form data using formidable
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      multiples: false,
    });

    const [fields, files] = await form.parse(req);

    // Get the uploaded file
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided. Please include a file in the request.',
      });
    }

    // Read the file from the temporary location
    const fileBuffer = readFileSync(file.filepath);

    // Upload the file using the UploadService
    const uploadService = new UploadService();
    const result = await uploadService.upload(
      fileBuffer,
      file.originalFilename || 'unknown',
      {
        contentType: file.mimetype || undefined,
      }
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

