import { get, post, put } from "./httpService";

export const packageService = {
  // Get all packages
  getAllPackages: async (includeInactive = false) => {
    return await get(`Package/All?includeInactive=${includeInactive}`);
  },

  // Get package by ID
  getPackageById: async (packageId) => {
    return await get(`Package/${packageId}`);
  },

  // Save or update package
  saveUpdatePackage: async (packageObj) => {
    return await post("Package/SaveUpdate", packageObj);
  },

  // Assign package to organization
  assignPackageToOrganization: async (assignmentObj) => {
    return await post("Package/AssignToOrganization", assignmentObj);
  },

  // Get organization package history
  getOrganizationPackageHistory: async (organizationId) => {
    return await get(`Package/Organization/${organizationId}/History`);
  },

  // Get current organization package
  getCurrentOrganizationPackage: async (organizationId) => {
    return await get(`Package/Organization/${organizationId}/Current`);
  },

  // Update organization package pricing
  updateOrganizationPackagePricing: async (pricingObj) => {
    return await put("Package/Organization/Package/UpdatePricing", pricingObj);
  },

  // Organization Card Management
  saveUpdateOrganizationCard: async (organizationId, cardObj) => {
    return await post(`Package/Organization/${organizationId}/Card`, cardObj);
  },

  getOrganizationCard: async (organizationId) => {
    return await get(`Package/Organization/${organizationId}/Card`);
  },

  validateOrganizationCard: async (organizationId) => {
    return await post(`Package/Organization/${organizationId}/Card/Validate`, {});
  },

  // Package Invoice Management
  getOrganizationInvoices: async (organizationId) => {
    return await get(`Package/Organization/${organizationId}/Invoices`);
  },

  getInvoiceById: async (invoiceId) => {
    return await get(`Package/Invoice/${invoiceId}`);
  },

  generateMonthlyInvoices: async (requestObj) => {
    return await post("Package/GenerateMonthlyInvoices", requestObj);
  },

  processInvoicePayment: async (requestObj) => {
    return await post("Package/ProcessInvoicePayment", requestObj);
  },
};

