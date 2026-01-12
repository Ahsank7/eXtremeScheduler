import { useState, useEffect } from "react";
import {
  Stack,
  Switch,
  Group,
  Text,
  Loader,
  ScrollArea,
  Badge,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { rolePermissionService } from "core/services";

const MenuManagement = ({ organizationId }) => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    if (organizationId) {
      loadMenus();
    }
  }, [organizationId]);

  const loadMenus = async () => {
    setLoading(true);
    try {
      const response = await rolePermissionService.getAllMenusForAdmin(organizationId);
      
      // handleApiResponse returns the data directly
      if (response && Array.isArray(response)) {
        // Organize menus by parent/child relationship
        const menuList = response;
        setMenus(menuList);
      } else {
        notifications.show({
          title: "Warning",
          message: "No menus found for this organization",
          color: "yellow",
        });
        setMenus([]);
      }
    } catch (error) {
      console.error("Error loading menus:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load menus",
        color: "red",
      });
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMenu = async (menu, newStatus) => {
    const menuId = menu.id || menu.Id;
    setUpdating({ ...updating, [menuId]: true });
    try {
      // Ensure menuId is a valid GUID string
      if (!menuId) {
        throw new Error("Menu ID is required");
      }

      console.log("Updating menu status:", { menuId, newStatus, menu });
      
      const response = await rolePermissionService.updateMenuStatus(
        menuId,
        newStatus
      );

      console.log("Update menu status response:", response);

      // handleApiResponse throws an error if the operation failed
      // If we get here, the operation was successful
      // Update local state - handle both camelCase and PascalCase
      setMenus((prevMenus) =>
        prevMenus.map((m) => {
          const currentMenuId = m.id || m.Id;
          if (currentMenuId === menuId) {
            return { ...m, isActive: newStatus, IsActive: newStatus };
          }
          return m;
        })
      );

      const menuName = menu.menuName || menu.MenuName;
      notifications.show({
        title: "Success",
        message: `Menu "${menuName}" ${newStatus ? "enabled" : "disabled"} successfully`,
        color: "green",
      });
    } catch (error) {
      console.error("Error updating menu status:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        stack: error.stack,
      });
      
      // Extract a more user-friendly error message
      let errorMessage = "Failed to update menu status";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        errorMessage = error.response.data.errors[0];
      }
      
      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setUpdating({ ...updating, [menuId]: false });
    }
  };

  // Group menus by parent - handle both camelCase and PascalCase
  const parentMenus = menus.filter((m) => !(m.parentMenuId || m.ParentMenuId));
  const childMenus = menus.filter((m) => m.parentMenuId || m.ParentMenuId);

  const getChildMenus = (parentMenuId) => {
    return childMenus.filter((m) => {
      const pId = m.parentMenuId || m.ParentMenuId;
      return pId === parentMenuId;
    });
  };

  if (loading) {
    return (
      <Stack align="center" spacing="md" py="xl">
        <Loader size="md" />
        <Text size="sm" color="dimmed">
          Loading menus...
        </Text>
      </Stack>
    );
  }

  if (menus.length === 0) {
    return (
      <Stack align="center" spacing="md" py="xl">
        <Text size="sm" color="dimmed">
          No menus found for this organization.
        </Text>
      </Stack>
    );
  }

  return (
    <ScrollArea style={{ height: 500 }}>
      <Stack spacing="md">
        {parentMenus.map((parentMenu) => {
          const menuId = parentMenu.menuId || parentMenu.MenuId;
          const menuName = parentMenu.menuName || parentMenu.MenuName;
          const menuPath = parentMenu.menuPath || parentMenu.MenuPath;
          const isActive = parentMenu.isActive !== undefined ? parentMenu.isActive : parentMenu.IsActive;
          const id = parentMenu.id || parentMenu.Id;
          const children = getChildMenus(menuId);
          
          return (
            <div key={id}>
              <Group position="apart" p="sm" style={{ border: "1px solid #e9ecef", borderRadius: "4px" }}>
                <Group spacing="md">
                  <Switch
                    checked={isActive}
                    onChange={(event) =>
                      handleToggleMenu(parentMenu, event.currentTarget.checked)
                    }
                    disabled={updating[id]}
                    size="md"
                  />
                  <div>
                    <Group spacing="xs">
                      <Text weight={500}>{menuName}</Text>
                      <Badge
                        color={isActive ? "green" : "red"}
                        size="sm"
                      >
                        {isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Group>
                    {menuPath && (
                      <Text size="xs" color="dimmed">
                        {menuPath}
                      </Text>
                    )}
                  </div>
                </Group>
              </Group>

              {children.length > 0 && (
                <Stack spacing="xs" pl="xl" mt="xs">
                  {children.map((childMenu) => {
                    const childId = childMenu.id || childMenu.Id;
                    const childMenuName = childMenu.menuName || childMenu.MenuName;
                    const childMenuPath = childMenu.menuPath || childMenu.MenuPath;
                    const childIsActive = childMenu.isActive !== undefined ? childMenu.isActive : childMenu.IsActive;
                    
                    return (
                      <Group
                        key={childId}
                        position="apart"
                        p="sm"
                        style={{
                          border: "1px solid #e9ecef",
                          borderRadius: "4px",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <Group spacing="md">
                          <Switch
                            checked={childIsActive}
                            onChange={(event) =>
                              handleToggleMenu(
                                childMenu,
                                event.currentTarget.checked
                              )
                            }
                            disabled={updating[childId]}
                            size="sm"
                          />
                          <div>
                            <Group spacing="xs">
                              <Text size="sm" weight={500}>
                                {childMenuName}
                              </Text>
                              <Badge
                                color={childIsActive ? "green" : "red"}
                                size="xs"
                              >
                                {childIsActive ? "Active" : "Inactive"}
                              </Badge>
                            </Group>
                            {childMenuPath && (
                              <Text size="xs" color="dimmed">
                                {childMenuPath}
                              </Text>
                            )}
                          </div>
                        </Group>
                      </Group>
                    );
                  })}
                </Stack>
              )}
              <Divider my="md" />
            </div>
          );
        })}
      </Stack>
    </ScrollArea>
  );
};

export default MenuManagement;

