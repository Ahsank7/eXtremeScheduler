import { get, post, remove } from "./httpService";

/*const getFranchiseList = async (organizationID, userID) => {
  return await get(`Franchise/${organizationID}/${userID}`);
};*/

const getUserExpenseItem = async (id) => {
    return await get(`Expenses/Details?userExpenseId=${id}`);
};

const saveUpdateUserExpense = async (userExpenseObj) => {
    return await post(`Expenses/SaveUpdate`, userExpenseObj);
};

const deleteUserExpenseItem = async (userExpenseId) => {
    return await remove(`Expenses/Delete?userExpenseId=${userExpenseId}`);
};

const getExpenseList = async (request) => {
    return await post(`Expenses/List`, request);
};

export {
    getUserExpenseItem,
    saveUpdateUserExpense,
    deleteUserExpenseItem,
    getExpenseList,
};
