import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Data: string): Promise<string> {
  try {
    // base64Data should be like "data:image/jpeg;base64,/9j/4AAQ..."
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: 'community-hero',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 900, crop: 'limit' }, // Max dimensions
        { quality: 'auto:good' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Serve WebP where supported
      ],
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error('Failed to upload image');
  }
}

export default cloudinary;
