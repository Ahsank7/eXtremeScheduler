import { get, post, remove } from "./httpService";

const getBillingSettings = async (organizationId) => {
  return await get(`OrganizationBillingSettings/${organizationId}`);
};

const saveBillingSettings = async (settings) => {
  return await post("OrganizationBillingSettings/save", settings);
};

const getTimeBasedRates = async (organizationId) => {
  return await get(`OrganizationBillingSettings/timebasedrates/${organizationId}`);
};

const saveTimeBasedRate = async (rate) => {
  return await post("OrganizationBillingSettings/timebasedrates", rate);
};

const deleteTimeBasedRate = async (id, organizationId) => {
  return await remove(`OrganizationBillingSettings/timebasedrates/${id}?organizationId=${organizationId}`);
};

export {
  getBillingSettings,
  saveBillingSettings,
  getTimeBasedRates,
  saveTimeBasedRate,
  deleteTimeBasedRate
};
