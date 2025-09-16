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

const RolePermissionManagement = ({ organizationId }) => {
  const [loading, setLoading] = useState(false);
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoles();
    loadMenus();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await roleService.getAvailableRoles(organizationId);
      if (response.isSuccess) {
        setRoles(response.data.map(role => ({
          value: role.id,
          label: role.name
        })));
      }
    } catch (error) {
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
      const response = await rolePermissionService.getAllMenus();
      if (response.isSuccess) {
        const menuData = response.data;
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
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load menus',
        color: 'red'
      });
    } finally {
      setLoading(false);
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

    setSaving(true);
    try {
      const permissionsArray = Object.values(permissions);
      
      // Debug: Log what we're sending
      console.log('Saving permissions:', permissionsArray);
      
      const request = {
        roleId: selectedRole,
        organizationId: organizationId,
        permissions: permissionsArray
      };

      console.log('Request payload:', request);

      const response = await rolePermissionService.saveRolePermissions(request);
      if (response.isSuccess) {
        notifications.show({
          title: 'Success',
          message: 'Role permissions saved successfully',
          color: 'green'
        });
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save role permissions',
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
            onChange={setSelectedRole}
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