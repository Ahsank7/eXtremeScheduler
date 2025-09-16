import { Navbar, ScrollArea, createStyles } from "@mantine/core";
import { LinksGroup } from "core/components";
import { useSidebar } from "../../context/SidebarContext";

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    paddingBottom: 0,
    borderRight: 0,
    height: "92vh",
    transition: "all 0.3s ease",
  },
}));

export const Sidebar = ({ sidebarMenu, selectedMenu, onSidebarMenu }) => {
  const { classes } = useStyles();
  const { isCollapsed } = useSidebar();

  return (
    <Navbar className={classes.navbar}>
      <Navbar.Section grow component={ScrollArea}>
        {sidebarMenu.map((menu) => (
          <LinksGroup
            key={menu.id}
            menu={menu}
            selectedMenu={selectedMenu}
            onSidebarMenu={onSidebarMenu}
            isCollapsed={isCollapsed}
          />
        ))}
      </Navbar.Section>
    </Navbar>
  );
};
