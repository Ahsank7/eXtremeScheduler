/**
 * Notification Handler Utility
 * Provides consistent notification handling for API responses
 */

import { notifications } from "@mantine/notifications";
import { getErrorMessage, getErrorDetails, isApiError } from "./responseHandler";

/**
 * Show success notification
 * @param {string} message - Success message
 * @param {string} title - Notification title (optional)
 */
export const showSuccessNotification = (message, title = "Success") => {
  notifications.show({
    withCloseButton: true,
    autoClose: 5000,
    title: title,
    message: message,
    color: "green",
    style: { backgroundColor: "white" },
  });
};

/**
 * Show error notification
 * @param {Error|string} error - Error object or error message
 * @param {string} title - Notification title (optional)
 * @param {boolean} showDetails - Whether to show detailed error information (optional)
 */
export const showErrorNotification = (error, title = "Error", showDetails = false) => {
  const message = typeof error === 'string' ? error : getErrorMessage(error);
  
  notifications.show({
    withCloseButton: true,
    autoClose: 8000,
    title: title,
    message: showDetails ? getDetailedErrorMessage(error) : message,
    color: "red",
    style: { backgroundColor: "white" },
  });
};

/**
 * Show warning notification
 * @param {string} message - Warning message
 * @param {string} title - Notification title (optional)
 */
export const showWarningNotification = (message, title = "Warning") => {
  notifications.show({
    withCloseButton: true,
    autoClose: 6000,
    title: title,
    message: message,
    color: "yellow",
    style: { backgroundColor: "white" },
  });
};

/**
 * Show info notification
 * @param {string} message - Info message
 * @param {string} title - Notification title (optional)
 */
export const showInfoNotification = (message, title = "Info") => {
  notifications.show({
    withCloseButton: true,
    autoClose: 5000,
    title: title,
    message: message,
    color: "blue",
    style: { backgroundColor: "white" },
  });
};

/**
 * Get detailed error message for debugging
 * @param {Error} error - Error object
 * @returns {string} Detailed error message
 */
const getDetailedErrorMessage = (error) => {
  if (isApiError(error)) {
    const details = getErrorDetails(error);
    let message = details.message;
    
    if (details.errors && details.errors.length > 0) {
      message += `\nErrors: ${details.errors.join(', ')}`;
    }
    
    if (details.traceId) {
      message += `\nTrace ID: ${details.traceId}`;
    }
    
    if (details.exception) {
      message += `\nException: ${details.exception}`;
    }
    
    return message;
  }
  
  return getErrorMessage(error);
};

/**
 * Handle API response and show appropriate notification
 * @param {*} response - API response data
 * @param {string} successMessage - Success message to show
 * @param {string} errorTitle - Error title (optional)
 * @param {boolean} showErrorDetails - Whether to show detailed error information (optional)
 * @returns {boolean} True if successful, false if error
 */
export const handleApiNotification = (response, successMessage, errorTitle = "Error", showErrorDetails = false) => {
  if (response && typeof response === 'object' && 'success' in response) {
    if (response.success) {
      showSuccessNotification(successMessage);
      return true;
    } else {
      showErrorNotification(response.message || 'Operation failed', errorTitle, showErrorDetails);
      return false;
    }
  }
  
  // If response doesn't have success property, assume it's successful
  showSuccessNotification(successMessage);
  return true;
};

/**
 * Handle API error and show appropriate notification
 * @param {Error} error - Error object
 * @param {string} errorTitle - Error title (optional)
 * @param {boolean} showDetails - Whether to show detailed error information (optional)
 */
export const handleApiError = (error, errorTitle = "Error", showDetails = false) => {
  console.error('API Error:', getErrorDetails(error));
  showErrorNotification(error, errorTitle, showDetails);
};
