import { get, post, put, remove } from "./httpService";

const API_BASE = "/Complaint";

/**
 * Get complaints with filtering options
 * @param {Object} filter - Filter options
 * @returns {Promise} API response with complaints
 */
export const getComplaints = async (filter = {}) => {
  try {
    const response = await post(`${API_BASE}/Search`, filter);
    return response;
  } catch (error) {
    console.error("Error fetching complaints:", error);
    throw error;
  }
};

/**
 * Get a specific complaint by ID
 * @param {string} complaintId - Complaint ID
 * @returns {Promise} API response with complaint details
 */
export const getComplaintById = async (complaintId) => {
  try {
    const response = await get(`${API_BASE}/${complaintId}`);
    return response;
  } catch (error) {
    console.error("Error fetching complaint:", error);
    throw error;
  }
};

/**
 * Get all complaints for a specific user
 * @param {string} userId - User ID
 * @returns {Promise} API response with user complaints
 */
export const getUserComplaints = async (userId) => {
  try {
    const response = await get(`${API_BASE}/User/${userId}`);
    return response;
  } catch (error) {
    console.error("Error fetching user complaints:", error);
    throw error;
  }
};

/**
 * Create a new complaint
 * @param {Object} complaintData - Complaint data
 * @returns {Promise} API response with created complaint
 */
export const createComplaint = async (complaintData) => {
  try {
    const response = await post(`${API_BASE}/Create`, complaintData);
    return response;
  } catch (error) {
    console.error("Error creating complaint:", error);
    throw error;
  }
};

/**
 * Update an existing complaint
 * @param {Object} complaintData - Complaint data with complaintId
 * @returns {Promise} API response with updated complaint
 */
export const updateComplaint = async (complaintData) => {
  try {
    const response = await put(`${API_BASE}/Update`, complaintData);
    return response;
  } catch (error) {
    console.error("Error updating complaint:", error);
    throw error;
  }
};

/**
 * Delete a complaint
 * @param {string} complaintId - Complaint ID to delete
 * @returns {Promise} API response
 */
export const deleteComplaint = async (complaintId) => {
  try {
    const response = await remove(`${API_BASE}/${complaintId}`);
    return response;
  } catch (error) {
    console.error("Error deleting complaint:", error);
    throw error;
  }
};

// User type constants
export const UserType = {
  CLIENT: 1,
  SERVICE_PROVIDER: 2,
  STAFF: 3,
  ADMIN: 4,
};

// Export all functions as default
export default {
  getComplaints,
  getComplaintById,
  getUserComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  UserType,
};

