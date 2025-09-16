import { Button, Drawer } from "@mantine/core";
import { AppDivider } from "shared/components";

export const AppDrawer = ({ opened, close, onFilter, children, onReset }) => {
  return (
    <Drawer
      opened={opened}
      position="right"
      size="20%"
      onClose={close}
      title="Filter"
      padding="1.2rem 1.5rem"
      shadow="xl"
      transitionProps={{
        duration: 150,
        timingFunction: "linear",
      }}
    >
      <AppDivider />
      <Drawer.Body p="0" mt="xl">
        {children}
        <Button.Group>
          <Button mt="xl" fullWidth size="sm" onClick={onFilter}>
            Apply
          </Button>
          {onReset && (
            <Button
              variant="default"
              fullWidth
              mt="xl"
              size="sm"
              onClick={onReset}
            >
              Reset
            </Button>
          )}
        </Button.Group>
      </Drawer.Body>
    </Drawer>
  );
};
