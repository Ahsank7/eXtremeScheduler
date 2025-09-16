import { Button, TextInput, Textarea, Select } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { notifications } from "@mantine/notifications";
import { expenseService, lookupService } from "core/services";

const schema = z.object({
  taskId: z.coerce.number().nonnegative("Task ID is not valid"),
  type: z.number().nonnegative("Type is not valid"),
  amount: z.coerce.number().nonnegative("Amount is not valid"),
  notes: z.string().nonempty("Notes are required"),
  date: z.string().nonempty("Date is required"),
});

export const AddUpdateUserExpense = ({
  id,
  userId,
  onModalClose,
  organizationId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [typeOptions, setTypeOptions] = useState([]);
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      taskId: 0,
      type: 0,
      amount: 0,
      notes: "",
      date: "",
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      expenseService
        .getUserExpenseItem(id)
        .then((response) => {
          const { data } = response;
          form.setValues({
            taskId: data.taskId,
            type: data.type,
            amount: data.amount,
            notes: data.notes,
            date: data.date.split("T")[0],
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch Expense item",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const typeResponse = await lookupService.getLookupList({
          lookupType: "ExpenseType",
          organizationId,
        });
        setTypeOptions(
          typeResponse.data.result.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch lookup data",
          color: "red",
        });
      }
    };

    if (typeOptions.length === 0) {
      fetchLookupData();
    }
  }, [typeOptions.length, organizationId]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let userExpenseObj = {
      id: id,
      userId: userId,
      taskId: values.taskId,
      type: values.type,
      amount: parseFloat(values.amount), // Convert amount to number
      notes: values.notes,
      date: values.date,
    };

    try {
      let result = await expenseService.saveUpdateUserExpense(userExpenseObj);
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Success",
        message: result.message,
        color: "green",
        style: {
          backgroundColor: "white",
        },
      });

      onModalClose();
    } catch (error) {
      notifications.show({
        withCloseButton: true,
        autoClose: 5000,
        title: "Error",
        message: "Please try again",
        color: "red",
        style: {
          backgroundColor: "white",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.onSubmit((values) =>
        handleSubmit({
          ...values,
          taskId: values.taskId,
          type: values.type,
          amount: parseFloat(values.amount),
          notes: values.notes,
          date: values.date,
        })
      )}
    >
      <TextInput
        label="Task ID"
        placeholder="Enter Task ID"
        required
        type="number"
        {...form.getInputProps("taskId")}
      />
      <Select
        label="Type"
        placeholder="Select Type"
        {...form.getInputProps("type")}
        data={typeOptions}
      />
      <TextInput
        label="Amount"
        placeholder="Enter Amount"
        required
        type="number"
        {...form.getInputProps("amount")}
      />
      <TextInput
        label="Date"
        placeholder="Enter Date"
        type="date"
        required
        {...form.getInputProps("date")}
      />

      <Textarea
        label="Notes"
        placeholder="Enter Notes"
        required
        {...form.getInputProps("notes")}
      />
      <Button
        type="submit"
        fullWidth
        mt="xl"
        size="md"
        loading={isLoading}
        loaderPosition="right"
      >
        Save
      </Button>
    </form>
  );
};
