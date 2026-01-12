import {
  Table,
  Badge,
  LoadingOverlay,
  Paper,
  Stack,
  Title,
  Button,
  Select,
  Modal,
  Textarea,
  Group,
  Text,
  TextInput,
  NumberInput,
  ActionIcon,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { packageService } from "core/services";
import { IconPlus, IconEdit } from "@tabler/icons";

const PackageHistory = ({ organizationId }) => {
  const [history, setHistory] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [editingPackage, setEditingPackage] = useState(null);
  const [editPricing, setEditPricing] = useState({
    perClientCharge: 0,
    initialOneTimeCost: 0,
    infrastructureCost: 0,
    supportCharges: 0,
    newFeatureReportCharges: 0,
  });

  useEffect(() => {
    if (organizationId) {
      loadPackageHistory();
      loadPackages();
    }
  }, [organizationId]);

  const loadPackageHistory = async () => {
    setLoading(true);
    try {
      const [historyResponse, currentResponse] = await Promise.all([
        packageService.getOrganizationPackageHistory(organizationId),
        packageService.getCurrentOrganizationPackage(organizationId),
      ]);

      // handleApiResponse already extracts data, so response is the data directly
      setHistory(Array.isArray(historyResponse) ? historyResponse : (historyResponse?.data || []));
      setCurrentPackage(currentResponse || null);
    } catch (error) {
      console.error("Error loading package history:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load package history",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await packageService.getAllPackages(false);
      // Response structure: { data: [...], count: number }
      let packages = [];
      if (response?.data && Array.isArray(response.data)) {
        packages = response.data;
      } else if (Array.isArray(response)) {
        packages = response;
      } else if (response?.Item1 && Array.isArray(response.Item1)) {
        packages = response.Item1;
      }
      setPackages(Array.isArray(packages) ? packages : []);
    } catch (error) {
      console.error("Error loading packages:", error);
      setPackages([]);
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedPackageId) {
      notifications.show({
        title: "Error",
        message: "Please select a package",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      await packageService.assignPackageToOrganization({
        organizationId: organizationId,
        packageId: selectedPackageId,
        startDate: new Date(startDate).toISOString(),
        notes: notes || "",
      });

      notifications.show({
        title: "Success",
        message: "Package assigned successfully",
        color: "green",
      });

      setAssignModalOpen(false);
      setSelectedPackageId(null);
      setNotes("");
      setStartDate(new Date().toISOString().split('T')[0]);
      loadPackageHistory();
    } catch (error) {
      console.error("Error assigning package:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to assign package",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2) || "0.00"}`;
  };

  const handleEditClick = (item) => {
    // Only allow editing active packages
    if (!item.isActive) {
      notifications.show({
        title: "Error",
        message: "Only active packages can be edited",
        color: "red",
      });
      return;
    }
    
    setEditingPackage(item);
    setEditPricing({
      perClientCharge: item.perClientCharge,
      initialOneTimeCost: item.initialOneTimeCost,
      infrastructureCost: item.infrastructureCost,
      supportCharges: item.supportCharges,
      newFeatureReportCharges: item.newFeatureReportCharges,
    });
    setEditModalOpen(true);
  };

  const handleUpdatePricing = async () => {
    if (!editingPackage) return;

    setLoading(true);
    try {
      await packageService.updateOrganizationPackagePricing({
        organizationPackageId: editingPackage.id,
        perClientCharge: editPricing.perClientCharge,
        initialOneTimeCost: editPricing.initialOneTimeCost,
        infrastructureCost: editPricing.infrastructureCost,
        supportCharges: editPricing.supportCharges,
        newFeatureReportCharges: editPricing.newFeatureReportCharges,
      });

      notifications.show({
        title: "Success",
        message: "Package pricing updated successfully",
        color: "green",
      });

      setEditModalOpen(false);
      setEditingPackage(null);
      loadPackageHistory();
    } catch (error) {
      console.error("Error updating package pricing:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to update package pricing",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const rows = history.map((item) => (
    <tr key={item.id}>
      <td>{item.packageName}</td>
      <td>{formatCurrency(item.perClientCharge)}</td>
      <td>{formatCurrency(item.initialOneTimeCost)}</td>
      <td>{formatCurrency(item.infrastructureCost)}</td>
      <td>{formatCurrency(item.supportCharges)}</td>
      <td>{formatCurrency(item.newFeatureReportCharges)}</td>
      <td>{formatDate(item.startDate)}</td>
      <td>{formatDate(item.endDate)}</td>
      <td>
        <Badge color={item.isActive ? "green" : "gray"}>
          {item.isActive ? "Active" : "Ended"}
        </Badge>
      </td>
      <td>
        {item.isActive ? (
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleEditClick(item)}
            title="Edit Pricing"
          >
            <IconEdit size={16} />
          </ActionIcon>
        ) : (
          <Text size="xs" color="dimmed">
            -
          </Text>
        )}
      </td>
    </tr>
  ));

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Stack spacing="md">
        <Group position="apart">
          <Title order={4}>Package History</Title>
          <Button
            leftIcon={<IconPlus size={16} />}
            onClick={() => setAssignModalOpen(true)}
          >
            Assign New Package
          </Button>
        </Group>

        {currentPackage && (
          <Paper p="md" withBorder style={{ backgroundColor: "#f0f9ff" }}>
            <Text weight={600} size="sm" mb="xs">
              Current Package: {currentPackage.packageName}
            </Text>
            <Text size="xs" color="dimmed">
              Started: {formatDate(currentPackage.startDate)}
            </Text>
          </Paper>
        )}

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Package Name</th>
              <th>Per Client Charge</th>
              <th>Initial Cost</th>
              <th>Infrastructure Cost</th>
              <th>Support Charges</th>
              <th>Feature/Report Charges</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: "center" }}>
                  No package history found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Stack>

      <Modal
        opened={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Package to Organization"
        size="md"
        centered
      >
        <Stack spacing="md">
          <Select
            label="Select Package"
            placeholder="Choose a package"
            data={(Array.isArray(packages) ? packages : []).map((pkg) => ({
              value: pkg.id,
              label: pkg.name,
            }))}
            value={selectedPackageId}
            onChange={setSelectedPackageId}
            required
          />
          <TextInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Textarea
            label="Notes (Optional)"
            placeholder="Add any notes about this package assignment"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={3}
          />
          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignPackage} loading={loading}>
              Assign Package
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPackage(null);
        }}
        title={`Edit Pricing - ${editingPackage?.packageName || ""}`}
        size="md"
        centered
      >
        <Stack spacing="md">
          <NumberInput
            label="Per Client Charge"
            placeholder="Enter amount"
            value={editPricing.perClientCharge}
            onChange={(value) =>
              setEditPricing({ ...editPricing, perClientCharge: value || 0 })
            }
            precision={2}
            min={0}
            step={0.01}
            icon={<Text size="sm">$</Text>}
            required
          />
          <NumberInput
            label="Initial One-Time Cost"
            placeholder="Enter amount"
            value={editPricing.initialOneTimeCost}
            onChange={(value) =>
              setEditPricing({ ...editPricing, initialOneTimeCost: value || 0 })
            }
            precision={2}
            min={0}
            step={0.01}
            icon={<Text size="sm">$</Text>}
            required
          />
          <NumberInput
            label="Infrastructure Cost"
            placeholder="Enter amount"
            value={editPricing.infrastructureCost}
            onChange={(value) =>
              setEditPricing({ ...editPricing, infrastructureCost: value || 0 })
            }
            precision={2}
            min={0}
            step={0.01}
            icon={<Text size="sm">$</Text>}
            required
          />
          <NumberInput
            label="Support Charges"
            placeholder="Enter amount"
            value={editPricing.supportCharges}
            onChange={(value) =>
              setEditPricing({ ...editPricing, supportCharges: value || 0 })
            }
            precision={2}
            min={0}
            step={0.01}
            icon={<Text size="sm">$</Text>}
            required
          />
          <NumberInput
            label="New Feature/Report Charges"
            placeholder="Enter amount"
            value={editPricing.newFeatureReportCharges}
            onChange={(value) =>
              setEditPricing({
                ...editPricing,
                newFeatureReportCharges: value || 0,
              })
            }
            precision={2}
            min={0}
            step={0.01}
            icon={<Text size="sm">$</Text>}
            required
          />
          <Group position="right" mt="md">
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditingPackage(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePricing} loading={loading}>
              Update Pricing
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};

export default PackageHistory;

