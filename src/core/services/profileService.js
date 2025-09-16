import { get, post, remove } from "./httpService";

const getUsers = async (usersRquest) => {
  return await post("Users/List", usersRquest);
};

const getUserByID = async (userID) => {
  return await get(`Users/Details?UserID=${userID}`);
};

const saveUpdateUserInfo = async (userObj) => {
  return await post(`Users/SaveUpdate`, userObj);
};

const removeUser = async (userID, userStatusAction) => {
  return await remove(
    `Users/Delete?Id=${userID}&userStatusAction=${userStatusAction}`
  );
};

const getClients = async (client) => {
  return await post("Client/GetClientList", client);
};

const getClientByID = async (clientID) => {
  return await get(`Client/GetClientDetails?UserID=${clientID}`);
};

const saveUpdateClient = async (clientObj) => {
  return await post(`Client/SaveUpdate`, clientObj);
};

const getServiceProviders = async (serviceProvider) => {
  return await post(
    "ServiceProvider/GetServiceProviderList",
    serviceProvider
  );
};

const getAvailableServiceProviders = async (serviceProvider) => {
  return await post("ServiceProvider/Available", serviceProvider);
};

const getServiceProvidersWithAvailability = async (request) => {
  return await post("ServiceProvider/WithAvailability", request);
};

const getStaffs = async (staff) => {
  return await post("Staff/GetStaffList", staff);
};

const getAddressList = async (addressObj) => {
  return await post("Address/GetAddressList", addressObj);
};

const getDocumentList = async (documentObj) => {
  return await post("Documents/List", documentObj);
};

const getLeaveList = async (leaveObj) => {
  return await post("Leaves/GetUserLeaveList", leaveObj);
};



const getContactList = async (contactObj) => {
  return await post("Contact/List", contactObj);
};

const getAvailabilityList = async (availabilityObj) => {
  return await post("Availability/List", availabilityObj);
};

const getExpenseList = async (expenseObj) => {
  return await post("Expenses/List", expenseObj);
};

const getTransactionList = async (transactionObj) => {
  return await post("Transactions/List", transactionObj);
};

const getTransactionDetails = async (transactionId) => {
  return await get(`Transactions/Details?transactionID=${transactionId}`);
};

const getClientPaymentList = async (paymentObj) => {
  return await post("Billing/Info/List", paymentObj);
};

const getServiceProviderPaymentList = async (paymentObj) => {
  return await post("Wage/Info/List", paymentObj);
};

const getContractInfo = async (userID) => {
  return await get(`ServiceProvider/GetContractInfo?UserId=${userID}`);
};

const upsertContractInfo = async (upsertContractInfoObj) => {
  return await post(`ServiceProvider/UpsertContractInfo`, upsertContractInfoObj);
};

export {
  getUsers,
  getUserByID,
  getClients,
  getClientByID,
  getServiceProviders,
  getAvailableServiceProviders,
  getServiceProvidersWithAvailability,
  getStaffs,
  getAddressList,
  getDocumentList,
  getLeaveList,

  getContactList,
  getAvailabilityList,
  saveUpdateClient,
  getExpenseList,
  getTransactionList,
  getTransactionDetails,
  getClientPaymentList,
  getServiceProviderPaymentList,
  saveUpdateUserInfo,
  removeUser,
  upsertContractInfo,
  getContractInfo
};
