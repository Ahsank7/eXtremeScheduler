import React, { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Select,
  Textarea,
  TextInput,
  Modal,
  Badge,
  ActionIcon,
  Loader,
  Alert,
  Box,
  Card,
  Divider,
  Timeline,
} from "@mantine/core";
import {
  IconPlus,
  IconEye,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import {
  complaintService,
  lookupService,
  showSuccessNotification,
  showErrorNotification,
  handleApiError,
} from "core/services";

export function UserComplaints({ userId, userType, readOnly = false }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [severityOptions, setSeverityOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [users, setUsers] = useState([]); // For selecting who to file complaint against
  
  const [newComplaint, setNewComplaint] = useState({
    complainedAgainstUserNo: "",
    title: "",
    description: "",
    category: null,
    severity: null,
  });

  useEffect(() => {
    if (userId) {
      loadComplaints();
      loadLookupOptions();
    }
  }, [userId]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const response = await complaintService.getUserComplaints(userId);
      if (response?.complaints) {
        setComplaints(response.complaints);
      }
    } catch (error) {
      handleApiError(error, "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const loadLookupOptions = async () => {
    try {
      // Load complaint categories
      const categoryResponse = await lookupService.getLookupList({
        lookupType: "ComplaintCategory",
      });
      if (categoryResponse?.result) {
        setCategoryOptions(
          categoryResponse.result.map((item) => ({
            value: item.id.toString(),
            label: item.name,
          }))
        );
      }

      // Load severity options
      const severityResponse = await lookupService.getLookupList({
        lookupType: "ComplaintSeverity",
      });
      if (severityResponse?.result) {
        setSeverityOptions(
          severityResponse.result.map((item) => ({
            value: item.id.toString(),
            label: item.name,
          }))
        );
      }

      // Load status options
      const statusResponse = await lookupService.getLookupList({
        lookupType: "ComplaintStatus",
      });
      if (statusResponse?.result) {
        setStatusOptions(
          statusResponse.result.map((item) => ({
            value: item.id.toString(),
            label: item.name,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading lookup options:", error);
    }
  };

  const handleCreateComplaint = async () => {
    if (!newComplaint.complainedAgainstUserNo || !newComplaint.title || !newComplaint.description) {
      showErrorNotification("Please fill in all required fields");
      return;
    }

    try {
      setSaving(true);
      await complaintService.createComplaint({
        complainantId: userId,
        complainantType: userType,
        complainedAgainstUserNo: newComplaint.complainedAgainstUserNo,
        title: newComplaint.title,
        description: newComplaint.description,
        category: newComplaint.category ? parseInt(newComplaint.category) : null,
        severity: newComplaint.severity ? parseInt(newComplaint.severity) : null,
      });

      showSuccessNotification("Complaint submitted successfully");
      loadComplaints();
      setModalOpened(false);
      
      // Reset form
      setNewComplaint({
        complainedAgainstUserNo: "",
        title: "",
        description: "",
        category: null,
        severity: null,
      });
    } catch (error) {
      handleApiError(error, "Failed to submit complaint");
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailModalOpened(true);
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      setSaving(true);
      await complaintService.deleteComplaint(complaintId);
      showSuccessNotification("Complaint deleted successfully");
      loadComplaints();
    } catch (error) {
      handleApiError(error, "Failed to delete complaint");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("resolved") || statusLower.includes("closed")) return "green";
    if (statusLower.includes("progress")) return "blue";
    if (statusLower.includes("review")) return "yellow";
    if (statusLower.includes("rejected")) return "red";
    return "gray";
  };

  const getSeverityColor = (severity) => {
    const severityLower = severity?.toLowerCase() || "";
    if (severityLower.includes("critical")) return "red";
    if (severityLower.includes("high")) return "orange";
    if (severityLower.includes("medium")) return "yellow";
    return "blue";
  };

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Group position="center">
          <Loader size="sm" />
          <Text>Loading complaints...</Text>
        </Group>
      </Paper>
    );
  }

  return (
    <Paper p="md" withBorder>
      <Stack spacing="md">
        <Group position="apart">
          <div>
            <Title order={4}>Complaints</Title>
            <Text size="sm" color="dimmed">
              View and manage complaints
            </Text>
          </div>
          {!readOnly && (
            <Button
              leftIcon={<IconPlus size={16} />}
              onClick={() => setModalOpened(true)}
            >
              File Complaint
            </Button>
          )}
        </Group>

        {/* Complaints List */}
        {complaints.length > 0 ? (
          <Stack spacing="sm">
            {complaints.map((complaint) => {
              const isComplainant = complaint.complainantId === userId;
              
              return (
                <Card key={complaint.id} shadow="xs" p="md" withBorder>
                  <Stack spacing="xs">
                    <Group position="apart">
                      <div>
                        <Group spacing="xs">
                          <Text weight={600} size="md">
                            {complaint.title}
                          </Text>
                          {complaint.severityName && (
                            <Badge color={getSeverityColor(complaint.severityName)} size="sm">
                              {complaint.severityName}
                            </Badge>
                          )}
                        </Group>
                        <Text size="xs" color="dimmed">
                          {isComplainant ? "Against: " : "Filed by: "}
                          {isComplainant
                            ? complaint.complainedAgainstName
                            : complaint.complainantName}
                        </Text>
                      </div>
                      <Badge color={getStatusColor(complaint.statusName)}>
                        {complaint.statusName || "Pending"}
                      </Badge>
                    </Group>

                    <Text size="sm" lineClamp={2}>
                      {complaint.description}
                    </Text>

                    {complaint.categoryName && (
                      <Group spacing="xs">
                        <Text size="xs" weight={500}>
                          Category:
                        </Text>
                        <Text size="xs" color="dimmed">
                          {complaint.categoryName}
                        </Text>
                      </Group>
                    )}

                    <Divider />

                    <Group position="apart">
                      <Text size="xs" color="dimmed">
                        Filed on:{" "}
                        {new Date(complaint.createdDate).toLocaleDateString()}
                      </Text>
                      <Group spacing="xs">
                        <Button
                          size="xs"
                          variant="subtle"
                          leftIcon={<IconEye size={14} />}
                          onClick={() => handleViewDetails(complaint)}
                        >
                          View Details
                        </Button>
                        {!readOnly && isComplainant && complaint.statusName === "Submitted" && (
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleDeleteComplaint(complaint.id)}
                            disabled={saving}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Alert color="gray" variant="light">
            <Text size="sm">No complaints found.</Text>
          </Alert>
        )}
      </Stack>

      {/* Create Complaint Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="File a Complaint"
        size="lg"
      >
        <Stack spacing="md">
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Please provide detailed information about your complaint. This will
              be reviewed by the appropriate authorities.
            </Text>
          </Alert>

          <TextInput
            label="Against User Number"
            placeholder="Enter the User Number you're filing complaint against"
            description="Enter the user's public User Number (not the internal ID)"
            value={newComplaint.complainedAgainstUserNo}
            onChange={(e) =>
              setNewComplaint({ ...newComplaint, complainedAgainstUserNo: e.target.value })
            }
            required
          />

          <TextInput
            label="Title"
            placeholder="Brief summary of the complaint"
            value={newComplaint.title}
            onChange={(e) =>
              setNewComplaint({ ...newComplaint, title: e.target.value })
            }
            required
            maxLength={200}
          />

          <Textarea
            label="Description"
            placeholder="Detailed description of the complaint"
            value={newComplaint.description}
            onChange={(e) =>
              setNewComplaint({ ...newComplaint, description: e.target.value })
            }
            required
            minRows={4}
            maxLength={2000}
          />

          <Select
            label="Category"
            placeholder="Select complaint category"
            data={categoryOptions}
            value={newComplaint.category}
            onChange={(value) => setNewComplaint({ ...newComplaint, category: value })}
          />

          <Select
            label="Severity"
            placeholder="Select severity level"
            data={severityOptions}
            value={newComplaint.severity}
            onChange={(value) => setNewComplaint({ ...newComplaint, severity: value })}
          />

          <Group position="right" mt="md">
            <Button variant="subtle" onClick={() => setModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateComplaint}
              loading={saving}
              disabled={!newComplaint.complainedAgainstUserNo || !newComplaint.title || !newComplaint.description}
            >
              Submit Complaint
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Complaint Details Modal */}
      <Modal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <Stack spacing="md">
            <div>
              <Group position="apart" mb="xs">
                <Text weight={600} size="lg">
                  {selectedComplaint.title}
                </Text>
                <Badge color={getStatusColor(selectedComplaint.statusName)}>
                  {selectedComplaint.statusName || "Pending"}
                </Badge>
              </Group>
              {selectedComplaint.severityName && (
                <Badge color={getSeverityColor(selectedComplaint.severityName)} size="sm" mb="xs">
                  Severity: {selectedComplaint.severityName}
                </Badge>
              )}
            </div>

            <Divider />

            <div>
              <Text size="sm" weight={500} mb="xs">
                Filed By
              </Text>
              <Text size="sm">{selectedComplaint.complainantName}</Text>
              <Text size="xs" color="dimmed">
                {selectedComplaint.complainantEmail}
              </Text>
            </div>

            <div>
              <Text size="sm" weight={500} mb="xs">
                Against
              </Text>
              <Text size="sm">{selectedComplaint.complainedAgainstName}</Text>
              <Text size="xs" color="dimmed">
                {selectedComplaint.complainedAgainstEmail}
              </Text>
            </div>

            {selectedComplaint.categoryName && (
              <div>
                <Text size="sm" weight={500} mb="xs">
                  Category
                </Text>
                <Text size="sm">{selectedComplaint.categoryName}</Text>
              </div>
            )}

            <div>
              <Text size="sm" weight={500} mb="xs">
                Description
              </Text>
              <Text size="sm">{selectedComplaint.description}</Text>
            </div>

            {selectedComplaint.resolution && (
              <div>
                <Text size="sm" weight={500} mb="xs" color="green">
                  Resolution
                </Text>
                <Paper p="sm" withBorder>
                  <Text size="sm">{selectedComplaint.resolution}</Text>
                  {selectedComplaint.resolvedByName && (
                    <Text size="xs" color="dimmed" mt="xs">
                      Resolved by: {selectedComplaint.resolvedByName}
                    </Text>
                  )}
                  {selectedComplaint.resolutionDate && (
                    <Text size="xs" color="dimmed">
                      on {new Date(selectedComplaint.resolutionDate).toLocaleString()}
                    </Text>
                  )}
                </Paper>
              </div>
            )}

            <Divider />

            <Group spacing="xl">
              <div>
                <Text size="xs" color="dimmed">
                  Filed On
                </Text>
                <Text size="sm">
                  {new Date(selectedComplaint.createdDate).toLocaleString()}
                </Text>
              </div>
              {selectedComplaint.updatedDate && (
                <div>
                  <Text size="xs" color="dimmed">
                    Last Updated
                  </Text>
                  <Text size="sm">
                    {new Date(selectedComplaint.updatedDate).toLocaleString()}
                  </Text>
                </div>
              )}
            </Group>

            <Group position="right" mt="md">
              <Button onClick={() => setDetailModalOpened(false)}>Close</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}

