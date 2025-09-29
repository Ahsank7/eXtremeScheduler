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
import imageUrlService from "../services/imageUrlService";
import { ChangePassword } from "shared/components/user/ChangePassword";
import { AppTable, AppModal } from "shared/components";
import React, { useState, useEffect } from "react";
import { UserType } from "core/enum";

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
        if (response && response.isSuccess && response.data) {
          setOrganizationName(response.data.name);
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
          <Logo width={120} />
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
                    src={imageUrlService.buildImageUrl(userInfo?.ProfileImagePath)}
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

export function Logo(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 623 163">
      <g fill="none" fillRule="evenodd">
        <path
          fill="#1864ab"
          fillRule="nonzero"
          d="M162.162 81.5c0-45.011-36.301-81.5-81.08-81.5C36.301 0 0 36.489 0 81.5 0 126.51 36.301 163 81.081 163s81.081-36.49 81.081-81.5z"
        />
        <g fill="#FFF">
          {/* Letter "A" */}
          <path
            fillRule="nonzero"
            d="M 85 60 Q 85 30 115 30 Q 145 30 145 60 Q 145 75 130 85 L 100 110 Q 90 120 90 130 L 145 130 L 145 140 L 85 140 Q 85 120 100 105 L 125 85 Q 135 75 135 60 Q 135 40 115 40 Q 95 40 95 60 Z"
          />
          {/* Number "2" */}
          <path d="M 20 140 L 60 20 L 100 140 L 85 140 L 75 110 L 45 110 L 35 140 Z M 52 95 L 68 95 L 60 70 Z" />
        </g>
        {/* Text "Scheduler" */}
        <text x="200" y="100" fill="currentColor" fontSize="85" fontFamily="Arial, sans-serif" fontWeight="bold">
          Scheduler
        </text>
      </g>
    </svg>
  );
}
