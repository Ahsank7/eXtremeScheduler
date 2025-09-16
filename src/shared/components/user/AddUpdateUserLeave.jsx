import { Button, TextInput, Textarea, Select } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { leaveService, lookupService } from "core/services";
import Moment from "moment";

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
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
  const [leaveStatusOptions, setLeaveStatusOptions] = useState([]);

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
          const { data } = response;
          
          // Format dates for input fields
          const formatDateTimeForInput = (dateTimeString) => {
            if (!dateTimeString) return "";
            return Moment(dateTimeString).format("YYYY-MM-DDTHH:mm");
          };

          form.setValues({
            startTime: formatDateTimeForInput(data.startTime),
            endTime: formatDateTimeForInput(data.endTime),
            type: data.type,
            status: data.status,
            notes: data.notes,
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch Leave item",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const leavestatusResponse = await lookupService.getLookupList({
          lookupType: "LeaveStatus",
          organizationId,
        });
        setLeaveStatusOptions(
          leavestatusResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );

        const leavetypeResponse = await lookupService.getLookupList({
          lookupType: "LeaveType",
          organizationId,
        });
        setLeaveTypeOptions(
          leavetypeResponse.data.result.map((item) => ({
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
      let result = await leaveService.saveUpdateLeave(userLeaveObj);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: result.message,
        color: "green",
        style: {
          backgroundColor: "white",
        },
      });

      onModalClose();
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: "Please try again",
        color: "red",
        style: {
          backgroundColor: "white",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        placeholder="Select Leave Type"
        required
        {...form.getInputProps("type")}
        data={leaveTypeOptions}
      />
      <Select
        label="Status"
        placeholder="Select Leave Status"
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
  );
};
