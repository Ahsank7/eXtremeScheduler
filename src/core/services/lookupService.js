import { get, post } from "./httpService";


const getLookupItem = async (id) => {
  return await get(`Lookup/GetDetails?lookupID=${id}`);
};

const saveUpdateLookupItem = async (lookupObj) => {
  return await post("Lookup/Item/SaveUpdate", lookupObj);
};

const getLookupList = async (request) => {
  return await post("Lookup/GetItemsList", request);
};

const getLookupDropdownList = async (request) => {
  return await post("Lookup/List", request);
};

const deleteLookupItem = async (id) => {
  return await post(`Lookup/Delete?lookupID=${id}`);
};

export {
  getLookupItem,
  saveUpdateLookupItem,
  getLookupList,
  deleteLookupItem,
  getLookupDropdownList
};

