/**
 * Response Handler Utility
 * Handles consistent API response processing for the application
 */

/**
 * Standard API Response structure from backend
 * @typedef {Object} ApiResponse
 * @property {number} status - HTTP status code
 * @property {string} message - Response message
 * @property {*} data - Response data
 * @property {boolean} isSuccess - Success flag
 * @property {string[]} errors - Array of error messages
 * @property {string} traceId - Trace ID for debugging
 * @property {string} exception - Exception message (for 500 errors)
 * @property {string} stackTrace - Stack trace (for 500 errors)
 */

/**
 * Process API response and extract data or handle errors
 * @param {ApiResponse} response - The API response object
 * @returns {Object} Processed response with data and metadata
 */
export const processApiResponse = (response) => {
  if (!response) {
    return {
      success: false,
      data: null,
      message: 'No response received',
      errors: ['No response received'],
      status: 0
    };
  }

  const {
    status,
    message,
    data,
    isSuccess,
    errors = [],
    traceId,
    exception,
    stackTrace
  } = response;

  return {
    success: isSuccess || status >= 200 && status < 300,
    data: data,
    message: message || 'Operation completed',
    errors: errors || [],
    status: status,
    traceId: traceId,
    exception: exception,
    stackTrace: stackTrace
  };
};

/**
 * Handle API response and throw appropriate errors if needed
 * @param {ApiResponse} response - The API response object
 * @returns {*} The data from the response
 * @throws {Error} If the response indicates an error
 */
export const handleApiResponse = (response) => {
  const processed = processApiResponse(response);

  if (!processed.success) {
    const error = new Error(processed.message);
    error.status = processed.status;
    error.errors = processed.errors;
    error.traceId = processed.traceId;
    error.exception = processed.exception;
    error.stackTrace = processed.stackTrace;
    throw error;
  }

  return processed.data;
};

/**
 * Create a standardized error object
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {string[]} errors - Array of error messages
 * @param {string} traceId - Trace ID
 * @param {string} exception - Exception message
 * @param {string} stackTrace - Stack trace
 * @returns {Error} Standardized error object
 */
export const createApiError = (message, status = 500, errors = [], traceId = null, exception = null, stackTrace = null) => {
  const error = new Error(message);
  error.status = status;
  error.errors = errors;
  error.traceId = traceId;
  error.exception = exception;
  error.stackTrace = stackTrace;
  return error;
};

/**
 * Check if an error is an API error with our structure
 * @param {Error} error - The error to check
 * @returns {boolean} True if it's an API error
 */
export const isApiError = (error) => {
  return error && typeof error === 'object' && 'status' in error;
};

/**
 * Get user-friendly error message from API error
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (isApiError(error)) {
    return error.message || 'An error occurred';
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Get detailed error information for debugging
 * @param {Error} error - The error object
 * @returns {Object} Detailed error information
 */
export const getErrorDetails = (error) => {
  if (isApiError(error)) {
    return {
      message: error.message,
      status: error.status,
      errors: error.errors || [],
      traceId: error.traceId,
      exception: error.exception,
      stackTrace: error.stackTrace
    };
  }
  
  if (error?.response?.data) {
    return {
      message: error.response.data.message || error.message,
      status: error.response.status,
      errors: error.response.data.errors || [],
      traceId: error.response.data.traceId,
      exception: error.response.data.exception,
      stackTrace: error.response.data.stackTrace
    };
  }
  
  return {
    message: error?.message || 'Unknown error',
    status: error?.status || 500,
    errors: [],
    traceId: null,
    exception: null,
    stackTrace: null
  };
};
