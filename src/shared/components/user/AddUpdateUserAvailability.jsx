import { Button, Select, Grid, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useState, useEffect } from "react";
import { z as zod } from "zod";
import { notifications } from "@mantine/notifications";
import { availabilityService } from "core/services";

const schema = zod.object({
  startTime: zod.string().nonempty("Start Time is required"),
  endTime: zod.string().nonempty("End Time is required"),
  day: zod.string().nonempty("Day is required"),
}).refine((data) => {
  if (data.startTime && data.endTime) {
    // Convert time strings to comparable values
    const startTime = data.startTime;
    const endTime = data.endTime;
    return startTime < endTime;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export const AddUpdateUserAvailability = ({ id, userId, onModalClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      startTime: "",
      endTime: "",
      day: "",
    },
    validateInputOnBlur: true,
  });

  useEffect(() => {
    if (id) {
      setIsFetching(true);
      availabilityService
        .getAvailabilityItem(id)
        .then((response) => {
          const { data } = response;
          form.setValues({
            endTime: data.endTime || "",
            startTime: data.startTime || "",
            day: data.day || "",
          });
        })
        .catch((error) => {
          notifications.show({
            withCloseButton: true,
            autoClose: 5000,
            title: "Error",
            message: "Failed to fetch Address item",
            color: "red",
            style: {
              backgroundColor: "white",
            },
          });
        })
        .finally(() => setIsFetching(false));
    }
  }, [id]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    let userAvailabilityObj = {
      ...values,
      userId: userId,
      id: id,
    };

    try {
      let result = await availabilityService.saveUpdateAvailability(
        userAvailabilityObj
      );
      notifications.show({
        title: "Success",
        message: result.message,
        color: "green",
      });
      onModalClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Please try again",
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Loading...</div>;

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Grid>
        <Grid.Col span={4}>
          <Select
            label="Day"
            required
            data={[
              { label: "Monday", value: "Monday" },
              { label: "Tuesday", value: "Tuesday" },
              { label: "Wednesday", value: "Wednesday" },
              { label: "Thursday", value: "Thursday" },
              { label: "Friday", value: "Friday" },
              { label: "Saturday", value: "Saturday" },
              { label: "Sunday", value: "Sunday" },
            ]}
            {...form.getInputProps("day")}
          />

          <TextInput
            label="Start Time"
            type="time"
            required
            {...form.getInputProps("startTime")}
          />
          <TextInput
            label="End Time"
            type="time"
            required
            {...form.getInputProps("endTime")}
          />
        </Grid.Col>
      </Grid>
      <Button type="submit" fullWidth mt="xl" loading={isLoading}>
        Save
      </Button>
    </form>
  );
};
