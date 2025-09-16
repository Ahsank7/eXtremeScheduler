import { Group, Paper, Text } from "@mantine/core";

const AppSimpleCard = ({ title, subTitle, description, children, ...rest }) => {
  return (
    <Paper
      style={{ border: "1px solid #dee2e6a3" }}
      shadow="sm"
      px="xl"
      py="lg"
      {...rest}
    >
      <Group mb="xl">
        <Text size="xl" weight="600">
          {title} {subTitle}
        </Text>
      </Group>

      {children}
    </Paper>
  );
};

export default AppSimpleCard;
