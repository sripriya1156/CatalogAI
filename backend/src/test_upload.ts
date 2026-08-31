import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFromBuffer = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'test_folder' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
};

const test = async () => {
  console.log('Testing direct Cloudinary upload from Flickr static URL...');
  const testUrl = 'https://live.staticflickr.com/65535/55289418382_2b0d1cd44e_b.jpg';

  try {
    console.log('Uploading direct Flickr URL to Cloudinary:', testUrl);
    const result = await cloudinary.uploader.upload(testUrl, {
      folder: 'test_folder',
    });
    console.log('Cloudinary direct upload success! URL:', result.secure_url);
  } catch (error: any) {
    console.error('Direct upload failed:', error.message || error);
  }
};

test();
