import { useMemo } from 'react';
import imageUrlService from '../services/imageUrlService';

/**
 * React hook for building image URLs with different storage providers
 * @param {string} imagePath - The image path or URL
 * @param {string} storageType - Optional storage type override
 * @param {object} options - Optional optimization options
 * @returns {string} Complete image URL
 */
export const useImageUrl = (imagePath, storageType = null, options = {}) => {
  return useMemo(() => {
    if (!imagePath) return null;
    
    if (options.thumbnail) {
      return imageUrlService.getThumbnailUrl(imagePath, options.size || 150);
    }
    
    if (options.optimized) {
      return imageUrlService.getOptimizedImageUrl(imagePath, options);
    }
    
    return imageUrlService.buildImageUrl(imagePath, storageType);
  }, [imagePath, storageType, options]);
};

/**
 * React hook for building optimized image URLs
 * @param {string} imagePath - The image path or URL
 * @param {object} options - Optimization options (width, height, quality, format)
 * @returns {string} Optimized image URL
 */
export const useOptimizedImageUrl = (imagePath, options = {}) => {
  return useMemo(() => {
    if (!imagePath) return null;
    return imageUrlService.getOptimizedImageUrl(imagePath, options);
  }, [imagePath, options]);
};

/**
 * React hook for building thumbnail URLs
 * @param {string} imagePath - The image path or URL
 * @param {number} size - Thumbnail size (default: 150)
 * @returns {string} Thumbnail URL
 */
export const useThumbnailUrl = (imagePath, size = 150) => {
  return useMemo(() => {
    if (!imagePath) return null;
    return imageUrlService.getThumbnailUrl(imagePath, size);
  }, [imagePath, size]);
}; 