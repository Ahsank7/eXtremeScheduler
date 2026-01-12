import React, { useState, useEffect } from "react";
import {
  Indicator,
  ActionIcon,
  Popover,
  Stack,
  Text,
  ScrollArea,
  Group,
  Badge,
  Button,
  Box,
  Divider,
  Tooltip,
  Loader,
  Center,
} from "@mantine/core";
import { IconBell, IconCheck, IconTrash, IconChecks } from "@tabler/icons";
import { notificationService, showSuccessNotification, showErrorNotification } from "core/services";
import moment from "moment";

const NotificationItem = ({ notification, onRead, onDelete, theme }) => {
  const getNotificationColor = (type) => {
    switch (type.toLowerCase()) {
      case "success": return "green";
      case "warning": return "yellow";
      case "error": return "red";
      case "activity": return "blue";
      default: return "gray";
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 2: return { label: "Urgent", color: "red" };
      case 1: return { label: "High", color: "orange" };
      default: return null;
    }
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await onRead(notification.id);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const priorityInfo = getPriorityLabel(notification.priority);

  return (
    <Box
      p="sm"
      style={{
        backgroundColor: notification.isRead 
          ? (theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0])
          : (theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.blue[0]),
        borderLeft: `3px solid ${theme.colors[getNotificationColor(notification.type)][6]}`,
        cursor: notification.actionUrl ? 'pointer' : 'default',
        transition: 'background-color 0.2s',
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (notification.actionUrl) {
          e.currentTarget.style.opacity = '0.8';
        }
      }}
      onMouseLeave={(e) => {
        if (notification.actionUrl) {
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      <Group position="apart" noWrap>
        <Stack spacing={4} style={{ flex: 1 }}>
          <Group spacing="xs">
            <Text size="sm" weight={600}>
              {notification.title}
            </Text>
            {priorityInfo && (
              <Badge size="xs" color={priorityInfo.color}>
                {priorityInfo.label}
              </Badge>
            )}
            {!notification.isRead && (
              <Badge size="xs" color="blue">
                New
              </Badge>
            )}
          </Group>
          <Text size="xs" color="dimmed" lineClamp={2}>
            {notification.message}
          </Text>
          <Text size="xs" color="dimmed">
            {moment(notification.createdDate).fromNow()}
            {notification.createdByName && ` • by ${notification.createdByName}`}
          </Text>
        </Stack>
        <Group spacing={4}>
          {!notification.isRead && (
            <Tooltip label="Mark as read">
              <ActionIcon
                size="sm"
                color="blue"
                variant="subtle"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead(notification.id);
                }}
              >
                <IconCheck size="1rem" />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Delete">
            <ActionIcon
              size="sm"
              color="red"
              variant="subtle"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Box>
  );
};

export function NotificationBell({ theme }) {
  const [opened, setOpened] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (opened) {
      fetchNotifications(1);
    }
  }, [opened]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const fetchNotifications = async (page = 1) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await notificationService.getUserNotifications({
        pageNumber: page,
        pageSize: 10,
        unreadOnly: false,
      });

      if (response && response.notifications) {
        if (page === 1) {
          setNotifications(response.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.notifications]);
        }
        setPageNumber(page);
        setHasMore(response.notifications.length === 10);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      showErrorNotification("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
      showErrorNotification("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccessNotification("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      showErrorNotification("Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      showSuccessNotification("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      showErrorNotification("Failed to delete notification");
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(pageNumber + 1);
    }
  };

  return (
    <Popover
      width={400}
      position="bottom-end"
      shadow="md"
      opened={opened}
      onChange={setOpened}
    >
      <Popover.Target>
        <Indicator
          inline
          label={unreadCount > 0 ? unreadCount : null}
          size={16}
          color="red"
          disabled={unreadCount === 0}
        >
          <Tooltip label="Notifications">
            <ActionIcon
              variant="outline"
              size="lg"
              onClick={() => setOpened(!opened)}
            >
              <IconBell size="1.1rem" />
            </ActionIcon>
          </Tooltip>
        </Indicator>
      </Popover.Target>

      <Popover.Dropdown p={0}>
        <Box p="md" style={{ borderBottom: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}` }}>
          <Group position="apart">
            <Text weight={600} size="lg">
              Notifications
            </Text>
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="xs"
                leftIcon={<IconChecks size="1rem" />}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </Group>
        </Box>

        <ScrollArea style={{ height: 400 }}>
          {notifications.length === 0 && !loading ? (
            <Center p="xl">
              <Stack align="center" spacing="xs">
                <IconBell size={48} stroke={1} color={theme.colors.gray[5]} />
                <Text color="dimmed" size="sm">
                  No notifications
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack spacing={0}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    theme={theme}
                  />
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {loading && (
                <Center p="md">
                  <Loader size="sm" />
                </Center>
              )}
              {!loading && hasMore && (
                <Button
                  variant="subtle"
                  fullWidth
                  onClick={loadMore}
                  mt="xs"
                >
                  Load more
                </Button>
              )}
            </Stack>
          )}
        </ScrollArea>
      </Popover.Dropdown>
    </Popover>
  );
}

