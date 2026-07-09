import axios from 'axios';
import crypto from 'crypto';

/**
 * Uploads a base64 encoded file to Cloudinary.
 * Auto-detects the resource type (image, raw file, video, etc.)
 */
export const uploadBase64ToCloudinary = async (
  fileBase64: string,
  fileName: string = 'file'
): Promise<string> => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials are not configured in environment variables');
  }

  // Ensure base64 string is formatted properly for Cloudinary
  let formattedFile = fileBase64;
  if (!fileBase64.startsWith('data:')) {
    // If it doesn't have a data URI header, try to extract extension or default to octet-stream
    const fileExtension = fileName.includes('.')
      ? fileName.substring(fileName.lastIndexOf('.') + 1)
      : 'bin';
    const mimeType = fileExtension === 'pdf' ? 'application/pdf' : `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`;
    formattedFile = `data:${mimeType};base64,${fileBase64}`;
  }

  const fileExtension = fileName.includes('.')
    ? fileName.substring(fileName.lastIndexOf('.'))
    : '.bin';
  
  const publicId = `upgrade_cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  
  const signature = crypto
    .createHash('sha1')
    .update(paramsToSign + apiSecret)
    .digest('hex');

  try {
    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        file: formattedFile,
        api_key: apiKey,
        timestamp: timestamp,
        signature: signature,
        public_id: publicId,
      }
    );

    return uploadRes.data.secure_url;
  } catch (err: any) {
    console.error('Cloudinary Upload Error Details:', err.response?.data || err.message);
    throw new Error(err.response?.data?.error?.message || err.message || 'Lỗi khi upload lên Cloudinary.');
  }
};
