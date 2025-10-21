import { get, post, put, remove } from "./httpService";

const getAvailableRoles = async (organizationId = null) => {
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return await get(`Role/available${params}`);
};

const getRoleById = async (roleId) => {
    return await get(`Role/${roleId}`);
};

const createRole = async (roleData) => {
    return await post('Role', roleData);
};

const updateRole = async (roleId, roleData) => {
    return await put(`Role/${roleId}`, roleData);
};

const deleteRole = async (roleId) => {
    return await remove(`Role/${roleId}`);
};

const assignRoleToUser = async (userId, roleId, createdBy = null) => {
    const request = {
        userId: userId,
        roleId: roleId,
        createdBy: createdBy
    };
    return await post('Role/assign', request);
};

const roleService = {
    getAvailableRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser
};

export default roleService;
export {
    getAvailableRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser
};
