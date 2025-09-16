import { get, post } from "./httpService";

/*const getFranchiseList = async (organizationID, userID) => {
  return await get(`Franchise/${organizationID}/${userID}`);
};*/

const getAddressItem = async (id) => {
  return await get(`Address/GetAddressDetails?AddressID=${id}`);
};

const saveUpdateAddress = async (addressObj) => {
  return await post(`Address/SaveUpdateAddress`, addressObj);
};

const deleteAddressItem = async (addressId) => {
  return await post(`Address/Delete?AddressID=${addressId}`);
};

export {
  getAddressItem,
  saveUpdateAddress,
  deleteAddressItem,
};
