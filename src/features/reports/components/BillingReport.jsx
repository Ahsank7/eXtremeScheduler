import React, { useState, useEffect, useCallback } from 'react';
import { 
  Stack, 
  Group, 
  Select, 
  Button, 
  Text,
  Table,
  Paper,
  Badge,
  LoadingOverlay,
  Grid,
  Card,
  TextInput
} from '@mantine/core';
import { IconFilter, IconRefresh } from '@tabler/icons';
import { localStoreService, profileService, organizationService } from 'core/services';
import { helperFunctions } from 'shared/utils';
import Moment from 'moment';
import ReportLayout from './ReportLayout';

export default function BillingReport({ config }) {
  const [startDate, setStartDate] = useState(Moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(Moment(new Date()).format('YYYY-MM-DD'));
  const [selectedClient, setSelectedClient] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [currencySign, setCurrencySign] = useState('$');

  useEffect(() => {
    fetchCurrencySign();
  }, []);

  const fetchCurrencySign = async () => {
    try {
      const organizationId = localStoreService.getOrganizationID();
      if (organizationId) {
        const sign = await organizationService.getCurrencySign(organizationId);
        setCurrencySign(sign);
      }
    } catch (error) {
      console.error('Error fetching currency sign:', error);
      setCurrencySign('$');
    }
  };

  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const franchise = localStoreService.getFranchiseID();
      
      const request = {
        userId: selectedClient || null,
        userNo: null,
        date: null,
        transactionId: null,
        franchiseId: franchise,
        sortColumn: "date",
        sortType: "desc",
        pageNumber: 1,
        pageSize: 1000,
      };

      const result = await profileService.getClientPaymentList(request);
      
      let payments = [];
      if (result && result.data && result.data.response) {
        payments = result.data.response;
      } else if (result && result.response) {
        payments = result.response;
      } else {
        payments = result || [];
      }

      // Filter by date range
      const filteredPayments = payments.filter(payment => {
        const paymentDate = Moment(payment.date).format('YYYY-MM-DD');
        return paymentDate >= startDate && paymentDate <= endDate;
      });

      // Calculate summary statistics
      const totalInvoices = filteredPayments.length;
      const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const paidInvoices = filteredPayments.filter(p => p.isPaid).length;
      const unpaidInvoices = totalInvoices - paidInvoices;
      const paidAmount = filteredPayments.filter(p => p.isPaid).reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const unpaidAmount = totalAmount - paidAmount;

      setReportData({
        payments: filteredPayments,
        summary: {
          totalInvoices,
          totalAmount,
          paidInvoices,
          unpaidInvoices,
          paidAmount,
          unpaidAmount
        }
      });

    } catch (error) {
      console.error('Error fetching billing data:', error);
      setReportData({ payments: [], summary: {} });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, selectedClient]);

  const handleGenerateReport = () => {
    fetchBillingData();
  };

  const handleReset = () => {
    setStartDate(Moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD'));
    setEndDate(Moment(new Date()).format('YYYY-MM-DD'));
    setSelectedClient(null);
    setReportData(null);
  };

  const formatAmount = (amount) => {
    return helperFunctions.formatCurrency(amount, currencySign);
  };

  const headerInfo = reportData ? {
    'Report Period': `${Moment(startDate).format('MMM DD, YYYY')} - ${Moment(endDate).format('MMM DD, YYYY')}`,
    'Generated On': Moment().format('MMM DD, YYYY HH:mm'),
    'Total Invoices': reportData.summary.totalInvoices || 0,
    'Total Amount': formatAmount(reportData.summary.totalAmount || 0)
  } : null;

  return (
    <>
      {/* Filter Section */}
      <Paper p="md" mb="lg" withBorder>
        <Stack spacing="md">
          <Text size="lg" weight={600}>Report Filters</Text>
          
          <Grid>
            <Grid.Col span={12} sm={6} md={3}>
              <TextInput
                label="Start Date"
                placeholder="Select start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid.Col>
            
            <Grid.Col span={12} sm={6} md={3}>
              <TextInput
                label="End Date"
                placeholder="Select end date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid.Col>
            
            <Grid.Col span={12} sm={6} md={3}>
              <Select
                label="Client (Optional)"
                placeholder="All Clients"
                value={selectedClient}
                onChange={setSelectedClient}
                data={clients}
                clearable
                searchable
              />
            </Grid.Col>

            <Grid.Col span={12} sm={6} md={3} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Group spacing="xs" style={{ width: '100%' }}>
                <Button
                  leftIcon={<IconFilter size={16} />}
                  onClick={handleGenerateReport}
                  style={{ flex: 1 }}
                >
                  Generate
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<IconRefresh size={16} />}
                  onClick={handleReset}
                  style={{ flex: 1 }}
                >
                  Reset
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      {/* Report Content */}
      {isLoading && <LoadingOverlay visible={true} />}
      
      {reportData && !isLoading && (
        <ReportLayout
          title="Billing Invoice Report"
          reportType="billing"
          headerInfo={headerInfo}
        >
          {/* Summary Cards */}
          <div className="grid">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="stat-label">Total Invoices</div>
              <div className="stat-value">{reportData.summary.totalInvoices}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <div className="stat-label">Total Amount</div>
              <div className="stat-value">{formatAmount(reportData.summary.totalAmount)}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <div className="stat-label">Paid Invoices</div>
              <div className="stat-value">{reportData.summary.paidInvoices}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <div className="stat-label">Unpaid Invoices</div>
              <div className="stat-value">{reportData.summary.unpaidInvoices}</div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="section-title">Invoice Details</div>
          
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.id}</td>
                  <td>{payment.clientName || '-'}</td>
                  <td>{Moment(payment.date).format('MMM DD, YYYY')}</td>
                  <td>{payment.dueDate ? Moment(payment.dueDate).format('MMM DD, YYYY') : '-'}</td>
                  <td style={{ fontWeight: 600 }}>{formatAmount(payment.totalAmount)}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: payment.isPaid ? '#d3f9d8' : '#ffe3e3',
                      color: payment.isPaid ? '#2f9e44' : '#c92a2a'
                    }}>
                      {payment.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {reportData.payments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#868e96' }}>
              <Text>No invoices found for the selected period</Text>
            </div>
          )}

          {/* Summary Section */}
          <div className="section-title">Financial Summary</div>
          <div className="card">
            <table style={{ margin: 0 }}>
              <tbody>
                <tr>
                  <td style={{ border: 'none', fontWeight: 600 }}>Paid Amount:</td>
                  <td style={{ border: 'none', textAlign: 'right', color: '#2f9e44', fontWeight: 600 }}>
                    {formatAmount(reportData.summary.paidAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: 'none', fontWeight: 600 }}>Unpaid Amount:</td>
                  <td style={{ border: 'none', textAlign: 'right', color: '#c92a2a', fontWeight: 600 }}>
                    {formatAmount(reportData.summary.unpaidAmount)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: 'none', fontWeight: 700, fontSize: '18px' }}>Total:</td>
                  <td style={{ border: 'none', textAlign: 'right', fontWeight: 700, fontSize: '18px' }}>
                    {formatAmount(reportData.summary.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ReportLayout>
      )}

      {!reportData && !isLoading && (
        <Paper p="xl" style={{ textAlign: 'center' }}>
          <Text size="lg" color="dimmed">
            Configure filters above and click "Generate" to create your billing report
          </Text>
        </Paper>
      )}
    </>
  );
}

