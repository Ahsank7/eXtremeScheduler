import { get, post } from "./httpService";

let organizations = [];

const getOrganizationList = async (userID) => {
  if (organizations.length > 0) return organizations;

  organizations = await get(`Organization/List/${userID}`);
  return organizations;
};

const getOrganizationByOrganizationName = async (orgName, userID) => {
  if (organizations.length === 0)
    organizations = await getOrganizationList(userID);

  return organizations.find((x) => x.name === orgName);
};

const getOrganizationByOrganizationID = async (orgID, userID) => {
  if (organizations.length === 0)
    organizations = await getOrganizationList(userID);

  return organizations.find((x) => x.id === orgID);
};

const getOrganizationById = async (id) => {
  return await get(`Organization/Info/${id}`);
};

const saveUpdateOrganization = async (organizationObj) => {
  return await post("Organization/SaveUpdateOrganization", organizationObj);
};

const getCurrencySign = async (organizationId) => {
  try {
    // First get the organization to get the CurrencySignId
    const orgResponse = await getOrganizationById(organizationId);
    if (orgResponse && orgResponse.data && orgResponse.data.currencySignId) {
      // Fetch the currency sign from lookup items
      const lookupResponse = await post("Lookup/GetItemsList", {
        lookupType: "CurrencySign",
        organizationId: organizationId
      });
      
      if (lookupResponse && lookupResponse.data && lookupResponse.data.result) {
        const currencySign = lookupResponse.data.result.find(item => item.id === orgResponse.data.currencySignId);
        return currencySign ? currencySign.name : '$';
      }
    }
    return '$'; // Default fallback
  } catch (error) {
    console.error('Error fetching currency sign:', error);
    return '$'; // Default fallback
  }
};

export {
  getOrganizationList,
  getOrganizationByOrganizationName,
  getOrganizationByOrganizationID,
  getOrganizationById,
  saveUpdateOrganization,
  getCurrencySign
};
