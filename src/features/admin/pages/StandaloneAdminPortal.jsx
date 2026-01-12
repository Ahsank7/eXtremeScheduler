import {
  Button,
  LoadingOverlay,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Grid,
  Container,
  Center,
  Divider,
  Box,
  createStyles,
  useMantineTheme,
  TextInput as MantineTextInput,
  PasswordInput,
  Modal,
  ActionIcon,
  Switch,
  Tooltip,
  Title,
  Alert,
  Tabs,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  localStoreService,
  organizationService,
  franchiseService,
  authenticationService,
} from "core/services";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconPlus,
  IconLogout,
  IconLock,
  IconUser,
  IconLogin,
  IconInfoCircle,
  IconRefresh,
  IconCheck,
  IconX,
  IconEdit,
  IconBuildingStore,
  IconBell,
} from "@tabler/icons";
import AdminOrganizationList from "../components/AdminOrganizationList";
import AddOrganization from "../components/AddOrganization";
import AddFranchiseToOrg from "../components/AddFranchiseToOrg";
import MenuManagement from "../components/MenuManagement";
import PackageManagement from "../components/PackageManagement";
import PackageHistory from "../components/PackageHistory";
import OrganizationCardManagement from "../components/OrganizationCardManagement";
import PackageInvoices from "../components/PackageInvoices";
import NotificationManagement from "../components/NotificationManagement";

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.md,
    maxWidth: "100%",
    minHeight: "100vh",
    background:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
  },
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(135deg, ${theme.colors.grape[6]} 0%, ${theme.colors.grape[8]} 100%)`,
  },
  loginCard: {
    maxWidth: 400,
    width: "100%",
    padding: theme.spacing.xl * 2,
    background: theme.white,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
    textAlign: "center",
    paddingTop: theme.spacing.lg,
    [theme.fn.smallerThan("sm")]: {
      paddingTop: theme.spacing.xl,
    },
  },
  logoutButton: {
    position: "fixed",
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
    [theme.fn.smallerThan("sm")]: {
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      fontSize: theme.fontSizes.xs,
      padding: theme.spacing.xs,
    },
  },
  refreshButton: {
    position: "fixed",
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 1000,
  },
}));

const StandaloneAdminPortal = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [addOrgModalOpen, setAddOrgModalOpen] = useState(false);
  const [addFranchiseModalOpen, setAddFranchiseModalOpen] = useState(false);
  const [orgSettingsModalOpen, setOrgSettingsModalOpen] = useState(false);
  const [packageManagementModalOpen, setPackageManagementModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const token = localStoreService.getToken();
      const userInfo = localStoreService.getUserInfo();

      if (token && userInfo) {
        // Check if user has role ID 6 (Super Admin)
        const roleId = userInfo.RoleID || userInfo.RoleId || userInfo.roleID || userInfo.roleId;
        if (roleId === 6 || roleId === "6") {
          setIsAuthenticated(true);
          fetchOrganizations();
        } else {
          setIsAuthenticated(false);
          localStoreService.clearLocalStorage();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      notifications.show({
        title: "Error",
        message: "Please enter both username and password",
        color: "red",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await authenticationService.login({
        username: loginForm.username,
        password: loginForm.password,
      });

      localStoreService.setToken(response.token);
      const userInfo = localStoreService.getUserInfo();

      // Check for role ID 6 (Super Admin)
      const roleId = userInfo.RoleID || userInfo.RoleId || userInfo.roleID || userInfo.roleId;
      if (roleId !== 6 && roleId !== "6") {
        notifications.show({
          title: "Access Denied",
          message: "This portal is only for Super Administrators (Role ID: 6)",
          color: "red",
        });
        localStoreService.clearLocalStorage();
        return;
      }

      setIsAuthenticated(true);
      notifications.show({
        title: "Success",
        message: "Login successful! Loading organizations...",
        color: "green",
      });

      await fetchOrganizations();
    } catch (error) {
      console.error("Login failed:", error);
      notifications.show({
        title: "Login Failed",
        message: "Invalid username or password",
        color: "red",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStoreService.clearLocalStorage();
    setIsAuthenticated(false);
    setOrganizations([]);
    setLoginForm({ username: "", password: "" });
    notifications.show({
      title: "Logged Out",
      message: "You have been logged out successfully",
      color: "blue",
    });
  };

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      // Clear cache to ensure we get fresh data
      organizationService.clearOrganizationCache();
      
      // For super admin, use the new GetAllOrganizations endpoint
      let response = await organizationService.getAllOrganizations();
      
      // Fallback to user-specific list if GetAllOrganizations fails
      if (!response || !Array.isArray(response) || response.length === 0) {
        const userId = localStoreService.getUserID();
        response = await organizationService.getOrganizationList(userId, true);
      }

      if (response && Array.isArray(response)) {
        // Fetch franchises for each organization WITHOUT user filtering (for admin)
        // This gets all franchises for the organization, not just user-accessible ones
        const orgsWithFranchises = await Promise.all(
          response.map(async (org) => {
            try {
              // Don't pass userId to get all franchises for the organization
              const franchises = await franchiseService.getFranchiseList(org.id, null);
              return {
                ...org,
                franchises: Array.isArray(franchises) ? franchises : [],
              };
            } catch (error) {
              console.error(`Error fetching franchises for org ${org.id}:`, error);
              return { ...org, franchises: [] };
            }
          })
        );
        setOrganizations(orgsWithFranchises);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch organizations",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrganization = () => {
    setAddOrgModalOpen(true);
  };

  const handleAddFranchise = (organization) => {
    setSelectedOrganization(organization);
    setAddFranchiseModalOpen(true);
  };

  const handleOrgModalClose = async () => {
    setAddOrgModalOpen(false);
    await fetchOrganizations();
  };

  const handleFranchiseModalClose = async () => {
    setAddFranchiseModalOpen(false);
    setSelectedOrganization(null);
    await fetchOrganizations();
  };

  const handleOrganizationClick = (organization) => {
    setSelectedOrganization(organization);
    setOrgSettingsModalOpen(true);
  };

  const handleOrgSettingsModalClose = () => {
    setOrgSettingsModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleToggleFranchise = async (franchise, organization) => {
    setIsLoading(true);
    try {
      const updatedFranchise = {
        id: franchise.id,
        name: franchise.name,
        description: franchise.description || "",
        organizationId: franchise.organizationId || organization.id,
        logo: franchise.logo || "",
        userId: localStoreService.getUserID(),
        isActive: !franchise.isActive,
      };

      await franchiseService.saveUpdateFranchiseList(updatedFranchise);
      
      notifications.show({
        title: "Success",
        message: `Franchise ${updatedFranchise.isActive ? "enabled" : "disabled"} successfully`,
        color: "green",
      });
      
      // Refresh to see updated state
      await fetchOrganizations();
    } catch (error) {
      console.error("Error toggling franchise:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update franchise status",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOrganization = async (organization) => {
    setIsLoading(true);
    try {
      const updatedOrg = {
        ...organization,
        IsActive: !organization.isActive,
      };
      
      // Map to the format expected by the API
      const orgData = {
        Id: organization.id,
        Name: organization.name,
        Description: organization.description || "",
        IsActive: !organization.isActive,
        DefaultBillingRate: organization.defaultBillingRate || 0,
        DefaultWageRate: organization.defaultWageRate || 0,
        CompleteAddress: organization.completeAddress || "",
        ContactNo: organization.contactNo || "",
        Email: organization.email || "",
        WebSite: organization.webSite || "",
        CurrencyId: organization.currencyId || 0,
        CurrencySignId: organization.currencySignId || null,
        CalculationTypeId: organization.calculationTypeId || 1,
        TaxPercentage: organization.taxPercentage || 0,
        DiscountPercentage: organization.discountPercentage || 0,
        ServiceRateForBilling: organization.serviceRateForBilling || 1,
        TimeZone: organization.timeZone || "Pakistan Standard Time",
      };

      await organizationService.saveUpdateOrganization(orgData);
      notifications.show({
        title: "Success",
        message: `Organization ${updatedOrg.IsActive ? "enabled" : "disabled"} successfully`,
        color: "green",
      });
      await fetchOrganizations();
    } catch (error) {
      console.error("Error toggling organization:", error);
      notifications.show({
        title: "Error",
        message: "Failed to update organization status",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={classes.loginContainer}>
        <Card className={classes.loginCard}>
          <div className={classes.header}>
            <Title order={1} color="grape" mb="sm">
              Super Admin Portal
            </Title>
            <Text size="lg" color="dimmed" mb="md">
              Sign in to access the administration portal
            </Text>
          </div>

          <Stack spacing="md">
            <MantineTextInput
              label="Username"
              placeholder="Enter your username"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({ ...loginForm, username: e.target.value })
              }
              icon={<IconUser size={16} />}
              size="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              icon={<IconLock size={16} />}
              size="md"
            />

            <Button
              fullWidth
              size="md"
              onClick={handleLogin}
              loading={isLoggingIn}
              leftIcon={<IconLogin size={16} />}
            >
              Sign In
            </Button>

            <Alert
              icon={<IconInfoCircle size={16} />}
              title="Access Information"
              color="grape"
              variant="light"
            >
              This portal is exclusively for Super Administrators (Role ID: 6).
              Please use your assigned credentials to access organization and
              franchise management.
            </Alert>
          </Stack>
        </Card>
      </div>
    );
  }

  // Show admin portal if authenticated
  return (
    <Container size="xl" className={classes.container}>
      <LoadingOverlay visible={isLoading} />

      {/* Logout Button */}
      <Button
        className={classes.logoutButton}
        variant="outline"
        color="red"
        size="sm"
        onClick={handleLogout}
        leftIcon={<IconX size={16} />}
      >
        Logout
      </Button>

      {/* Header */}
      <div className={classes.header}>
        <Title order={1} color="grape" mb="sm">
          Super Admin Portal
        </Title>
        <Text size="lg" color="dimmed" mb="md">
          Manage Organizations and Franchises
        </Text>
        <Group position="center" spacing="md">
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={handleAddOrganization}
            size="md"
          >
            Add New Organization
          </Button>
          <Button
            leftIcon={<IconBuilding size={16} />}
            onClick={() => setPackageManagementModalOpen(true)}
            size="md"
            variant="outline"
          >
            Manage Packages
          </Button>
          <Button
            leftIcon={<IconBell size={16} />}
            onClick={() => setNotificationModalOpen(true)}
            size="md"
            variant="outline"
            color="blue"
          >
            Send Notification
          </Button>
        </Group>
      </div>

      {/* Organizations List */}
      <AdminOrganizationList
        organizations={organizations}
        onAddFranchise={handleAddFranchise}
        onToggleOrganization={handleToggleOrganization}
        onOrganizationClick={handleOrganizationClick}
        onToggleFranchise={handleToggleFranchise}
      />

      {/* Add Organization Modal */}
      <Modal
        opened={addOrgModalOpen}
        onClose={() => setAddOrgModalOpen(false)}
        title="Add New Organization"
        size="lg"
        centered
      >
        <AddOrganization onModalClose={handleOrgModalClose} />
      </Modal>

      {/* Add Franchise Modal */}
      <Modal
        opened={addFranchiseModalOpen}
        onClose={() => setAddFranchiseModalOpen(false)}
        title={`Add Franchise to ${selectedOrganization?.name || "Organization"}`}
        size="lg"
        centered
      >
        {selectedOrganization && (
          <AddFranchiseToOrg
            organizationId={selectedOrganization.id}
            organizationName={selectedOrganization.name}
            onModalClose={handleFranchiseModalClose}
          />
        )}
      </Modal>

      {/* Organization Settings Modal */}
      <Modal
        opened={orgSettingsModalOpen}
        onClose={handleOrgSettingsModalClose}
        title={`${selectedOrganization?.name || "Organization"} Settings`}
        size="90%"
        centered
        styles={{
          body: { maxHeight: '85vh', overflowY: 'auto' },
          content: { maxHeight: '90vh' }
        }}
      >
        {selectedOrganization && (
          <Tabs defaultValue="Menus" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="Menus">Menus</Tabs.Tab>
              <Tabs.Tab value="Package">Package History</Tabs.Tab>
              <Tabs.Tab value="Card">Payment Card</Tabs.Tab>
              <Tabs.Tab value="Invoices">Invoices</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="Menus" pt="md">
              <MenuManagement organizationId={selectedOrganization.id} />
            </Tabs.Panel>

            <Tabs.Panel value="Package" pt="md">
              <PackageHistory organizationId={selectedOrganization.id} />
            </Tabs.Panel>

            <Tabs.Panel value="Card" pt="md">
              <OrganizationCardManagement organizationId={selectedOrganization.id} />
            </Tabs.Panel>

            <Tabs.Panel value="Invoices" pt="md">
              <PackageInvoices organizationId={selectedOrganization.id} />
            </Tabs.Panel>
          </Tabs>
        )}
      </Modal>

      {/* Package Management Modal */}
      <Modal
        opened={packageManagementModalOpen}
        onClose={() => setPackageManagementModalOpen(false)}
        title="Package Management"
        size="90%"
        centered
        styles={{
          body: { maxHeight: '85vh', overflowY: 'auto' },
          content: { maxHeight: '90vh' }
        }}
      >
        <PackageManagement />
      </Modal>

      {/* Notification Management Modal */}
      <Modal
        opened={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
        title="Send Notification to Users"
        size="lg"
        centered
      >
        <NotificationManagement />
      </Modal>

      {/* Refresh Button */}
      <ActionIcon
        className={classes.refreshButton}
        size="xl"
        radius="xl"
        color="grape"
        variant="filled"
        onClick={fetchOrganizations}
        loading={isLoading}
      >
        <IconRefresh size={20} />
      </ActionIcon>
    </Container>
  );
};

export default StandaloneAdminPortal;

