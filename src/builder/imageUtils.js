/**
 * Image compression utilities for the card builder
 */

const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;
const IMAGE_QUALITY = 0.8;

/**
 * Compress an image file using canvas
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
