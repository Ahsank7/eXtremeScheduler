import { get, post } from "./httpService";

const getFranchiseList = async (organizationID, userID) => {
  return await get(`Franchise/${organizationID}/${userID}`);
};

const saveUpdateFranchiseList = async (franchiseObj) => {
  return await post(`Franchise/SaveUpdateFranchise`, franchiseObj);
};

export {
  getFranchiseList,
  saveUpdateFranchiseList,
};
