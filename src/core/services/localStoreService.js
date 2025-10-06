import { jwtDecode } from "jwt-decode";

const token_Key = "t__id";

const getUserID = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo.UserID;
};

const getOrganizationID = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo.OrganizationId;
};

const getUserInfo = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo;
};

const getUserType = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo.UserType;
};

const getFranchiseID = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo?.FranchiseId;
};

const getUserNo = () => {
  let userInfo = jwtDecode(getToken());

  return userInfo?.UserNo;
};

const setToken = (token) => {
  localStorage.setItem(token_Key, token);
};

const getToken = () => {
  return localStorage.getItem(token_Key);
};

const clearLocalStorage = () => {
  localStorage.clear();
};

export {
  getUserID,
  getOrganizationID,
  getFranchiseID,
  getUserType,
  getUserNo,
  clearLocalStorage,
  setToken,
  getToken,
  getUserInfo,
};
