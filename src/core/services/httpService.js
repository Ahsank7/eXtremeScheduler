import axios from "axios";
import enviroment from "enviroment";
import { localStoreService, loginHistoryService } from ".";
import { handleApiResponse, processApiResponse, getErrorMessage, getErrorDetails } from "../utils/responseHandler";

const axiosClient = axios.create({
  baseURL: enviroment.baseURL
});

// Request interceptor to add auth token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStoreService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for 401 handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("error");
    console.log(error);

    if (error?.response?.status === 401) {
      // Don't redirect if we're on public pages (landing page, login, etc.)
      const currentPath = window.location.pathname.toLowerCase();
      const publicPaths = ['/home', '/login', '/attendance', '/admin'];
      const isPublicPath = publicPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));
      
      if (isPublicPath) {
        // On public page, just reject the error without redirecting
        return Promise.reject(error);
      }

      // Log logout history before clearing storage (only if user was logged in)
      try {
        const token = localStoreService.getToken();
        if (token) {
          const userInfo = localStoreService.getUserInfo();
          if (userInfo?.UserID) {
            await loginHistoryService.updateLogoutTime(userInfo.UserID);
          }
        }
      } catch (logError) {
        console.error('Failed to log logout history:', logError);
        // Don't block logout if logging fails
      }
      
      // Clear stored token
      localStoreService.clearLocalStorage();
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const get = async (url) => {
  try {
    const { data } = await axiosClient.get(`${url}`);
    return handleApiResponse(data);
  } catch (error) {
    console.error('GET request failed:', getErrorDetails(error));
    throw error;
  }
};

const post = async (url, postData) => {
  try {
    const { data } = await axiosClient.post(`${url}`, postData);
    return handleApiResponse(data);
  } catch (error) {
    console.error('POST request failed:', getErrorDetails(error));
    throw error;
  }
};

const put = async (url, putData) => {
  try {
    const { data } = await axiosClient.put(`${url}`, putData);
    return handleApiResponse(data);
  } catch (error) {
    console.error('PUT request failed:', getErrorDetails(error));
    throw error;
  }
};

const remove = async (url) => {
  try {
    const { data } = await axiosClient.delete(`${url}`);
    return handleApiResponse(data);
  } catch (error) {
    console.error('DELETE request failed:', getErrorDetails(error));
    throw error;
  }
};

export { get, post, put, remove };
