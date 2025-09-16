import { get } from "./httpService";

const getFranchiseDashboardData = async (franchiseId, startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate.toISOString().split('T')[0]);
  if (endDate) params.append('endDate', endDate.toISOString().split('T')[0]);
  
  return await get(`Franchise/Dashboard/${franchiseId}?${params.toString()}`);
};

export const franchiseDashboardService = {
  getFranchiseDashboardData,
};
