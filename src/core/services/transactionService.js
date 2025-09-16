import { get, post } from "./httpService";


const getTransactionItem = async (id) => {
    return await get(`Transactions/Details?transactionID=${id}`);
};

const saveUpdateTransaction = async (transactionObj) => {
    return await post(`Transactions/SaveUpdate`, transactionObj);
};

/*const deleteTransactionItem = async (transactionId) => {
    return await post(`Transaction/Delete?TransactionID=${transactionId}`);
};*/

export {
    getTransactionItem,
    saveUpdateTransaction,
    //  deleteTransactionItem,
};
