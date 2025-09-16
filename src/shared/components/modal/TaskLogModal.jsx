import React, { useEffect, useState } from "react";
import {
  Modal,
  Text,
  Group,
  Button,
  LoadingOverlay,
  Stack,
  Badge,
  Paper,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import Moment from "moment";
import { taskLogService } from "core/services";
import { IconHistory, IconUser, IconClock, IconInfoCircle } from "@tabler/icons";

const TaskLogModal = ({ opened, onClose, taskId, taskTitle = "Task" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [taskLogs, setTaskLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (opened && taskId) {
      fetchTaskLogs();
    }
  }, [opened, taskId, pageNumber]);

  const fetchTaskLogs = async () => {
    setIsLoading(true);
    try {
      const response = await taskLogService.getTaskLogs({
        taskId,
        pageNumber,
        pageSize,
      });
      
      if (response.status === 200) {
        setTaskLogs(response.data.logs || []);
        setTotalRecords(response.data.totalRecords || 0);
      }
    } catch (error) {
      console.error("Failed to fetch task logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionTypeColor = (actionType) => {
    switch (actionType) {
      case "AttendanceUpdate":
        return "blue";
      case "NotesUpdate":
        return "green";
      case "StatusChange":
        return "orange";
      case "TaskCreated":
        return "teal";
      case "TaskModified":
        return "purple";
      default:
        return "gray";
    }
  };

  const getActionTypeIcon = (actionType) => {
    switch (actionType) {
      case "AttendanceUpdate":
        return "⏰";
      case "NotesUpdate":
        return "📝";
      case "StatusChange":
        return "🔄";
      case "TaskCreated":
        return "➕";
      case "TaskModified":
        return "✏️";
      default:
        return "ℹ️";
    }
  };

  const tableColumns = [
    {
      accessor: "actionType",
      title: "Action",
      textAlignment: "left",
      render: (record) => (
        <Group spacing="xs">
          <Text size="lg">{getActionTypeIcon(record.actionType)}</Text>
          <Badge color={getActionTypeColor(record.actionType)} variant="light">
            {record.actionType.replace(/([A-Z])/g, ' $1').trim()}
          </Badge>
        </Group>
      ),
      noWrap: true,
    },
    {
      accessor: "fieldName",
      title: "Field",
      textAlignment: "left",
      render: (record) => record.fieldName || "N/A",
      noWrap: true,
    },
    {
      accessor: "previousValue",
      title: "Previous Value",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" color="dimmed" style={{ maxWidth: 150, wordBreak: "break-word" }}>
          {record.previousValue || "N/A"}
        </Text>
      ),
      noWrap: false,
    },
    {
      accessor: "newValue",
      title: "New Value",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" style={{ maxWidth: 150, wordBreak: "break-word" }}>
          {record.newValue || "N/A"}
        </Text>
      ),
      noWrap: false,
    },
    {
      accessor: "description",
      title: "Description",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" style={{ maxWidth: 200, wordBreak: "break-word" }}>
          {record.description || "N/A"}
        </Text>
      ),
      noWrap: false,
    },
    {
      accessor: "userName",
      title: "Updated By",
      textAlignment: "left",
      render: (record) => (
        <Group spacing="xs">
          <IconUser size={16} />
          <Text size="sm">{record.userName}</Text>
          <Text size="xs" color="dimmed">({record.userNo})</Text>
        </Group>
      ),
      noWrap: true,
    },
    {
      accessor: "createdDate",
      title: "Date & Time",
      textAlignment: "left",
      render: (record) => (
        <Group spacing="xs">
          <IconClock size={16} />
          <Text size="sm">
            {Moment(record.createdDate).format("MMM DD, YYYY")}
          </Text>
          <Text size="xs" color="dimmed">
            {Moment(record.createdDate).format("h:mm A")}
          </Text>
        </Group>
      ),
      noWrap: true,
    },
  ];

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group spacing="xs">
          <IconHistory size={20} />
          <Text size="lg" weight={600}>
            Task Log - {taskTitle}
          </Text>
        </Group>
      }
      size="xl"
      styles={(theme) => ({
        title: {
          fontSize: theme.fontSizes.lg,
          fontWeight: 600,
        },
      })}
    >
      <LoadingOverlay visible={isLoading} />
      
      <Stack spacing="md">
        <Paper p="md" withBorder>
          <Group spacing="xs">
            <IconInfoCircle size={16} />
            <Text size="sm" color="dimmed">
              This log shows all changes made to this task including attendance updates, notes changes, and status modifications.
            </Text>
          </Group>
        </Paper>

        <Divider />

        <DataTable
          height={400}
          striped
          highlightOnHover
          columns={tableColumns}
          records={taskLogs}
          noRecordsText="No task logs found"
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={handlePagination}
          paginationSize="sm"
          idAccessor="id"
        />

        <Group position="right">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default TaskLogModal;
