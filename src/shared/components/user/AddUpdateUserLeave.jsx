import { Button, TextInput, Textarea, Select, Modal, Text, Stack, Alert, Group, Badge } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { leaveService, lookupService, planboardService } from "core/services";
import { getClientTasks, getServiceProviderTasks } from "core/services/scheduleService";
import Moment from "moment";
import { IconAlertTriangle, IconCalendar, IconClock } from "@tabler/icons";

const schema = zod.object({
  startTime: zod.string().nonempty("Start Time is required"),
  endTime: zod.string().nonempty("End Time is required"),
  type: zod.number().min(1, "Type is required"),
  status: zod.number().min(1, "Status is required"),
  notes: zod.string().nonempty("Notes is required"),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    const startDateTime = new Date(data.startTime);
    const endDateTime = new Date(data.endTime);
    return startDateTime < endDateTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const AddUpdateUserLeave = ({
  id,
  userId,
  onModalClose,
  organizationId,
  userType,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [leaveStatusOptions, setLeaveStatusOptions] = useState([]);
  const [showTaskWarning, setShowTaskWarning] = useState(false);
  const [affectedTasks, setAffectedTasks] = useState([]);
  const [pendingLeaveData, setPendingLeaveData] = useState(null);
  const [previousStatus, setPreviousStatus] = useState(null);
  
  // Determine if this is a client (userType 1 = Client)
  const isClient = userType === 1;
  const isServiceProvider = userType === 2;
  const leaveLabel = isClient ? "Off Service" : "Leave";

  // Get today's date and set default times
  const getDefaultTimes = () => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(9, 0, 0, 0); // 9:00 AM
    
    const endOfDay = new Date(today);
    endOfDay.setHours(17, 0, 0, 0); // 5:00 PM
    
    return {
      startTime: startOfDay.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
      endTime: endOfDay.toISOString().slice(0, 16)
    };
  };

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      startTime: getDefaultTimes().startTime,
      endTime: getDefaultTimes().endTime,
      type: 0,
      status: 0,
      notes: "",
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      leaveService
        .getLeaveItem(id)
        .then((response) => {
          console.log('Leave Item Response:', response); // Debug log
          
          // Format dates for input fields
          const formatDateTimeForInput = (dateTimeString) => {
            if (!dateTimeString) return "";
            return Moment(dateTimeString).format("YYYY-MM-DDTHH:mm");
          };

          // Store previous status to check for changes
          setPreviousStatus(response?.status || 0);

          form.setValues({
            startTime: formatDateTimeForInput(response?.startTime),
            endTime: formatDateTimeForInput(response?.endTime),
            type: response?.type || 0,
            status: response?.status || 0,
            notes: response?.notes || "",
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: `Failed to fetch ${leaveLabel} item`,
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  }, [id, leaveLabel]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const leavestatusResponse = await lookupService.getLookupList({
          lookupType: "LeaveStatus",
          organizationId,
        });
        setLeaveStatusOptions(
          (leavestatusResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const leavetypeResponse = await lookupService.getLookupList({
          lookupType: "LeaveType",
          organizationId,
        });
        setLeaveTypeOptions(
          (leavetypeResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch lookup data",
          color: "red",
        });
      }
    };

    if (leaveStatusOptions.length === 0 && leaveTypeOptions.length === 0) {
      fetchLookupData();
    }
  }, [leaveStatusOptions.length, leaveTypeOptions.length, organizationId]);

  // Function to check for scheduled tasks in the leave period
  const checkScheduledTasks = async (startTime, endTime) => {
    try {
      // Format dates properly for API (with time component)
      const formattedStartDate = Moment(startTime).format("YYYY-MM-DD") + "T00:00:00Z";
      const formattedEndDate = Moment(endTime).format("YYYY-MM-DD") + "T23:59:59Z";
      
      if (isClient) {
        // For clients, get client tasks
        const request = {
          clientId: userId, // Use clientId, not userId
          organizationId: organizationId,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          statusIds: "", // Required parameter
        };
        console.log("Checking client tasks with request:", request);
        const response = await getClientTasks(request);
        console.log("Client tasks response:", response);
        // Response is the array itself, not response.tasks
        return Array.isArray(response) ? response : [];
      } else if (isServiceProvider) {
        // For service providers, get service provider tasks
        const request = {
          serviceProviderId: userId, // Use serviceProviderId, not userId
          organizationId: organizationId,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          statusIds: "", // Required parameter
        };
        console.log("Checking service provider tasks with request:", request);
        const response = await getServiceProviderTasks(request);
        console.log("Service provider tasks response:", response);
        // Response is the array itself, not response.tasks
        return Array.isArray(response) ? response : [];
      }
      return [];
    } catch (error) {
      console.error("Error checking scheduled tasks:", error);
      return [];
    }
  };

  // Function to find "Approved" status ID from lookup options
  const getApprovedStatusId = () => {
    const approvedStatus = leaveStatusOptions.find(
      option => option.label.toLowerCase() === "approved"
    );
    console.log("Leave status options:", leaveStatusOptions);
    console.log("Approved status found:", approvedStatus);
    return approvedStatus?.value;
  };

  // Function to actually save the leave and handle task updates
  const saveLeaveAndUpdateTasks = async (userLeaveObj, shouldUpdateTasks) => {
    try {
      // Save the leave first
      let result = await leaveService.saveUpdateLeave(userLeaveObj);
      
      // If we need to update tasks (cancel or unassign)
      if (shouldUpdateTasks && affectedTasks.length > 0) {
        if (isClient) {
          // Cancel tasks for clients - Status ID 37 = Cancelled
          for (const task of affectedTasks) {
            try {
              const taskId = task.taskId || task.id;
              console.log(`Cancelling task ${taskId} - setting status to 37 (Cancelled)`);
              await planboardService.UpdateTaskStatus({
                taskId: taskId,
                taskStatus: 37, // 37 = Cancelled (from TaskStatus lookup)
                statusNotes: `Cancelled due to client ${leaveLabel.toLowerCase()}`,
                updatedBy: userId,
              });
            } catch (error) {
              console.error(`Failed to cancel task ${task.taskId || task.id}:`, error);
            }
          }
          notifications.show({
            title: "Success",
            message: `${leaveLabel} saved and ${affectedTasks.length} task(s) cancelled`,
            color: "green",
          });
        } else if (isServiceProvider) {
          // Unassign tasks for service providers - Status ID 38 = Unassigned
          for (const task of affectedTasks) {
            try {
              const taskId = task.taskId || task.id;
              console.log(`Unassigning task ${taskId} - setting status to 38 (Unassigned)`);
              await planboardService.UpdateTaskStatus({
                taskId: taskId,
                taskStatus: 38, // 38 = Unassigned (from TaskStatus lookup)
                statusNotes: `Unassigned due to service provider leave`,
                updatedBy: userId,
              });
            } catch (error) {
              console.error(`Failed to unassign task ${task.taskId || task.id}:`, error);
            }
          }
          notifications.show({
            title: "Success",
            message: `${leaveLabel} saved and ${affectedTasks.length} task(s) unassigned`,
            color: "green",
          });
        }
      } else {
        notifications.show({
          title: "Success",
          message: result.message,
          color: "green",
        });
      }

      onModalClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to save. Please try again",
        color: "red",
      });
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);
    
    // Extract date from start time for the date field
    const startDateTime = new Date(values.startTime);
    const date = startDateTime.toISOString().split('T')[0];
    
    let userLeaveObj = {
      id: id,
      userId: userId,
      date: date,
      startTime: values.startTime,
      endTime: values.endTime,
      type: values.type,
      status: values.status,
      notes: values.notes,
    };

    try {
      // Check if status is being changed to "Approved"
      const approvedStatusId = getApprovedStatusId();
      const isStatusChangingToApproved = 
        approvedStatusId && 
        values.status === approvedStatusId && 
        previousStatus !== approvedStatusId;

      console.log("Status check:", {
        approvedStatusId,
        currentStatus: values.status,
        previousStatus,
        isStatusChangingToApproved,
        userType,
        isClient,
        isServiceProvider
      });

      if (isStatusChangingToApproved) {
        console.log("Status is changing to approved, checking for tasks...");
        // Check for scheduled tasks
        const tasks = await checkScheduledTasks(values.startTime, values.endTime);
        console.log("Found tasks:", tasks);
        
        if (tasks && tasks.length > 0) {
          console.log("Showing warning modal for", tasks.length, "tasks");
          // Show warning modal with affected tasks
          setAffectedTasks(tasks);
          setPendingLeaveData(userLeaveObj);
          setShowTaskWarning(true);
          setIsLoading(false);
          return; // Don't proceed yet, wait for user confirmation
        } else {
          console.log("No tasks found in date range");
        }
      } else {
        console.log("Status not changing to approved, proceeding normally");
      }

      // If no tasks affected or status not changing to approved, proceed normally
      await saveLeaveAndUpdateTasks(userLeaveObj, false);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Please try again",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmWithTasks = async () => {
    setShowTaskWarning(false);
    setIsLoading(true);
    await saveLeaveAndUpdateTasks(pendingLeaveData, true);
    setIsLoading(false);
  };

  const handleCancelWarning = () => {
    setShowTaskWarning(false);
    setAffectedTasks([]);
    setPendingLeaveData(null);
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit((values) =>
          handleSubmit({
            ...values,
            startTime: values.startTime,
            endTime: values.endTime,
            type: values.type,
            status: values.status,
            notes: values.notes,
          })
        )}
      >
        <TextInput
          label="Start Time"
          placeholder="Enter Start Time"
          type="datetime-local"
          required
          {...form.getInputProps("startTime")}
        />
        <TextInput
          label="End Time"
          placeholder="Enter End Time"
          type="datetime-local"
          required
          {...form.getInputProps("endTime")}
        />

        <Select
          label="Type"
          placeholder={`Select ${leaveLabel} Type`}
          required
          {...form.getInputProps("type")}
          data={leaveTypeOptions}
        />
        <Select
          label="Status"
          placeholder={`Select ${leaveLabel} Status`}
          required
          {...form.getInputProps("status")}
          data={leaveStatusOptions}
        />

        <Textarea
          label="Notes"
          placeholder="Enter Notes"
          required
          {...form.getInputProps("notes")}
        />

        <Button
          type="submit"
          fullWidth
          mt="xl"
          size="md"
          loading={isLoading}
          loaderPosition="right"
        >
          Save
        </Button>
      </form>

      {/* Warning Modal for Affected Tasks */}
      <Modal
        opened={showTaskWarning}
        onClose={handleCancelWarning}
        title={
          <Group spacing="xs">
            <IconAlertTriangle size={24} color="orange" />
            <Text size="lg" weight={600}>
              Scheduled Tasks Will Be Affected
            </Text>
          </Group>
        }
        size="lg"
      >
        <Stack spacing="md">
          <Alert icon={<IconAlertTriangle size={16} />} title="Warning" color="orange">
            {isClient ? (
              <Text size="sm">
                This {leaveLabel.toLowerCase()} period overlaps with {affectedTasks.length} scheduled task(s).
                If you proceed, these tasks will be <strong>CANCELLED</strong>.
              </Text>
            ) : (
              <Text size="sm">
                This {leaveLabel.toLowerCase()} period overlaps with {affectedTasks.length} scheduled task(s).
                If you proceed, these tasks will be <strong>UNASSIGNED</strong> and can be reassigned to another service provider.
              </Text>
            )}
          </Alert>

          <Stack spacing="xs">
            <Text weight={600} size="sm">Affected Tasks:</Text>
            {affectedTasks.map((task, index) => (
              <Group
                key={index}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Stack spacing={4} style={{ flex: 1 }}>
                  <Group spacing="xs">
                    <IconCalendar size={16} color="#868e96" />
                    <Text size="sm" weight={500}>
                      Task #{task.taskId || task.id}
                    </Text>
                    {task.taskStatus && (
                      <Badge size="sm" color="blue">
                        {task.taskStatus}
                      </Badge>
                    )}
                  </Group>
                  <Group spacing="xs">
                    <IconClock size={14} color="#868e96" />
                    <Text size="xs" color="dimmed">
                      {Moment(task.startTime || task.date).format("MMM DD, YYYY")} - {" "}
                      {Moment(task.startTime).format("h:mm A")} to {Moment(task.endTime).format("h:mm A")}
                    </Text>
                  </Group>
                  {task.serviceName && (
                    <Text size="xs" color="dimmed">
                      Service: {task.serviceName}
                    </Text>
                  )}
                </Stack>
              </Group>
            ))}
          </Stack>

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={handleCancelWarning}>
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={handleConfirmWithTasks}
              loading={isLoading}
            >
              {isClient ? "Proceed & Cancel Tasks" : "Proceed & Unassign Tasks"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
