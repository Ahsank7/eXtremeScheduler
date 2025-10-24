import {
  Button,
  LoadingOverlay,
  TextInput,
  Input,
  MultiSelect,
  Select,
  Group,
  Tooltip,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Moment from "moment";
import {
  localStoreService,
  planboardService,
  lookupService,
} from "core/services";
import {
  AppTable,
  AppContainer,
  AppDrawer,
  UpdateAppointment,
  AppModal,
  TaskLogModal,
} from "shared/components";
import { TaskExpenses } from "shared/components/planboard/TaskExpenses";
import { AddTaskExpense } from "shared/components/planboard/AddTaskExpense";
import { notifications } from "@mantine/notifications";
import { DataTable } from "mantine-datatable";
import { IconEdit, IconSend, IconTrash, IconDownload, IconCalendar, IconHistory, IconUser, IconUserCheck, IconReceipt, IconPlus } from "@tabler/icons";

const Planboard = () => {
  const { franchiseName } = useParams();
  const navigate = useNavigate();
  
  // Components imported successfully
  const [isLoading, setIsLoading] = useState(false);
  const [servicesTasks, setServicesTasks] = useState([]);
  const [clientName, setClientName] = useState("");
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [clientUserNo, setClientUserNo] = useState("");
  const [serviceProviderUserNo, setServiceProviderUserNo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskId, setTaskId] = useState("");
  const [taskStatus, setTaskStatus] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [statusOptions, setStatusOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(0);
  const [tableHeight, setTableHeight] = useState(500);
  const [isTaskLogModalOpen, setIsTaskLogModalOpen] = useState(false);
  const [selectedTaskForLog, setSelectedTaskForLog] = useState(null);
  const [isTaskExpensesModalOpen, setIsTaskExpensesModalOpen] = useState(false);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [selectedTaskForExpense, setSelectedTaskForExpense] = useState(null);

  const [opened, { open, close }] = useDisclosure(false);

  const pageSize = 25;

  const tableColumns = [
    {
      accessor: "taskId",
      title: "TaskId",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "scheduleId",
      title: "ScheduleId",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "startTime",
      title: "StartTime",
      textAlignment: "left",
      render: (record) => Moment(record.startTime).format("h:mm a"),
      noWrap: true,
    },
    {
      accessor: "endTime",
      title: "EndTime",
      textAlignment: "left",
      render: (record) => Moment(record.endTime).format("h:mm a"),
      noWrap: true,
    },
    {
      accessor: "date",
      title: "Date",
      textAlignment: "left",
      render: (record) => Moment(record.date).format("YYYY-MM-DD"),
      noWrap: true,
    },
    {
      accessor: "CheckInTime",
      title: "CheckIn Time",
      textAlignment: "left",
      render: (record) => record.checkInTime ? Moment(record.checkInTime).format("h:mm a") : "",
      noWrap: true,
    },
    {
      accessor: "CheckOutTime",
      title: "CheckOut Time",
      textAlignment: "left",
      render: (record) => record.checkOutTime ? Moment(record.checkOutTime).format("h:mm a") : "",
      noWrap: true,
    },
    {
      accessor: "taskStatus",
      title: "Status",
      textAlignment: "left",
      cellsStyle: (row) =>
        row.taskStatus === "Scheduled"
          ? {
            background: "#5933f0c9",
          }
          : row.taskStatus === "Delayed"
            ? {
              background: "#fa5252",
            }
            : row.taskStatus === "In-Progress"
              ? {
                background: "#40c057",
              }
              : row.taskStatus === "Completed"
                ? {
                  background: "#228be6",
                }
                : row.taskStatus === "Cancelled"
                  ? {
                    background: "#fab005",
                  }
                  : {
                    background: "lightOrange",
                  },
      noWrap: true,
    },
    {
      accessor: "serviceType",
      title: "Service Type",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceName",
      title: "Service Name",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "clientUserNo",
      title: "Client UserNo",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "clientName",
      title: "Client Name",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "clientEmail",
      title: "Client Email",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "clientPhone",
      title: "Client Phone",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "clientMobile",
      title: "Client Mobile",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceProviderUserNo",
      title: "ServiceProvider UserNo",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceProviderName",
      title: "ServiceProvider Name",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceProviderEmail",
      title: "ServiceProvider Email",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceProviderPhone",
      title: "ServiceProvider Phone",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "serviceProviderMobile",
      title: "ServiceProvider Mobile",
      textAlignment: "left",
      noWrap: true,
    },
    {
      accessor: "isConfirmed",
      title: "IsConfirmed",
      textAlignment: "left",
      render: (record) => (record.isConfirmed ? "Yes" : "No"),
      noWrap: true,
    },
  ];

  useEffect(() => {
    getServicesTasks();
  }, [pageNumber]);

  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      // Account for header, navigation, padding, and status buttons
      const reservedHeight = 200; // Adjust this value based on your layout
      const calculatedHeight = Math.max(400, windowHeight - reservedHeight);
      setTableHeight(calculatedHeight);
    };

    // Calculate initial height
    calculateTableHeight();

    // Recalculate on window resize
    window.addEventListener('resize', calculateTableHeight);

    // Cleanup
    return () => window.removeEventListener('resize', calculateTableHeight);
  }, []);

  const getServicesTasks = async () => {
    const obj = {};

    obj.taskStatusIds = taskStatus.toString();
    obj.taskId = taskId;
    obj.startDate = startDate ? startDate : null;
    obj.endDate = endDate ? endDate : null;
    obj.clientUserNo = clientUserNo;
    obj.clientName = clientName;
    obj.serviceProviderUserNo = serviceProviderUserNo;
    obj.serviceProviderName = serviceProviderName;
    obj.franchiseId = localStoreService.getFranchiseID();
    obj.pageNumber = pageNumber;
    obj.pageSize = pageSize;

    setIsLoading(true);
    const { response, totalRecords } = await planboardService.getServicesTasks(obj);
    setServicesTasks(response);
    setTotalRecords(totalRecords);
    setIsLoading(false);
  };

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const handleFilter = async () => {
    close();
    await getServicesTasks();
  };

  const handleReset = async () => {
    setServiceProviderName("");
    setClientName("");
    setClientUserNo("");
    setServiceProviderUserNo("");
    setStartDate("");
    setEndDate("");
    setTaskId("");
    setTaskStatus([]);

    await handleFilter();
  };

  useEffect(() => {
    const fetchLookupData = async () => {
      try {
        const typeResponse = await lookupService.getLookupList({
          lookupType: "TaskStatus",
        });
        setStatusOptions(
          (typeResponse?.result || []).map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to fetch lookup data",
          color: "red",
        });
      }
    };

    if (statusOptions.length === 0) {
      fetchLookupData();
    }
  }, [statusOptions.length]);

  const handleProfileDetail = (selectedRow) => {
    setIsModalOpen(true);
    setSelectedRecord(selectedRow.taskId);
  };

  const handleViewTaskLog = (selectedRow) => {
    setSelectedTaskForLog({
      id: selectedRow.taskId,
      title: `Task #${selectedRow.taskId} - ${selectedRow.clientName || 'Unknown Client'}`
    });
    setIsTaskLogModalOpen(true);
  };

  const handleViewTaskExpenses = (selectedRow) => {
    setSelectedTaskForExpense({
      taskId: selectedRow.taskId,
      userId: selectedRow.serviceProviderId, // Assuming service provider is the user
      taskStatus: selectedRow.taskStatus,
      isConfirmed: selectedRow.isConfirmed,
    });
    setIsTaskExpensesModalOpen(true);
  };

  const handleAddExpenseToTask = (selectedRow) => {
    setSelectedTaskForExpense({
      taskId: selectedRow.taskId,
      userId: selectedRow.serviceProviderId, // Assuming service provider is the user
    });
    setIsAddExpenseModalOpen(true);
  };

  const handleOpenClientProfile = (selectedRow) => {
    if (selectedRow.clientId) {
      navigate(`/franchises/${franchiseName}/profile/${selectedRow.clientId}/1`);
    } else {
      notifications.show({
        title: "Error",
        message: "Client ID not available",
        color: "red",
      });
    }
  };

  const handleOpenServiceProviderProfile = (selectedRow) => {
    if (selectedRow.serviceProviderId) {
      navigate(`/franchises/${franchiseName}/profile/${selectedRow.serviceProviderId}/2`);
    } else {
      notifications.show({
        title: "Error",
        message: "Service Provider ID not available",
        color: "red",
      });
    }
  };

  const handleDownloadExcel = () => {
    if (!servicesTasks || servicesTasks.length === 0) return;

    // Prepare data for Excel export
    const excelData = servicesTasks.map((record, index) => ({
      'Sr No': index + 1,
      'Task ID': record.taskId || '-',
      'Schedule ID': record.scheduleId || '-',
      'Start Time': record.startTime ? Moment(record.startTime).format("h:mm a") : '-',
      'End Time': record.endTime ? Moment(record.endTime).format("h:mm a") : '-',
      'Date': record.date ? Moment(record.date).format("YYYY-MM-DD") : '-',
      'Check In Time': record.checkInTime ? Moment(record.checkInTime).format("h:mm a") : '-',
      'Check Out Time': record.checkOutTime ? Moment(record.checkOutTime).format("h:mm a") : '-',
      'Task Status': record.taskStatus || '-',
      'Client User No': record.clientUserNo || '-',
      'Client Name': record.clientName || '-',
      'Service Provider User No': record.serviceProviderUserNo || '-',
      'Service Provider Name': record.serviceProviderName || '-',
      'Service Type': record.serviceType || '-',
      'Notes': record.notes || '-'
    }));

    // Convert to CSV format
    const headers = Object.keys(excelData[0]);
    const csvContent = [
      headers.join(','),
      ...excelData.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    // Create filename with date range if available
    let filename = `Planboard_Tasks_${Moment().format('YYYY-MM-DD')}`;
    if (startDate && endDate) {
      filename = `Planboard_Tasks_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename = `Planboard_Tasks_from_${startDate}`;
    } else if (endDate) {
      filename = `Planboard_Tasks_until_${endDate}`;
    }
    
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <AppContainer
        title="Planboard"
        button={
          <Group spacing="xs">
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={open}
              style={{ minWidth: 100, color: "#fff", borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
            >
              Filter
            </Button>
            <Button
              variant="filled"
              color="green"
              size="sm"
              leftIcon={<IconDownload size={16} />}
              onClick={handleDownloadExcel}
              style={{ minWidth: 100, color: "#fff", borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
              disabled={!servicesTasks || servicesTasks.length === 0}
            >
              Download Excel
            </Button>
          </Group>
        }
        showDivider="true"
      >
        <LoadingOverlay visible={isLoading} />

        <DataTable
          height="70vh"
          striped
          highlightOnHover
          columns={tableColumns}
          records={servicesTasks}
          noRecordsText={isLoading ? 'Loading Planboard Task...' : 'No tasks found'}
          rowContextMenu={{
            items: (record) => {
              const isTaskCompletedAndConfirmed = record.taskStatus === 'Completed' && record.isConfirmed;
              
              const items = [
                {
                  key: "update appointment",
                  icon: <IconEdit size={16} />,
                  onClick: () => handleProfileDetail(record),
                },
                {
                  key: "view task log",
                  icon: <IconHistory size={16} />,
                  onClick: () => handleViewTaskLog(record),
                },
                {
                  key: "view task expenses",
                  icon: <IconReceipt size={16} />,
                  onClick: () => handleViewTaskExpenses(record),
                },
                // Only show add expense option if task is not completed and confirmed
                ...(isTaskCompletedAndConfirmed ? [] : [{
                  key: "add expense to task",
                  icon: <IconPlus size={16} />,
                  onClick: () => handleAddExpenseToTask(record),
                }]),
                {
                  key: "open client profile",
                  icon: <IconUser size={16} />,
                  onClick: () => handleOpenClientProfile(record),
                },
                {
                  key: "open service provider profile",
                  icon: <IconUserCheck size={16} />,
                  onClick: () => handleOpenServiceProviderProfile(record),
                },
              ];
              return items;
            },
          }}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={(p) => handlePagination(p)}
          paginationSize="lg"
          idAccessor="taskId"
        />
      </AppContainer>

      <AppDrawer
        opened={opened}
        close={close}
        onFilter={handleFilter}
        onReset={handleReset}
      >
        <form>
          <TextInput
            label="Client UserNo"
            placeholder="1-1-1"
            size="md"
            mt="md"
            value={clientUserNo}
            onChange={(e) => setClientUserNo(e.target.value)}
          />
          <TextInput
            label="Client Name"
            placeholder="john"
            size="md"
            mt="md"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <TextInput
            label="Service Provider UserNo"
            placeholder="1-1-1"
            size="md"
            mt="md"
            value={serviceProviderUserNo}
            onChange={(e) => setServiceProviderUserNo(e.target.value)}
          />
          <TextInput
            label="Service Provider Name"
            placeholder="john"
            size="md"
            mt="md"
            value={serviceProviderName}
            onChange={(e) => setServiceProviderName(e.target.value)}
          />
          <TextInput
            label="Task Id"
            placeholder="1"
            size="md"
            mt="md"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          />

          <Stack spacing="xs" mt="md">
            <Text size="sm" weight={500} color="dimmed">
              Date Range
            </Text>
            <Group grow>
              <TextInput
                label="Start Date"
                placeholder="Select start date"
                type="date"
                size="md"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                icon={<IconCalendar size={16} />}
              />
              <TextInput
                label="End Date"
                placeholder="Select end date"
                type="date"
                size="md"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                icon={<IconCalendar size={16} />}
              />
            </Group>
          </Stack>

          <MultiSelect
            label="Task Status"
            placeholder="Select Status"
            size="md"
            mt="md"
            value={taskStatus}
            onChange={(values) => setTaskStatus(values)}
            data={statusOptions}
          />
        </form>
      </AppDrawer>
      <Group
        position="apart"
        style={{
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Tooltip label="Scheduled">
          <Button style={{ backgroundColor: "#5933f0c9" }}>Scheduled</Button>
        </Tooltip>
        <Tooltip label="In-Progress">
          <Button color="green">In-Progress</Button>
        </Tooltip>
        <Tooltip label="Cancelled">
          <Button color="yellow">Cancelled</Button>
        </Tooltip>
        <Tooltip label="Completed">
          <Button color="blue">Completed</Button>
        </Tooltip>
        <Tooltip label="Delay">
          <Button color="red">Delay</Button>
        </Tooltip>
      </Group>
             <AppModal
         opened={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         title={"Appointment"}
         size="xl"
       >
         <UpdateAppointment 
           taskID={selectedRecord} 
           franchiseName={franchiseName}
           onModalClose={async () => {
             setIsModalOpen(false);
             await getServicesTasks();
           }}
         />
       </AppModal>

       <TaskLogModal
         opened={isTaskLogModalOpen}
         onClose={() => setIsTaskLogModalOpen(false)}
         taskId={selectedTaskForLog?.id}
         taskTitle={selectedTaskForLog?.title}
       />

       <TaskExpenses
         opened={isTaskExpensesModalOpen}
         onClose={() => setIsTaskExpensesModalOpen(false)}
         taskId={selectedTaskForExpense?.taskId}
         userId={selectedTaskForExpense?.userId}
         organizationId={localStoreService.getOrganizationID()}
         taskStatus={selectedTaskForExpense?.taskStatus}
         isConfirmed={selectedTaskForExpense?.isConfirmed}
       />

       <AddTaskExpense
         opened={isAddExpenseModalOpen}
         onClose={() => setIsAddExpenseModalOpen(false)}
         taskId={selectedTaskForExpense?.taskId}
         userId={selectedTaskForExpense?.userId}
         organizationId={localStoreService.getOrganizationID()}
         onExpenseAdded={() => {
           // Refresh the expenses modal if it's open
           if (isTaskExpensesModalOpen) {
             // This will trigger a refresh when the user opens the expenses modal again
           }
         }}
       />
    </>
  );
};

export default Planboard;
