import React, { useEffect, useState, useCallback } from "react";
import { AppTable, AppModal } from "shared/components"; // Added Button import
import { Button, Badge } from "@mantine/core";
import { profileService, expenseService } from "core/services";
import { helperFunctions } from "shared/utils";
import { notifications } from "@mantine/notifications"; // Import notifications for success message
// Removed imports for AddUpdateUserExpense and AppConfirmationModal as they are no longer needed

export function Expense({ userId, organizationId }) {
  const [Expense, setExpense] = useState(null);
  // Removed modal states as they are no longer needed

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

  // Removed action handlers as expenses are now managed through Planboard

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <div style={{ color: "#666", fontSize: "14px" }}>
          Expenses are now managed through the Planboard. Use the "Add Expense" option on tasks.
        </div>
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
                  <div style={{ color: "#999", fontSize: "12px" }}>
                    View Only
                  </div>
                </td>
              </tr>
            ))}
      </AppTable>

      {/* Modal removed - expenses are now managed through Planboard */}

      {/* Confirmation modal removed - expenses are now managed through Planboard */}
    </>
  );
}
