import React, { useState, useEffect } from 'react';
import {
  Button,
  TextInput,
  MultiSelect,
  Grid,
  Paper,
  Group, 
  Text, 
  Loader, 
  Textarea, 
  Select, 
  Checkbox, 
  Switch,
  Divider,
  Title,
  Badge,
  ActionIcon,
  Alert,
  Stack
} from "@mantine/core";
import { IconUsers, IconAlertCircle } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { profileService, localStoreService, servicesService, scheduleService } from "core/services";
import { useFranchise } from "core/context/FranchiseContext";
import ServiceProviderSelector from "./ServiceProviderSelector";
import { AppConfirmationModal } from "shared/components";

const AddUpdateUserSchedule = ({ userId, organizationId, onModalClose }) => {
  const { franchiseId: currentFranchiseId, loading: franchiseLoading } = useFranchise();
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedProviderDetails, setSelectedProviderDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showProviderSelector, setShowProviderSelector] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingProviders, setConflictingProviders] = useState([]);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);

  const form = useForm({
    initialValues: {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      serviceTypeId: '',
      serviceIds: [],
      serviceProviderIds: [],
      recurrencePattern: '1', // 0 = No recurrence, 1 = Daily, 2 = Weekly, 3 = Monthly, 4 = Yearly
      recurrenceDaysOfWeek: [],
      recurrenceDayOfMonth: [],
      recurrenceDayOfYear: [],
      description: '',
      clientId: userId,
      status: 'Scheduled',
      timezone: 'Pakistan Standard Time'
    },
    validate: {
      startDate: (value) => (!value ? 'Start date is required' : null),
      endDate: (value) => (!value ? 'End date is required' : null),
      startTime: (value) => (!value ? 'Start time is required' : null),
      endTime: (value) => (!value ? 'End time is required' : null),
      serviceTypeId: (value) => (!value ? 'Service type is required' : null),
      serviceIds: (value) => (value.length === 0 ? 'At least one service is required' : null),
      serviceProviderIds: (value) => (value.length === 0 ? 'At least one service provider is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
    validateInputOnBlur: true,
    validateInputOnChange: false,
  });

  // Load service types on component mount
  useEffect(() => {
    loadServiceTypes();
  }, []);

  // Load services when service type changes
  useEffect(() => {
    if (form.values.serviceTypeId) {
      loadServices(form.values.serviceTypeId);
    } else {
      setServices([]);
    }
  }, [form.values.serviceTypeId]);

  // Load service providers when dates change
  useEffect(() => {
    const { startDate, endDate, startTime, endTime } = form.values;
    
    if (startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      loadServiceProviders(1, false, startDateTime, endDateTime, 'Pakistan Standard Time');
      setIsInitialized(true);
    } else {
      setServiceProviders([]);
      setHasMore(false);
      setTotalRecords(0);
      setIsInitialized(false);
    }
  }, [form.values.startDate, form.values.endDate, form.values.startTime, form.values.endTime]);

  const loadServiceTypes = async () => {
    try {
      const response = await servicesService.getServiceTypes(organizationId);
      console.log('Service Types Response:', response); // Debug log
      
      // Handle different response structures
      let serviceTypesData = [];
      if (Array.isArray(response)) {
        // Direct array response
        serviceTypesData = response;
      } else if (response && Array.isArray(response.response)) {
        // Response with response property
        serviceTypesData = response.response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        serviceTypesData = response.data;
      } else if (response && response.data && Array.isArray(response.data.response)) {
        // Response with data.response property
        serviceTypesData = response.data.response;
      }
      
      const serviceTypesOptions = serviceTypesData.map(item => ({
        value: item.id,
        label: item.name
      }));
      setServiceTypes(serviceTypesOptions);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  };

  const loadServices = async (serviceTypeId) => {
    setLoadingServices(true);
    try {
      const response = await servicesService.getServicesByType(serviceTypeId);
      console.log('Services Response:', response); // Debug log
      
      // Handle different response structures
      let servicesData = [];
      if (Array.isArray(response)) {
        // Direct array response
        servicesData = response;
      } else if (response && Array.isArray(response.response)) {
        // Response with response property
        servicesData = response.response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        servicesData = response.data;
      } else if (response && response.data && Array.isArray(response.data.response)) {
        // Response with data.response property
        servicesData = response.data.response;
      }
      
      const servicesOptions = servicesData.map(item => ({
        value: item.id,
        label: item.name
      }));
      setServices(servicesOptions);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadServiceProviders = async (page = 1, append = false, startDateTime, endDateTime, timezone) => {
    if (!startDateTime || !endDateTime) return;
    if (!currentFranchiseId) return; // Wait for franchise ID to be available

    setLoading(true);
    try {
      const request = {
        FranchiseId: currentFranchiseId, // Use current franchise from context
        StartDateTime: startDateTime.toISOString(),
        EndDateTime: endDateTime.toISOString(),
        SearchText: '',
        PageNumber: page,
        PageSize: 10,
        TimeZone: timezone
      };

      const response = await profileService.getAvailableServiceProviders(request);
      
      if (response && response.response) {
        const newProviders = response.response.map(provider => ({
          value: provider.userId,
          label: provider.name
        }));

        if (append) {
          setServiceProviders(prev => [...prev, ...newProviders]);
        } else {
          setServiceProviders(newProviders);
        }

        setHasMore(response.totalRecords > (page * 10));
        setTotalRecords(response.totalRecords);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading service providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && isInitialized) {
      const { startDate, endDate, startTime, endTime, timezone } = form.values;
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);
      
      loadServiceProviders(currentPage + 1, true, startDateTime, endDateTime, timezone);
    }
  };

  const checkProvidersAvailability = () => {
    const unavailableProviders = selectedProviderDetails.filter(
      (p) => p.finalAvailabilityStatus?.toLowerCase() !== "available"
    );
    return unavailableProviders;
  };

  const handleSubmit = async (values) => {
    // Manual validation check
    const errors = {};
    
    if (!values.startDate) errors.startDate = 'Start date is required';
    if (!values.endDate) errors.endDate = 'End date is required';
    if (!values.startTime) errors.startTime = 'Start time is required';
    if (!values.endTime) errors.endTime = 'End time is required';
    if (!values.serviceTypeId) errors.serviceTypeId = 'Service type is required';
    if (!values.serviceIds || values.serviceIds.length === 0) errors.serviceIds = 'At least one service is required';
    if (!values.serviceProviderIds || values.serviceProviderIds.length === 0) errors.serviceProviderIds = 'At least one service provider is required';
    if (!values.description) errors.description = 'Description is required';
    
    // Set errors in form
    if (Object.keys(errors).length > 0) {
      form.setErrors(errors);
      console.log('Form has validation errors:', errors);
      return;
    }

    // Check for provider conflicts
    const unavailableProviders = checkProvidersAvailability();
    
    if (unavailableProviders.length > 0) {
      // Show confirmation dialog
      setConflictingProviders(unavailableProviders);
      setPendingSubmitValues(values);
      setShowConflictModal(true);
    } else {
      // No conflicts, proceed directly
      submitAppointment(values);
    }
  };

  const handleConflictModalClose = (confirmed) => {
    if (confirmed && pendingSubmitValues) {
      submitAppointment(pendingSubmitValues);
    }
    setShowConflictModal(false);
    setConflictingProviders([]);
    setPendingSubmitValues(null);
  };

  const submitAppointment = async (values) => {
    console.log('Form is valid, proceeding with submission');
    setLoading(true);
    try {
      // Prepare the request object for CreateAppointment API
      const startDateTime = new Date(`${values.startDate}T${values.startTime}`);
      const endDateTime = new Date(`${values.endDate}T${values.endTime}`);
      
      // Helper function to convert recurrence arrays to CSV strings
      const getRecurrenceCSV = (array, pattern) => {
        if (!array || array.length === 0) return null;
        
        if (pattern === '2') { // Weekly - convert day numbers to day names
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          return array.map(dayNum => dayNames[parseInt(dayNum)]).join(',');
        } else if (pattern === '3') { // Monthly - use day numbers as is
          return array.join(',');
        } else if (pattern === '4') { // Yearly - use month numbers (1-12) as is
          return array.join(',');
        }
        return null;
      };

      const request = {
        ScheduleDescription: values.description,
        StartTime: startDateTime.toISOString(),
        EndTime: endDateTime.toISOString(),
        RecurrencePattern: parseInt(values.recurrencePattern),
        RecurrenceInterval: 1, // Default interval
        RecurrenceDaysOfWeek: getRecurrenceCSV(values.recurrenceDaysOfWeek, values.recurrencePattern) || '',
        RecurrenceDayOfMonth: getRecurrenceCSV(values.recurrenceDayOfMonth, values.recurrencePattern) || '',
        RecurrenceDayOfYear: getRecurrenceCSV(values.recurrenceDayOfYear, values.recurrencePattern) || '',
        ServiceType: parseInt(values.serviceTypeId),
        TimeZone: values.timezone || 'Pakistan Standard Time',
        CSVServiceIds: values.serviceIds.join(','), // Convert array to comma-separated string
        ClientId: values.clientId,
        CSVServiceProviderIds: values.serviceProviderIds.join(','), // Convert array to comma-separated string
        CreatedBy: localStoreService.getUserID()
      };

      console.log('Creating appointment with request:', request);
      
      const response = await scheduleService.saveUpdateschedule(request);
      
      console.log('Appointment created successfully:', response);
      // Show success message
      // You can add a notification here if needed
      onModalClose();
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Handle error - you can add error notification here
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (!isInitialized) {
      return "Please select start and end date/time first";
    }
    return "Select Service Providers";
  };

  const handleProviderSelection = (providers) => {
    // Store full provider details
    setSelectedProviderDetails(providers);
    
    // Update form with provider IDs
    const providerIds = providers.map(p => p.userId);
    form.setFieldValue('serviceProviderIds', providerIds);
  };

  const handleOpenProviderSelector = () => {
    if (isInitialized) {
      setShowProviderSelector(true);
    }
  };

  const getSelectedProvidersDisplay = () => {
    if (form.values.serviceProviderIds.length === 0) {
      return null;
    }

    return (
      <Group spacing="xs" mt="xs">
        {selectedProviderDetails.map((provider) => {
          const isAvailable = provider.finalAvailabilityStatus?.toLowerCase() === "available";
          return (
            <Badge
              key={provider.userId}
              color={isAvailable ? "green" : "orange"}
              variant="filled"
              size="lg"
            >
              {provider.name} - {provider.finalAvailabilityStatus}
            </Badge>
          );
        })}
      </Group>
    );
  };

  return (
    <>
      {/* Service Provider Selector Modal */}
      <ServiceProviderSelector
        opened={showProviderSelector}
        onClose={() => setShowProviderSelector(false)}
        onSelect={handleProviderSelection}
        selectedProviders={form.values.serviceProviderIds}
        startDateTime={
          form.values.startDate && form.values.startTime
            ? new Date(`${form.values.startDate}T${form.values.startTime}`)
            : null
        }
        endDateTime={
          form.values.endDate && form.values.endTime
            ? new Date(`${form.values.endDate}T${form.values.endTime}`)
            : null
        }
        multiSelect={true}
      />

      {/* Conflict Warning Modal */}
      <AppConfirmationModal
        opened={showConflictModal}
        onClose={handleConflictModalClose}
        title="Service Provider Conflicts Detected"
        isLoading={loading}
      >
        <Stack spacing="md">
          <Group>
            <IconAlertCircle size={24} color="orange" />
            <Text>The following service providers have scheduling conflicts:</Text>
          </Group>
          
          {conflictingProviders.map((provider) => (
            <Alert key={provider.userId} color="orange">
              <Text size="sm" weight={500}>{provider.name}</Text>
              <Text size="xs">
                Status: {provider.finalAvailabilityStatus}
                {provider.taskCount > 0 && ` - Has ${provider.taskCount} task(s) already scheduled`}
                {provider.finalAvailabilityStatus?.toLowerCase() === "on leave" && 
                  provider.leaveStartDate && 
                  ` - Leave period: ${new Date(provider.leaveStartDate).toLocaleDateString()} to ${new Date(provider.leaveEndDate).toLocaleDateString()}`
                }
              </Text>
            </Alert>
          ))}
          
          <Text weight={500} color="orange">
            Do you want to proceed with the assignment anyway?
          </Text>
        </Stack>
      </AppConfirmationModal>

      <Paper p="md" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid mt="xs">
          {/* Service Type and Services */}
          <Grid.Col span={6}>
            <Select
              label="Service Type"
              placeholder="Select Service Type"
              data={serviceTypes}
              required
              error={form.errors.serviceTypeId}
              {...form.getInputProps('serviceTypeId')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <MultiSelect
              label="Services"
              placeholder="Select Services"
              data={services}
              required
              disabled={!form.values.serviceTypeId}
              loading={loadingServices}
              searchable
              error={form.errors.serviceIds}
              {...form.getInputProps('serviceIds')}
            />
          </Grid.Col>

          {/* Date and Time */}
          <Grid.Col span={6}>
            <TextInput
              label="Start Date"
              placeholder="mm/dd/yyyy"
              type="date"
              required
              error={form.errors.startDate}
              {...form.getInputProps('startDate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Date"
              placeholder="mm/dd/yyyy"
              type="date"
              required
              error={form.errors.endDate}
              {...form.getInputProps('endDate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Start Time"
              placeholder="--:--"
              type="time"
              required
              error={form.errors.startTime}
              {...form.getInputProps('startTime')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Time"
              placeholder="--:--"
              type="time"
              required
              error={form.errors.endTime}
              {...form.getInputProps('endTime')}
            />
          </Grid.Col>

          {/* Recurrence Pattern - Segmented Control */}
          <Grid.Col span={12}>
            <Text size="sm" weight={500} mb="xs">Recurrence Pattern</Text>
            <Group spacing="xs">
              {[
                { value: '1', label: 'Daily' },
                { value: '2', label: 'Weekly' },
                { value: '3', label: 'Monthly' },
                { value: '4', label: 'Yearly' }
              ].map((pattern) => (
                <Button
                  key={pattern.value}
                  variant={form.values.recurrencePattern === pattern.value ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => form.setFieldValue('recurrencePattern', pattern.value)}
                >
                  {pattern.label}
                </Button>
              ))}
            </Group>
          </Grid.Col>

          {/* Conditional Recurrence Fields */}
          {form.values.recurrencePattern === '2' && (
            <Grid.Col span={12}>
              <MultiSelect
                label="Days of the Week"
                placeholder="Select Days of the Week"
                data={[
                  { value: '0', label: 'Sunday' },
                  { value: '1', label: 'Monday' },
                  { value: '2', label: 'Tuesday' },
                  { value: '3', label: 'Wednesday' },
                  { value: '4', label: 'Thursday' },
                  { value: '5', label: 'Friday' },
                  { value: '6', label: 'Saturday' }
                ]}
                required
                {...form.getInputProps('recurrenceDaysOfWeek')}
              />
            </Grid.Col>
          )}

          {form.values.recurrencePattern === '3' && (
            <Grid.Col span={12}>
              <MultiSelect
                label="Days of the Month"
                placeholder="Select Days of the Month"
                data={Array.from({ length: 31 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: (i + 1).toString()
                }))}
                required
                {...form.getInputProps('recurrenceDayOfMonth')}
              />
            </Grid.Col>
          )}

            {form.values.recurrencePattern === '4' && (
                <Grid.Col span={12}>
              <MultiSelect
                        label="Months of the Year"
                        placeholder="Select Months of the Year"
                data={[
                            { value: '1', label: 'January' },
                            { value: '2', label: 'February' },
                            { value: '3', label: 'March' },
                            { value: '4', label: 'April' },
                            { value: '5', label: 'May' },
                            { value: '6', label: 'June' },
                            { value: '7', label: 'July' },
                            { value: '8', label: 'August' },
                            { value: '9', label: 'September' },
                            { value: '10', label: 'October' },
                            { value: '11', label: 'November' },
                            { value: '12', label: 'December' }
                ]}
                required
                        {...form.getInputProps('recurrenceDayOfYear')}
              />
            </Grid.Col>
          )}

          {/* Service Providers */}
          <Grid.Col span={12}>
            <Text size="sm" weight={500} mb="xs">
              Service Providers <span style={{ color: 'red' }}>*</span>
            </Text>
            <Button
              fullWidth
              variant="outline"
              onClick={handleOpenProviderSelector}
              disabled={!isInitialized}
              leftIcon={<IconUsers size={16} />}
              styles={(theme) => ({
                root: {
                  borderColor: form.errors.serviceProviderIds ? theme.colors.red[6] : undefined,
                  height: 'auto',
                  minHeight: '36px',
                  justifyContent: 'flex-start'
                }
              })}
            >
              <Group spacing="xs" position="apart" style={{ width: '100%' }}>
                <Text>
                  {form.values.serviceProviderIds.length === 0
                    ? getPlaceholder()
                    : `${form.values.serviceProviderIds.length} provider(s) selected`}
                </Text>
                {form.values.serviceProviderIds.length > 0 && (
                  <Badge color="blue" variant="filled">
                    {form.values.serviceProviderIds.length}
                  </Badge>
                )}
              </Group>
            </Button>
            {form.errors.serviceProviderIds && (
              <Text size="xs" color="red" mt={4}>
                {form.errors.serviceProviderIds}
              </Text>
            )}
            {!isInitialized && (
              <Text size="xs" color="orange" mt={4}>
                Select start and end date/time to load available service providers
              </Text>
            )}
            {getSelectedProvidersDisplay()}
          </Grid.Col>

          {/* Description */}
          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Enter Description"
              required
              minRows={3}
              maxRows={6}
              error={form.errors.description}
              {...form.getInputProps('description')}
            />
          </Grid.Col>
        </Grid>

        <Button
          type="submit"
          fullWidth
          mt="xl"
          size="md"
          loading={loading}
        >
          Save
        </Button>
      </form>
    </Paper>
    </>
  );
};

export default AddUpdateUserSchedule;
