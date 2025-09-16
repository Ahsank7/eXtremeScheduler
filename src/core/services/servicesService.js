import { get, post, put, remove } from "./httpService";

const getServiceTypes = async (organizationId) => {
    return await get(`Services/List/ServiceType?organizationId=${organizationId}`);
};

const getServicesByType = async (serviceTypeId) => {
    return await get(`Services/List?serviceTypeId=${serviceTypeId}`);
};

const addServiceType = async (serviceTypeObj) => {
    return await post("Services/ServiceType", serviceTypeObj);
};

const updateServiceType = async (serviceTypeObj) => {
    return await put("Services/ServiceType", serviceTypeObj);
};

const deleteServiceType = async (serviceTypeId) => {
    return await remove(`Services/ServiceType/${serviceTypeId}`);
};

const addService = async (serviceObj) => {
    return await post("Services", serviceObj);
};

const updateService = async (serviceTypeObj) => {
    return await put("Services", serviceTypeObj);
};

const deleteService = async (serviceId) => {
    return await remove(`Services/${serviceId}`);
};

export { getServiceTypes, getServicesByType, addServiceType, updateServiceType, deleteServiceType, addService, updateService, deleteService }; 