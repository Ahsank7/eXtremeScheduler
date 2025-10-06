import axios from "axios";
import enviroment from "enviroment";
import { localStoreService } from ".";
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

// Response interceptor for attendance portal - NO automatic redirects
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("attendance http error");
    console.log(error);

    // For attendance portal, we don't want automatic redirects
    // Let the component handle authentication errors
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
    console.log('Making POST request to:', url, 'with data:', postData);
    const { data } = await axiosClient.post(`${url}`, postData);
    console.log('Raw response data:', data);
    const processed = handleApiResponse(data);
    console.log('Processed response:', processed);
    return processed;
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
