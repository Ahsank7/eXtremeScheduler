import { get, post, remove } from "./httpService";

const API_BASE = "/Preference";

/**
 * Get all preferences for a client
 * @param {string} clientId - Client user ID
 * @returns {Promise} API response with client preferences
 */
export const getClientPreferences = async (clientId) => {
  try {
    const response = await get(`${API_BASE}/Client/${clientId}`);
    return response;
  } catch (error) {
    console.error("Error fetching client preferences:", error);
    throw error;
  }
};

/**
 * Create or update a client preference
 * @param {Object} preferenceData - Preference data
 * @returns {Promise} API response with preference ID
 */
export const upsertClientPreference = async (preferenceData) => {
  try {
    const response = await post(`${API_BASE}/Client/Upsert`, preferenceData);
    return response;
  } catch (error) {
    console.error("Error upserting client preference:", error);
    throw error;
  }
};

/**
 * Delete a client preference
 * @param {string} preferenceId - Preference ID to delete
 * @returns {Promise} API response
 */
export const deleteClientPreference = async (preferenceId) => {
  try {
    const response = await remove(`${API_BASE}/Client/${preferenceId}`);
    return response;
  } catch (error) {
    console.error("Error deleting client preference:", error);
    throw error;
  }
};

/**
 * Get all attributes for a service provider
 * @param {string} serviceProviderId - Service provider user ID
 * @returns {Promise} API response with service provider attributes
 */
export const getServiceProviderAttributes = async (serviceProviderId) => {
  try {
    const response = await get(`${API_BASE}/ServiceProvider/${serviceProviderId}`);
    return response;
  } catch (error) {
    console.error("Error fetching service provider attributes:", error);
    throw error;
  }
};

/**
 * Create or update a service provider attribute
 * @param {Object} attributeData - Attribute data
 * @returns {Promise} API response with attribute ID
 */
export const upsertServiceProviderAttribute = async (attributeData) => {
  try {
    const response = await post(`${API_BASE}/ServiceProvider/Upsert`, attributeData);
    return response;
  } catch (error) {
    console.error("Error upserting service provider attribute:", error);
    throw error;
  }
};

/**
 * Delete a service provider attribute
 * @param {string} attributeId - Attribute ID to delete
 * @returns {Promise} API response
 */
export const deleteServiceProviderAttribute = async (attributeId) => {
  try {
    const response = await remove(`${API_BASE}/ServiceProvider/${attributeId}`);
    return response;
  } catch (error) {
    console.error("Error deleting service provider attribute:", error);
    throw error;
  }
};

/**
 * Get service providers matching client preferences
 * @param {string} clientId - Client user ID
 * @param {string} franchiseId - Optional franchise ID
 * @returns {Promise} API response with matching service providers
 */
export const getMatchingServiceProviders = async (clientId, franchiseId = null) => {
  try {
    const requestData = {
      clientId,
      franchiseId
    };
    const response = await post(`${API_BASE}/MatchingServiceProviders`, requestData);
    return response;
  } catch (error) {
    console.error("Error fetching matching service providers:", error);
    throw error;
  }
};

// Preference type constants
export const PreferenceTypes = {
  GENDER: "Gender",
  SMOKING_STATUS: "SmokingStatus",
  LANGUAGE: "Language",
  AGE_RANGE: "AgeRange",
  EXPERIENCE: "Experience",
  CERTIFICATION: "Certification",
  PET_FRIENDLY: "PetFriendly",
  TRANSPORTATION_MODE: "TransportationMode",
};

// Export all functions as default
export default {
  getClientPreferences,
  upsertClientPreference,
  deleteClientPreference,
  getServiceProviderAttributes,
  upsertServiceProviderAttribute,
  deleteServiceProviderAttribute,
  getMatchingServiceProviders,
  PreferenceTypes,
};

