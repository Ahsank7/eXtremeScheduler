import { post } from "./httpService";

const generateServiceProviderWage = async (data) => {
  return await post("Wage/Generate", data);
};

const previewServiceProviderWage = async (data) => {
  return await post("Wage/Preview", data);
};

export { generateServiceProviderWage, previewServiceProviderWage }; 