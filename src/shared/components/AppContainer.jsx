import { Box, Card, Group, Title } from "@mantine/core";
import { AppDivider } from "shared/components";

export const AppContainer = ({
  title,
  button: Button,
  showDivider,
  margionTop = "1.5rem",
  icon,
  children,
}) => {
  return (
    <Card>
      {title && <Card.Section p="0" m="0" py="1.3rem" px="1rem">
        <Group position="apart">
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {icon && <Box mr="lg">{icon}</Box>}
            <Title size="h2">{title}</Title>
          </Box>
          {Button}
        </Group>
      </Card.Section>}

      {showDivider && <AppDivider mx="xl"></AppDivider>}

      <Card.Section p="0" m="0" px="1rem" mt={margionTop}>
        {children}
      </Card.Section>
    </Card>
  );
};
