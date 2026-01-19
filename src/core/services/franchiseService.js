import { get, post, remove } from "./httpService";

const getFranchiseList = async (organizationID, userID = null) => {
  // If userID is provided, use the filtered endpoint
  // Otherwise, get all franchises for the organization (for admin)
  if (userID) {
    return await get(`Franchise/${organizationID}/${userID}`);
  } else {
    return await get(`Franchise/${organizationID}`);
  }
};

const saveUpdateFranchiseList = async (franchiseObj) => {
  return await post(`Franchise/SaveUpdateFranchise`, franchiseObj);
};

const createFranchiseAdminUser = async (adminUserObj) => {
  return await post(`Franchise/CreateFranchiseAdminUser`, adminUserObj);
};

// User Franchise Assignment methods
const getUserFranchiseAssignments = async (userId, organizationId) => {
  return await get(`Franchise/UserAssignments/${userId}/${organizationId}`);
};

const assignUserToFranchise = async (assignmentData) => {
  return await post(`Franchise/AssignUserToFranchise`, assignmentData);
};

const removeUserFromFranchise = async (userId, franchiseId) => {
  return await remove(`Franchise/RemoveUserFromFranchise/${userId}/${franchiseId}`);
};

export {
  getFranchiseList,
  saveUpdateFranchiseList,
  createFranchiseAdminUser,
  getUserFranchiseAssignments,
  assignUserToFranchise,
  removeUserFromFranchise,
};
