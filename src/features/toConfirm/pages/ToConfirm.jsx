import { LoadingOverlay, TextInput, Checkbox, Button, Group, Stack, Text } from "@mantine/core"; // <-- Add Group
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Moment from "moment";
import {
  AppTable,
  AppDrawer,
  AppContainer,
  AppConfirmationModal,
} from "shared/components";
import { localStoreService, toConfirmService } from "core/services";
import { DataTable } from "mantine-datatable";
import { IconEdit, IconSend, IconTrash, IconDownload, IconCalendar, IconUser, IconUserCheck, IconReceipt, IconClipboard } from "@tabler/icons";
import { notifications } from "@mantine/notifications";

const ToConfirm = () => {
  const { franchiseName } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [serviceProviderName, setServiceProviderName] = useState("");
  const [clientPhoneNumber, setClientPhoneNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [clientUserNo, setClientUserNo] = useState("");
  const [serviceProviderUserNo, setServiceProviderUserNo] = useState("");
  const [taskId, setTaskId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [servicesTasks, setServicesTasks] = useState([]);
  const [selectedServicesTasks, setSelectedServicesTasks] = useState([]);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [tableHeight, setTableHeight] = useState(500);


  const [opened, { open, close }] = useDisclosure(false);

  const pageSize = 25;

  const tableColumns = [
    {
      accessor: "recordType",
      title: "Type",
      textAlignment: "left",
      render: (record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {record.recordType === 'Task' ? (
            <IconClipboard size={16} color="#228be6" />
          ) : (
            <IconReceipt size={16} color="#40c057" />
          )}
          <span style={{ 
            fontWeight: 'bold',
            color: record.recordType === 'Task' ? '#228be6' : '#40c057'
          }}>
            {record.recordType}
          </span>
        </div>
      ),
      noWrap: true,
    },
    {
      accessor: "isConfirmed",
      title: "IsConfirmed",
      textAlignment: "left",
      render: (record) => (record.isConfirmed ? "Yes" : "No"),
      noWrap: true,
    },
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
          accessor: "checkInTime",
          title: "Check In",
          textAlignment: "left",
         render: (record) => record.checkInTime ? Moment(record.checkInTime).format("h:mm a") : '-',
          noWrap: true,
     },
     {
          accessor: "checkOutTime",
          title: "Check Out",
          textAlignment: "left",
         render: (record) => record.checkOutTime ? Moment(record.checkOutTime).format("h:mm a") : '-',
          noWrap: true,
     },
    {
      accessor: "serviceType",
      title: "Service Type",
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

  ];

  useEffect(() => {
    getServicesTasks();
  }, [pageNumber]);

  const getServicesTasks = async () => {
    const obj = {};

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
    const { response, totalRecords } = await toConfirmService.getServicesTasks(obj);
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

  const handleReset = async () => {
    setClientUserNo("");
    setClientName("");
    setServiceProviderUserNo("");
    setServiceProviderName("");
    setTaskId("");
    setStartDate("");
    setEndDate("");

    await handleFilter();
  };

  const handleProfileDetail = (selectedRow) => { };

  const handleDownloadExcel = () => {
    if (!servicesTasks || servicesTasks.length === 0) return;

    // Prepare data for Excel export
    const excelData = servicesTasks.map((record, index) => ({
      'Sr No': index + 1,
      'Is Confirmed': record.isConfirmed ? "Yes" : "No",
      'Task ID': record.taskId || '-',
      'Schedule ID': record.scheduleId || '-',
      'Start Time': record.startTime ? Moment(record.startTime).format("HH:mm") : '-',
      'End Time': record.endTime ? Moment(record.endTime).format("HH:mm") : '-',
      'Date': record.date ? Moment(record.date).format("YYYY-MM-DD") : '-',
      'Client User No': record.clientUserNo || '-',
      'Client Name': record.clientName || '-',
      'Client Email': record.clientEmail || '-',
      'Client Phone': record.clientPhone || '-',
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
    let filename = `ToConfirm_Tasks_${Moment().format('YYYY-MM-DD')}`;
    if (startDate && endDate) {
      filename = `ToConfirm_Tasks_${startDate}_to_${endDate}`;
    } else if (startDate) {
      filename = `ToConfirm_Tasks_from_${startDate}`;
    } else if (endDate) {
      filename = `ToConfirm_Tasks_until_${endDate}`;
    }
    
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <>
      <AppContainer
        title="ToConfirm"
        showDivider="true"
        button={
          <Group spacing="sm">
            <Button
              disabled={selectedServicesTasks.length === 0}
              onClick={() => setIsConfirmationModalOpen(true)}
              color="blue"
              variant="filled"
              size="sm"
              style={{
                minWidth: 120,
                color: "#fff", // Ensures white text
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }}
            >
              Confirm Tasks
            </Button>
            <Button
              onClick={open}
              color="blue"
              variant="filled"
              size="sm"
              style={{
                minWidth: 100,
                color: "#fff",
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }}
            >
              Filter
            </Button>
            <Button
              variant="filled"
              color="green"
              size="sm"
              leftIcon={<IconDownload size={16} />}
              onClick={handleDownloadExcel}
              style={{
                minWidth: 100,
                color: "#fff",
                borderTopLeftRadius: 20,
                borderBottomLeftRadius: 20,
              }}
              disabled={!servicesTasks || servicesTasks.length === 0}
            >
              Download Excel
            </Button>
          </Group>
        }
      >
        <LoadingOverlay visible={isLoading} />

        <DataTable
          height="70vh"
          striped
          highlightOnHover
          columns={tableColumns}
          records={servicesTasks}
          noRecordsText="No records to show"
          rowContextMenu={{
            items: (record) => [
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
            ],
          }}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={(p) => handlePagination(p)}
          paginationSize="lg"
          selectedRecords={selectedServicesTasks.filter(record => record.recordType === 'Task')}
          onSelectedRecordsChange={(records) => {
            // Only allow selection of Task records, filter out Expense records
            const taskRecords = records.filter(record => record.recordType === 'Task');
            setSelectedServicesTasks(taskRecords);
          }}
          idAccessor={(record) => {
            // Create unique ID by combining record type with appropriate ID
            if (record.recordType === 'Task') {
              return `task_${record.taskId}`;
            } else {
              return `expense_${record.expenseId}`;
            }
          }}
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
        </form>
      </AppDrawer>

      <AppConfirmationModal
        opened={isConfirmationModalOpen}
        onClose={async (confirmed) => {
          if (confirmed) {
            // Since we only allow selection of Task records, selectedServicesTasks contains only tasks
            const tasks = selectedServicesTasks;
            
            // Confirm tasks - this will automatically confirm associated expenses
            if (tasks.length > 0) {
              await toConfirmService.CalculateBillingAndWageAmounts(
                tasks.map((row) => row.taskId).join(","),
                localStoreService.getOrganizationID()
              );
            }

            setSelectedServicesTasks([]);
            setIsConfirmationModalOpen(false);
            getServicesTasks();
          } else setIsConfirmationModalOpen(false);
        }}
        title="Confirm Tasks"
      >
        Are you sure you want to confirm the selected tasks? 
        <br />
        <small style={{ color: '#666' }}>
          Note: Confirming tasks will automatically confirm their associated expenses.
        </small>
      </AppConfirmationModal>
    </>
  );
};

export default ToConfirm;
