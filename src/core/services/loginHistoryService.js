import { post } from "./httpService";

const getLoginHistory = async (request) => {
  return await post("LoginHistory/GetLoginHistory", request);
};

const insertLoginHistory = async (request) => {
  return await post("LoginHistory/InsertLoginHistory", request);
};

const updateLogoutTime = async (userId, loginTime = null) => {
  return await post("LoginHistory/UpdateLogoutTime", { userId, loginTime });
};

export { getLoginHistory, insertLoginHistory, updateLogoutTime };
