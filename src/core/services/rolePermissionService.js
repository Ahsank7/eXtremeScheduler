import { get, post } from "./httpService";

export const rolePermissionService = {
    // Get user menu permissions
    getUserMenuPermissions: async (userId, organizationId = null) => {
        const params = organizationId ? `?organizationId=${organizationId}` : '';
        return await get(`RolePermission/user-permissions/${userId}${params}`);
    },

    // Get all menus for role permission management
    getAllMenus: async (organizationId) => {
        return await get(`RolePermission/menus/${organizationId}`);
    },

    // Get all menus for admin (including inactive)
    getAllMenusForAdmin: async (organizationId) => {
        return await get(`RolePermission/menus-for-admin/${organizationId}`);
    },

    // Update menu status (enable/disable)
    updateMenuStatus: async (menuId, isActive) => {
        return await post('RolePermission/update-menu-status', {
            menuId: menuId,
            isActive: isActive
        });
    },

    // Save role permissions
    saveRolePermissions: async (permissions) => {
        return await post('RolePermission/save-permissions', permissions);
    },

    // Get role permissions (for role management)
    getRolePermissions: async (roleId, organizationId) => {
        const params = organizationId ? `?organizationId=${organizationId}` : '';
        return await get(`RolePermission/role-permissions/${roleId}${params}`);
    }
}; 