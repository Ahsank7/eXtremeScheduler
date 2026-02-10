import {
  createStyles,
  Header,
  Group,
  Burger,
  Menu,
  UnstyledButton,
  Avatar,
  Text,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconChevronRight, IconLogout, IconSun, IconMoon, IconLock } from "@tabler/icons";
import { useNavigate } from "react-router-dom";
import { localStoreService, loginHistoryService, organizationService } from "core/services";
import { useTheme } from "../context/ThemeContext";
import { useSidebar } from "../context/SidebarContext";
import { buildImageUrl } from "../utils/urlHelper";
import { ChangePassword } from "shared/components/user/ChangePassword";
import { AppTable, AppModal } from "shared/components";
import React, { useState, useEffect } from "react";
import { UserType } from "core/enum";
import { NotificationBell } from "./NotificationBell";

const useStyles = createStyles((theme) => ({
  header: {
    paddingLeft: theme.spacing.md,
    borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    height: "8vh",
  },

  headerMenu: {
    height: "100%",
    paddingRight: theme.spacing.md,
    paddingLeft: theme.spacing.md,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.gray[0],
    },
  },
}));

export function AppHeader({ franchiseName }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState(null);
  const { classes, theme } = useStyles();
  const naviagte = useNavigate();
  const { colorScheme, toggleColorScheme } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const userInfo = localStoreService.getUserInfo();
  const userType = localStoreService.getUserType();


  useEffect(() => {
    fetchOrganizationName();
  }, []);

  const fetchOrganizationName = async () => {
    try {
      const organizationId = localStoreService.getOrganizationID();
      if (organizationId) {
        const response = await organizationService.getOrganizationById(organizationId);
        if (response && response.name) {
          setOrganizationName(response.name);
        }
      }
    } catch (error) {
      console.error('Error fetching organization name:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Log logout history before clearing storage
      const userInfo = localStoreService.getUserInfo();
      if (userInfo?.UserID) {
        await loginHistoryService.updateLogoutTime(userInfo.UserID);
      }
    } catch (error) {
      console.error('Failed to log logout history:', error);
      // Don't block logout if logging fails
    }
    
    localStoreService.clearLocalStorage();
    naviagte("/login");
  };

  const handleChangePassword = () => {
    setIsModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setIsModalOpen(false);
  };


  return (
    <Header shadow="md" className={classes.header}>
      <Group position="apart" style={{ height: "100%" }}>
        <Group>
          <Burger opened={!isCollapsed} onClick={toggleSidebar} size="sm" />
          <Logo width={180} />
          {(organizationName && franchiseName && userType == UserType.Staffs) && (
            <Group spacing={4} style={{ marginLeft: "16px" }}>
              {organizationName && (
                <Text 
                  size="sm" 
                  color="#0078d4" 
                  weight={500}
                  style={{ 
                    cursor: "pointer", 
                    fontSize: "14px",
                    textDecoration: "none"
                  }}
                  onClick={() => naviagte("/organizations")}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  {organizationName}
                </Text>
              )}
              {franchiseName && (
                <>
                  <Text size="sm" color="dimmed" style={{ fontSize: "14px" }}>/</Text>
                  <Text 
                    size="sm" 
                    color="#0078d4" 
                    weight={500}
                    style={{ 
                      cursor: "pointer", 
                      fontSize: "14px",
                      textDecoration: "none"
                    }}
                    onClick={() => naviagte(`/franchises/${franchiseName}/dashboard`)}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  >
                    {franchiseName}
                  </Text>
                </>
              )}
            </Group>
          )}
        </Group>

        <Group className={classes.headerMenu}>
          <NotificationBell theme={theme} />
          
          <Tooltip label={colorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <ActionIcon
              variant="outline"
              color={colorScheme === 'dark' ? 'yellow' : 'blue'}
              onClick={toggleColorScheme}
              size="lg"
            >
              {colorScheme === 'dark' ? (
                <IconSun size="1.1rem" />
              ) : (
                <IconMoon size="1.1rem" />
              )}
            </ActionIcon>
          </Tooltip>
          
          <Menu withArrow width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group>
                  <Avatar
                    src={buildImageUrl(userInfo?.ProfileImagePath)}
                    radius="xl"
                  />
                  <Stack spacing={0}>
                    <Text size="sm" weight={500}>
                      {userInfo?.FullName || "-"}
                    </Text>

                    <Text color="dimmed" size="xs">
                      {userInfo?.Email || "-"}
                    </Text>
                  </Stack>
                  <IconChevronRight size="1rem" />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown mt="0.4rem">
              <Menu.Item
                onClick={handleChangePassword}
                icon={
                  <IconLock
                    size="0.9rem"
                    stroke={1.5}
                    color={theme.colors.blue[6]}
                  />
                }
              >
                Change Password
              </Menu.Item>
              <Menu.Item
                onClick={handleLogout}
                icon={
                  <IconLogout
                    size="0.9rem"
                    stroke={1.5}
                    color={theme.colors.red[6]}
                  />
                }
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>


      <AppModal
        opened={isModalOpen}
        onClose={closeChangePasswordModal}
        title="Change Password"
      >
        <ChangePassword
          userId={userInfo?.UserID}
          onSuccess={closeChangePasswordModal}
        />
      </AppModal>

    </Header>
  );
}

export function Logo({ width = 180, ...props }) {
  return (
    <img
      src="/caresyncHC-Logo.PNG"
      alt="caresynX Scheduler"
      width={width}
      height="auto"
      style={{ maxHeight: "40px", objectFit: "contain" }}
      {...props}
    />
  );
}
