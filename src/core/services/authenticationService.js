import { post, get } from "./httpService";
import { localStoreService } from "core/services";


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
  let token = localStoreService.getToken();

  if (!token) return true;

  /*try {
    const { exp } = jwt_decode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds
    return exp < currentTime; // If `exp` is less than the current time, the token is expired
  } catch (error) {
    //console.error("Invalid token:", error);
    return true; // Consider invalid tokens as expired
  }*/
  return true;
};

export { getUserCredentials, saveUpdateUserCredentials, changePassword, login, validateToken };
