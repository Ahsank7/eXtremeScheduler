import { get, post, remove } from "./httpService";

const getDocumentItem = async (id) => {
    return await get(`Documents/Details?Id=${id}`);
};

const getDocumentByUserId = async (userId, documentTypeId) => {
    return await get(`Documents/DetailsByUserId?Id=${userId}&documentTypeId=${documentTypeId}`);
};

const getDocumentList = async (searchRequest) => {
    return await post(`Documents/List`, searchRequest);
};

const saveUpdateDocument = async (documentObj) => {
    return await post(`Documents/Upload`, documentObj);
};

const deleteDocumentItem = async (documentId) => {
    return await remove(`Documents/Delete?documentID=${documentId}`);
};

const uploadUserImage = async (userId, file) => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("file", file);
    return await post(`Documents/upload-user-image`, formData);
};

const getUserImage = async (userId) => {
    return await get(`Documents/get-user-image?userId=${userId}`);
};

const deleteUserImage = async (userId) => {
    return await remove(`Documents/delete-user-image?userId=${userId}`);
};

const uploadOrganizationImage = async (organizationId, file) => {
    const formData = new FormData();
    formData.append("organizationId", organizationId);
    formData.append("file", file);
    return await post(`Documents/upload-organization-logo`, formData);
};

const getOrganizationImage = async (organizationId) => {
    return await get(`Documents/get-organization-logo?organizationId=${organizationId}`);
};

const deleteOrganizationImage = async (organizationId) => {
    return await remove(`Documents/delete-organization-logo=${organizationId}`);
};

export {
    getDocumentItem,
    getDocumentByUserId,
    getDocumentList,
    saveUpdateDocument,
    deleteDocumentItem,
    uploadUserImage,
    getUserImage,
    deleteUserImage,
    getOrganizationImage,
    uploadOrganizationImage,
    deleteOrganizationImage
};
