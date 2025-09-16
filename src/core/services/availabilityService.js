import { post, get } from "./httpService";

const saveUpdateAvailability = async (AvailabilityObj) => {
  return await post(`Availability/SaveUpdate`, AvailabilityObj);
};

const deleteAvailabilityItem = async (id) => {
  return await post(`Availability/Delete?Id=${id}`);
};

const getAvailabilityItem = async (id) => {
  return await get(`Availability/Details?Id=${id}`);
};

export {
  getAvailabilityItem,
  saveUpdateAvailability,
  deleteAvailabilityItem
};
