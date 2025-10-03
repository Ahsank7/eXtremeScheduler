import React, { useState, useEffect } from "react";
import {
  Paper,
  Select,
  Text,
  Button,
  Grid,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { roleService, authenticationService } from "core/services";
import { localStoreService } from "core/services";

export function RoleManagement({ userId, userType, readOnly = false }) {
  const [rolesOptions, setRolesOptions] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [organizationId] = useState(localStoreService.getOrganizationID());
  const [selectKey, setSelectKey] = useState(0);

  // Load available roles when component mounts
  useEffect(() => {
    if (userType === 3) {
      loadAvailableRoles();
    }
  }, [userType, organizationId]);

  // Load current user role when component mounts or when roles are available
  useEffect(() => {
    if (userType === 3 && userId && rolesOptions.length > 0) {
      loadCurrentUserRole();
    }
  }, [userType, userId, rolesOptions]);

  // Ensure dropdown shows correct value when both roles and currentRole are available
  useEffect(() => {
    if (userType === 3 && rolesOptions.length > 0 && currentRole) {
      console.log('Role Management - Current role:', currentRole, 'Type:', typeof currentRole);
      console.log('Available roles:', rolesOptions);
      
      // Check for exact match first
      let selectedRole = rolesOptions.find(role => role.value === currentRole);
      if (!selectedRole) {
        // Try string comparison
        selectedRole = rolesOptions.find(role => role.value.toString() === currentRole.toString());
      }
      if (!selectedRole) {
        // Try number comparison
        selectedRole = rolesOptions.find(role => role.value === parseInt(currentRole));
      }
      
             if (selectedRole) {
         console.log('Role found in options:', selectedRole.label, 'Value:', selectedRole.value);
         // Ensure currentRole matches the exact type from rolesOptions (always use number)
         if (selectedRole.value !== currentRole) {
           console.log('Fixing type mismatch - updating currentRole to match role option type (number)');
           setCurrentRole(selectedRole.value);
         }
       } else {
        console.log('Role not found in options. Current role:', currentRole, 'Available roles:', rolesOptions);
        console.log('Type comparison failed - currentRole type:', typeof currentRole, 'role.value type:', typeof rolesOptions[0]?.value);
      }
    }
  }, [userType, rolesOptions, currentRole]);

  // Debug useEffect to track state changes
  useEffect(() => {
    if (userType === 3) {
      console.log('Role Management State Debug:', {
        rolesOptions: rolesOptions.length,
        currentRole,
        hasRoles: rolesOptions.length > 0,
        firstRole: rolesOptions[0]?.label,
        timestamp: new Date().toISOString()
      });
    }
  }, [userType, rolesOptions, currentRole]);

  // Debug useEffect to track component re-renders
  useEffect(() => {
    if (userType === 3) {
      console.log('Role Management Component re-render detected for staff user');
    }
  });

  const loadAvailableRoles = async () => {
    try {
      console.log('Loading available roles for organization:', organizationId);
      setIsLoading(true);
      const roleResponse = await roleService.getAvailableRoles(organizationId);
      console.log('Role response:', roleResponse);
      
      // Handle different response structures
      let rolesData = [];
      if (Array.isArray(roleResponse)) {
        // Direct array response
        rolesData = roleResponse;
      } else if (roleResponse && Array.isArray(roleResponse.data)) {
        // Response with data property
        rolesData = roleResponse.data;
      } else if (roleResponse && Array.isArray(roleResponse.response)) {
        // Response with response property
        rolesData = roleResponse.response;
      }
      
      if (rolesData.length > 0) {
        const roles = rolesData.map((item) => ({
          value: item.id,
          label: item.name,
          description: item.description
        }));
        console.log('Processed roles:', roles);
        setRolesOptions(roles);
      } else {
        console.log('No roles found in response:', roleResponse);
        notifications.show({
          title: "Error",
          message: "No roles found",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load available roles",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentUserRole = async () => {
    try {
      console.log('Loading current user role for userId:', userId);
      const credentialsResponse = await authenticationService.getUserCredentials(userId);
      console.log('Credentials response:', credentialsResponse);
      
      // Try different possible response structures
      let roleId = null;
      if (credentialsResponse?.roleId) {
        roleId = credentialsResponse.roleId;
      } else if (credentialsResponse?.data?.roleId) {
        roleId = credentialsResponse.data.roleId;
      } else if (credentialsResponse?.result?.roleId) {
        roleId = credentialsResponse.result.roleId;
      } else if (credentialsResponse?.data?.result?.roleId) {
        roleId = credentialsResponse.data.result.roleId;
      }
      
      if (roleId) {
        console.log('Setting current role from credentials:', roleId);
        // Store as number to match role option values
        setCurrentRole(parseInt(roleId));
        // Force refresh the Select component
        setSelectKey(prev => prev + 1);
      } else {
        console.log('No roleId found in credentials response');
        // Set default role if no role is assigned
        if (rolesOptions.length > 0) {
          console.log('Setting default role:', rolesOptions[0].value);
          setCurrentRole(rolesOptions[0].value);
          // Force refresh the Select component
          setSelectKey(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      // Set default role if fetch fails
      if (rolesOptions.length > 0) {
        console.log('Setting default role due to error:', rolesOptions[0].value);
        setCurrentRole(rolesOptions[0].value);
        // Force refresh the Select component
        setSelectKey(prev => prev + 1);
      }
    }
  };

  const handleRoleChange = async (newRoleId) => {
    if (!newRoleId || newRoleId === currentRole) return;
    
    setIsRoleLoading(true);
    try {
      const response = await roleService.assignRoleToUser(userId, parseInt(newRoleId), userId);
      console.log('Role assignment response:', response);
      
      // The httpService.handleApiResponse returns the data field from the API response
      // For role assignment, the API returns { data: false } but with isSuccess: true
      // Since handleApiResponse extracts the data field, we get false
      // But if we reach this point without an exception, it means the operation was successful
      // because handleApiResponse throws an error if isSuccess is false
      
      setCurrentRole(newRoleId);
      notifications.show({
        title: "Success",
        message: "Role updated successfully",
        color: "green",
      });
    } catch (error) {
      console.error("Error updating role:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update role",
        color: "red",
      });
    } finally {
      setIsRoleLoading(false);
    }
  };

  // Only show for staff users (UserType 3)
  if (userType !== 3) {
    return null;
  }

  return (
    <Paper withBorder p="md" radius="md">
      <LoadingOverlay visible={isLoading} />
      
      <Text size="xl" weight={700} mb="md">
        Role Management
      </Text>

             <Alert color="blue" mb="md">
         Role assignment is mandatory for staff users. This determines the user's permissions and access levels within the system.
       </Alert>


              <Grid gutter="md">
          <Grid.Col span={6}>
                         <Select
               key={`role-select-${selectKey}-${currentRole}-${rolesOptions.length}`}
               label="Current Role"
               placeholder="Select Role"
               data={rolesOptions}
               value={currentRole || ""}
               onChange={handleRoleChange}
               disabled={readOnly || isRoleLoading}
               required
               withAsterisk
               loading={isRoleLoading}
               description="Select the appropriate role for this staff member"
               searchable={false}
               clearable={false}
             />
          </Grid.Col>
        <Grid.Col span={6}>
                     <Text size="sm" color="dimmed" style={{ marginTop: '32px' }}>
             {currentRole ? (
               <>
                 <strong>Current Role:</strong> {rolesOptions.find(r => r.value === currentRole)?.label || 'Unknown'}
               </>
             ) : (
               'No role assigned - please select a role'
             )}
           </Text>
        </Grid.Col>
      </Grid>

             {currentRole && (
         <Paper withBorder p="sm" mt="md" style={{ backgroundColor: '#f8f9fa' }}>
           <Text size="sm" color="dimmed">
             <strong>Role Description:</strong> {rolesOptions.find(r => r.value === currentRole)?.description || 'No description available'}
           </Text>
         </Paper>
       )}


    </Paper>
  );
}
