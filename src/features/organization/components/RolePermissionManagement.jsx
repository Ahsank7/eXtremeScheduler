import React, { useState, useEffect } from 'react';
import {
  Paper,
  Title,
  Stack,
  Group,
  Select,
  Checkbox,
  Button,
  Alert,
  Divider,
  Accordion,
  Text,
  Badge,
  LoadingOverlay
} from '@mantine/core';
import { IconShield, IconCheck, IconX } from '@tabler/icons';
import { notifications } from '@mantine/notifications';
import { roleService, rolePermissionService } from 'core/services';
import { usePermissions } from 'core/context/PermissionContext';

const RolePermissionManagement = ({ organizationId }) => {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);
  const { reloadPermissions } = usePermissions();

  useEffect(() => {
    loadRoles();
    loadMenus();
  }, []);

  // Load existing permissions when role is selected
  useEffect(() => {
    if (selectedRole && menus.length > 0) {
      loadExistingPermissions();
    }
  }, [selectedRole, menus]);

  const loadRoles = async () => {
    try {
      console.log('Loading roles for organization:', organizationId);
      const response = await roleService.getAvailableRoles(organizationId);
      console.log('Role Permission Management - Role response:', response);
      
      // Handle different response structures
      let rolesData = [];
      if (Array.isArray(response)) {
        // Direct array response
        rolesData = response;
      } else if (response && Array.isArray(response.data)) {
        // Response with data property
        rolesData = response.data;
      } else if (response && Array.isArray(response.response)) {
        // Response with response property
        rolesData = response.response;
      }
      
      console.log('Processed roles data:', rolesData);
      
      if (rolesData.length > 0) {
        const roleOptions = rolesData.map(role => ({
          value: role.id,
          label: role.name
        }));
        setRoles(roleOptions);
        console.log('Set roles:', roleOptions);
      } else {
        console.log('No roles found in response:', response);
        notifications.show({
          title: 'Info',
          message: 'No roles available for this organization. Please create roles first.',
          color: 'blue'
        });
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load roles',
        color: 'red'
      });
    }
  };

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await rolePermissionService.getAllMenus(organizationId);
      console.log('Menu response:', response);
      
      if (response && Array.isArray(response)) {
        const menuData = response;
        setMenus(menuData);
        
        // Initialize permissions with default values
        const initialPermissions = {};
        menuData.forEach(menu => {
          initialPermissions[menu.menuId] = {
            menuId: menu.menuId,
            menuName: menu.menuName,
            canView: true,
            canCreate: false,
            canEdit: false,
            canDelete: false
          };
        });
        setPermissions(initialPermissions);
        console.log('Initialized permissions:', initialPermissions);
        
        // Show success notification for menu loading
        notifications.show({
          title: 'Success',
          message: `Loaded ${menuData.length} menu items for permission configuration`,
          color: 'green'
        });
      } else {
        console.log('No menu data received or invalid format:', response);
        notifications.show({
          title: 'Warning',
          message: 'No menu data available. Please ensure menus are configured in the database.',
          color: 'yellow'
        });
      }
    } catch (error) {
      console.error('Error loading menus:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load menus',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExistingPermissions = async () => {
    if (!selectedRole) return;
    
    try {
      console.log('Loading existing permissions for role:', selectedRole, 'organization:', organizationId);
      const response = await rolePermissionService.getRolePermissions(selectedRole, organizationId);
      console.log('Existing permissions response:', response);
      
      if (response && Array.isArray(response)) {
        const existingPermissions = {};
        response.forEach(permission => {
          existingPermissions[permission.menuId] = {
            menuId: permission.menuId,
            menuName: permission.menuName,
            canView: permission.canView,
            canCreate: permission.canCreate,
            canEdit: permission.canEdit,
            canDelete: permission.canDelete
          };
        });
        
        console.log('Processed existing permissions:', existingPermissions);
        
        // Merge with existing permissions, keeping defaults for menus not in response
        const mergedPermissions = { ...permissions };
        Object.keys(mergedPermissions).forEach(menuId => {
          if (existingPermissions[menuId]) {
            mergedPermissions[menuId] = existingPermissions[menuId];
          }
        });
        
        setPermissions(mergedPermissions);
        console.log('Final merged permissions:', mergedPermissions);
        
        // Show info notification for existing permissions
        const permissionCount = Object.keys(existingPermissions).length;
        if (permissionCount > 0) {
          notifications.show({
            title: 'Info',
            message: `Loaded ${permissionCount} existing permissions for this role`,
            color: 'blue'
          });
        }
      }
    } catch (error) {
      console.error('Failed to load existing permissions:', error);
      // Don't show error notification as this is not critical
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    if (roleId) {
      notifications.show({
        title: 'Info',
        message: 'Role selected. Loading existing permissions...',
        color: 'blue'
      });
    }
  };

  const handlePermissionChange = (menuId, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        [permission]: value
      }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) {
      notifications.show({
        title: 'Error',
        message: 'Please select a role',
        color: 'red'
      });
      return;
    }

    if (!organizationId) {
      notifications.show({
        title: 'Error',
        message: 'Organization ID is required',
        color: 'red'
      });
      return;
    }

    setSaving(true);
    
    // Show loading notification
    notifications.show({
      title: 'Info',
      message: 'Saving role permissions...',
      color: 'blue'
    });
    
    try {
      const permissionsArray = Object.values(permissions).filter(permission => 
        permission && permission.menuId
      );
      
      if (permissionsArray.length === 0) {
        notifications.show({
          title: 'Error',
          message: 'No valid permissions to save',
          color: 'red'
        });
        return;
      }
      
      // Debug: Log what we're sending
      console.log('Saving permissions:', permissionsArray);
      console.log('Selected role:', selectedRole, 'Type:', typeof selectedRole);
      console.log('Organization ID:', organizationId, 'Type:', typeof organizationId);
      
      const request = {
        roleId: parseInt(selectedRole),
        organizationId: organizationId,
        permissions: permissionsArray
      };

      console.log('Request payload:', request);
      console.log('Request payload JSON:', JSON.stringify(request, null, 2));

      const response = await rolePermissionService.saveRolePermissions(request);
      console.log('Save response:', response);
      
      // The response should be a boolean (true/false) from the backend
      // If we get here without an exception, the operation was successful
      notifications.show({
        title: 'Success',
        message: 'Role permissions saved successfully',
        color: 'green'
      });
      
      // Reload existing permissions to reflect the saved state
      await loadExistingPermissions();
      
      // Reload user permissions in the context
      await reloadPermissions();
    } catch (error) {
      console.error('Error saving permissions:', error);
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to save role permissions',
        color: 'red'
      });
    } finally {
      setSaving(false);
    }
  };

  const getPermissionIcon = (hasPermission) => {
    return hasPermission ? <IconCheck size={16} color="green" /> : <IconX size={16} color="red" />;
  };

  const getPermissionBadge = (hasPermission) => {
    return hasPermission ? 
      <Badge color="green" size="sm">Yes</Badge> : 
      <Badge color="red" size="sm">No</Badge>;
  };

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder>
      <LoadingOverlay visible={loading} />
      
      <Stack spacing="lg">
        <Group position="apart">
          <Title order={3}>
            <IconShield size={24} style={{ marginRight: 8 }} />
            Role-Based Access Control
          </Title>
        </Group>

        <Alert color="blue" title="Access Control Setup">
          Configure role-based access control for staff users. Select a role and set permissions for each menu item.
          This system allows you to control what staff members can view, create, edit, and delete within your organization.
        </Alert>

        <Group>
          <Select
            label="Role"
            placeholder="Select role"
            data={roles}
            value={selectedRole}
            onChange={handleRoleChange}
            style={{ flex: 1 }}
            required
          />
        </Group>

        {selectedRole && menus.length > 0 && (
          <>
            <Divider />
            
            <Stack spacing="md">
              <Title order={4}>Menu Permissions</Title>
              
              <Accordion variant="contained">
                {menus.map((menu) => (
                  <Accordion.Item key={menu.menuId} value={menu.menuId}>
                    <Accordion.Control>
                      <Group position="apart">
                        <Text weight={500}>{menu.menuName}</Text>
                        <Group spacing="xs">
                          {getPermissionBadge(permissions[menu.menuId]?.canView)}
                          {getPermissionBadge(permissions[menu.menuId]?.canCreate)}
                          {getPermissionBadge(permissions[menu.menuId]?.canEdit)}
                          {getPermissionBadge(permissions[menu.menuId]?.canDelete)}
                        </Group>
                      </Group>
                    </Accordion.Control>
                    
                    <Accordion.Panel>
                      <Stack spacing="sm">
                        <Group>
                          <Checkbox
                            label="Can View"
                            checked={permissions[menu.menuId]?.canView || false}
                            onChange={(event) => handlePermissionChange(menu.menuId, 'canView', event.currentTarget.checked)}
                          />
                          <Checkbox
                            label="Can Create"
                            checked={permissions[menu.menuId]?.canCreate || false}
                            onChange={(event) => handlePermissionChange(menu.menuId, 'canCreate', event.currentTarget.checked)}
                          />
                          <Checkbox
                            label="Can Edit"
                            checked={permissions[menu.menuId]?.canEdit || false}
                            onChange={(event) => handlePermissionChange(menu.menuId, 'canEdit', event.currentTarget.checked)}
                          />
                          <Checkbox
                            label="Can Delete"
                            checked={permissions[menu.menuId]?.canDelete || false}
                            onChange={(event) => handlePermissionChange(menu.menuId, 'canDelete', event.currentTarget.checked)}
                          />
                        </Group>
                        
                        {menu.menuPath && (
                          <Text size="sm" color="dimmed">
                            Path: {menu.menuPath}
                          </Text>
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Stack>

            <Group position="right">
              <Button
                onClick={handleSavePermissions}
                loading={saving}
                leftIcon={<IconShield size={16} />}
              >
                Save Permissions
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default RolePermissionManagement; 