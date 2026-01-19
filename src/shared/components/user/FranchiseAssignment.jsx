import React, { useState, useEffect } from "react";
import {
  Paper,
  Select,
  Text,
  Button,
  Grid,
  LoadingOverlay,
  Table,
  Badge,
  Group,
  ActionIcon,
  Modal,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { franchiseService, localStoreService } from "core/services";
import { IconTrash, IconPlus } from "@tabler/icons";

export function FranchiseAssignment({ userId, readOnly = false }) {
  const [franchiseOptions, setFranchiseOptions] = useState([]);
  const [userFranchises, setUserFranchises] = useState([]);
  const [selectedFranchise, setSelectedFranchise] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [organizationId] = useState(localStoreService.getOrganizationID());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [franchiseToRemove, setFranchiseToRemove] = useState(null);

  useEffect(() => {
    if (userId && organizationId) {
      loadData();
    }
  }, [userId, organizationId]);

  const loadData = async () => {
    await Promise.all([loadAllFranchises(), loadUserFranchises()]);
  };

  const loadAllFranchises = async () => {
    try {
      setIsLoading(true);
      const response = await franchiseService.getFranchiseList(organizationId);
      
      let franchisesData = [];
      if (Array.isArray(response)) {
        franchisesData = response;
      } else if (response && Array.isArray(response.data)) {
        franchisesData = response.data;
      }
      
      if (franchisesData.length > 0) {
        const franchises = franchisesData
          .filter(f => f.isActive)
          .map((item) => ({
            value: item.id,
            label: item.name,
            description: item.description
          }));
        setFranchiseOptions(franchises);
      }
    } catch (error) {
      console.error("Failed to fetch franchises:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load franchises",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserFranchises = async () => {
    try {
      setIsLoading(true);
      const response = await franchiseService.getUserFranchiseAssignments(userId, organizationId);
      
      let assignmentsData = [];
      if (Array.isArray(response)) {
        assignmentsData = response;
      } else if (response && Array.isArray(response.data)) {
        assignmentsData = response.data;
      }
      
      setUserFranchises(assignmentsData);
    } catch (error) {
      console.error("Failed to fetch user franchises:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load user franchise assignments",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignFranchise = async () => {
    if (!selectedFranchise) {
      notifications.show({
        title: "Warning",
        message: "Please select a franchise to assign",
        color: "yellow",
      });
      return;
    }

    // Check if franchise is already assigned
    const alreadyAssigned = userFranchises.find(
      uf => uf.franchiseId === selectedFranchise && uf.isActive
    );
    
    if (alreadyAssigned) {
      notifications.show({
        title: "Warning",
        message: "This franchise is already assigned to the user",
        color: "yellow",
      });
      return;
    }

    try {
      setIsAssigning(true);
      const assignmentData = {
        userId: userId,
        franchiseId: selectedFranchise,
        isActive: true
      };

      await franchiseService.assignUserToFranchise(assignmentData);
      
      notifications.show({
        title: "Success",
        message: "Franchise assigned successfully",
        color: "green",
      });

      setSelectedFranchise(null);
      await loadUserFranchises();
    } catch (error) {
      console.error("Failed to assign franchise:", error);
      notifications.show({
        title: "Error",
        message: "Failed to assign franchise to user",
        color: "red",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveFranchise = async (franchiseId) => {
    try {
      setIsLoading(true);
      await franchiseService.removeUserFromFranchise(userId, franchiseId);
      
      notifications.show({
        title: "Success",
        message: "Franchise assignment removed successfully",
        color: "green",
      });

      setDeleteModalOpen(false);
      setFranchiseToRemove(null);
      await loadUserFranchises();
    } catch (error) {
      console.error("Failed to remove franchise:", error);
      notifications.show({
        title: "Error",
        message: "Failed to remove franchise assignment",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (franchise) => {
    setFranchiseToRemove(franchise);
    setDeleteModalOpen(true);
  };

  const getAvailableFranchises = () => {
    const assignedFranchiseIds = userFranchises
      .filter(uf => uf.isActive)
      .map(uf => uf.franchiseId);
    
    return franchiseOptions.filter(
      option => !assignedFranchiseIds.includes(option.value)
    );
  };

  if (!userId) {
    return (
      <Paper p="md" shadow="sm">
        <Text color="dimmed">No user selected</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="sm" style={{ position: "relative" }}>
      <LoadingOverlay visible={isLoading} />
      
      <Stack spacing="md">
        <Text size="lg" weight={600}>
          Franchise Assignments
        </Text>

        {!readOnly && (
          <Paper p="md" withBorder>
            <Text size="sm" weight={500} mb="sm">
              Assign New Franchise
            </Text>
            <Grid>
              <Grid.Col span={8}>
                <Select
                  placeholder="Select a franchise to assign"
                  data={getAvailableFranchises()}
                  value={selectedFranchise}
                  onChange={setSelectedFranchise}
                  searchable
                  clearable
                  disabled={isAssigning || getAvailableFranchises().length === 0}
                  nothingFound={
                    getAvailableFranchises().length === 0
                      ? "All franchises are already assigned"
                      : "No franchises found"
                  }
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Button
                  leftIcon={<IconPlus size={16} />}
                  onClick={handleAssignFranchise}
                  loading={isAssigning}
                  disabled={!selectedFranchise || isAssigning}
                  fullWidth
                >
                  Assign
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>
        )}

        <Paper p="md" withBorder>
          <Text size="sm" weight={500} mb="sm">
            Assigned Franchises
          </Text>
          
          {userFranchises.length === 0 ? (
            <Text color="dimmed" size="sm" align="center" py="xl">
              No franchises assigned yet
            </Text>
          ) : (
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th>Franchise Name</th>
                  <th>Status</th>
                  {!readOnly && <th style={{ width: 100 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {userFranchises.map((franchise) => (
                  <tr key={franchise.id}>
                    <td>
                      <Text weight={500}>{franchise.franchiseName}</Text>
                    </td>
                    <td>
                      <Badge color={franchise.isActive ? "green" : "red"}>
                        {franchise.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    {!readOnly && (
                      <td>
                        <Group spacing="xs">
                          {franchise.isActive && (
                            <ActionIcon
                              color="red"
                              variant="light"
                              onClick={() => openDeleteModal(franchise)}
                              title="Remove assignment"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          )}
                        </Group>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Paper>
      </Stack>

      <Modal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setFranchiseToRemove(null);
        }}
        title="Confirm Removal"
        centered
      >
        <Stack spacing="md">
          <Text>
            Are you sure you want to remove the assignment of{" "}
            <strong>{franchiseToRemove?.franchiseName}</strong> from this user?
          </Text>
          <Text size="sm" color="dimmed">
            This will make the franchise inactive for this user. They will no longer be able to access this franchise.
          </Text>
          <Group position="right" spacing="sm">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteModalOpen(false);
                setFranchiseToRemove(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => handleRemoveFranchise(franchiseToRemove.franchiseId)}
            >
              Remove
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

