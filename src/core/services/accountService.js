import { post, get } from "./httpService";


const upsertUserCardInfo = async (userCardsObj) => {
    return await post(`Accounts/UpsertUserCardInfo`, userCardsObj);
};

const getUserCardInfo = async (userId) => {
    return await get(`Accounts/GetUserCardInfo?UserId=${userId}`);
};

const upsertUserBankAccount = async (userBankObj) => {
    return await post(`Accounts/UpsertUserBankAccount`, userBankObj);
};

const getUserBankAccount = async (userId) => {
    return await get(`Accounts/GetUserBankAccount?UserId=${userId}`);
};

export {
    getUserCardInfo,
    upsertUserCardInfo,
    upsertUserBankAccount,
    getUserBankAccount
};
