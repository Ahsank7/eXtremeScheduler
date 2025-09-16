import { Box, Modal } from "@mantine/core";
import { AppDivider } from "shared/components";

export const AppModal = ({ opened, onClose, size = "md", title, children }) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size={size}
      closeOnEscape={false}
      closeOnClickOutside={false}
      padding="1.2rem 1.5rem"
      shadow="xl"
      transitionProps={{
        transition: "pop",
        duration: 200,
        timingFunction: "linear",
      }}
      style={{'overflow' : 'hidden'}}
    >
      <AppDivider></AppDivider>
      <Box mt="lg" style={{'overflow' : 'hidden'}}>{children}</Box>
    </Modal>
  );
};
