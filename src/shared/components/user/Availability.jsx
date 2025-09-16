import React, { useEffect, useState, useCallback } from "react";
import { AppTable, AppModal } from "shared/components"; // Added Button import
import { Button, LoadingOverlay, Text, Paper } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import { profileService, availabilityService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications"; // Import notifications for success message
import { AddUpdateUserAvailability } from "shared/components/user/AddUpdateUserAvailability"; // Import AddAvailability component
import { AppConfirmationModal } from "shared/components/modal/AppConfirmationModal"; // Import AppConfirmationModal for delete confirmation

export function Availability({ userId }) {
  const [Availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal visibility
  const [currentRowId, setCurrentRowId] = useState(0);

  const tableColumns = ["SrNo", "Day", "StartTime", "EndTime", "Actions"];

  const fetchAvailability = useCallback(async () => {
    const getAvailability = async () => {
      if (!userId) {
        console.log('No userId provided, skipping availability fetch');
        return;
      }

      setIsLoading(true);
      const request = {
        userId: userId,
        sortColumn: "id",
        sortType: "desc",
        pageNumber: 1,
        pageSize: 100,
      };

      try {
        console.log('Fetching availability with request:', request);
        const response = await profileService.getAvailabilityList(request);
        console.log('Availability API response:', response); // Debug log
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        console.log('Full response object:', JSON.stringify(response, null, 2));
        
        // Handle different response structures
        if (response && response.response) {
          // API returns { response: [...], totalRecords: 5 }
          console.log('Setting availability from response.response:', response.response);
          console.log('Response.response type:', typeof response.response);
          console.log('Response.response length:', response.response.length);
          setAvailability(response.response);
        } else if (response && response.data) {
          // Fallback for other response structures
          console.log('Setting availability from response.data:', response.data);
          setAvailability(response.data);
        } else {
          // Fallback to the response itself
          console.log('Setting availability from response itself:', response);
          setAvailability(response || []);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailability([]);
      } finally {
        setIsLoading(false);
      }
    };

    getAvailability();
  }, [userId]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Debug effect to log Availability state changes
  useEffect(() => {
    console.log('Availability state changed:', Availability);
    console.log('Availability type:', typeof Availability);
    console.log('Availability length:', Availability ? Availability.length : 'null');
  }, [Availability]);

  const handleActionClick = async (action, rowId) => {
    setCurrentRowId(rowId);

    if (action === "Delete") {
      setIsConfirmationModalOpen(true); // Open confirmation modal instead of direct deletion
    } else if (action === "Edit") {
      setIsModalOpen(true);
    } else if (action === "Add") {
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await availabilityService.deleteAvailabilityItem(currentRowId);
      // Show success notification
      notifications.show({
        title: "Success",
        message: "Availability item deleted successfully",
        color: "green",
      });
      // Refresh the Availability list after deletion
      fetchAvailability();
    } catch (error) {
      console.error("Failed to delete Availability item:", error);
    }
    setIsConfirmationModalOpen(false); // Close confirmation modal after deletion
  };

  const openAddModal = () => {
    setCurrentRowId(null); // Ensure no rowId is set when adding a new entry
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchAvailability(); // Refresh the Availability list after closing the modal to ensure the latest data is fetched
  };

  return (
    <>
      <LoadingOverlay visible={isLoading} />
      
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            handleActionClick("Add", null);
          }}
        >
          Create
        </Button>
      </div>

      {!isLoading && !Availability && (
        <Paper p="md" withBorder>
          <Text color="dimmed" align="center">
            No availability data found. Please check the console for any errors.
          </Text>
          <Text size="sm" color="dimmed" align="center" mt="xs">
            Debug: userId = {userId}, isLoading = {isLoading.toString()}, Availability = {Availability ? 'defined' : 'null'}
          </Text>
        </Paper>
      )}

  

      {!isLoading && Availability && Availability.length === 0 && (
        <Paper p="md" withBorder>
          <Text color="dimmed" align="center">
            No availability records found for this user.
          </Text>
        </Paper>
      )}

      {!isLoading && Availability && Availability.length > 0 && (
        <AppTable thead={tableColumns}>
          {Availability.map((row, index) => (
            <tr key={index}>
              <td>{helperFunctions.getRowNumber(100, 1, index)}</td>     
              <td>{row.day}</td>
              <td>{row.startTime}</td>
              <td>{row.endTime}</td>
              <td>
                <Button.Group>
                  <Button onClick={() => handleActionClick("Edit", row.id)}>
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleActionClick("Delete", row.id)}
                  >
                    Delete
                  </Button>
                </Button.Group>
              </td>
            </tr>
          ))}
        </AppTable>
      )}

      <AppModal
        opened={isModalOpen}
        onClose={closeModal}
        title={currentRowId ? "Edit Availability" : "Add Availability"}
      >
        <AddUpdateUserAvailability
          userId={userId}
          id={currentRowId}
          onModalClose={closeModal}
        />
      </AppModal>

      <AppConfirmationModal
        opened={isConfirmationModalOpen}
        onClose={(confirmed) => {
          if (confirmed) handleDelete();
          else setIsConfirmationModalOpen(false);
        }}
        title="Confirm Deletion"
      >
        Are you sure you want to delete this Availability item?
      </AppConfirmationModal>
    </>
  );
}
