import axios from "axios";
import enviroment from "enviroment";
import { localStoreService, loginHistoryService } from ".";

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
      // Log logout history before clearing storage
      try {
        const userInfo = localStoreService.getUserInfo();
        if (userInfo?.UserID) {
          await loginHistoryService.updateLogoutTime(userInfo.UserID);
        }
      } catch (logError) {
        console.error('Failed to log logout history:', logError);
        // Don't block logout if logging fails
      }
      
      // Clear stored token
      localStoreService.clearLocalStorage();
      
      // Redirect to login page
      window.location.href = '/login';
      // OR if using React Router v6:
      // const navigate = useNavigate();
      // navigate('/login');
    }
    return Promise.reject(error);
  }
);

const get = async (url) => {
  const { data } = await axiosClient.get(`${url}`);
  return data;
};

const post = async (url, postData) => {
  const { data } = await axiosClient.post(`${url}`, postData);
  return data;
};

const put = async (url, putData) => {
  const { data } = await axiosClient.put(`${url}`, putData);
  return data;
};

const remove = async (url) => {
  const { data } = await axiosClient.delete(`${url}`);
  return data;
};

export { get, post, put, remove };
