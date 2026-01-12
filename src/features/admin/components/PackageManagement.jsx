import {
  Button,
  Table,
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Switch,
  Group,
  Stack,
  Title,
  ActionIcon,
  Badge,
  LoadingOverlay,
  Paper,
  Grid,
} from "@mantine/core";
import { useState, useEffect } from "react";
import { useForm, zodResolver } from "@mantine/form";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { packageService } from "core/services";
import { IconPlus, IconEdit, IconTrash, IconCheck, IconX } from "@tabler/icons";

const schema = zod.object({
  name: zod.string().min(1, "Package name is required"),
  description: zod.string().optional(),
  perClientCharge: zod.number().min(0, "Must be 0 or greater"),
  initialOneTimeCost: zod.number().min(0, "Must be 0 or greater"),
  infrastructureCost: zod.number().min(0, "Must be 0 or greater"),
  supportCharges: zod.number().min(0, "Must be 0 or greater"),
  newFeatureReportCharges: zod.number().min(0, "Must be 0 or greater"),
  isActive: zod.boolean(),
});

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      name: "",
      description: "",
      perClientCharge: 0,
      initialOneTimeCost: 0,
      infrastructureCost: 0,
      supportCharges: 0,
      newFeatureReportCharges: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await packageService.getAllPackages(true);
      console.log("Package response:", response); // Debug log
      
      // Response structure: { data: [...], count: number }
      let packagesList = [];
      if (response?.data && Array.isArray(response.data)) {
        packagesList = response.data;
      } else if (Array.isArray(response)) {
        packagesList = response;
      } else if (response?.Item1 && Array.isArray(response.Item1)) {
        // Handle tuple format { Item1: [...], Item2: count }
        packagesList = response.Item1;
      }
      
      // Ensure it's always an array
      if (!Array.isArray(packagesList)) {
        console.warn("Packages is not an array:", packagesList);
        packagesList = [];
      }
      
      setPackages(packagesList);
    } catch (error) {
      console.error("Error loading packages:", error);
      setPackages([]); // Set empty array on error
      notifications.show({
        title: "Error",
        message: "Failed to load packages",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      form.setValues({
        name: pkg.name || "",
        description: pkg.description || "",
        perClientCharge: pkg.perClientCharge || 0,
        initialOneTimeCost: pkg.initialOneTimeCost || 0,
        infrastructureCost: pkg.infrastructureCost || 0,
        supportCharges: pkg.supportCharges || 0,
        newFeatureReportCharges: pkg.newFeatureReportCharges || 0,
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
      });
    } else {
      setEditingPackage(null);
      form.reset();
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingPackage(null);
    form.reset();
  };

  const handleSubmit = async (values) => {
    try {
      const packageObj = {
        id: editingPackage?.id || null,
        name: values.name,
        description: values.description || "",
        perClientCharge: values.perClientCharge,
        initialOneTimeCost: values.initialOneTimeCost,
        infrastructureCost: values.infrastructureCost,
        supportCharges: values.supportCharges,
        newFeatureReportCharges: values.newFeatureReportCharges,
        isActive: values.isActive,
      };

      await packageService.saveUpdatePackage(packageObj);
      notifications.show({
        title: "Success",
        message: `Package ${editingPackage ? "updated" : "created"} successfully`,
        color: "green",
      });
      handleCloseModal();
      loadPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      notifications.show({
        title: "Error",
        message: error.message || "Failed to save package",
        color: "red",
      });
    }
  };

  const rows = (Array.isArray(packages) ? packages : []).map((pkg) => (
    <tr key={pkg.id}>
      <td>{pkg.name}</td>
      <td>{pkg.description || "-"}</td>
      <td>${pkg.perClientCharge?.toFixed(2) || "0.00"}</td>
      <td>${pkg.initialOneTimeCost?.toFixed(2) || "0.00"}</td>
      <td>${pkg.infrastructureCost?.toFixed(2) || "0.00"}</td>
      <td>${pkg.supportCharges?.toFixed(2) || "0.00"}</td>
      <td>${pkg.newFeatureReportCharges?.toFixed(2) || "0.00"}</td>
      <td>
        <Badge color={pkg.isActive ? "green" : "red"}>
          {pkg.isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td>
        <Group spacing="xs">
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => handleOpenModal(pkg)}
          >
            <IconEdit size={16} />
          </ActionIcon>
        </Group>
      </td>
    </tr>
  ));

  return (
    <Paper shadow="md" radius="md" p="xl" withBorder style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} />
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Package Management</Title>
          <Button leftIcon={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
            Add Package
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Per Client Charge</th>
              <th>Initial One-Time Cost</th>
              <th>Infrastructure Cost</th>
              <th>Support Charges</th>
              <th>New Feature/Report Charges</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Stack>

      <Modal
        opened={modalOpen}
        onClose={handleCloseModal}
        title={editingPackage ? "Edit Package" : "Add Package"}
        size="lg"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label="Package Name"
              placeholder="e.g., Gold, Silver, Platinum"
              required
              {...form.getInputProps("name")}
            />
            <Textarea
              label="Description"
              placeholder="Package description"
              minRows={3}
              {...form.getInputProps("description")}
            />
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label="Per Client Charge ($)"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  required
                  {...form.getInputProps("perClientCharge")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Initial One-Time Cost ($)"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  required
                  {...form.getInputProps("initialOneTimeCost")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Infrastructure Cost ($/month)"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  required
                  {...form.getInputProps("infrastructureCost")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Support Charges ($)"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  required
                  {...form.getInputProps("supportCharges")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="New Feature/Report Charges ($)"
                  placeholder="0.00"
                  min={0}
                  precision={2}
                  required
                  {...form.getInputProps("newFeatureReportCharges")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Switch
                  label="Active"
                  {...form.getInputProps("isActive", { type: "checkbox" })}
                />
              </Grid.Col>
            </Grid>
            <Group position="right" mt="md">
              <Button variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
};

export default PackageManagement;

