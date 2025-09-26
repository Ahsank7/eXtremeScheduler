import React, { useState } from 'react';
import { Button, TextInput, Select, Grid, Paper } from "@mantine/core";

export const AddUpdateUserScheduleMinimal = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Paper p="md" radius="md">
      <form>
        <Grid mt="xs">
          <Grid.Col span={6}>
            <TextInput
              label="Start Date"
              placeholder="Enter Start Date"
              type="date"
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Date"
              placeholder="Enter End Date"
              type="date"
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Start Time"
              placeholder="Enter Start Time"
              type="time"
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="End Time"
              placeholder="Enter End Time"
              type="time"
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Service Providers"
              placeholder="Select Service Providers"
              data={[
                { value: "1", label: "John Doe" },
                { value: "2", label: "Jane Smith" }
              ]}
              required
            />
          </Grid.Col>
        </Grid>
        <Button
          type="submit"
          fullWidth
          mt="xl"
          size="md"
          loading={isLoading}
        >
          Save
        </Button>
      </form>
    </Paper>
  );
};

export default AddUpdateUserScheduleMinimal;
