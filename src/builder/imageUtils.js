/**
 * Image utilities for the card builder
 */

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.8;

// Cloudinary config from env vars
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured() {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

/**
 * Compress an image file using canvas
 * @param {File} file - Image file to compress
 * @returns {Promise<Blob>} Compressed image as blob
 */
function compressImageToBlob(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_IMAGE_WIDTH) {
        height = (height * MAX_IMAGE_WIDTH) / width;
        width = MAX_IMAGE_WIDTH;
      }
      if (height > MAX_IMAGE_HEIGHT) {
        width = (width * MAX_IMAGE_HEIGHT) / height;
        height = MAX_IMAGE_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        IMAGE_QUALITY
      );
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Cloudinary URL
 */
export async function uploadToCloudinary(file) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  // Compress first
  const compressedBlob = await compressImageToBlob(file);

  const formData = new FormData();
  formData.append('file', compressedBlob);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Compress an image file using canvas (legacy - returns data URL)
 * @param {File} file - Image file to compress
 * @returns {Promise<string>} Data URL of compressed image
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      let { width, height } = img;

      if (width > MAX_IMAGE_WIDTH) {
        height = (height * MAX_IMAGE_WIDTH) / width;
        width = MAX_IMAGE_WIDTH;
      }
      if (height > MAX_IMAGE_HEIGHT) {
        width = (width * MAX_IMAGE_HEIGHT) / height;
        height = MAX_IMAGE_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
      resolve(dataUrl);
    };

    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
