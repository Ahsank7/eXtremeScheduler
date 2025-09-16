import { post, get } from "./httpService";

const saveUpdateContact = async (contactObj) => {
  return await post(`Contact/SaveUpdate`, contactObj);
};

const deleteContactItem = async (id) => {
  return await post(`Contact/Delete?Id=${id}`);
};

const getContactItem = async (id) => {
  return await get(`Contact/Details?contactID=${id}`);
};

export {
  getContactItem,
  saveUpdateContact,
  deleteContactItem
};
