import React, { useEffect, useState, useCallback } from "react";
import { AppTable, AppModal } from "shared/components";
import { Button, LoadingOverlay, Badge } from "@mantine/core";
import { profileService, leaveService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications";
import { AddUpdateUserLeave } from "shared/components/user/AddUpdateUserLeave";
import { AppConfirmationModal } from "shared/components/modal/AppConfirmationModal";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons";
import Moment from "moment";

export function Leave({ userId, organizationId }) {
  const [Leave, setLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tableColumns = [
    "SrNo",
    "Start",
    "End",
    "Type",
    "Status",
    "Actions",
  ];

  const fetchLeave = useCallback(async () => {
    setIsLoading(true);
    const request = {
      userId: userId,
      sortColumn: "id",
      sortType: "desc",
      pageNumber: 1,
      pageSize: 100,
    };

    try {
      const { response } = await profileService.getLeaveList(request);
      setLeave(response);
    } catch (error) {
      console.error("Failed to fetch leave data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLeave();
  }, [fetchLeave]);

  const handleActionClick = async (action, rowId) => {
    setCurrentRowId(rowId);

    if (action === "Delete") {
      setIsConfirmationModalOpen(true);
    } else if (action === "Edit") {
      setIsModalOpen(true);
    } else if (action === "Add") {
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await leaveService.deleteLeaveItem(currentRowId);
      notifications.show({
        title: "Success",
        message: "Leave item deleted successfully",
        color: "green",
      });
      fetchLeave();
    } catch (error) {
      console.error("Failed to delete Leave item:", error);
    }
    setIsConfirmationModalOpen(false);
  };

  const openAddModal = () => {
    setCurrentRowId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchLeave();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    return Moment(dateTimeString).format("MM/DD/YYYY");
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
          onClick={openAddModal}
        >
          Create
        </Button>
      </div>
      <AppTable thead={tableColumns}>
        {Leave &&
          Leave.map((row, index) => (
            <tr key={index}>
              <td>{helperFunctions.getRowNumber(100, 1, index)}</td>
              <td>{formatDateTime(row.startTime)}</td>
              <td>{formatDateTime(row.endTime)}</td>
              <td>{row.type}</td>
              <td>
                <Badge color="blue" variant="light">
                  {row.status}
                </Badge>
              </td>
              <td>
                <Button.Group>
                  <Button 
                    onClick={() => handleActionClick("Edit", row.id)}
                    leftIcon={<IconEdit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    color="red"
                    onClick={() => handleActionClick("Delete", row.id)}
                    leftIcon={<IconTrash size={16} />}
                  >
                    Delete
                  </Button>
                </Button.Group>
              </td>
            </tr>
          ))}
      </AppTable>

      <AppModal
        opened={isModalOpen}
        onClose={closeModal}
        title={currentRowId ? "Edit Leave" : "Add Leave"}
      >
        <AddUpdateUserLeave
          userId={userId}
          id={currentRowId}
          onModalClose={closeModal}
          organizationId={organizationId}
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
        Are you sure you want to delete this Leave item?
      </AppConfirmationModal>
    </>
  );
}
