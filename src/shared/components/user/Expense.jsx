import React, { useEffect, useState, useCallback } from "react";
import { AppTable, AppModal } from "shared/components"; // Added Button import
import { Button, Badge } from "@mantine/core";
import { profileService, expenseService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications"; // Import notifications for success message
import { AddUpdateUserExpense } from "shared/components/user/AddUpdateUserExpense"; // Import AddExpense component
import { AppConfirmationModal } from "shared/components/modal/AppConfirmationModal"; // Import AppConfirmationModal for delete confirmation

export function Expense({ userId, organizationId }) {
  const [Expense, setExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal visibility
  const [currentRowId, setCurrentRowId] = useState(0);

  const tableColumns = [
    "SrNo",
    "Expense Type",
    "TaskId",
    "Date",
    "Amount",
    "IsConfirmed",
    "IsPaid",
    "Actions", // Added "Actions" column for edit and delete buttons
  ];

  const fetchExpense = useCallback(async () => {
    const request = {
      userId: userId,
      sortColumn: "id",
      sortType: "desc",
      pageNumber: 1,
      pageSize: 100,
    };

    try {
      const response = await profileService.getExpenseList(request);
      console.log('Expense Response:', response); // Debug log
      setExpense(response?.response || []);
    } catch (error) {
      console.error("Failed to fetch expense data:", error);
      setExpense([]);
    }
  }, [userId]);

  useEffect(() => {
    fetchExpense();
  }, [fetchExpense]);

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
      await expenseService.deleteUserExpenseItem(currentRowId);
      // Show success notification
      notifications.show({
        title: "Success",
        message: "Expense item deleted successfully",
        color: "green",
      });
      // Refresh the Expense list after deletion
      fetchExpense();
    } catch (error) {
      console.error("Failed to delete Expense item:", error);
    }
    setIsConfirmationModalOpen(false); // Close confirmation modal after deletion
  };

  const openAddModal = () => {
    setCurrentRowId(null); // Ensure no rowId is set when adding a new entry
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    fetchExpense(); // Refresh the Expense list after closing the modal to ensure the latest data is fetched
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <Button
          onClick={() => {
            handleActionClick("Add", null);
          }}
        >
          Create
        </Button>
      </div>
      <AppTable thead={tableColumns}>
        {Expense &&
          Expense
            .filter((row) => row.isActive !== false) // Filter out inactive records
            .map((row, index) => (
              <tr key={index}>
                <td>{helperFunctions.getRowNumber(100, 1, index)}</td>
                <td>
                  <Badge color="blue" variant="light">
                    {row.type}
                  </Badge>
                </td>
                <td>{row.taskId}</td>
                <td>{row.date ? new Date(row.date).toLocaleDateString() : ''}</td>
                <td>${parseFloat(row.amount || 0).toFixed(2)}</td>
                <td>{row.isConfirmed ? "Yes" : "No"}</td>
                <td>{row.isPaid ? "Yes" : "No"}</td>
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

      <AppModal
        opened={isModalOpen}
        onClose={closeModal}
        title={currentRowId ? "Edit Expense" : "Add Expense"}
      >
        <AddUpdateUserExpense
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
        Are you sure you want to delete this Expense item?
      </AppConfirmationModal>
    </>
  );
}
