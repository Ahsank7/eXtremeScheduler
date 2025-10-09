import environment from "../../enviroment";

/**
 * Builds a complete URL for document access
 * @param {string} documentPath - The document path from the API
 * @returns {string} - Complete URL for document access
 */
export const buildDocumentUrl = (documentPath) => {
  if (!documentPath) return "";
  
  // If it's already a complete URL, return as is
  if (documentPath.startsWith("http://") || documentPath.startsWith("https://")) {
    return documentPath;
  }
  
  // If it's a relative path, prepend the API base URL
  if (documentPath.startsWith("/")) {
    return `${environment.API_BASE_URL}${documentPath}`;
  }
  
  // If it's just a filename or path, prepend the API base URL with a slash
  return `${environment.API_BASE_URL}/${documentPath}`;
};

/**
 * Builds a complete URL for image access
 * @param {string} imagePath - The image path from the API
 * @returns {string} - Complete URL for image access
 */
export const buildImageUrl = (imagePath) => {
  return buildDocumentUrl(imagePath);
};

/**
 * Builds a secure URL for image access (alias for buildImageUrl)
 * @param {string} imagePath - The image path from the API
 * @returns {string} - Complete URL for image access
 */
export const buildSecureImageUrl = (imagePath) => {
  return buildImageUrl(imagePath);
};

/**
 * Builds a complete URL for file access
 * @param {string} filePath - The file path from the API
 * @returns {string} - Complete URL for file access
 */
export const buildFileUrl = (filePath) => {
  return buildDocumentUrl(filePath);
};

/**
 * Checks if a URL is complete (starts with http/https)
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is complete
 */
export const isCompleteUrl = (url) => {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
};

/**
 * Extracts filename from a URL or path
 * @param {string} url - The URL or path
 * @returns {string} - The filename
 */
export const getFilenameFromUrl = (url) => {
  if (!url) return "";
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    return pathname.split('/').pop() || "";
  } catch {
    // If it's not a valid URL, treat it as a path
    return url.split('/').pop() || "";
  }
};

/**
 * Gets file extension from URL or path
 * @param {string} url - The URL or path
 * @returns {string} - The file extension (without dot)
 */
export const getFileExtension = (url) => {
  const filename = getFilenameFromUrl(url);
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1).toLowerCase() : "";
};

/**
 * Checks if a file is an image based on its extension
 * @param {string} url - The URL or path
 * @returns {boolean} - True if the file is an image
 */
export const isImageFile = (url) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(url);
  return imageExtensions.includes(extension);
};
