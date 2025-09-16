import { get, post } from "./httpService";

export const rolePermissionService = {
    // Get user menu permissions
    getUserMenuPermissions: async (userId, organizationId = null) => {
        const params = organizationId ? `?organizationId=${organizationId}` : '';
        return await get(`RolePermission/user-permissions/${userId}${params}`);
    },

    // Get all menus for role permission management
    getAllMenus: async () => {
        return await get('RolePermission/menus');
    },

    // Save role permissions
    saveRolePermissions: async (permissions) => {
        return await post('RolePermission/save-permissions', permissions);
    }
}; 