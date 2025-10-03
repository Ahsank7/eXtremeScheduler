import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStoreService } from 'core/services';
import { rolePermissionService } from 'core/services';

const PermissionContext = createContext();

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const userInfo = localStoreService.getUserInfo();
      const token = localStoreService.getToken();
      
      console.log('Loading permissions for user:', userInfo);
      console.log('Token available:', !!token);
      
      if (!userInfo || !userInfo.UserID) {
        console.warn('No user info or UserID found');
        setLoading(false);
        return;
      }
      
      if (!token) {
        console.warn('No authentication token found');
        setLoading(false);
        return;
      }
      
      setUserInfo(userInfo);
      
      // Get user permissions
      const response = await rolePermissionService.getUserMenuPermissions(
        userInfo.UserID,
        userInfo.OrganizationId
      );
      
      if (response && Array.isArray(response)) {
        const permissionsMap = {};
        response.forEach(permission => {
          permissionsMap[permission.menuId] = permission;
        });
        setPermissions(permissionsMap);
        console.log('Permissions loaded successfully:', permissionsMap);
      } else {
        console.warn('Failed to load permissions:', response.message);
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (menuId, action = 'canView') => {
    if (!permissions[menuId]) return false;
    return permissions[menuId][action] || false;
  };

  const canView = (menuId) => hasPermission(menuId, 'canView');
  const canCreate = (menuId) => hasPermission(menuId, 'canCreate');
  const canEdit = (menuId) => hasPermission(menuId, 'canEdit');
  const canDelete = (menuId) => hasPermission(menuId, 'canDelete');

  const value = {
    permissions,
    loading,
    userInfo,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    refreshPermissions: loadUserPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}; 