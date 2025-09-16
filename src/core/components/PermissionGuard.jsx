import React from 'react';
import { usePermissions } from '../context/PermissionContext';

const PermissionGuard = ({ 
  menuId, 
  action = 'canView', 
  children, 
  fallback = null,
  showIfNoPermission = false 
}) => {
  const { hasPermission } = usePermissions();
  
  const hasAccess = hasPermission(menuId, action);
  
  if (showIfNoPermission) {
    return hasAccess ? null : children;
  }
  
  return hasAccess ? children : fallback;
};

export default PermissionGuard; 