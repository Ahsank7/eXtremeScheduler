import { get, post, remove } from "./httpService";

const notificationService = {
  /**
   * Get user notifications
   * @param {Object} request - Search parameters
   * @returns {Promise} - Promise containing notifications
   */
  getUserNotifications: async (request = {}) => {
    const requestData = {
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 20,
      unreadOnly: request.unreadOnly || false,
      ...request
    };
    return await post('/Notification/GetNotifications', requestData);
  },

  /**
   * Get unread notification count
   * @returns {Promise} - Promise containing unread count
   */
  getUnreadCount: async () => {
    return await get('/Notification/GetUnreadCount');
  },

  /**
   * Create a new notification (Admin only)
   * @param {Object} notification - Notification data
   * @returns {Promise} - Promise containing created notification ID
   */
  createNotification: async (notification) => {
    return await post('/Notification/Create', notification);
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Promise containing success status
   */
  markAsRead: async (notificationId) => {
    return await post('/Notification/MarkAsRead', { notificationId });
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} - Promise containing success status
   */
  markAllAsRead: async () => {
    return await post('/Notification/MarkAllAsRead', {});
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Promise containing success status
   */
  deleteNotification: async (notificationId) => {
    return await remove(`/Notification/Delete?notificationId=${notificationId}`);
  }
};

export default notificationService;

