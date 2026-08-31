import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const uploadFromBuffer = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'catalog_builder' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

export const uploadImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const uploadResult = await uploadFromBuffer(req.file.buffer);

    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
};
