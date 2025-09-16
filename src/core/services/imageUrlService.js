import enviroment from "../../enviroment";

/**
 * Generic image URL service that handles different storage providers
 * Supports local storage, AWS S3, Azure Blob Storage, and other cloud providers
 */
class ImageUrlService {
  constructor() {
    this.backendBaseUrl = enviroment.baseURL.replace(/\/api\/?$/, "");
    this.storageConfig = this.getStorageConfig();
  }

  /**
   * Get storage configuration from environment or config
   * This can be extended to read from environment variables or config files
   */
  getStorageConfig() {
    // You can extend this to read from environment variables
    // For now, we'll use a simple configuration
    return {
      type: process.env.REACT_APP_STORAGE_TYPE || 'local', // 'local', 's3', 'azure', 'gcp'
      baseUrl: process.env.REACT_APP_STORAGE_BASE_URL || this.backendBaseUrl,
      cdnUrl: process.env.REACT_APP_CDN_URL || null,
    };
  }

  /**
   * Build a complete image URL based on the storage type and image path
   * @param {string} imagePath - The relative path or full URL of the image
   * @param {string} storageType - Optional override for storage type
   * @returns {string} Complete image URL
   */
  buildImageUrl(imagePath, storageType = null) {
    if (!imagePath) {
      return null;
    }

    // If the imagePath is already a complete URL, return it as is
    if (this.isCompleteUrl(imagePath)) {
      return imagePath;
    }

    const config = storageType ? { ...this.storageConfig, type: storageType } : this.storageConfig;

    switch (config.type) {
      case 's3':
        return this.buildS3Url(imagePath, config);
      case 'azure':
        return this.buildAzureUrl(imagePath, config);
      case 'gcp':
        return this.buildGcpUrl(imagePath, config);
      case 'local':
      default:
        return this.buildLocalUrl(imagePath, config);
    }
  }

  /**
   * Check if the given path is already a complete URL
   * @param {string} path - The image path to check
   * @returns {boolean}
   */
  isCompleteUrl(path) {
    return path && (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//'));
  }

  /**
   * Build URL for local storage
   * @param {string} imagePath - Relative path to the image
   * @param {object} config - Storage configuration
   * @returns {string} Complete local URL
   */
  buildLocalUrl(imagePath, config) {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${config.baseUrl}/${cleanPath}`;
  }

  /**
   * Build URL for AWS S3
   * @param {string} imagePath - S3 key or path
   * @param {object} config - Storage configuration
   * @returns {string} Complete S3 URL
   */
  buildS3Url(imagePath, config) {
    // For S3, the imagePath should be the S3 key
    // You can extend this to handle different S3 bucket configurations
    const bucketName = process.env.REACT_APP_S3_BUCKET_NAME || 'your-bucket-name';
    const region = process.env.REACT_APP_S3_REGION || 'us-east-1';
    
    return `https://${bucketName}.s3.${region}.amazonaws.com/${imagePath}`;
  }

  /**
   * Build URL for Azure Blob Storage
   * @param {string} imagePath - Azure blob path
   * @param {object} config - Storage configuration
   * @returns {string} Complete Azure URL
   */
  buildAzureUrl(imagePath, config) {
    // For Azure Blob Storage
    const accountName = process.env.REACT_APP_AZURE_ACCOUNT_NAME || 'your-account-name';
    const containerName = process.env.REACT_APP_AZURE_CONTAINER_NAME || 'your-container-name';
    
    return `https://${accountName}.blob.core.windows.net/${containerName}/${imagePath}`;
  }

  /**
   * Build URL for Google Cloud Storage
   * @param {string} imagePath - GCS path
   * @param {object} config - Storage configuration
   * @returns {string} Complete GCS URL
   */
  buildGcpUrl(imagePath, config) {
    // For Google Cloud Storage
    const bucketName = process.env.REACT_APP_GCP_BUCKET_NAME || 'your-bucket-name';
    
    return `https://storage.googleapis.com/${bucketName}/${imagePath}`;
  }

  /**
   * Get optimized image URL (useful for CDN)
   * @param {string} imagePath - The image path
   * @param {object} options - Optimization options (width, height, quality, etc.)
   * @returns {string} Optimized image URL
   */
  getOptimizedImageUrl(imagePath, options = {}) {
    const baseUrl = this.buildImageUrl(imagePath);
    
    if (!baseUrl || !this.storageConfig.cdnUrl) {
      return baseUrl;
    }

    // Add optimization parameters for CDN
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.quality) params.append('q', options.quality);
    if (options.format) params.append('f', options.format);

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Get thumbnail URL for an image
   * @param {string} imagePath - The original image path
   * @param {number} size - Thumbnail size (default: 150)
   * @returns {string} Thumbnail URL
   */
  getThumbnailUrl(imagePath, size = 150) {
    return this.getOptimizedImageUrl(imagePath, { width: size, height: size, quality: 80 });
  }
}

// Create a singleton instance
const imageUrlService = new ImageUrlService();

export default imageUrlService; 