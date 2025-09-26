import React from 'react';
import { Button, TextInput, Paper } from "@mantine/core";

export function TestComponent() {
  return (
    <Paper p="md">
      <TextInput label="Test Input" />
      <Button>Test Button</Button>
    </Paper>
  );
}
