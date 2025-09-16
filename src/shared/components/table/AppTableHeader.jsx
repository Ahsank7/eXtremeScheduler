import { createStyles } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  tableHeader: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `1px solid ${theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
        }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },

  headerHeaderRow: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  headerHeaderColumn: {
    paddingTop: "1.1rem !important",
    paddingBottom: "1.1rem !important",
    whiteSpace: "nowrap",
  },
}));

export const AppTableHeader = ({ thead, scrolled }) => {
  const { classes, cx } = useStyles();

  return (
    <thead
      className={cx(classes.tableHeader, {
        [classes.scrolled]: scrolled,
      })}
    >
      <tr className={classes.headerHeaderRow}>
        {thead.map((head, index) => (
          <th className={classes.headerHeaderColumn} key={index}>
            {head}
          </th>
        ))}
      </tr>
    </thead>
  );
};