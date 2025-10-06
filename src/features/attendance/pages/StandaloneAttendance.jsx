import {
  Button,
  LoadingOverlay,
  Text,
  Card,
  Group,
  Stack,
  Badge,
  Grid,
  Paper,
  Title,
  Alert,
  Modal,
  TextInput,
  ActionIcon,
  Tooltip,
  Container,
  Center,
  Divider,
  Box,
  createStyles,
  useMantineTheme,
  TextInput as MantineTextInput,
  PasswordInput,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Moment from "moment";
import {
  localStoreService,
  franchiseService,
} from "core/services";
import * as planboardService from "core/services/attendancePlanboardService";
import * as authenticationService from "core/services/attendanceAuthService";
import { notifications } from "@mantine/notifications";
import {
  IconClock,
  IconCheck,
  IconX,
  IconCalendar,
  IconUser,
  IconMapPin,
  IconPhone,
  IconMail,
  IconAlertCircle,
  IconInfoCircle,
  IconRefresh,
  IconLogin,
  IconLogout,
  IconLock,
} from "@tabler/icons";
import { stringhelper } from "shared/utils";

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.md,
    maxWidth: '100%',
    minHeight: '100vh',
    background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
  },
  loginContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${theme.colors.blue[6]} 0%, ${theme.colors.blue[8]} 100%)`,
  },
  loginCard: {
    maxWidth: 400,
    width: '100%',
    padding: theme.spacing.xl * 2,
    background: theme.white,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    paddingTop: theme.spacing.lg,
    [theme.fn.smallerThan('sm')]: {
      paddingTop: theme.spacing.xl,
    },
  },
  taskCard: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows.md,
      transform: 'translateY(-2px)',
    },
  },
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[1],
  },
  statusBadge: {
    textTransform: 'capitalize',
  },
  actionButton: {
    height: 40,
    minWidth: 120,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  infoLabel: {
    fontWeight: 500,
    color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    minWidth: 100,
  },
  infoValue: {
    fontWeight: 600,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[9],
    fontSize: theme.fontSizes.sm,
  },
  modalContent: {
    padding: theme.spacing.lg,
  },
  timeInput: {
    marginBottom: theme.spacing.md,
  },
  refreshButton: {
    position: 'fixed',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 1000,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing.xl * 2,
  },
  logoutButton: {
    position: 'fixed',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1000,
    [theme.fn.smallerThan('sm')]: {
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      fontSize: theme.fontSizes.xs,
      padding: theme.spacing.xs,
    },
  },
}));

const StandaloneAttendance = () => {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const { franchiseName } = useParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Get today's date for filtering tasks
  const today = new Date();
  // Manually construct YYYY-MM-DD from local date components to avoid timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(today.getDate()).padStart(2, '0');
  const todayDateString = `${year}-${month}-${day}`;
  
  const todayStart = todayDateString;
  const todayEnd = todayDateString; // Same day for both start and end

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = () => {
    try {
      const token = localStoreService.getToken();
      const userInfo = localStoreService.getUserInfo();
      
      if (token && userInfo && userInfo.UserType === '2') {
        setIsAuthenticated(true);
        fetchTodaysTasks();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
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
      console.log("Attempting login with:", { username: loginForm.username, password: "***" });
      const response = await authenticationService.login({
        username: loginForm.username,
        password: loginForm.password,
      });
      console.log("Login response:", response);

      localStoreService.setToken(response.token);
      const userInfo = localStoreService.getUserInfo();
      
      if (userInfo.UserType !== '2') {
        notifications.show({
          title: "Access Denied",
          message: "This portal is only for Service Providers",
          color: "red",
        });
        localStoreService.clearLocalStorage();
        return;
      }

      setIsAuthenticated(true);
      notifications.show({
        title: "Success",
        message: "Login successful! Loading your tasks...",
        color: "green",
      });
      
      await fetchTodaysTasks();
    } catch (error) {
      console.error('Login failed:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response?.data,
        stack: error.stack
      });
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
    setTasks([]);
    setLoginForm({ username: '', password: '' });
    notifications.show({
      title: "Logged Out",
      message: "You have been logged out successfully",
      color: "blue",
    });
  };

  const fetchTodaysTasks = async () => {
    setIsLoading(true);
    try {
      const userNo = localStoreService.getUserNo(); // Get UserNo instead of UserID
      const franchiseId = localStoreService.getFranchiseID();
      
      const request = {
        serviceProviderUserNo: userNo, // Use UserNo for the stored procedure
        startDate: todayStart, // Already formatted as YYYY-MM-DD
        endDate: todayEnd, // Already formatted as YYYY-MM-DD
        franchiseId: franchiseId,
        pageNumber: 1,
        pageSize: 100, // Get all tasks for the day
      };
      
      console.log('Date debugging:', {
        today: today.toDateString(),
        todayDateString: todayDateString,
        todayStart: todayStart,
        todayEnd: todayEnd,
        startDate: request.startDate,
        endDate: request.endDate
      });

      const response = await planboardService.getServicesTasks(request);
      
      if (response && response.response) {
        setTasks(response.response);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      notifications.show({
        title: "Error",
        message: "Failed to fetch today's tasks",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'blue';
      case 'in-progress': return 'green';
      case 'completed': return 'teal';
      case 'cancelled': return 'red';
      case 'delayed': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return <IconClock size={16} />;
      case 'in-progress': return <IconLogin size={16} />;
      case 'completed': return <IconCheck size={16} />;
      case 'cancelled': return <IconX size={16} />;
      default: return <IconInfoCircle size={16} />;
    }
  };

  const canCheckIn = (task) => {
    return task.taskStatus === 'Scheduled' && !task.checkInTime;
  };

  const canCheckOut = (task) => {
    return task.taskStatus === 'In-Progress' && task.checkInTime && !task.checkOutTime;
  };

  const handleTaskClick = (task) => {
    if (task.taskStatus === 'Completed' || task.taskStatus === 'Cancelled') {
      return; // Don't allow interaction with completed/cancelled tasks
    }

    setSelectedTask(task);
    
    if (canCheckIn(task)) {
      setModalAction('checkin');
      setCheckInTime(new Date().toTimeString().slice(0, 5));
      setCheckOutTime('');
    } else if (canCheckOut(task)) {
      setModalAction('checkout');
      setCheckInTime(task.checkInTime ? new Date(task.checkInTime).toTimeString().slice(0, 5) : '');
      setCheckOutTime(new Date().toTimeString().slice(0, 5));
    }
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTask) return;

    setIsLoading(true);
    try {
      if (modalAction === 'checkin') {
        const taskDate = new Date(selectedTask.date).toISOString().split('T')[0];
        const checkInDateTime = `${taskDate}T${checkInTime}`;
        
        await planboardService.UpdateTaskAttendance({
          taskId: selectedTask.taskId,
          attendanceTime: new Date(checkInDateTime).toISOString(),
          updatedBy: localStoreService.getUserID(),
        });

        notifications.show({
          title: "Success",
          message: "Check-in recorded successfully",
          color: "green",
        });
      } else if (modalAction === 'checkout') {
        const taskDate = new Date(selectedTask.date).toISOString().split('T')[0];
        const checkInDateTime = `${taskDate}T${checkInTime}`;
        const checkOutDateTime = `${taskDate}T${checkOutTime}`;

        // Validate times
        const checkInTimeObj = new Date(checkInDateTime);
        const checkOutTimeObj = new Date(checkOutDateTime);
        
        if (checkOutTimeObj <= checkInTimeObj) {
          notifications.show({
            title: "Error",
            message: "Check-out time must be after check-in time",
            color: "red",
          });
          return;
        }

        await planboardService.AddTaskAttendance({
          taskId: selectedTask.taskId,
          checkInTime: checkInTimeObj.toISOString(),
          checkOutTime: checkOutTimeObj.toISOString(),
          updatedBy: localStoreService.getUserID(),
        });

        notifications.show({
          title: "Success",
          message: "Check-out recorded successfully",
          color: "green",
        });
      }

      setIsModalOpen(false);
      await fetchTodaysTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error saving attendance:', error);
      notifications.show({
        title: "Error",
        message: "Failed to save attendance",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTaskActionText = (task) => {
    if (canCheckIn(task)) return 'Check In';
    if (canCheckOut(task)) return 'Check Out';
    return 'View Details';
  };

  const getTaskActionIcon = (task) => {
    if (canCheckIn(task)) return <IconLogin size={16} />;
    if (canCheckOut(task)) return <IconLogout size={16} />;
    return <IconInfoCircle size={16} />;
  };

  const getTaskActionColor = (task) => {
    if (canCheckIn(task)) return 'green';
    if (canCheckOut(task)) return 'blue';
    return 'gray';
  };

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={classes.loginContainer}>
        <Card className={classes.loginCard}>
          <div className={classes.header}>
            <Title order={1} color="blue" mb="sm">
              Service Provider Portal
            </Title>
            <Text size="lg" color="dimmed" mb="md">
              Sign in to access your attendance portal
            </Text>
          </div>

          <Stack spacing="md">
            <MantineTextInput
              label="Username"
              placeholder="Enter your username"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              icon={<IconUser size={16} />}
              size="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
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
              color="blue"
              variant="light"
            >
              This portal is exclusively for Service Providers. Please use your assigned credentials to access your daily tasks and attendance management.
            </Alert>
          </Stack>
        </Card>
      </div>
    );
  }

  // Show attendance portal if authenticated
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
        <Title order={1} color="blue" mb="sm">
          Service Provider Attendance Portal
        </Title>
        <Text size="lg" color="dimmed" mb="md">
          {formatDate(today)}
        </Text>
        <Group position="center" spacing="md">
          <Badge size="lg" color="blue" variant="light">
            <IconCalendar size={16} style={{ marginRight: 8 }} />
            Today's Tasks
          </Badge>
        </Group>
      </div>

      {/* Tasks Grid */}
      {tasks.length === 0 ? (
        <Center className={classes.emptyState}>
          <Stack align="center" spacing="md">
            <IconCalendar size={64} color={theme.colors.gray[4]} />
            <Title order={3} color="dimmed">
              No tasks scheduled for today
            </Title>
            <Text color="dimmed">
              You don't have any tasks scheduled for today.
            </Text>
          </Stack>
        </Center>
      ) : (
        <Grid gutter="md" mt="lg">
          {tasks.map((task) => (
            <Grid.Col key={task.taskId} span={12} md={6} lg={4}>
              <Card
                className={`${classes.taskCard} ${
                  task.taskStatus === 'Completed' ? classes.taskCardCompleted : ''
                }`}
                p="md"
                onClick={() => handleTaskClick(task)}
                style={{
                  cursor: task.taskStatus === 'Completed' || task.taskStatus === 'Cancelled' 
                    ? 'default' : 'pointer'
                }}
              >
                <Stack spacing="sm">
                  {/* Task Header */}
                  <Group position="apart" align="flex-start">
                    <div>
                      <Text weight={600} size="lg">
                        Task #{task.taskId}
                      </Text>
                      <Text size="sm" color="dimmed">
                        {task.serviceName || 'Service'}
                      </Text>
                    </div>
                    <Badge
                      color={getStatusColor(task.taskStatus)}
                      variant="filled"
                      className={classes.statusBadge}
                      leftSection={getStatusIcon(task.taskStatus)}
                    >
                      {task.taskStatus}
                    </Badge>
                  </Group>

                  {/* Client Information */}
                  <Divider />
                  <div className={classes.infoRow}>
                    <IconUser size={16} color={theme.colors.blue[6]} />
                    <Text size="sm" weight={500}>
                      {task.clientName || 'N/A'}
                    </Text>
                  </div>

                  {/* Time Information */}
                  <div className={classes.infoRow}>
                    <IconClock size={16} color={theme.colors.green[6]} />
                    <Text size="sm">
                      {formatTime(task.startTime)} - {formatTime(task.endTime)}
                    </Text>
                  </div>

                  {/* Location */}
                  {task.clientAddress && (
                    <div className={classes.infoRow}>
                      <IconMapPin size={16} color={theme.colors.orange[6]} />
                      <Text size="sm" truncate>
                        {task.clientAddress}
                      </Text>
                    </div>
                  )}

                  {/* Contact Information */}
                  {task.clientPhone && (
                    <div className={classes.infoRow}>
                      <IconPhone size={16} color={theme.colors.teal[6]} />
                      <Text size="sm">
                        {task.clientPhone}
                      </Text>
                    </div>
                  )}

                  {/* Attendance Status */}
                  {(task.checkInTime || task.checkOutTime) && (
                    <Divider />
                  )}
                  
                  {task.checkInTime && (
                    <div className={classes.infoRow}>
                      <IconLogin size={16} color={theme.colors.green[6]} />
                      <Text size="sm" weight={500}>
                        Checked In: {formatTime(task.checkInTime)}
                      </Text>
                    </div>
                  )}

                  {task.checkOutTime && (
                    <div className={classes.infoRow}>
                      <IconLogout size={16} color={theme.colors.blue[6]} />
                      <Text size="sm" weight={500}>
                        Checked Out: {formatTime(task.checkOutTime)}
                      </Text>
                    </div>
                  )}

                  {/* Action Button */}
                  {task.taskStatus !== 'Completed' && task.taskStatus !== 'Cancelled' && (
                    <Button
                      fullWidth
                      className={classes.actionButton}
                      color={getTaskActionColor(task)}
                      leftIcon={getTaskActionIcon(task)}
                      variant={canCheckIn(task) || canCheckOut(task) ? "filled" : "outline"}
                    >
                      {getTaskActionText(task)}
                    </Button>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      )}

      {/* Check-in/Check-out Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${modalAction === 'checkin' ? 'Check In' : 'Check Out'} - Task #${selectedTask?.taskId}`}
        size="md"
        centered
      >
        <div className={classes.modalContent}>
          {selectedTask && (
            <Stack spacing="md">
              {/* Task Information */}
              <Alert
                icon={<IconInfoCircle size={16} />}
                title="Task Information"
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  <strong>Client:</strong> {selectedTask.clientName}<br />
                  <strong>Service:</strong> {selectedTask.serviceName}<br />
                  <strong>Scheduled Time:</strong> {formatTime(selectedTask.startTime)} - {formatTime(selectedTask.endTime)}
                </Text>
              </Alert>

              {/* Time Inputs */}
              <TextInput
                label="Check In Time"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                disabled={true}
                className={classes.timeInput}
                icon={<IconLogin size={16} />}
              />

              {modalAction === 'checkout' && (
                <TextInput
                  label="Check Out Time"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  disabled={true}
                  className={classes.timeInput}
                  icon={<IconLogout size={16} />}
                />
              )}

              {/* Notes */}
              <TextInput
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this task..."
                multiline
                minRows={2}
                maxRows={4}
              />

              {/* Action Buttons */}
              <Group position="right" mt="lg">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  color={modalAction === 'checkin' ? 'green' : 'blue'}
                  onClick={handleSave}
                  loading={isLoading}
                  leftIcon={modalAction === 'checkin' ? <IconLogin size={16} /> : <IconLogout size={16} />}
                >
                  {modalAction === 'checkin' ? 'Check In' : 'Check Out'}
                </Button>
              </Group>
            </Stack>
          )}
        </div>
      </Modal>

      {/* Refresh Button */}
      <ActionIcon
        className={classes.refreshButton}
        size="xl"
        radius="xl"
        color="blue"
        variant="filled"
        onClick={fetchTodaysTasks}
        loading={isLoading}
      >
        <IconRefresh size={20} />
      </ActionIcon>
    </Container>
  );
};

export default StandaloneAttendance;
