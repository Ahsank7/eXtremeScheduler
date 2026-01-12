import { get, post } from "./httpService";

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

export {
  getFranchiseList,
  saveUpdateFranchiseList,
  createFranchiseAdminUser,
};
