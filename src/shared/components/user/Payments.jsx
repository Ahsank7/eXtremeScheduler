import React, { useEffect, useState, useCallback } from "react";
import {  AppModal, AppDrawer, AppContainer } from "shared/components";
import { Button, TextInput, LoadingOverlay, Badge, Group, Text, Card, Stack, Menu, Paper } from "@mantine/core";
import { localStoreService, profileService, organizationService } from "core/services";
import { helperFunctions } from "shared/utils";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconFilter, IconRefresh, IconDownload, IconFileText, IconReceipt } from '@tabler/icons';
import Moment from 'moment';
import PaymentReport from "./PaymentReport";
import { DataTable } from "mantine-datatable";
import { Transactions } from "./Transactions";

export function Payments({ userId, type, readOnly = false }) {
  //  type Billing Wage
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
      // Get franchise ID dynamically
      const franchise = localStoreService.getFranchiseID();
      
      if (!franchise) {
        console.error('Franchise ID not available');
        setPayments([]);
        setTotalRecords(0);
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
  }, [userId, type, userNo, date, transactionId, pageNumber, pageSize]);

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
    </>
  );
}
