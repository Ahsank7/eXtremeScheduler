import React, { createContext, useContext, useState, useEffect } from 'react';
import { rolePermissionService } from 'core/services';
import { localStoreService } from 'core/services';

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
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      const userId = localStoreService.getUserID();
      const userType = localStoreService.getUserType();
      const organizationId = localStoreService.getOrganizationID();
      
      console.log('Loading permissions for user:', userId, 'type:', userType, 'org:', organizationId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Permission loading timeout')), 10000)
      );
      
      // Only load permissions for staff users (userType === 3)
      if (userType === '3' || userType === 3) {
        const response = await Promise.race([
          rolePermissionService.getUserMenuPermissions(userId, organizationId),
          timeoutPromise
        ]);
        console.log('User permissions response:', response);
        
        if (response && Array.isArray(response)) {
          const permissionMap = {};
          response.forEach(permission => {
            permissionMap[permission.menuId] = {
              canView: permission.canView,
              canCreate: permission.canCreate,
              canEdit: permission.canEdit,
              canDelete: permission.canDelete
            };
          });
          setPermissions(permissionMap);
          console.log('Set permissions:', permissionMap);
        }
      } else {
        // For non-staff users, set default permissions (allow all)
        setPermissions({});
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      // Set default permissions on error to prevent blocking
      setPermissions({});
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (menuId, permission = 'canView') => {
    // If no permissions loaded or user is not staff, allow access
    if (!initialized || Object.keys(permissions).length === 0) {
      return true;
    }
    
    const menuPermissions = permissions[menuId];
    if (!menuPermissions) {
      return true; // Allow access if no specific permission found
    }
    
    return menuPermissions[permission] === true;
  };

  const canView = (menuId) => hasPermission(menuId, 'canView');
  const canCreate = (menuId) => hasPermission(menuId, 'canCreate');
  const canEdit = (menuId) => hasPermission(menuId, 'canEdit');
  const canDelete = (menuId) => hasPermission(menuId, 'canDelete');

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const value = {
    permissions,
    loading,
    initialized,
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    reloadPermissions: loadUserPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};