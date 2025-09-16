import { Button, Group, Text } from "@mantine/core";

import { AppModal } from "shared/components";

export const AppConfirmationModal = ({
  opened,
  onClose,
  title = "Confirmation",
  children = <Text>Are you sure you want to continue?</Text>,
  isLoading = false,
}) => {
  return (
    <AppModal opened={opened} onClose={() => onClose(false)} title={title}>
      {children}
      <Group mt="xl" spacing="xs" position="right">
        <Button loading={isLoading} onClick={() => onClose(true)}>
          Confirm
        </Button>
        <Button variant="default" onClick={() => onClose(false)}>
          Cancel
        </Button>
      </Group>
    </AppModal>
  );
};
