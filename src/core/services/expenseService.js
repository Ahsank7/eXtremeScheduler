import { get, post } from "./httpService";

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
    return await post(`Expenses/Delete?userExpenseId=${userExpenseId}`);
};

export {
    getUserExpenseItem,
    saveUpdateUserExpense,
    deleteUserExpenseItem,
};
