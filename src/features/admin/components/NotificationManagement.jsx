import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Stack,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Group,
  Button,
  Grid,
  Card,
  Text,
  Badge,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconSend,
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
} from "@tabler/icons";
import {
  notificationService,
  organizationService,
  franchiseService,
  showSuccessNotification,
  showErrorNotification,
} from "core/services";

const NotificationManagement = () => {
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "Info",
    priority: 0,
    organizationId: "",
    franchiseId: "",
    targetRoleId: "",
    expiresAt: null,
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (formData.organizationId) {
      fetchFranchises(formData.organizationId);
    } else {
      setFranchises([]);
      setFormData(prev => ({ ...prev, franchiseId: "" }));
    }
  }, [formData.organizationId]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationService.getAllOrganizations();
      if (response && Array.isArray(response)) {
        setOrganizations(
          response.map((org) => ({
            value: org.id,
            label: org.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    }
  };

  const fetchFranchises = async (organizationId) => {
    try {
      const response = await franchiseService.getFranchiseList(organizationId);
      if (response && Array.isArray(response)) {
        setFranchises(
          response.map((franchise) => ({
            value: franchise.id,
            label: franchise.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch franchises:", error);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSendNotification = async () => {
    // Validation
    if (!formData.title.trim()) {
      showErrorNotification("Please enter a notification title");
      return;
    }
    if (!formData.message.trim()) {
      showErrorNotification("Please enter a notification message");
      return;
    }

    setLoading(true);
    try {
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        priority: formData.priority,
        organizationId: formData.organizationId || null,
        franchiseId: formData.franchiseId || null,
        targetRoleId: formData.targetRoleId ? parseInt(formData.targetRoleId) : null,
        expiresAt: formData.expiresAt || null,
      };

      await notificationService.createNotification(notificationData);
      
      showSuccessNotification("Notification sent successfully!");
      
      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "Info",
        priority: 0,
        organizationId: "",
        franchiseId: "",
        targetRoleId: "",
        expiresAt: null,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      showErrorNotification("Failed to send notification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    { value: "Info", label: "Info", color: "blue" },
    { value: "Success", label: "Success", color: "green" },
    { value: "Warning", label: "Warning", color: "yellow" },
    { value: "Error", label: "Error", color: "red" },
  ];

  const priorityLevels = [
    { value: 0, label: "Normal" },
    { value: 1, label: "High" },
    { value: 2, label: "Urgent" },
  ];

  const roles = [
    { value: "", label: "All Roles" },
    { value: "6", label: "Super Admin" },
    { value: "1", label: "Administrator" },
    { value: "2", label: "Manager" },
    { value: "3", label: "Supervisor" },
    { value: "5", label: "Coordinator" },
    { value: "4", label: "Staff" },
  ];

  const getTargetDescription = () => {
    const parts = [];
    
    if (!formData.organizationId && !formData.franchiseId && !formData.targetRoleId) {
      return "All users in the system";
    }
    
    if (formData.organizationId) {
      const org = organizations.find(o => o.value === formData.organizationId);
      parts.push(`Organization: ${org?.label || 'Selected'}`);
    }
    
    if (formData.franchiseId) {
      const franchise = franchises.find(f => f.value === formData.franchiseId);
      parts.push(`Franchise: ${franchise?.label || 'Selected'}`);
    }
    
    if (formData.targetRoleId) {
      const role = roles.find(r => r.value === formData.targetRoleId);
      parts.push(`Role: ${role?.label || 'Selected'}`);
    }
    
    return parts.join(" • ");
  };

  return (
    <Box p="md">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stack spacing="lg">
          <Group position="apart">
            <Title order={3}>Send Notification</Title>
            <Badge size="lg" variant="outline" color="blue">
              Push Notification System
            </Badge>
          </Group>

          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            Send notifications to users based on organization, franchise, or role. Leave filters empty to send to all users.
          </Alert>

          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label="Notification Title"
                placeholder="Enter a clear, concise title"
                required
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Message"
                placeholder="Enter the notification message"
                required
                minRows={4}
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
              />
            </Grid.Col>

            <Grid.Col md={6} xs={12}>
              <Select
                label="Notification Type"
                placeholder="Select type"
                data={notificationTypes}
                value={formData.type}
                onChange={(value) => handleChange("type", value)}
              />
            </Grid.Col>

            <Grid.Col md={6} xs={12}>
              <Select
                label="Priority"
                placeholder="Select priority"
                data={priorityLevels}
                value={formData.priority}
                onChange={(value) => handleChange("priority", value)}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Text size="sm" weight={500} mb="xs">
                Target Audience
              </Text>
              <Card withBorder p="md" bg="gray.0">
                <Grid>
                  <Grid.Col md={4} xs={12}>
                    <Select
                      label="Organization"
                      placeholder="All organizations"
                      data={organizations}
                      value={formData.organizationId}
                      onChange={(value) => handleChange("organizationId", value)}
                      clearable
                    />
                  </Grid.Col>

                  <Grid.Col md={4} xs={12}>
                    <Select
                      label="Franchise"
                      placeholder="All franchises"
                      data={franchises}
                      value={formData.franchiseId}
                      onChange={(value) => handleChange("franchiseId", value)}
                      clearable
                      disabled={!formData.organizationId}
                    />
                  </Grid.Col>

                  <Grid.Col md={4} xs={12}>
                    <Select
                      label="Role"
                      placeholder="All roles"
                      data={roles}
                      value={formData.targetRoleId}
                      onChange={(value) => handleChange("targetRoleId", value)}
                      clearable
                    />
                  </Grid.Col>
                </Grid>

                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="cyan"
                  mt="md"
                  variant="light"
                >
                  <Text size="sm" weight={500}>
                    Targeting: {getTargetDescription()}
                  </Text>
                </Alert>
              </Card>
            </Grid.Col>
          </Grid>

          <Group position="right">
            <Button
              leftIcon={<IconSend size={18} />}
              onClick={handleSendNotification}
              loading={loading}
              size="md"
            >
              Send Notification
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Paper shadow="sm" p="xl" radius="md" withBorder mt="xl">
        <Stack spacing="md">
          <Title order={4}>Quick Tips</Title>
          <Grid>
            <Grid.Col md={6} xs={12}>
              <Card withBorder p="md">
                <Group spacing="xs" mb="xs">
                  <IconCheck size={20} color="green" />
                  <Text weight={500}>Best Practices</Text>
                </Group>
                <Text size="sm" color="dimmed">
                  • Keep titles short and descriptive<br />
                  • Use appropriate notification types<br />
                  • Target specific audiences when possible<br />
                  • Use High/Urgent priority sparingly
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col md={6} xs={12}>
              <Card withBorder p="md">
                <Group spacing="xs" mb="xs">
                  <IconInfoCircle size={20} color="blue" />
                  <Text weight={500}>Notification Types</Text>
                </Group>
                <Text size="sm" color="dimmed">
                  • <strong>Info:</strong> General information<br />
                  • <strong>Success:</strong> Positive updates<br />
                  • <strong>Warning:</strong> Important notices<br />
                  • <strong>Error:</strong> Critical issues
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotificationManagement;

