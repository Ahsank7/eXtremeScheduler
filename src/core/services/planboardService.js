import { get, post } from "./httpService";

const getServicesTasks = async (serviceTask) => {
  return await post("PlanBoard/ServicesTask", serviceTask);
};

const getServicesTaskInfo = async (serviceTaskId, franchiseId) => {
  return await get(`PlanBoard/ServicesTaskInfo?taskId=${serviceTaskId}&franchiseId=${franchiseId}`);
};

const AddTaskAttendance = async (addTaskAttendance) => {
  return await post(`PlanBoard/AddTaskAttendance`, addTaskAttendance);
};

const UpdateTaskStatus = async (updateTaskStatus) => {
  return await post(`PlanBoard/UpdateTaskStatus`, updateTaskStatus);
};

const UpdateTaskAttendance = async (updateTaskAttendance) => {
  return await post(`PlanBoard/UpdateTaskAttendance`, updateTaskAttendance);
};

const UpdateTaskNotes = async (updateTaskNotes) => {
  return await post(`PlanBoard/UpdateTaskNotes`, updateTaskNotes);
};

const AssignServiceProvider = async (assignRequest) => {
  return await post(`PlanBoard/AssignServiceProvider`, assignRequest);
};

export {
  getServicesTasks,
  getServicesTaskInfo,
  AddTaskAttendance,
  UpdateTaskStatus,
  UpdateTaskAttendance,
  UpdateTaskNotes,
  AssignServiceProvider
};
