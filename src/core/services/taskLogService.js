import { post } from "./httpService";

const getTaskLogs = async (request) => {
  return await post("TaskLog/GetTaskLogs", request);
};

const insertTaskLog = async (taskId, actionType, previousValue = null, newValue = null, fieldName = null, description = null) => {
  return await post("TaskLog/InsertTaskLog", {
    taskId,
    actionType,
    previousValue,
    newValue,
    fieldName,
    description
  });
};

export { getTaskLogs, insertTaskLog };
