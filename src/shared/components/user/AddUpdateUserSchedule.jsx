import {
  Button,
  TextInput,
  Textarea,
  Loader,
  Select,
  SegmentedControl,
  MultiSelect,
  Grid,
  Paper,
  useMantineTheme,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import {
  scheduleService,
  localStoreService,
  lookupService,
  profileService,
  servicesService
} from "core/services";
import { AppDivider } from "../AppDivider";

const schema = zod.object({
  startTime: zod.string().nonempty("Start Time is required"),
  endTime: zod.string().nonempty("End Time is required"),
  servicetype: zod.number().min(1, "Service Type is required"),
  csvServiceIds: zod.array(zod.number()).nonempty("Service IDs are required"), // Changed from zod.array(zod.string()) to zod.array(zod.number())
  scheduleDescription: zod.string().nonempty("Description is required"),

  recurrencePattern: zod.number().min(1, "Recurrence Pattern is required"),
  recurrenceInterval: zod.number().min(0, "Recurrence Interval is required"),
  recurrenceDaysOfWeek: zod.array(zod.string()).optional(),
  recurrenceDayOfMonth: zod.array(zod.string()).optional(),
  recurrenceDayOfYear: zod.array(zod.string()).optional(),
  csvServiceProviderIds: zod
    .array(zod.string())
    .nonempty("Service Provider IDs are required"), // Changed from zod.string() to zod.array(zod.string())
  timezone: zod.string().nonempty("Timezone is required"), // Added timezone field
})

export const AddUpdateUserSchedule = ({
  userId,
  organizationId,
  onModalClose,
}) => {
  const theme = useMantineTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [serviceTypeOptions, setServiceTypeOptions] = useState([]);
  const [serviceIdsOptions, setServiceIdsOptions] = useState([]);

  const [serviceProviderOptions, setServiceProviderOptions] = useState([]); // Added service provider options state
  const [filteredServiceIdsOptions, setFilteredServiceIdsOptions] = useState(
    []
  );
  const [timezoneOptions, setTimezoneOptions] = useState([]); // Added timezone options state
  const franchiseId = localStoreService.getFranchiseID();


  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      startTime: "",
      endTime: "",
      servicetype: 0,
      csvServiceIds: [],
      scheduleDescription: "",

      csvServiceProviderIds: [], // Changed from string to array
      recurrencePattern: 1,
      recurrenceInterval: 0,
      recurrenceDaysOfWeek: [],
      recurrenceDayOfMonth: [],
      recurrenceDayOfYear: [],
      timezone: "",
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        /*const scheduleserviceIdsResponse = await lookupService.getLookupList({
          lookupType: 23,
          organizationId,
        });
        setServiceIdsOptions(
          scheduleserviceIdsResponse.data.map((item) => ({
            value: item.id,
            label: item.name,
            otherFieldValue1: item.otherFieldValue1
              ? item.otherFieldValue1
              : undefined,
          }))
        );*/

        const scheduletypeResponse = await servicesService.getServiceTypes(
          organizationId
        );
        setServiceTypeOptions(
          scheduletypeResponse.data.response.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );


        const currentDate = new Date();
        // Fetch service provider options
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
        const serviceProviderResponse = await profileService.getAvailableServiceProviders({
          startDateTime: startOfMonth,
          endDateTime: endOfMonth,
          franchiseId: franchiseId,
          searchText: "",
        });
        setServiceProviderOptions(
          serviceProviderResponse.data.response.map((item) => ({
            value: item.userId,
            label: item.name,
          }))
        );
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch  data",
          color: "red",
        });
      }
    };

    fetchLookupData();
  }, [organizationId]);

  useEffect(() => {
    const filterServiceIds = async () => {
      const selectedServiceType = serviceTypeOptions.find(
        (serviceType) => serviceType.value === form.values.servicetype
      );
      if (selectedServiceType) {
        const filteredOptions = await servicesService.getServicesByType(selectedServiceType.value);
        setFilteredServiceIdsOptions(
          filteredOptions.data.response.map((item) => ({
            value: item.id,
            label: item.name
          }))
        );
      } else {
        setFilteredServiceIdsOptions([]);
      }
    };

    filterServiceIds();
  }, [form.values.servicetype, serviceTypeOptions]);

  useEffect(() => {
    const fetchTimezoneOptions = async () => {
      try {
        const timezoneResponse = await lookupService.getLookupList({
          lookupType: "TimeZones",
          organizationId,
        }); // Using organizationId instead of hardcoded value
        setTimezoneOptions(
          timezoneResponse.data.result.map((item) => ({
            value: item.name,
            label: item.description,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch timezone options:", error);
      }
    };

    fetchTimezoneOptions();
  }, [organizationId]);

  const getNotificationBg = () => (
    theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
  );

  const handleSubmit = async (values) => {
    //alert("hello world");

    setIsLoading(true);
    let userscheduleObj = {
      ...values,
      clientId: userId,
      csvServiceProviderIds: values.csvServiceProviderIds.toString(), // Convert array to string
      csvServiceIds: values.csvServiceIds.toString(), // Convert array to string
      recurrenceDayOfMonth: values.recurrenceDayOfMonth.toString(), // Convert array to string
      recurrenceDayOfYear: values.recurrenceDayOfYear.toString(), // Convert array to string
      recurrenceDaysOfWeek: values.recurrenceDaysOfWeek.toString(), // Convert array to string
    };

    // Validate and convert start time and end time to UTC
    const startDate = new Date(values.startDate + ' ' + values.startTime);
    const endDate = new Date(values.endDate + ' ' + values.endTime);

    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      notifications.show({
        title: "Error",
        message: "Invalid date format",
        color: "red",
      });
      setIsLoading(false);
      return;
    }

    // Check if end time is after start time
    if (startDate >= endDate) {
      notifications.show({
        title: "Error",
        message: "End time must be after start time",
        color: "red",
      });
      setIsLoading(false);
      return;
    }

    userscheduleObj.startTime = startDate.toISOString();
    userscheduleObj.endTime = endDate.toISOString();

    try {
      let result = await scheduleService.saveUpdateschedule(userscheduleObj);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: result.message,
        color: "green",
        style: {
          backgroundColor: getNotificationBg(),
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
          backgroundColor: getNotificationBg(),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* <pre>{JSON.stringify(form?.errors)}</pre> */}
        <Grid mt="xs">
          <Grid.Col span={6}>
            <Select
              label="Service Type"
              placeholder="Select Service Type"
              {...form.getInputProps("servicetype")}
              data={serviceTypeOptions}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <MultiSelect
              label="Services"
              placeholder="Select Services"
              {...form.getInputProps("csvServiceIds")}
              data={filteredServiceIdsOptions}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Start Date"
              placeholder="Enter Start Date"
              type="date"
              required
              {...form.getInputProps("startDate")}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Date"
              placeholder="Enter End Date"
              type="date"
              required
              {...form.getInputProps("endDate")}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Start Time"
              placeholder="Enter Start Time"
              type="time"
              required
              {...form.getInputProps("startTime")}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Time"
              placeholder="Enter End Time"
              type="time"
              required
              {...form.getInputProps("endTime")}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <SegmentedControl
              label="Recurrence Pattern"
              {...form.getInputProps("recurrencePattern")}
              required
              data={[
                { label: "Daily", value: 1 },
                { label: "Weekly", value: 2 },
                { label: "Monthly", value: 3 },
                { label: "Yearly", value: 4 },
              ]}
            />
          </Grid.Col>

          {form.values.recurrencePattern === 2 && (
            <Grid.Col>
              <MultiSelect
                label="Days of the Week"
                placeholder="Select Days of the Week"
                {...form.getInputProps("recurrenceDaysOfWeek")}
                data={[
                  { label: "Monday", value: "Monday" },
                  { label: "Tuesday", value: "Tuesday" },
                  { label: "Wednesday", value: "Wednesday" },
                  { label: "Thursday", value: "Thursday" },
                  { label: "Friday", value: "Friday" },
                  { label: "Saturday", value: "Saturday" },
                  { label: "Sunday", value: "Sunday" },
                ]}
                required
              />
            </Grid.Col>
          )}
          {form.values.recurrencePattern === 3 && (
            <Grid.Col>
              <MultiSelect
                label="Day of the Month"
                placeholder="Select Day of the Month"
                {...form.getInputProps("recurrenceDayOfMonth")}
                data={Array.from({ length: 31 }, (_, i) => ({
                  label: String(i + 1),
                  value: String(i + 1),
                }))}
                required
              />
            </Grid.Col>
          )}
          {form.values.recurrencePattern === 4 && (
            <Grid.Col>
              <MultiSelect
                label="Month of the Year"
                placeholder="Select Month of the Year"
                {...form.getInputProps("recurrenceDayOfYear")}
                data={[
                  { label: "January", value: "January" },
                  { label: "February", value: "February" },
                  { label: "March", value: "March" },
                  { label: "April", value: "April" },
                  { label: "May", value: "May" },
                  { label: "June", value: "June" },
                  { label: "July", value: "July" },
                  { label: "August", value: "August" },
                  { label: "September", value: "September" },
                  { label: "October", value: "October" },
                  { label: "November", value: "November" },
                  { label: "December", value: "December" },
                ]}
                required
              />
            </Grid.Col>
          )}

          <Grid.Col span={4}>
            <MultiSelect
              label="Service Providers"
              placeholder="Select Service Providers"
              {...form.getInputProps("csvServiceProviderIds")}
              data={serviceProviderOptions}
              required
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Select
              label="Timezone"
              placeholder="Select Timezone"
              {...form.getInputProps("timezone")}
              data={timezoneOptions}
              required
            />
          </Grid.Col>
          <Grid.Col>
            <Textarea
              label="Description"
              placeholder="Enter Description"
              {...form.getInputProps("scheduleDescription")}
              required
            />
          </Grid.Col>
        </Grid>

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
    </Paper>
  );
};
