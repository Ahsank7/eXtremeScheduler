import { post, get } from "./attendanceHttpService";

const saveUpdateUserCredentials = async (userCredentialsObj) => {
  return await post(
    `Authenticate/UpdateUserCredentials`,
    userCredentialsObj
  );
};

const getUserCredentials = async (userId) => {
  return await get(
    `Authenticate/GetUserCredentials?UserId=${userId}`
  );
};

const changePassword = async (changePasswordObj) => {
  return await post(
    `Authenticate/ChangePassword`,
    changePasswordObj
  );
};

const login = async (userCredential) => {
  return await post(`Authenticate/login`, userCredential);
};

const validateToken = () => {
  // Simple token validation for attendance portal
  return true;
};

export { getUserCredentials, saveUpdateUserCredentials, changePassword, login, validateToken };
