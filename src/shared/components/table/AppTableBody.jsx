import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  tableRow: {
    transition: "box-shadow 150ms ease",

    "> tr": {
      "&:hover": {
        boxShadow: theme.shadows.md,
        cursor: "pointer",
      },
      td: {
        whiteSpace: "nowrap",
      },
    },
  },
}));

export const AppTableBody = ({ children }) => {
  const { classes } = useStyles();

  return <tbody className={classes.tableRow}>{children}</tbody>;
};