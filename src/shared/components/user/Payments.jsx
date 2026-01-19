import React, { useEffect, useState, useCallback } from "react";
import {  AppModal, AppDrawer, AppContainer } from "shared/components";
import { Button, TextInput, LoadingOverlay, Badge, Group, Text, Card, Stack, Menu, Paper, Textarea, Modal } from "@mantine/core";
import { localStoreService, profileService, organizationService } from "core/services";
import { manualMarkAsPaid } from "core/services/paymentService";
import { helperFunctions } from "shared/utils";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconFilter, IconRefresh, IconDownload, IconFileText, IconReceipt, IconCheck } from '@tabler/icons';
import Moment from 'moment';
import PaymentReport from "./PaymentReport";
import { DataTable } from "mantine-datatable";
import { Transactions } from "./Transactions";
import { showNotification } from '@mantine/notifications';
import { useFranchise } from "core/context/FranchiseContext";

export function Payments({ userId, type, readOnly = false }) {
  //  type Billing Wage
  const { franchiseId: currentFranchiseId, loading: franchiseLoading } = useFranchise();
  const [userNo, setUserNo] = useState("");
  const [date, setDate] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [Payments, setPayments] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currencySign, setCurrencySign] = useState('$');
  const [manualPaymentModalOpened, setManualPaymentModalOpened] = useState(false);
  const [selectedPaymentForManual, setSelectedPaymentForManual] = useState(null);
  const [manualPaymentReason, setManualPaymentReason] = useState('');
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const pageSize = 25;
  const tableColumns = [
    {
      accessor: "srNo",
      title: "Sr No",
      textAlignment: "left",
      render: (record, index) => helperFunctions.getRowNumber(pageSize, pageNumber, index),
      noWrap: true,
    },
    {
      accessor: "id",
      title: type === "billing" ? "Invoice ID" : "Payroll ID",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" weight={600} color="blue">
          #{record.id}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "userNo",
      title: "User No",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm">
          {record.userNo || '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "name",
      title: type === "billing" ? "Client" : "Service Provider",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" weight={500}>
          {type === "billing"
            ? record.clientName || '-'
            : record.serviceProviderName || '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "date",
      title: "Date",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm">
          {record.date ? Moment(record.date).format("YYYY-MM-DD") : '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "totalAmount",
      title: "Total Amount",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm">
          {formatAmount(record.totalAmount)}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "dueDate",
      title: "Due Date",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm">
          {record.dueDate ? Moment(record.dueDate).format('YYYY-MM-DD') : '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "status",
      title: "Status",
      textAlignment: "left",
      render: (record) => getStatusBadge(record.isPaid),
      noWrap: true,
    },

    {
      accessor: "actions",
      title: "Actions",
      textAlignment: "left",
      render: (record) => {
        // Show View Transactions button if the payment has been processed (has a transaction ID)
        const hasTransaction = record.transactionId;
        return (
          <Group spacing="xs">
            <Button
              variant="filled"
              size="xs"
              leftIcon={<IconEye size={14} />}
              onClick={() => handleViewDetails(record)}
              color="blue"
            >
              View
            </Button>
            {hasTransaction && (
              <Button
                variant="filled"
                size="xs"
                leftIcon={<IconReceipt size={14} />}
                onClick={() => handleViewTransactions(record)}
                color="green"
              >
                View Transactions
              </Button>
            )}
          </Group>
        );
      },
      noWrap: true,
    },
  ];

  const fetchPayments = useCallback(async () => {
    const getPayments = async () => {
      // Get franchise ID from context (currently selected franchise)
      const franchise = currentFranchiseId || localStoreService.getFranchiseID();
      
      if (!franchise || franchiseLoading) {
        console.error('Franchise ID not available or still loading');
        return;
      }

      const request = {
        userId: userId || null,
        userNo: userNo || null,
        date: date || null,
        transactionId: transactionId || null,
        franchiseId: franchise,
        sortColumn: "id",
        sortType: "desc",
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
      
      console.log('Payment request:', request); // Debug log
      console.log('Franchise ID:', franchise); // Debug log
      console.log('Type:', type); // Debug log

      let service;
      if (type === "billing") {
        service = profileService.getClientPaymentList;
      } else if (type === "wage") {
        service = profileService.getServiceProviderPaymentList;
      }
      
      if (!service) {
        console.error('No service available for type:', type);
        setPayments([]);
        setTotalRecords(0);
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await service(request);
        console.log('Payment API response:', result); // Debug log
        
        // Handle different response structures
        if (result && result.data) {
          // If the response is wrapped in a data property
          const responseData = result.data;
          console.log('Response data:', responseData); // Debug log
          if (responseData.response) {
            setPayments(responseData.response);
            setTotalRecords(responseData.totalRecords || responseData.response.length);
          } else {
            setPayments(responseData);
            setTotalRecords(responseData.length || 0);
          }
        } else if (result && result.response) {
          // Direct response structure
          setPayments(result.response);
          setTotalRecords(result.totalRecords || result.response.length);
        } else {
          // Fallback to the result itself
          setPayments(result || []);
          setTotalRecords(result?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        console.error('Error details:', error.response?.data || error.message); // More detailed error logging
        setPayments([]);
        setTotalRecords(0);
      } finally {
        setIsLoading(false);
      }
    };

    getPayments();
  }, [userId, type, userNo, date, transactionId, pageNumber, pageSize, currentFranchiseId, franchiseLoading]);

  const handleFilter = async () => {
    close();
    setPageNumber(1);
    await fetchPayments();
  };

  const handleReset = async () => {
    setTransactionId("");
    setDate("");
    setUserNo("");
    setPageNumber(1);
    await handleFilter();
  };

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const handleViewDetails = (row) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleViewTransactions = (record) => {
    // Use the payment ID (record.id) to filter transactions by ReferenceId
    if (record.id) {
      setSelectedTransactionId(record.transactionId.toString());
      setIsTransactionsModalOpen(true);
    }
  };

  const formatAmount = (amount) => {
    return helperFunctions.formatCurrency(amount, currencySign);
  };

  const getStatusBadge = (isPaid) => {
    return (
      <Badge 
        color={isPaid ? 'green' : 'red'} 
        variant="light"
        size="sm"
      >
        {isPaid ? 'Paid' : 'Unpaid'}
      </Badge>
    );
  };

  const fetchCurrencySign = async () => {
    try {
      const organizationId = localStoreService.getOrganizationID();
      if (organizationId) {
        const sign = await organizationService.getCurrencySign(organizationId);
        setCurrencySign(sign);
      }
    } catch (error) {
      console.error('Error fetching currency sign:', error);
      setCurrencySign('$'); // Default fallback
    }
  };

  const handleDownloadExcel = () => {
    if (!Payments || Payments.length === 0) return;

    // Prepare data for Excel export
    const excelData = Payments.map((record, index) => ({
      'Sr No': helperFunctions.getRowNumber(pageSize, pageNumber, index),
      [type === "billing" ? "Invoice ID" : "Payroll ID"]: record.id,
      'User No': record.userNo || '-',
      [type === "billing" ? "Client" : "Service Provider"]: type === "billing" ? record.clientName || '-' : record.serviceProviderName || '-',
      'Date': record.date ? Moment(record.date).format('MMM DD, YYYY') : '-',
      'Total Amount': formatAmount(record.totalAmount),
      'Due Date': record.DueDate ? Moment(record.DueDate).format('MMM DD, YYYY') : '-',
      'Status': record.IsPaid ? 'Paid' : 'Unpaid',
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
    link.setAttribute('download', `${type === "billing" ? "Billing" : "Wage"}_Payments_${Moment().format('YYYY-MM-DD')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualMarkAsPaid = (record) => {
    setSelectedPaymentForManual(record);
    setManualPaymentReason('');
    setManualPaymentModalOpened(true);
  };

  const handleConfirmManualPayment = async () => {
    if (!manualPaymentReason.trim()) {
      showNotification({
        title: 'Error',
        message: 'Please provide a reason for manual payment',
        color: 'red',
      });
      return;
    }

    setIsMarkingPaid(true);
    try {
      const paymentType = type === "billing" ? "INVOICE" : "WAGE";
      const response = await manualMarkAsPaid({
        paymentType: paymentType,
        paymentId: selectedPaymentForManual.id,
        reason: manualPaymentReason,
        paymentDate: new Date().toISOString(),
      });

      console.log('Manual payment response:', response);

      // handleApiResponse returns the data directly, so check response.success
      if (response?.success) {
        showNotification({
          title: 'Success',
          message: response?.message || `${type === "billing" ? "Invoice" : "Wage"} has been marked as paid successfully`,
          color: 'green',
        });
        
        // Close modal first
        setManualPaymentModalOpened(false);
        setSelectedPaymentForManual(null);
        setManualPaymentReason('');
        
        // Refresh the payment list
        await fetchPayments();
      } else {
        throw new Error(response?.message || 'Failed to mark payment as paid');
      }
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      showNotification({
        title: 'Error',
        message: error?.message || 'Failed to mark payment as paid',
        color: 'red',
      });
    } finally {
      setIsMarkingPaid(false);
    }
  };



  useEffect(() => {
    // Fetch currency sign when component mounts
    fetchCurrencySign();
    
    // Only fetch payments if we have the required parameters
    if (type) {
      console.log('Component ready, fetching payments for type:', type);
      fetchPayments();
    } else {
      console.log('Component not ready, missing type parameter');
    }
  }, [fetchPayments, type]);

  return (
    <>
     
        <AppContainer
        title= {type === "billing" ? "Billing Payments" : "Wage Payments"}
        button={
          <Group spacing="xs">
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={open}
              style={{ minWidth: 100, color: "#fff", borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }}
              disabled={readOnly}
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
              disabled={!Payments || Payments.length === 0 || readOnly}
            >
              Download Excel
            </Button>
          </Group>
        }
        showDivider="true"
      >
        {readOnly && (
          <Paper 
            withBorder 
            p="md" 
            mb="md" 
            radius="md" 
            style={{ 
              backgroundColor: '#fff3cd', 
              borderColor: '#ffeaa7',
              color: '#856404'
            }}
          >
            <Text size="sm" weight={500}>
              📖 This payments view is in read-only mode. You can view information but cannot filter or download data.
            </Text>
          </Paper>
        )}
        <LoadingOverlay visible={isLoading} />

        

        <DataTable
          height="70vh"
          striped
          highlightOnHover
          columns={tableColumns}
          records={Payments || []}
          noRecordsText={'No records to show'}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={(p) => handlePagination(p)}
          paginationSize="lg"
          rowContextMenu={{
            items: (record) => {
              const items = [];
              
              // Only show "Mark as Paid" for unpaid records
              if (!record.isPaid && !readOnly) {
                items.push({
                  key: 'mark-paid',
                  icon: <IconCheck size={16} />,
                  title: `Mark ${type === "billing" ? "Invoice" : "Wage"} as Paid`,
                  onClick: () => handleManualMarkAsPaid(record),
                });
              }
              
              return items;
            },
          }}
        />
        
      </AppContainer>

      <AppDrawer opened={opened} close={close} onFilter={handleFilter} onReset={handleReset}>
        <Stack spacing="md">
          <Text size="lg" weight={600} mb="md">
            Filter Payments
          </Text>
          
          {userId ? null : (
            <TextInput
              label="User No"
              placeholder="Enter user number"
              size="md"
              value={userNo}
              onChange={(e) => setUserNo(e.target.value)}
              disabled={readOnly}
            />
          )}
          
          <TextInput
            label="Date"
            size="md"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={readOnly}
          />
          
          
        </Stack>
      </AppDrawer>

      <AppModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${type === "billing" ? "Invoice" : "Payment"} Details`}
        size="50%"
      
      >
        <PaymentReport info={selectedRow} type={type} />
      </AppModal>

      <AppModal
        opened={isTransactionsModalOpen}
        onClose={() => setIsTransactionsModalOpen(false)}
        title="Transaction Details"
        size="80%"
      >
        <Transactions 
          userId={userId} 
          readOnly={true} 
          transactionId={selectedTransactionId}
          type={type}
        />
      </AppModal>

      <Modal
        opened={manualPaymentModalOpened}
        onClose={() => {
          setManualPaymentModalOpened(false);
          setSelectedPaymentForManual(null);
          setManualPaymentReason('');
        }}
        title={`Mark ${type === "billing" ? "Invoice" : "Wage"} as Paid`}
        size="md"
      >
        <Stack spacing="md">
          <Text size="sm" color="dimmed">
            You are about to manually mark {type === "billing" ? "invoice" : "wage"} #{selectedPaymentForManual?.id} as paid.
          </Text>
          
          {selectedPaymentForManual && (
            <Card withBorder padding="sm">
              <Stack spacing="xs">
                <Group position="apart">
                  <Text size="sm" weight={500}>
                    {type === "billing" ? "Invoice ID:" : "Payroll ID:"}
                  </Text>
                  <Text size="sm" color="blue" weight={600}>
                    #{selectedPaymentForManual.id}
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm" weight={500}>
                    {type === "billing" ? "Client:" : "Service Provider:"}
                  </Text>
                  <Text size="sm">
                    {type === "billing" 
                      ? selectedPaymentForManual.clientName 
                      : selectedPaymentForManual.serviceProviderName}
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm" weight={500}>Amount:</Text>
                  <Text size="sm" weight={600} color="green">
                    {formatAmount(selectedPaymentForManual.totalAmount)}
                  </Text>
                </Group>
              </Stack>
            </Card>
          )}

          <Textarea
            label="Reason for Manual Payment"
            placeholder="Enter the reason why this payment is being marked as paid manually (e.g., 'Paid via check', 'Cash payment received', 'Bank transfer completed')"
            required
            minRows={4}
            value={manualPaymentReason}
            onChange={(e) => setManualPaymentReason(e.target.value)}
            disabled={isMarkingPaid}
          />

          <Group position="right" mt="md">
            <Button
              variant="subtle"
              onClick={() => {
                setManualPaymentModalOpened(false);
                setSelectedPaymentForManual(null);
                setManualPaymentReason('');
              }}
              disabled={isMarkingPaid}
            >
              Cancel
            </Button>
            <Button
              color="green"
              leftIcon={<IconCheck size={16} />}
              onClick={handleConfirmManualPayment}
              loading={isMarkingPaid}
              disabled={!manualPaymentReason.trim()}
            >
              Mark as Paid
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
