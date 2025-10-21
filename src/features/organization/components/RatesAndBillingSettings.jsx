import React, { useState, useEffect } from 'react';
import {
  Card,
  Title,
  Text,
  Radio,
  Group,
  Button,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Select,
  NumberInput,
  Switch,
  Grid,
  Divider,
  Stack,
  Badge,
  Alert,
  LoadingOverlay,
  ScrollArea,
  Paper,
  Textarea,
  Collapse,
  Box,
  Accordion,
  ThemeIcon
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z as zod } from 'zod';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconTrash, IconEdit, IconAlertCircle, IconChevronDown, IconChevronRight, IconClock, IconCalendar, IconBuilding, IconSettings } from '@tabler/icons';
import { organizationBillingSettingsService, servicesService } from 'core/services';

const schema = zod.object({
  // No form fields needed since we removed billing method and default rates
});

const timeBasedRateSchema = zod.object({
  serviceTypeId: zod.string().optional(),
  serviceId: zod.string().optional(),
  dayOfWeek: zod.number().min(0).max(6),
  startTime: zod.string().min(1),
  endTime: zod.string().min(1),
  clientRate: zod.number().min(0),
  wageRate: zod.number().min(0),
  isActive: zod.boolean(),
});

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Removed BILLING_MODES since we're removing billing method selection

