import { post } from "./httpService";

const saveUpdateschedule = async (saveScheduleObj) => {
  return await post(`Scheduler/CreateAppointment`, saveScheduleObj);
};

const getClientTasks = async (getClientTasksRequest) => {
  return await post(
    `Scheduler/GetClientTasks`,
    getClientTasksRequest
  );
};

const getServiceProviderTasks = async (getServiceProviderTasksRequest) => {
  return await post(
    `Scheduler/GetServiceProviderTasks`,
    getServiceProviderTasksRequest
  );
};

export { saveUpdateschedule, getClientTasks, getServiceProviderTasks };
