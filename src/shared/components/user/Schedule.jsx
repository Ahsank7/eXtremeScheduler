import React, { useEffect, useState } from "react";
import { Button, Select, Container, Group, Tooltip, Paper, Text } from "@mantine/core";
import { Scheduler } from "react-scheduler-pro";
import AddUpdateUserSchedule from "shared/components/user/AddUpdateUserSchedule";
import { lookupService, scheduleService } from "core/services";
import { UpdateAppointment } from "..";
import { UserType } from "core/enum";

export function Schedule({ userId, organizationId, userType, readOnly = false }) {
  const fetchEvents = async (startDate, endDate) => {
    let request = {
      organizationId: organizationId,
      startDate:
        new Date(startDate.setHours(0, 0, 0, 0)).toISOString().split("T")[0] +
        "T00:00:00Z",
      endDate:
        new Date(endDate.setHours(23, 59, 59, 999))
          .toISOString()
          .split("T")[0] + "T23:59:59Z",
      statusIds: "", // Assuming this is a placeholder for actual status IDs
    };

    let serviceMethod;
    if (userType == UserType.Clients) {
      request.clientId = userId;
      serviceMethod = scheduleService.getClientTasks;
    } else if (userType == UserType["Service Providers"]) {
      request.serviceProviderId = userId;
      serviceMethod = scheduleService.getServiceProviderTasks;
    }

    try {
      const response = await serviceMethod(request);
      //console.log("Fetched events:", response);
      if (response) {
        //console.log("Fetched events:", response); // Log the response data
        const events = response
          .filter((task) => {
            // Filter out tasks with invalid dates
            const startDate = new Date(task.startTime);
            const endDate = new Date(task.endTime);
            const isValid = !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate < endDate;


            if (!isValid) {
              console.warn(`Skipping task ${task.taskId} due to invalid date range:`, {
                startTime: task.startTime,
                endTime: task.endTime,
                startDate: startDate,
                endDate: endDate
              });
            }

            return isValid;
          })
          .map((task, index) => {
            const startDate = new Date(task.startTime);
            const endDate = new Date(task.endTime);

            return {
              key: index,
              _id: task.taskId,
              name: `${task.serviceProviderFullName}`,
              startDate: startDate,
              endDate: endDate,
              resourceId: task.scheduleId,
              backgroundColor:
                task.taskStatus === "Scheduled"
                  ? "#5933f0c9"
                  : task.taskStatus === "Delayed"
                    ? "#fa5252"
                    : task.taskStatus === "In-Progress"
                      ? "#40c057"
                      : task.taskStatus === "Completed"
                        ? "#228be6"
                        : task.taskStatus === "Cancelled"
                          ? "#fab005"
                          : task.taskStatus === "Unassigned"
                            ? "#B8956A" // Light brown for unassigned tasks
                            : "#ffa447", // Default color for demonstration
              isAllDay: false,
            };
          });
        return events;
      } else {
        console.log("No events found for the given period."); // Log if no events are found
        return [];
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }
  };

  const [eventFields, setEventFields] = useState({});
  const [events, setEvents] = useState([]);
  const [startEndDate, setStartEndDate] = useState(null);

  const closeModal = (toggle) => {
    toggle();
    fetchEventsAsync(startEndDate.startDate, startEndDate.endDate);
  };

  const handleNavigate = async ({ start, end }) => {
    fetchEventsAsync(start, end);
  };

  const setEventField = (field, value) => {
    setEventFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventSubmit = (e) => {
    e.preventDefault();
    console.log("Event submitted:", eventFields);
    // Here you would typically handle the event submission, e.g., send to an API
  };

  const fetchEventsAsync = async (start, end) => {
    const newEvents = await fetchEvents(start, end);
    setEvents(newEvents);
    setStartEndDate({ startDate: start, endDate: end });
  };

  useEffect(() => {
    const currentDate = new Date();
    const { start, end } = getMonthRange(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1
    );
    fetchEventsAsync(start, end);
  }, []);

  // Timezone is now handled at organization level, no need to fetch here

  const getMonthRange = (year, month) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return { start, end };
  };

  return (
    <Container fluid>
      {readOnly && (
        <Paper 
          withBorder 
          p="md" 
          mb="md" 
          radius="md" 
          style={{ 
            backgroundColor: '#fff3cd', 
            borderColor: '#ffeaa7',
            color: '#856404'
          }}
        >
          <Text size="sm" weight={500}>
            📖 This schedule view is in read-only mode. You can view appointments but cannot create or edit them.
          </Text>
        </Paper>
      )}
      <Group position="apart" style={{ marginBottom: "20px" }}>
        <div style={{ flex: 1 }}></div>{" "}
        {/* Timezone is now managed at organization level */}
        <Scheduler
          modalSize="sm"
          view="month"
          events={events}
          fields={{
            id: "_id",
            subject: "name",
            start: "startDate",
            end: "endDate",
            allDay: "isAllDay",
            backgroundColor: "backgroundColor",
          }}
          onNavigate={handleNavigate}
          eventFormContext={({ toggle, date, event, resource }) => {
            if (readOnly) return null; // Don't allow editing in read-only mode
            
            const handleRecurrenceChange = (value) => {
              setEventField("recurrencePattern", parseInt(value));
              if (value === "0") {
                // Daily
                setEventField("recurrenceDaysOfWeek", []);
                setEventField("recurrenceDayOfMonth", []);
                setEventField("recurrenceDayOfYear", []);
              }
            };
            if (!event) {
              if (userType == UserType.Clients) {
                document.body.className = "client_scheduler_modal";
                return (
                  <AddUpdateUserSchedule
                    userId={userId}
                    organizationId={organizationId}
                    onModalClose={() => {
                      closeModal(toggle);
                    }}
                  />
                );
              } else if (userType == UserType["Service Providers"]) {
                document.body.className = "service_provider_scheduler_modal";
              }
            } else {
              return (
                <UpdateAppointment
                  taskID={event._id}
                  onModalClose={() => {
                    closeModal(toggle);
                  }}
                />
              );
            }
          }}
        />
      </Group>
      <Group
        position="apart"
        style={{
          width: "100%",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        <Tooltip label="Scheduled">
          <div style={{ 
            backgroundColor: "#5933f0c9", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>Scheduled</div>
        </Tooltip>
        <Tooltip label="In-Progress">
          <div style={{ 
            backgroundColor: "#40c057", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>In-Progress</div>
        </Tooltip>
        <Tooltip label="Cancelled">
          <div style={{ 
            backgroundColor: "#fab005", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>Cancelled</div>
        </Tooltip>
        <Tooltip label="Completed">
          <div style={{ 
            backgroundColor: "#228be6", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>Completed</div>
        </Tooltip>
        <Tooltip label="Delay">
          <div style={{ 
            backgroundColor: "#fa5252", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>Delay</div>
        </Tooltip>
        <Tooltip label="Unassigned">
          <div style={{ 
            backgroundColor: "#B8956A", 
            color: "white", 
            padding: "8px 16px", 
            borderRadius: "4px", 
            cursor: "default",
            userSelect: "none"
          }}>Unassigned</div>
        </Tooltip>
      </Group>
    </Container>
  );
}
