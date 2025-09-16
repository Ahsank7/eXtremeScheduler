import { Avatar, Group, Paper, Text, createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  franchiseCard: {
    transition: "transform 150ms ease",
    height: "12.5rem",
    cursor: "pointer",
    //border: "1px solid #dee2e645",

    "&:hover,:focus,:active": {
      // boxShadow: theme.shadows.sm,
      transform: "scale(1.05)",
    },
  },
}));

const FranchiseCard = ({ franchise, onFranchise }) => {
  const { name, description } = franchise;
  const { classes } = useStyles();

  return (
    <Paper
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      className={classes.franchiseCard}
      onClick={() => onFranchise(franchise)}
    >
      <Group mb="md">
        <Avatar size="lg" color="cyan">
          MK
        </Avatar>
        <Text size="lg" weight="500" color="dimmed">
          {name}
        </Text>
      </Group>

      <Text size="sm" color="dimmed" lineClamp={3}>
        {description}
      </Text>
    </Paper>
  );
};

export default FranchiseCard;
