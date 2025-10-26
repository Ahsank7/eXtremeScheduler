import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
// Removed DateInput import - using regular date input instead
import { notifications } from "@mantine/notifications";
import { expenseService, lookupService } from "core/services";

export function AddTaskExpense({ opened, onClose, taskId, userId, organizationId, onExpenseAdded }) {
  const [formData, setFormData] = useState({
    type: null,
    amount: 0,
    date: new Date(),
    notes: "",
  });
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (opened) {
      fetchExpenseTypes();
      // Reset form when modal opens
      setFormData({
        type: null,
        amount: 0,
        date: new Date(),
        notes: "",
      });
    }
  }, [opened]);

  const fetchExpenseTypes = async () => {
    try {
      const response = await lookupService.getLookupList({
        lookupType: "ExpenseType",
      });
      setExpenseTypes(
        (response?.result || []).map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch expense types:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate expense type
    if (!formData.type) {
      notifications.show({
        title: "Validation Error",
        message: "Please select an expense type",
        color: "red",
      });
      return;
    }
    
    // Validate amount
    if (!formData.amount || formData.amount <= 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter a valid amount greater than 0",
        color: "red",
      });
      return;
    }
    
    // Validate date
    if (!formData.date || isNaN(new Date(formData.date).getTime())) {
      notifications.show({
        title: "Validation Error",
        message: "Please enter a valid date",
        color: "red",
      });
      return;
    }

    setIsLoading(true);
    try {
      const expenseData = {
        userId: userId,
        taskId: taskId,
        type: formData.type,
        amount: formData.amount,
        date: formData.date,
        notes: formData.notes,
        createdBy: userId, // Assuming current user is the creator
      };

      await expenseService.saveUpdateUserExpense(expenseData);
      
      notifications.show({
        title: "Success",
        message: "Expense added successfully!",
        color: "green",
      });
      
      if (onExpenseAdded) {
        onExpenseAdded();
      }
      
      onClose();
    } catch (error) {
      console.error("Failed to add expense:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add expense",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Expense to Task"
      size="md"
    >
      <Stack spacing="md">
        <Text size="sm" color="dimmed">
          Task ID: {taskId}
        </Text>

        <Select
          label="Expense Type"
          placeholder="Select expense type"
          data={expenseTypes}
          value={formData.type}
          onChange={(value) => setFormData({ ...formData, type: value })}
          required
        />

        <NumberInput
          label="Amount"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(value) => setFormData({ ...formData, amount: value })}
          min={0}
          precision={2}
          required
        />

        <TextInput
          label="Date"
          type="date"
          value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          required
        />

        <Textarea
          label="Notes"
          placeholder="Enter any additional notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          minRows={3}
        />

        <Group position="right" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Add Expense
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
