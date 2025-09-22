import { Card, createStyles, Grid } from "@mantine/core";
import { AppHeader, Sidebar } from "core/components";
import { useSidebar } from "../../context/SidebarContext";

const useStyles = createStyles((theme) => ({
  layoutHeight: {
    height: "92vh",
  },

  layoutContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
  },

  bodyContainer: {
    border: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
    height: "100%",
    borderRadius: "0.4rem",
    overflowY: "auto",
  },
}));

export const Layout = ({
  sidebarMenu,
  selectedMenu,
  onSidebarMenu,
  children,
  franchiseName
}) => {
  const { classes, cx } = useStyles();
  const { isCollapsed } = useSidebar();

  return (
    <Grid m={0} p={0}>
      <Grid.Col m={0} p={0} xs={12}>
        <AppHeader franchiseName={franchiseName}></AppHeader>
      </Grid.Col>

      {!isCollapsed && (
        <Grid.Col m={0} p={0} xs={4} lg={2}>
          <Sidebar
            sidebarMenu={sidebarMenu}
            selectedMenu={selectedMenu}
            onSidebarMenu={onSidebarMenu}
          ></Sidebar>
        </Grid.Col>
      )}

      <Grid.Col 
        m={0} 
        p={0} 
        xs={isCollapsed ? 12 : 8} 
        lg={isCollapsed ? 12 : 10}
      >
        <section className={cx(classes.layoutHeight, classes.layoutContainer)}>
          <Card p="0" m="0" shadow="sm" className={classes.bodyContainer}>
            {children}
          </Card>
        </section>
      </Grid.Col>
    </Grid>
  );
};
