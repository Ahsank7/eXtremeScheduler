import axios from "axios";
import enviroment from "enviroment";
import { processApiResponse } from "../utils/responseHandler";

const axiosClient = axios.create({
  baseURL: enviroment.baseURL
});

export const landingService = {
  // Submit contact request
  submitContactRequest: async (contactData) => {
    try {
      const { data } = await axiosClient.post("Home/Contact", contactData);
      return processApiResponse(data);
    } catch (error) {
      if (error?.response?.data) {
        return processApiResponse(error.response.data);
      }
      throw error;
    }
  },

  // Request demo
  requestDemo: async (demoData) => {
    try {
      const { data } = await axiosClient.post("Home/RequestDemo", demoData);
      return processApiResponse(data);
    } catch (error) {
      if (error?.response?.data) {
        return processApiResponse(error.response.data);
      }
      throw error;
    }
  },
};

