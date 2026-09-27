import express from 'express';
import { uploadImageToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();

/**
 * GET /api/upload/config
 * Returns public Cloudinary configuration for client-side direct uploads.
 */
router.get('/config', (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  const isServerConfigured = Boolean(
    process.env.CLOUDINARY_URL || 
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );

  res.json({
    success: true,
    cloudName,
    uploadPreset,
    isClientConfigured: Boolean(cloudName && uploadPreset),
    isServerConfigured
  });
});

/**
 * POST /api/upload
 * Upload base64 image or image URL to Cloudinary.
 * Body: { image: string, folder?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { image, folder = 'kalsen-platform' } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide a base64 string or image URL.'
      });
    }

    const result = await uploadImageToCloudinary(image, { folder });

    return res.json({
      success: true,
      url: result.url,
      secure_url: result.url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes,
      isFallback: result.isFallback || false,
      message: result.message || 'Image uploaded to Cloudinary successfully'
    });
  } catch (error) {
    console.error('[Upload Route Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image to Cloudinary'
    });
  }
});

export default router;
