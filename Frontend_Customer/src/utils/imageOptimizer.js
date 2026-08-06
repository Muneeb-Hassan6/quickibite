/**
 * Optimizes a Cloudinary image URL by injecting quality, format, and width parameters.
 * If the URL is not a valid Cloudinary upload URL, it returns the original URL.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - The desired width in pixels (e.g., 600)
 * @returns {string} - The optimized Cloudinary URL
 */
export const optimizeCloudinaryImage = (url, width = 600) => {
  if (!url || typeof url !== 'string') return url;

  // Check if it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    const uploadIndex = url.indexOf('/upload/');
    if (uploadIndex !== -1) {
      // Inject transformation parameters: scale crop, specific width, auto quality, auto format
      const transformation = `/c_scale,w_${width},q_auto,f_auto`;
      return url.slice(0, uploadIndex + 7) + transformation + url.slice(uploadIndex + 7);
    }
  }

  // Return original URL if it's not a Cloudinary upload URL
  return url;
};
