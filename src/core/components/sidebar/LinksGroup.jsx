import { useState } from "react";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  Text,
  UnstyledButton,
  createStyles,
  Tooltip,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
  control: {
    fontWeight: 500,
    display: "block",
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    fontSize: theme.fontSizes.sm,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  link: {
    fontWeight: 500,
    display: "block",
    textDecoration: "none",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    paddingLeft: 31,
    marginLeft: 30,
    fontSize: theme.fontSizes.sm,
    cursor: "pointer",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    borderLeft: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  chevron: {
    transition: "transform 200ms ease",
  },

  active: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },
}));

export const LinksGroup = ({ menu, selectedMenu, onSidebarMenu, isCollapsed = false }) => {
  const { icon: Icon, label, initiallyOpened = false, childrenLinks } = menu;

  const { classes, theme, cx } = useStyles();
  const ChevronIcon = theme.dir === "ltr" ? IconChevronRight : IconChevronLeft;

  const hasLinks = Array.isArray(childrenLinks);
  const [opened, setOpened] = useState(initiallyOpened || false);

  const buttonContent = (
    <UnstyledButton
      onClick={() => (hasLinks ? setOpened((o) => !o) : onSidebarMenu(menu))}
      className={cx(
        classes.control,
        menu?.id === selectedMenu?.id ? classes.active : ""
      )}
      style={{
        padding: isCollapsed ? `${theme.spacing.xs} ${theme.spacing.sm}` : undefined,
        justifyContent: isCollapsed ? 'center' : 'flex-start',
      }}
    >
      <Group position="apart" spacing={0} style={{ width: '100%' }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <ThemeIcon variant="light" size={30}>
            <Icon size={18} />
          </ThemeIcon>
          {!isCollapsed && <Box ml="md">{label}</Box>}
        </Box>
        {hasLinks && !isCollapsed && (
          <ChevronIcon
            className={classes.chevron}
            size={14}
            stroke={1.5}
            style={{
              transform: opened
                ? `rotate(${theme.dir === "rtl" ? -90 : 90}deg)`
                : "none",
            }}
          />
        )}
      </Group>
    </UnstyledButton>
  );

  return (
    <>
      {isCollapsed ? (
        <Tooltip label={label} position="right" withArrow>
          {buttonContent}
        </Tooltip>
      ) : (
        buttonContent
      )}

      {hasLinks && !isCollapsed && (
        <Collapse in={opened}>
          {childrenLinks.map((link) => (
            <Text
              component="a"
              className={cx(
                classes.link,
                link.id === selectedMenu?.id ? classes.active : ""
              )}
              //href={link.link}
              key={link.label}
              onClick={() => onSidebarMenu(link)}
            >
              {link.label}
            </Text>
          ))}
        </Collapse>
      )}
    </>
  );
};
