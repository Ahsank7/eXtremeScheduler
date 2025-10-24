import React, { useState, useEffect } from "react";
import {
  Modal,
  Table,
  Badge,
  Text,
  Group,
  Button,
  Stack,
  LoadingOverlay,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons";
import { expenseService } from "core/services";
import { notifications } from "@mantine/notifications";
import { AddTaskExpense } from "./AddTaskExpense";

export function TaskExpenses({ opened, onClose, taskId, userId, organizationId, taskStatus, isConfirmed }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (opened && taskId) {
      fetchExpenses();
    }
  }, [opened, taskId]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const request = {
        userId: userId,
        taskId: taskId,
        sortColumn: "date",
        sortType: "desc",
        pageNumber: 1,
        pageSize: 100,
      };

      const response = await expenseService.getExpenseList(request);
      setExpenses(response?.response || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleExpenseAdded = () => {
    setIsAddModalOpen(false);
    fetchExpenses(); // Refresh the list
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await expenseService.deleteUserExpenseItem(expenseId);
      notifications.show({
        title: "Success",
        message: "Expense deleted successfully!",
        color: "green",
      });
      fetchExpenses(); // Refresh the list
    } catch (error) {
      console.error("Failed to delete expense:", error);
      notifications.show({
        title: "Error",
        message: "Failed to delete expense",
        color: "red",
      });
    }
  };

  const getTotalAmount = () => {
    return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
  };

  const isTaskCompletedAndConfirmed = taskStatus === 'Completed' && isConfirmed;

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={`Task Expenses - Task #${taskId}`}
        size="lg"
      >
        <LoadingOverlay visible={isLoading} />
        
        <Stack spacing="md">
          <Group position="apart">
            <Text size="sm" color="dimmed">
              Total Expenses: ${getTotalAmount().toFixed(2)}
            </Text>
            {!isTaskCompletedAndConfirmed && (
              <Button
                leftIcon={<IconPlus size={16} />}
                onClick={handleAddExpense}
                size="sm"
              >
                Add Expense
              </Button>
            )}
          </Group>

          {expenses.length === 0 ? (
            <Text size="sm" color="dimmed" ta="center" py="xl">
              No expenses found for this task
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <tr key={index}>
                    <td>
                      <Badge color="blue" variant="light">
                        {expense.type}
                      </Badge>
                    </td>
                    <td>${parseFloat(expense.amount || 0).toFixed(2)}</td>
                    <td>{expense.date ? new Date(expense.date).toLocaleDateString() : ''}</td>
                    <td>
                      <Badge 
                        color={expense.isConfirmed ? "green" : "yellow"}
                        variant="light"
                      >
                        {expense.isConfirmed ? "Confirmed" : "Pending"}
                      </Badge>
                    </td>
                    <td>{expense.notes || '-'}</td>
                    <td>
                      {!isTaskCompletedAndConfirmed && !expense.isConfirmed && (
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          leftIcon={<IconTrash size={12} />}
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Stack>
      </Modal>

      <AddTaskExpense
        opened={isAddModalOpen}
        onClose={handleExpenseAdded}
        taskId={taskId}
        userId={userId}
        organizationId={organizationId}
        onExpenseAdded={fetchExpenses}
      />
    </>
  );
}
