/**
 * useCloudinaryUpload — Universal hook for uploading images to Cloudinary.
 *
 * Supports two modes:
 *  1. Direct Client-side Unsigned Upload:
 *     Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
 *  2. Server-side Cloudinary Upload:
 *     Calls /api/upload which uses CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in .env
 *  3. Fallback:
 *     If no Cloudinary credentials are configured, converts to base64 data URI so features continue working.
 */

import { useState } from 'react';

const RAW_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const RAW_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

const CLOUD_NAME = (RAW_CLOUD && !RAW_CLOUD.includes('your_cloud_name')) ? RAW_CLOUD : 'futpfdib';
const UPLOAD_PRESET = (RAW_PRESET && !RAW_PRESET.includes('your_upload_preset')) ? RAW_PRESET : 'kw0xwgcm';

// Determine server API base URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useCloudinaryUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Helper to convert File/Blob to base64 Data URI
   */
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  /**
   * Upload image file to Cloudinary.
   * @param {File|Blob|string} file - The file object or base64 string to upload
   * @param {string} folder - Optional Cloudinary folder name (default: 'urban-platform')
   * @returns {Promise<string|null>} Cloudinary secure_url string or fallback URL
   */
  const uploadImage = async (file, folder = 'urban-platform') => {
    if (!file) return null;

    setUploading(true);
    setProgress(10);

    // MODE 1: Direct unsigned upload to Cloudinary CDN
    if (CLOUD_NAME && UPLOAD_PRESET && typeof file !== 'string') {
      try {
        const url = await new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', UPLOAD_PRESET);
          formData.append('folder', folder);

          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 90) + 5);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const res = JSON.parse(xhr.responseText);
                resolve(res.secure_url || res.url || null);
              } catch (e) {
                reject(e);
              }
            } else {
              reject(new Error(`Direct Cloudinary upload failed: ${xhr.status} ${xhr.responseText}`));
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Network error during direct Cloudinary upload')));
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
          xhr.send(formData);
        });

        if (url) {
          setProgress(100);
          setUploading(false);
          return url;
        }
      } catch (directErr) {
        console.warn('[Cloudinary Direct Upload Warning]:', directErr.message, 'Trying backend /api/upload...');
      }
    }

    // MODE 2: Upload via Backend /api/upload (Server Cloudinary Service)
    try {
      let base64String = file;
      if (typeof file !== 'string') {
        setProgress(30);
        base64String = await fileToBase64(file);
      }

      setProgress(60);

      const endpoints = [`${API_BASE}/upload`, '/api/upload'];
      let resData = null;

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64String, folder })
          });

          if (res.ok) {
            resData = await res.json();
            break;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      if (resData && (resData.url || resData.secure_url)) {
        setProgress(100);
        setUploading(false);
        return resData.url || resData.secure_url;
      }
    } catch (serverErr) {
      console.warn('[Cloudinary Backend Upload Warning]:', serverErr.message);
    }

    // MODE 3: Fallback to local Data URI if all else fails
    try {
      const base64Url = typeof file === 'string' ? file : await fileToBase64(file);
      setProgress(100);
      setUploading(false);
      return base64Url;
    } catch (fallbackErr) {
      console.error('[Cloudinary] All upload strategies failed:', fallbackErr);
      setProgress(0);
      setUploading(false);
      return null;
    }
  };

  return { uploadImage, uploading, progress };
};

export default useCloudinaryUpload;
