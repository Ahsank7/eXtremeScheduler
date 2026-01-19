import {
  Button,
  Select,
  TextInput,
  DateTimeInput,
  Grid,
  Text,
  Card,
  Group,
  createStyles,
  Box,
  Stack,
  Divider,
  Badge,
  Paper,
  Title,
  Alert,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { planboardService, localStoreService } from "core/services";
import { useFranchise } from "core/context/FranchiseContext";
import { 
  IconCalendar, 
  IconClock, 
  IconCheck, 
  IconX, 
  IconEdit, 
  IconNotes,
  IconAlertCircle,
  IconInfoCircle,
  IconHistory,
} from "@tabler/icons";
import TaskLogModal from "../modal/TaskLogModal";
import { notifications } from "@mantine/notifications";

const useStyles = createStyles((theme) => ({
  container: {
    padding: theme.spacing.sm,
    maxWidth: '100%',
  },
  header: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    marginBottom: theme.spacing.md,
    border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.sm,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[8],
    fontWeight: 600,
    fontSize: theme.fontSizes.sm,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: 500,
    color: theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.colors.gray[7],
    fontSize: theme.fontSizes.xs,
  },
  infoValue: {
    fontWeight: 600,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[9],
    fontSize: theme.fontSizes.xs,
  },
  statusBadge: {
    textTransform: 'capitalize',
  },
  actionSection: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  formSection: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]}`,
  },
  timeInputs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  notesSection: {
    marginTop: theme.spacing.sm,
  },
  saveButton: {
    marginTop: theme.spacing.md,
    height: 42,
    fontSize: theme.fontSizes.sm,
    fontWeight: 600,
  },
  alert: {
    marginTop: theme.spacing.sm,
  },
  divider: {
    margin: `${theme.spacing.sm} 0`,
  },
}));

const UpdateAppointment = ({ taskID, franchiseName, onModalClose }) => {
  const { franchiseId: currentFranchiseId, loading: franchiseLoading } = useFranchise();
  const [action, setAction] = useState("");
  const { classes } = useStyles();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [taskInfo, setTaskInfo] = useState(null);
  const [isTaskLogModalOpen, setIsTaskLogModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  let franchise = currentFranchiseId || localStoreService.getFranchiseID(); // Use current franchise from context

  // Helper function to check if check-out time is valid compared to check-in time
  const isCheckOutTimeValid = () => {
    if (!checkIn || !checkOut) return true;
    const checkInTime = new Date(checkIn);
    const checkOutTime = new Date(checkOut);
    // Extract time portions (hours and minutes) for comparison
    const checkInMinutes = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const checkOutMinutes = checkOutTime.getHours() * 60 + checkOutTime.getMinutes();
    return checkOutMinutes > checkInMinutes;
  };

  // Get status color for badge
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

  useEffect(() => {
    const fetchTaskInfo = async () => {
      if (!franchise || franchiseLoading) return; // Wait for franchise ID
      
      const response = await planboardService.getServicesTaskInfo(
        taskID,
        franchise
      );
      if (response) {
        setTaskInfo(response);
        if (
          response.taskStatus === "Cancelled" ||
          response.taskStatus === "Completed"
        ) {
          setIsDisabled(true);
        }
        if (response.taskStatus === "Scheduled") {
          const taskDate = new Date(response.date).toISOString().split("T")[0];
          const currentTime = new Date().toTimeString().slice(0, 5);
          setCheckIn(`${taskDate}T${currentTime}`);
        }
        if (response.taskStatus === "In-Progress") {
          const taskDate = new Date(response.date).toISOString().split("T")[0];
          const currentTime = new Date().toTimeString().slice(0, 5);
          setCheckOut(`${taskDate}T${currentTime}`);
        }
        if (response.checkInTime) {
          setCheckIn(response.checkInTime);
        }
        if (response.checkOutTime) {
          setCheckOut(response.checkOutTime);
        }
      }
    };

    fetchTaskInfo();
  }, [taskID, franchise, franchiseLoading]);

  const handleSave = async () => {
    // Set loading immediately when button is clicked
    setIsLoading(true);

    try {
      if (action === "updateAttendance") {
        if (checkIn && !checkOut) {
          await planboardService.UpdateTaskAttendance({
            taskId: taskID,
            attendanceTime: new Date(checkIn).toISOString(),
            updatedBy: localStoreService.getUserID(),
          });
        } else if (checkIn && checkOut) {
          const checkInDate = new Date(checkIn);
          const checkOutDate = new Date(checkOut);

          // Validate dates
          if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            alert("Invalid date format");
            setIsLoading(false);
            return;
          }

          // Use the same validation logic as the frontend
          const checkInMinutes = checkInDate.getHours() * 60 + checkInDate.getMinutes();
          const checkOutMinutes = checkOutDate.getHours() * 60 + checkOutDate.getMinutes();
          
          if (checkOutMinutes <= checkInMinutes) {
            alert("Check-out time must be greater than check-in time");
            setIsLoading(false);
            return;
          }

          // Convert checkIn and checkOut to UTC before sending
          const utcCheckIn = checkInDate.toISOString();
          const utcCheckOut = checkOutDate.toISOString();
          await planboardService.AddTaskAttendance({
            taskId: taskID,
            checkInTime: utcCheckIn,
            checkOutTime: utcCheckOut,
            updatedBy: localStoreService.getUserID(),
          });
        }
      } else if (action === "cancelTask") {
        if (
          taskInfo.taskStatus !== "Completed" &&
          taskInfo.taskStatus !== "In-Progress" &&
          taskInfo.taskStatus !== "Cancelled"
        ) {
          await planboardService.UpdateTaskStatus({
            taskId: taskID,
            taskStatus: 0,
            statusNotes: notes,
            updatedBy: localStoreService.getUserID(),
          });
        }
      } else if (action === "updateNotes") {
        await planboardService.UpdateTaskNotes({
          taskId: String(taskID),
          notes: notes,
          updatedBy: localStoreService.getUserID(),
        });
      }
      
      onModalClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error saving:", error);
      notifications.show({
        title: "Error",
        message: "Failed to save changes. Please try again.",
        color: "red",
      });
      setIsLoading(false);
    }
  };

  const actionOptions = [
    { value: "updateAttendance", label: "Update Attendance", icon: IconClock },
    { value: "updateNotes", label: "Update Notes", icon: IconNotes },
    { value: "cancelTask", label: "Cancel Task", icon: IconX },
  ];

  const filteredActions =
    taskInfo?.taskStatus === "Cancelled" || taskInfo?.taskStatus === "Completed"
      ? actionOptions.filter(
        (action) =>
          action.value !== "updateAttendance" && action.value !== "cancelTask"
      )
      : taskInfo?.taskStatus === "In-Progress"
        ? actionOptions.filter((action) => action.value !== "cancelTask")
        : actionOptions;

  // Filter out 'updateAttendance' option if task start time is in the future
  const isStartTimeInFuture = new Date(taskInfo?.date) > new Date();
  const finalFilteredActions = isStartTimeInFuture
    ? filteredActions.filter((action) => action.value !== "updateAttendance")
    : filteredActions;

  return (
    <div className={classes.container}>
      <div className={classes.header}>
        <Title order={3} color="blue" mb={8}>
          Update Appointment
        </Title>
        <Group spacing={6} position="center">
          <Button
            variant="outline"
            size="xs"
            compact
            leftIcon={<IconHistory size={14} />}
            onClick={() => setIsTaskLogModalOpen(true)}
            color="gray"
          >
            View Task Log
          </Button>
        </Group>
      </div>

      {taskInfo && (
        <Paper className={classes.infoCard} p="sm">
          <Grid gutter="sm">
            {/* Task Information */}
            <Grid.Col span={12} md={4}>
              <div className={classes.sectionTitle}>
                <IconInfoCircle size={16} />
                <Text size="xs" weight={600}>Task Information</Text>
              </div>
              <Stack spacing={4}>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Task ID:</span>
                  <span className={classes.infoValue}>#{taskInfo.taskId}</span>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Service Type:</span>
                  <span className={classes.infoValue}>{taskInfo.serviceType || 'N/A'}</span>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Service Name:</span>
                  <span className={classes.infoValue}>{taskInfo.serviceName || 'N/A'}</span>
                </div>
              </Stack>
            </Grid.Col>

            {/* Time Information */}
            <Grid.Col span={12} md={4}>
              <div className={classes.sectionTitle}>
                <IconClock size={16} />
                <Text size="xs" weight={600}>Time Information</Text>
              </div>
              <Stack spacing={4}>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Start Time:</span>
                  <span className={classes.infoValue}>
                    {new Date(taskInfo.startTime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>End Time:</span>
                  <span className={classes.infoValue}>
                    {new Date(taskInfo.endTime).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              </Stack>
            </Grid.Col>

            {/* Status Information */}
            <Grid.Col span={12} md={4}>
              <div className={classes.sectionTitle}>
                <IconCheck size={16} />
                <Text size="xs" weight={600}>Status Information</Text>
              </div>
              <Stack spacing={4}>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Status:</span>
                  <Badge 
                    color={getStatusColor(taskInfo.taskStatus)} 
                    variant="filled"
                    className={classes.statusBadge}
                    size="sm"
                  >
                    {taskInfo.taskStatus}
                  </Badge>
                </div>
                <div className={classes.infoRow}>
                  <span className={classes.infoLabel}>Confirmed:</span>
                  <Badge 
                    color={taskInfo.isConfirmed ? "green" : "orange"} 
                    variant="filled"
                    size="sm"
                  >
                    {taskInfo.isConfirmed ? "Yes" : "No"}
                  </Badge>
                </div>
                {taskInfo.checkInTime && (
                  <div className={classes.infoRow}>
                    <span className={classes.infoLabel}>Check In:</span>
                    <span className={classes.infoValue}>
                      {new Date(taskInfo.checkInTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                )}
                {taskInfo.checkOutTime && (
                  <div className={classes.infoRow}>
                    <span className={classes.infoLabel}>Check Out:</span>
                    <span className={classes.infoValue}>
                      {new Date(taskInfo.checkOutTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>
      )}

      <Divider className={classes.divider} />

      {/* Action Selection */}
      <div className={classes.actionSection}>
        <div className={classes.sectionTitle}>
          <IconEdit size={16} />
          <Text size="xs" weight={600}>Select Action</Text>
        </div>
        <Select
          data={finalFilteredActions.map(action => ({
            value: action.value,
            label: action.label
          }))}
          value={action}
          onChange={setAction}
          placeholder="Choose an action to perform"
          size="sm"
          withinPortal
          dropdownPosition="bottom"
          maxDropdownHeight={200}
          zIndex={10000}
          styles={(theme) => ({
            input: {
              borderColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
              '&:focus': {
                borderColor: theme.colors.blue[6],
              }
            }
          })}
        />
      </div>

      {/* Action Forms */}
      {action === "updateAttendance" && (
        <Paper className={classes.formSection}>
          <div className={classes.sectionTitle}>
            <IconClock size={16} />
            <Text size="xs" weight={600}>Update Attendance</Text>
          </div>
          
          <Alert 
            icon={<IconInfoCircle size={14} />} 
            title={<Text size="xs" weight={600}>Attendance Information</Text>}
            color="blue" 
            variant="light"
            className={classes.alert}
            p="xs"
          >
            <Text size="xs">Update the check-in and check-out times for this task.</Text>
          </Alert>

          <div className={classes.timeInputs}>
            <TextInput
              label="Check In Time"
              placeholder="Select check-in time"
              type="time"
              size="sm"
              value={checkIn ? new Date(checkIn).toTimeString().slice(0, 5) : ""}
              onChange={(e) => {
                const taskDate = new Date(taskInfo.date).toISOString().split('T')[0];
                const newDateTime = `${taskDate}T${e.target.value}`;
                setCheckIn(newDateTime);
              }}
              disabled={taskInfo?.checkInTime ? true : false}
              icon={<IconClock size={14} />}
              styles={(theme) => ({
                input: {
                  borderColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              })}
            />

            <TextInput
              label="Check Out Time"
              type="time"
              size="sm"
              value={checkOut ? new Date(checkOut).toTimeString().slice(0, 5) : ""}
              onChange={(e) => {
                const taskDate = new Date(taskInfo.date).toISOString().split('T')[0];
                const newDateTime = `${taskDate}T${e.target.value}`;
                setCheckOut(newDateTime);
              }}
              placeholder="Select check-out time"
              disabled={taskInfo?.checkOutTime ? true : false}
              icon={<IconClock size={14} />}
              styles={(theme) => ({
                input: {
                  borderColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
                  '&:focus': {
                    borderColor: theme.colors.blue[6],
                  }
                }
              })}
            />
          </div>
          
          {checkIn && checkOut && !isCheckOutTimeValid() && (
            <Alert 
              icon={<IconAlertCircle size={14} />} 
              title={<Text size="xs" weight={600}>Invalid Time Range</Text>}
              color="red" 
              variant="light"
              mt="sm"
              p="xs"
            >
              <Text size="xs">Check-out time must be greater than check-in time.</Text>
            </Alert>
          )}
        </Paper>
      )}

      {(action === "updateNotes" || action === "cancelTask") && (
        <Paper className={classes.formSection}>
          <div className={classes.sectionTitle}>
            <IconNotes size={16} />
            <Text size="xs" weight={600}>{action === "updateNotes" ? "Update Notes" : "Cancel Task"}</Text>
          </div>
          
          <Alert 
            icon={<IconInfoCircle size={14} />} 
            title={<Text size="xs" weight={600}>{action === "updateNotes" ? "Notes Information" : "Cancellation Information"}</Text>}
            color={action === "updateNotes" ? "blue" : "orange"} 
            variant="light"
            className={classes.alert}
            p="xs"
          >
            <Text size="xs">
              {action === "updateNotes" 
                ? "Add or update notes for this task." 
                : "Provide a reason for cancelling this task."
              }
            </Text>
          </Alert>

          <TextInput
            label="Notes"
            size="sm"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={action === "updateNotes" ? "Enter task notes..." : "Enter cancellation reason..."}
            multiline
            minRows={3}
            maxRows={6}
            icon={<IconNotes size={14} />}
            styles={(theme) => ({
              input: {
                borderColor: theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3],
                '&:focus': {
                  borderColor: theme.colors.blue[6],
                }
              }
            })}
          />
        </Paper>
      )}

      {/* Save Button */}
      <Button
        type="submit"
        fullWidth
        className={classes.saveButton}
        loading={isLoading}
        loaderPosition="right"
        onClick={handleSave}
        disabled={
          !action || 
          isLoading ||
          (action === "updateAttendance" && 
           checkIn && 
           checkOut && 
           !isCheckOutTimeValid())
        }
        leftIcon={!isLoading && <IconCheck size={20} />}
        styles={(theme) => ({
          root: {
            background: theme.colors.blue[6],
            '&:hover': {
              background: theme.colors.blue[7],
            },
            '&:disabled': {
              background: theme.colors.gray[4],
            }
          }
        })}
      >
        {action ? `Save ${action.replace(/([A-Z])/g, ' $1').toLowerCase()}` : 'Select an action'}
      </Button>

      <TaskLogModal
        opened={isTaskLogModalOpen}
        onClose={() => setIsTaskLogModalOpen(false)}
        taskId={taskInfo?.taskId}
        taskTitle={`Task #${taskInfo?.taskId} - ${taskInfo?.clientName || 'Unknown Client'}`}
      />
    </div>
  );
};

export default UpdateAppointment;
