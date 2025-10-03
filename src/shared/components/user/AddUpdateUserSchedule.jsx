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
  Title
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { profileService, localStoreService, servicesService, scheduleService } from "core/services";

const AddUpdateUserSchedule = ({ userId, organizationId, onModalClose }) => {
  const [serviceProviders, setServiceProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const form = useForm({
    initialValues: {
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      serviceTypeId: '',
      serviceIds: [],
      serviceProviderIds: [],
      recurrencePattern: '0', // 0 = No recurrence, 1 = Daily, 2 = Weekly, 3 = Monthly, 4 = Yearly
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

    setLoading(true);
    try {
      const franchiseId = localStoreService.getFranchiseID();
      const request = {
        FranchiseId: franchiseId, // Use franchiseId instead of organizationId
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

  const handleSubmit = async (values) => {
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

  return (
    <Paper p="md" radius="md">
      <Title order={3} mb="md">Appointment</Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid mt="xs">
          {/* Service Type and Services */}
          <Grid.Col span={6}>
            <Select
              label="Service Type"
              placeholder="Select Service Type"
              data={serviceTypes}
              required
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
              {...form.getInputProps('startDate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Date"
              placeholder="mm/dd/yyyy"
              type="date"
              required
              {...form.getInputProps('endDate')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Start Time"
              placeholder="--:--"
              type="time"
              required
              {...form.getInputProps('startTime')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Time"
              placeholder="--:--"
              type="time"
              required
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
            <MultiSelect
              label="Service Providers"
              placeholder={getPlaceholder()}
              data={serviceProviders}
              value={form.values.serviceProviderIds}
              onChange={(value) => form.setFieldValue('serviceProviderIds', value)}
              required
              searchable={isInitialized}
              disabled={!isInitialized}
              rightSection={
                <Group spacing="xs">
                  {loading && <Loader size="xs" />}
                  {hasMore && !loading && isInitialized && (
                    <Button
                      size="xs"
                      variant="subtle"
                      onClick={handleLoadMore}
                      style={{ fontSize: '12px', padding: '2px 6px' }}
                    >
                      Load More
                    </Button>
                  )}
                </Group>
              }
              styles={{
                rightSection: {
                  pointerEvents: 'auto',
                }
              }}
            />
            {isInitialized && hasMore && (
              <Text size="xs" color="dimmed" mt={4}>
                Showing {serviceProviders.length} of {totalRecords} service providers
              </Text>
            )}
            {!isInitialized && (
              <Text size="xs" color="orange" mt={4}>
                Select start and end date/time to load available service providers
              </Text>
            )}
          </Grid.Col>

          {/* Description */}
          <Grid.Col span={12}>
            <Textarea
              label="Description"
              placeholder="Enter Description"
              required
              minRows={3}
              maxRows={6}
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
  );
};

export default AddUpdateUserSchedule;
