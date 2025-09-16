import { get, post } from "./httpService";

const getLeaveItem = async (id) => {
  return await get(`Leaves/GetUserLeaveDetails?userLeaveId=${id}`);
};

const saveUpdateLeave = async (leaveObj) => {
  return await post(`Leaves/SaveUpdateUserLeave`, leaveObj);
};

const deleteLeaveItem = async (leaveId) => {
  return await post(`Leaves/Delete?userLeaveId=${leaveId}`);
};

export {
  //getFranchiseList,
  saveUpdateLeave,
  deleteLeaveItem,
  getLeaveItem
};
