import { post } from "./httpService";

const generateBillingInvoices = async (data) => {
  return await post("Billing/Generate", data);
};

const previewBillingInvoices = async (data) => {
  return await post("Billing/Preview", data);
};

export { generateBillingInvoices, previewBillingInvoices }; 