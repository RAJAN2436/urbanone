import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure Cloudinary with environment variables.
 * Supports:
 *  1. CLOUDINARY_URL (e.g. cloudinary://apiKey:apiSecret@cloudName)
 *  2. CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *  3. VITE_CLOUDINARY_CLOUD_NAME
 */
export const initCloudinary = () => {
  const cloudUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudUrl) {
    cloudinary.config({
      cloudinary_url: cloudUrl,
      secure: true
    });
    return true;
  } else if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });
    return true;
  } else if (cloudName) {
    cloudinary.config({
      cloud_name: cloudName,
      secure: true
    });
    return false; // missing key/secret for signed backend upload
  }
  return false;
};

/**
 * Upload an image (base64 data URI, remote URL, or buffer) to Cloudinary.
 * @param {string} fileStr - Base64 data URI or remote image URL
 * @param {object} options - Optional folder, tags, transformations
 * @returns {Promise<{ success: boolean, url: string, public_id?: string, format?: string }>}
 */
export const uploadImageToCloudinary = async (fileStr, options = {}) => {
  initCloudinary();

  const folder = options.folder || 'kalsen-platform';
  const resourceType = options.resourceType || 'image';

  // Check if credentials are present
  const isConfigured = Boolean(
    process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );

  if (!isConfigured) {
    console.warn('[Cloudinary Service] Cloudinary API credentials not configured in .env. Falling back.');
    // If it's already a URL or base64, return it with a note
    return {
      success: true,
      url: fileStr,
      isFallback: true,
      message: 'Cloudinary credentials not configured in .env; saved image source directly.'
    };
  }

  try {
    const uploadRes = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: resourceType,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif', 'svg', 'avif'],
      ...options
    });

    return {
      success: true,
      url: uploadRes.secure_url || uploadRes.url,
      public_id: uploadRes.public_id,
      format: uploadRes.format,
      bytes: uploadRes.bytes,
      width: uploadRes.width,
      height: uploadRes.height
    };
  } catch (error) {
    console.error('[Cloudinary Service] Upload failed:', error.message);
    throw error;
  }
};

export default {
  initCloudinary,
  uploadImageToCloudinary,
  cloudinary
};