const RatesAndBillingSettings = ({ organizationId, organizationName }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeBasedRates, setTimeBasedRates] = useState([]);
  const [originalTimeBasedRates, setOriginalTimeBasedRates] = useState([]); // Track original rates for comparison
  const [serviceTypes, setServiceTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  
  // Hierarchical view state
  const [expandedServiceTypes, setExpandedServiceTypes] = useState(new Set());
  const [expandedServices, setExpandedServices] = useState(new Set());
  const [expandedDays, setExpandedDays] = useState(new Set());

  const form = useForm({
    schema: zodResolver(schema),
    initialValues: {
      // No form fields needed
    },
  });

  const rateForm = useForm({
    schema: zodResolver(timeBasedRateSchema),
    initialValues: {
      serviceTypeId: '',
      serviceId: '',
      dayOfWeek: 1,
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      clientRate: 0,
      wageRate: 0,
      isActive: true,
    },
  });

  // Convert 24-hour format to 12-hour AM/PM format for form display
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Convert 12-hour AM/PM format to 24-hour format for API
  const convertTo24Hour = (time12) => {
    if (!time12) return '';
    const [time, period] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);
    
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  useEffect(() => {
    if (organizationId) {
      loadTimeBasedRates();
      loadServiceTypes();
    }
  }, [organizationId]);

  // Helper functions for hierarchical view
  const toggleServiceType = (serviceTypeId) => {
    const newExpanded = new Set(expandedServiceTypes);
    if (newExpanded.has(serviceTypeId)) {
      newExpanded.delete(serviceTypeId);
    } else {
      newExpanded.add(serviceTypeId);
    }
    setExpandedServiceTypes(newExpanded);
  };

  const toggleService = (serviceId) => {
    const newExpanded = new Set(expandedServices);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedServices(newExpanded);
  };

  const toggleDay = (dayKey) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  // Group rates by service type, service, and day
  const groupedRates = timeBasedRates.reduce((acc, rate) => {
    const serviceTypeId = rate.serviceTypeId || 'all';
    const serviceTypeName = rate.serviceTypeName || 'All Service Types';
    const serviceId = rate.serviceId || 'all';
    const serviceName = rate.serviceName || 'All Services';
    const dayOfWeek = rate.dayOfWeek;
    const dayName = rate.dayName;

    if (!acc[serviceTypeId]) {
      acc[serviceTypeId] = {
        id: serviceTypeId,
        name: serviceTypeName,
        services: {}
      };
    }

    if (!acc[serviceTypeId].services[serviceId]) {
      acc[serviceTypeId].services[serviceId] = {
        id: serviceId,
        name: serviceName,
        days: {}
      };
    }

    if (!acc[serviceTypeId].services[serviceId].days[dayOfWeek]) {
      acc[serviceTypeId].services[serviceId].days[dayOfWeek] = {
        dayOfWeek,
        dayName,
        rates: []
      };
    }

    acc[serviceTypeId].services[serviceId].days[dayOfWeek].rates.push(rate);
    return acc;
  }, {});

  // Format time for display in AM/PM format (handle both string and TimeSpan object formats)
  const formatTimeForDisplay = (timeValue) => {
    if (!timeValue) return '12:00 AM';
    
    let timeString = '';
    
    // If it's already a string (HH:MM or HH:MM:SS), use as is
    if (typeof timeValue === 'string') {
      timeString = timeValue.includes(':') ? timeValue : '00:00';
    }
    // If it's a TimeSpan object with ticks, convert to HH:MM format
    else if (typeof timeValue === 'object' && timeValue.ticks !== undefined) {
      const totalSeconds = Math.floor(timeValue.ticks / 10000000); // Convert ticks to seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      return '12:00 AM';
    }
    
    // Convert to AM/PM format
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const loadTimeBasedRates = async () => {
    setLoading(true);
    try {
      console.log('Loading time-based rates for organizationId:', organizationId); // Debug log
      const response = await organizationBillingSettingsService.getTimeBasedRates(organizationId);
      console.log('API Response:', response); // Debug log
      
      // Check if response is an array directly or nested under data property
      const ratesData = Array.isArray(response) ? response : response?.data;
      
      if (ratesData && ratesData.length > 0) {
            console.log('Rates data:', ratesData); // Debug log
            // Transform the data to ensure rates are numbers
            const transformedRates = ratesData.map(rate => {
                try {
                    return {
                        ...rate,
                        clientRate: Number(rate.clientRate || 0),
                        wageRate: Number(rate.wageRate || 0),
                        serviceTypeId: rate.serviceTypeId ? Number(rate.serviceTypeId) : null,
                        serviceId: rate.serviceId ? Number(rate.serviceId) : null
                    };
                } catch (error) {
                    console.warn('Error transforming rate data:', error, rate);
                    return {
                        ...rate,
                        clientRate: 0,
                        wageRate: 0,
                        serviceTypeId: null,
                        serviceId: null
                    };
                }
            });
            console.log('Transformed rates:', transformedRates); // Debug log
            setTimeBasedRates(transformedRates);
            setOriginalTimeBasedRates([...transformedRates]); // Store original rates for comparison
        } else {
            console.log('No rates data found, setting empty array'); // Debug log
            setTimeBasedRates([]);
        }
      // else {
      //  // Add sample data for demo purposes
      //  setTimeBasedRates([
      //    {
      //      id: 1,
      //      dayOfWeek: 1,
      //      dayName: 'Monday-Friday',
      //      startTime: '09:00',
      //      endTime: '18:00',
      //      serviceTypeId: null,
      //      serviceTypeName: 'All Service Types',
      //      serviceId: null,
      //      serviceName: 'All Services',
      //      clientRate: 5.00,
      //      wageRate: 3.00,
      //      isActive: true
      //    },
      //    {
      //      id: 2,
      //      dayOfWeek: 1,
      //      dayName: 'Monday-Friday',
      //      startTime: '18:00',
      //      endTime: '21:00',
      //      serviceTypeId: 1,
      //      serviceTypeName: 'Personal Care',
      //      serviceId: 1,
      //      serviceName: 'Personal Care Service',
      //      clientRate: 7.00,
      //      wageRate: 4.00,
      //      isActive: true
      //    },
      //    {
      //      id: 3,
      //      dayOfWeek: 6,
      //      dayName: 'Saturday',
      //      startTime: '09:00',
      //      endTime: '12:00',
      //      serviceTypeId: 2,
      //      serviceTypeName: 'Companionship',
      //      serviceId: 2,
      //      serviceName: 'Companionship Service',
      //      clientRate: 6.00,
      //      wageRate: 3.50,
      //      isActive: true
      //    }
      //  ]);
      //}
    } catch (error) {
      console.error('Failed to load time-based rates:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load time-based rates',
        color: 'red',
      });
      setTimeBasedRates([]);
    } finally {
      setLoading(false);
    }
  };


  const loadServiceTypes = async () => {
    try {
      const response = await servicesService.getServiceTypes(organizationId);
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
       
     
        const serviceTypeOptions = serviceTypesData.map(serviceType => ({
          value: serviceType.id,
          label: serviceType.name,
        }));
        setServiceTypes([{ value: '', label: 'All Service Types' }, ...serviceTypeOptions]);
       
    } catch (error) {
      console.error('Failed to load service types:', error);
      // Add sample service types for demo purposes

    }
  };

  const loadServices = async (serviceTypeId = null) => {
    try {
      let response;
      if (serviceTypeId) {
        // Use the specific endpoint for services by type
        response = await servicesService.getServicesByType(serviceTypeId);
      }
      
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
         

        const serviceOptions = servicesData.map(service => ({
          value: service.id,
          label: service.name,
        }));
        setServices([{ value: '', label: 'All Services' }, ...serviceOptions]);
      
    } catch (error) {
      console.error('Failed to load services:', error);
 
    }
  };

  const handleSaveTimeBasedRates = async () => {
    setSaving(true);
    setValidationErrors([]);
    
    try {
      // Validate time-based rates
      const errors = validateTimeBasedRates();
      if (errors.length > 0) {
        setValidationErrors(errors);
        setSaving(false);
        return;
      }

      // Format time for API (convert HH:MM to HH:MM:SS)
      const formatTimeForAPI = (timeString) => {
        if (!timeString) return "00:00:00";
        if (timeString.includes(':')) {
          const parts = timeString.split(':');
          if (parts.length === 2) {
            return `${timeString}:00`;
          }
          return timeString;
        }
        return "00:00:00";
      };

      // Convert to TimeSpan string format for .NET API
      const formatTimeAsTimeSpan = (timeString) => {
        if (!timeString) return "00:00:00";
        if (timeString.includes(':')) {
          const parts = timeString.split(':');
          if (parts.length === 2) {
            // Convert HH:MM to HH:MM:SS
            return `${timeString}:00`;
          }
          return timeString; // Already in HH:MM:SS format
        }
        return "00:00:00";
      };

      // Find rates that were deleted (exist in original but not in current)
      const deletedRates = originalTimeBasedRates.filter(originalRate => 
        originalRate.id && originalRate.id > 0 && // Only consider rates that were saved to DB
        !timeBasedRates.some(currentRate => currentRate.id === originalRate.id)
      );

      // Delete removed rates
      for (const deletedRate of deletedRates) {
        console.log('Deleting rate:', deletedRate.id);
        await organizationBillingSettingsService.deleteTimeBasedRate(deletedRate.id, organizationId);
      }

      // Save/Update time-based rates
      for (const rate of timeBasedRates) {
        const formattedRate = {
          ...rate,
          organizationId,
          serviceTypeId: rate.serviceTypeId ? Number(rate.serviceTypeId) : null,
          serviceId: rate.serviceId ? Number(rate.serviceId) : null,
          dayOfWeek: Number(rate.dayOfWeek),
          startTime: formatTimeAsTimeSpan(rate.startTime),
          endTime: formatTimeAsTimeSpan(rate.endTime),
          clientRate: Number(rate.clientRate),
          wageRate: Number(rate.wageRate),
        };

        if (rate.id && rate.id > 0) {
          // Update existing rate
          console.log('Updating rate:', rate.id);
          await organizationBillingSettingsService.saveTimeBasedRate(formattedRate);
        } else {
          // Add new rate
          console.log('Adding new rate');
          await organizationBillingSettingsService.saveTimeBasedRate(formattedRate);
        }
      }
      
      // Reload the data to get the latest state from the server
      await loadTimeBasedRates();
      
      notifications.show({
        title: 'Success',
        message: `Time-based rates saved successfully. ${deletedRates.length > 0 ? `${deletedRates.length} rate(s) deleted.` : ''}`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save time-based rates',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleServiceTypeChange = async (serviceTypeId) => {
    // Reset service selection when service type changes
    rateForm.setFieldValue('serviceId', '');
    // Load services for the selected service type
    await loadServices(serviceTypeId);
  };

  const validateTimeBasedRates = () => {
    const errors = [];
    
    // Check for overlapping time ranges
    for (let i = 0; i < timeBasedRates.length; i++) {
      for (let j = i + 1; j < timeBasedRates.length; j++) {
        const rate1 = timeBasedRates[i];
        const rate2 = timeBasedRates[j];
        
        if (rate1.dayOfWeek === rate2.dayOfWeek && 
            rate1.isActive && rate2.isActive &&
            rate1.serviceId === rate2.serviceId && 
            rate1.serviceTypeId === rate2.serviceTypeId) {
          
          const start1 = new Date(`2000-01-01T${rate1.startTime}`);
          const end1 = new Date(`2000-01-01T${rate1.endTime}`);
          const start2 = new Date(`2000-01-01T${rate2.startTime}`);
          const end2 = new Date(`2000-01-01T${rate2.endTime}`);
          
          if (start1 < end2 && start2 < end1) {
            const serviceTypeName1 = rate1.serviceTypeName || 'All Service Types';
            const serviceName1 = rate1.serviceName || 'All Services';
            const dayName1 = rate1.dayName;
            const timeRange1 = `${formatTimeForDisplay(rate1.startTime)} - ${formatTimeForDisplay(rate1.endTime)}`;
            const timeRange2 = `${formatTimeForDisplay(rate2.startTime)} - ${formatTimeForDisplay(rate2.endTime)}`;
            
            errors.push(
              `${serviceTypeName1} > ${serviceName1} > ${dayName1}: ${timeRange1} overlaps with ${timeRange2}`
            );
          }
        }
      }
    }
    
    return errors;
  };

  const handleAddRate = () => {
    setEditingRate(null);
    rateForm.setValues({
      serviceTypeId: '',
      serviceId: '',
      dayOfWeek: 1,
      startTime: '9:00 AM',
      endTime: '5:00 PM',
      clientRate: 0,
      wageRate: 0,
      isActive: true,
    });
    setModalOpened(true);
  };

  const handleEditRate = (rate) => {
    setEditingRate(rate);
    
    // Convert display time back to 24-hour format first, then to 12-hour for form
    const startTime24 = formatTimeForDisplay(rate.startTime).replace(' AM', '').replace(' PM', '');
    const endTime24 = formatTimeForDisplay(rate.endTime).replace(' AM', '').replace(' PM', '');
    
    rateForm.setValues({
      serviceTypeId: rate.serviceTypeId || '',
      serviceId: rate.serviceId || '',
      dayOfWeek: rate.dayOfWeek,
      startTime: convertTo12Hour(startTime24),
      endTime: convertTo12Hour(endTime24),
      clientRate: Number(rate.clientRate || 0),
      wageRate: Number(rate.wageRate || 0),
      isActive: rate.isActive,
    });
    setModalOpened(true);
  };

  const handleSaveRate = async (values) => {
    try {
      // Convert 12-hour format to 24-hour format for API
      const formatTimeForAPI = (timeString) => {
        if (!timeString) return "00:00:00";
        const time24 = convertTo24Hour(timeString);
        return `${time24}:00`; // Add seconds
      };

      // Convert to TimeSpan string format for .NET API
      const formatTimeAsTimeSpan = (timeString) => {
        if (!timeString) return "00:00:00";
        if (timeString.includes(':')) {
          const parts = timeString.split(':');
          if (parts.length === 2) {
            // Convert HH:MM to HH:MM:SS
            return `${timeString}:00`;
          }
          return timeString; // Already in HH:MM:SS format
        }
        return "00:00:00";
      };

      const rateData = {
        id: editingRate?.id,
        organizationId,
        serviceTypeId: values.serviceTypeId ? Number(values.serviceTypeId) : null,
        serviceId: values.serviceId ? Number(values.serviceId) : null,
        dayOfWeek: Number(values.dayOfWeek),
        startTime: formatTimeAsTimeSpan(values.startTime),
        endTime: formatTimeAsTimeSpan(values.endTime),
        clientRate: Number(values.clientRate),
        wageRate: Number(values.wageRate),
        isActive: values.isActive,
      };

      if (editingRate) {
        // Update existing rate
        const updatedRates = timeBasedRates.map(rate => 
          rate.id === editingRate.id ? { 
            ...rate, 
            ...rateData,
            serviceTypeName: values.serviceTypeId ? 
              serviceTypes.find(st => st.value === values.serviceTypeId)?.label : 'All Service Types',
            serviceName: values.serviceId ? 
              services.find(s => s.value === values.serviceId)?.label : 'All Services',
          } : rate
        );
        setTimeBasedRates(updatedRates);
      } else {
        // Add new rate
        const newRate = {
          id: Date.now(), // Temporary ID for UI
          ...rateData,
          serviceTypeName: values.serviceTypeId ? 
            serviceTypes.find(st => st.value === values.serviceTypeId)?.label : 'All Service Types',
          serviceName: values.serviceId ? 
            services.find(s => s.value === values.serviceId)?.label : 'All Services',
          dayName: DAYS_OF_WEEK[values.dayOfWeek].label,
        };
        setTimeBasedRates([...timeBasedRates, newRate]);
      }

      setModalOpened(false);
      notifications.show({
        title: 'Success',
        message: 'Time-based rate saved successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save time-based rate',
        color: 'red',
      });
    }
  };

  const handleDeleteRate = async (rateId) => {
    try {
      // Optimistic update - remove from UI immediately
      setTimeBasedRates(timeBasedRates.filter(rate => rate.id !== rateId));
      notifications.show({
        title: 'Success',
        message: 'Time-based rate removed. Click "Save Changes" to confirm deletion.',
        color: 'blue',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to remove time-based rate',
        color: 'red',
      });
    }
  };


  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <LoadingOverlay visible={loading} />
      
      <Stack spacing="xl">
        <Title order={2} mb="md">Time-Based Rates</Title>
        
        {/* Time-Based Rates Section */}
        <Paper shadow="sm" radius="md" p="lg" withBorder>
          <Group position="apart" mb="md">
            <Title order={4}>Time-Based Rate Schedule</Title>
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={handleAddRate}
              size="sm"
              variant="outline"
            >
              + Add Rate Row
            </Button>
          </Group>

          {validationErrors.length > 0 && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
              <Text size="sm" weight={500}>Validation Errors:</Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <ScrollArea style={{ height: 600 }}>
            {Object.keys(groupedRates).length === 0 ? (
              <Box style={{ textAlign: 'center', padding: '2rem' }}>
                <Text color="dimmed">No time-based rates configured. Click "Add Rate Row" to get started.</Text>
              </Box>
            ) : (
              <Stack spacing="md">
                {Object.values(groupedRates).map((serviceType) => (
                  <Card key={serviceType.id} withBorder>
                    <Group 
                      style={{ cursor: 'pointer' }} 
                      onClick={() => toggleServiceType(serviceType.id)}
                    >
                      <ThemeIcon color="blue" variant="light" size="sm">
                        <IconBuilding size={16} />
                      </ThemeIcon>
                      <Text weight={600} size="lg">{serviceType.name}</Text>
                      {expandedServiceTypes.has(serviceType.id) ? 
                        <IconChevronDown size={16} /> : 
                        <IconChevronRight size={16} />
                      }
                    </Group>
                    
                    <Collapse in={expandedServiceTypes.has(serviceType.id)}>
                      <Box pl="xl" pt="md">
                        {Object.values(serviceType.services).map((service) => (
                          <Card key={service.id} withBorder style={{ marginBottom: '8px' }}>
                            <Group 
                              style={{ cursor: 'pointer' }} 
                              onClick={() => toggleService(service.id)}
                            >
                              <ThemeIcon color="green" variant="light" size="sm">
                                <IconSettings size={16} />
                              </ThemeIcon>
                              <Text weight={500}>{service.name}</Text>
                              {expandedServices.has(service.id) ? 
                                <IconChevronDown size={16} /> : 
                                <IconChevronRight size={16} />
                              }
                            </Group>
                            
                            <Collapse in={expandedServices.has(service.id)}>
                              <Box pl="xl" pt="md">
                                {Object.values(service.days).map((day) => {
                                  const dayKey = `${serviceType.id}-${service.id}-${day.dayOfWeek}`;
                                  return (
                                    <Card key={day.dayOfWeek} withBorder style={{ marginBottom: '8px' }}>
                                      <Group 
                                        style={{ cursor: 'pointer' }} 
                                        onClick={() => toggleDay(dayKey)}
                                      >
                                        <ThemeIcon color="orange" variant="light" size="sm">
                                          <IconCalendar size={16} />
                                        </ThemeIcon>
                                        <Text weight={500}>{day.dayName}</Text>
                                        {expandedDays.has(dayKey) ? 
                                          <IconChevronDown size={16} /> : 
                                          <IconChevronRight size={16} />
                                        }
                                      </Group>
                                      
                                      <Collapse in={expandedDays.has(dayKey)}>
                                        <Box pl="xl" pt="md">
                                          {day.rates.length === 0 ? (
                                            <Text color="dimmed" size="sm">No rates configured for this day</Text>
                                          ) : (
                                            <Table striped highlightOnHover>
                                              <thead>
                                                <tr>
                                                  <th>Start Time</th>
                                                  <th>End Time</th>
                                                  <th>Client Rate ($/hr)</th>
                                                  <th>Wage Rate ($)</th>
                                                  <th>Actions</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {day.rates.map((rate, index) => (
                                                  <tr key={rate.id || `rate-${index}`}>
                                                    <td>
                                                      <Group spacing="xs">
                                                        <IconClock size={14} />
                                                        {formatTimeForDisplay(rate.startTime)}
                                                      </Group>
                                                    </td>
                                                    <td>
                                                      <Group spacing="xs">
                                                        <IconClock size={14} />
                                                        {formatTimeForDisplay(rate.endTime)}
                                                      </Group>
                                                    </td>
                                                    <td>
                                                      <Badge color="blue" variant="light">
                                                        ${Number(rate.clientRate || 0).toFixed(2)}
                                                      </Badge>
                                                    </td>
                                                    <td>
                                                      <Badge color="green" variant="light">
                                                        ${Number(rate.wageRate || 0).toFixed(2)}
                                                      </Badge>
                                                    </td>
                                                    <td>
                                                      <Group spacing="xs">
                                                        <ActionIcon
                                                          color="red"
                                                          variant="light"
                                                          onClick={() => handleDeleteRate(rate.id)}
                                                          size="sm"
                                                        >
                                                          <IconTrash size={14} />
                                                        </ActionIcon>
                                                      </Group>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </Table>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </Card>
                                  );
                                })}
                              </Box>
                            </Collapse>
                          </Card>
                        ))}
                      </Box>
                    </Collapse>
                  </Card>
                ))}
              </Stack>
            )}
          </ScrollArea>


        </Paper>

        {/* Save Button */}
        <Group position="right" mt="xl">
          <Button
            onClick={handleSaveTimeBasedRates}
            loading={saving}
            disabled={timeBasedRates.length === 0}
            size="md"
          >
            Save Changes
          </Button>
        </Group>
      </Stack>

      {/* Time-Based Rate Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingRate ? 'Edit Time-Based Rate' : 'Add Time-Based Rate'}
        size="lg"
        centered
      >
        <form onSubmit={rateForm.onSubmit(handleSaveRate)}>
          <Stack spacing="lg">
            <Grid>
              <Grid.Col span={6}>
                <Select
                  label="Service Type"
                  placeholder="Select service type"
                  data={serviceTypes}
                  {...rateForm.getInputProps('serviceTypeId')}
                  clearable
                  onChange={(value) => {
                    rateForm.setFieldValue('serviceTypeId', value);
                    handleServiceTypeChange(value);
                  }}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Day of Week"
                  placeholder="Select day"
                  data={DAYS_OF_WEEK}
                  {...rateForm.getInputProps('dayOfWeek')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={12}>
                <Select
                  label="Service"
                  placeholder="Select service"
                  data={services}
                  {...rateForm.getInputProps('serviceId')}
                  clearable
                  disabled={!rateForm.values.serviceTypeId}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Start Time"
                  type="time"
                  placeholder="HH:MM"
                  {...rateForm.getInputProps('startTime')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="End Time"
                  type="time"
                  placeholder="HH:MM"
                  {...rateForm.getInputProps('endTime')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Client Rate ($/hr)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...rateForm.getInputProps('clientRate')}
                  required
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Wage Rate ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...rateForm.getInputProps('wageRate')}
                  required
                />
              </Grid.Col>
            </Grid>

            <Switch
              label="Active"
              description="Enable this rate rule"
              {...rateForm.getInputProps('isActive', { type: 'checkbox' })}
            />

            <Group position="right" mt="xl">
              <Button variant="outline" onClick={() => setModalOpened(false)}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                {editingRate ? 'Update Rate' : 'Add Rate'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default RatesAndBillingSettings;
