import { post } from "./httpService";

const getServicesTasks = async (serviceTask) => {
  return await post("ToConfirm/ServicesTask", serviceTask);
};

const CalculateBillingAndWageAmounts = async (servicesTaskIds, organizationId) => {
  return await post(`ToConfirm/CalculateBillingAndWageAmounts?servicesTaskIds=${servicesTaskIds}&organizationId=${organizationId}`);
};

export {
  getServicesTasks,
  CalculateBillingAndWageAmounts
};
