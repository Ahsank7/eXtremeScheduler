import React, { useEffect, useState, useCallback } from "react";
import { AppContainer } from "shared/components";
import { profileService, localStoreService } from "core/services";
import { helperFunctions } from "shared/utils";
import { LoadingOverlay, Paper, Text, Badge, Group } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import Moment from 'moment';

export function Transactions({ userId, readOnly = false, transactionId = null, type = null }) {
  const [Transactions, setTransactions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  let franchise = localStoreService.getFranchiseID();

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
      accessor: "status",
      title: "Status",
      textAlignment: "left",
      render: (record) => getStatusBadge(record.status),
      noWrap: true,
    },
    {
      accessor: "transactionDate",
      title: "Date",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm">
          {record.transactionDate ? Moment(record.transactionDate).format("YYYY-MM-DD") : '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "referenceId",
      title: "Reference ID",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" color="dimmed" style={{ fontFamily: 'monospace' }}>
          {record.referenceId || '-'}
        </Text>
      ),
      noWrap: true,
    },
    {
      accessor: "remarks",
      title: "Remarks",
      textAlignment: "left",
      render: (record) => (
        <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {record.remarks || '-'}
        </Text>
      ),
      noWrap: false,
    },
  ];

  const fetchTransactions = useCallback(async () => {
    // If a specific transactionId is provided, fetch single transaction details
    if (transactionId) {
      setIsLoading(true);
      try {
        const response = await profileService.getTransactionDetails(transactionId);
        console.log('Transaction Details Response:', response); // Debug log
        
        // The httpService has already extracted the data, so response is the data object
        if (response) {
          setTransactions([response]);
          setTotalRecords(1);
        } else {
          setTransactions([]);
          setTotalRecords(0);
        }
      } catch (error) {
        console.error('Error fetching transaction details:', error);
        setTransactions([]);
        setTotalRecords(0);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Otherwise fetch all transactions
    const request = {
      userId: userId,
      userNo: "",
      date: null,
      referenceId: "",
      sortColumn: "transactionId",
      franchiseId: franchise,
      sortType: "desc",
      pageNumber: pageNumber,
      pageSize: pageSize,
    };

    setIsLoading(true);
    try {
      const response = await profileService.getTransactionList(request);
      console.log('Transaction List Response:', response); // Debug log
      
      // Handle different response structures
      let transactionsData = [];
      if (Array.isArray(response)) {
        // Direct array response
        transactionsData = response;
      } else if (response && Array.isArray(response.response)) {
        // Response with response property
        transactionsData = response.response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        transactionsData = response.data;
      } else if (response && response.data && Array.isArray(response.data.response)) {
        // Response with data.response property
        transactionsData = response.data.response;
      }
      
      setTransactions(transactionsData);
      setTotalRecords(transactionsData?.length || 0);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId, franchise, pageNumber, pageSize, transactionId]);

  const handlePagination = (pageNumber) => {
    setPageNumber(pageNumber);
  };

  const getStatusBadge = (status) => {
    if (!status) return <Badge color="gray" variant="light" size="sm">Unknown</Badge>;
    
    const statusLower = status.toLowerCase();
    let color = 'blue';
    
    if (statusLower.includes('success') || statusLower.includes('completed')) {
      color = 'green';
    } else if (statusLower.includes('pending')) {
      color = 'yellow';
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
      color = 'red';
    }
    
    return (
      <Badge color={color} variant="light" size="sm">
        {status}
      </Badge>
    );
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <>
      <AppContainer 
        title="Transaction Details"
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
              📖 This transactions view is in read-only mode. You can view information but cannot modify data.
            </Text>
          </Paper>
        )}
        
        {transactionId && (
          <Paper 
            withBorder 
            p="md" 
            mb="md" 
            radius="md" 
            style={{ 
              backgroundColor: '#e3f2fd', 
              borderColor: '#2196f3',
              color: '#1565c0'
            }}
          >
            <Text size="sm" weight={500}>
              🔍 Showing transaction details for Transaction ID: {transactionId}
            </Text>
          </Paper>
        )}
        
        <LoadingOverlay visible={isLoading} />

        <DataTable
          height="70vh"
          striped
          highlightOnHover
          columns={tableColumns}
          records={Transactions || []}
          noRecordsText={'No transactions found'}
          totalRecords={totalRecords}
          recordsPerPage={pageSize}
          page={pageNumber}
          onPageChange={(p) => handlePagination(p)}
          paginationSize="lg"
        />
      </AppContainer>
    </>
  );
}
