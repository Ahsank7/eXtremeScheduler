import React, { useState, useEffect } from 'react';
import { Button, Alert, TextInput, Group } from '@mantine/core';
import { IconCalendar, IconReceipt, IconCheck, IconEye } from '@tabler/icons';
import { useParams } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { AppContainer } from 'shared/components';
import { localStoreService, billingService, organizationService } from 'core/services';
import PreviewModal from 'shared/components/PreviewModal';

const GenerateBilling = () => {
  const { franchiseName } = useParams();
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [previewModalOpened, setPreviewModalOpened] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [previewError, setPreviewError] = useState(null);
  const [currencySign, setCurrencySign] = useState('$');
  const pageSize = 15;

  const form = useForm({
    initialValues: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    validate: {
      startDate: (value) => (!value ? 'Start date is required' : null),
      endDate: (value) => (!value ? 'End date is required' : null),
    },
  });

  // Fetch currency sign on component mount
  useEffect(() => {
    const fetchCurrencySign = async () => {
      try {
        const organizationId = localStoreService.getOrganizationID();
        if (organizationId) {
          const currency = await organizationService.getCurrencySign(organizationId);
          setCurrencySign(currency);
        }
      } catch (error) {
        console.error('Error fetching currency sign:', error);
        // Keep default '$' if there's an error
      }
    };

    fetchCurrencySign();
  }, []);

  const handlePreview = async (page = 1) => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await billingService.previewBillingInvoices({
        startDate: form.values.startDate,
        endDate: form.values.endDate,
        organizationId: localStoreService.getOrganizationID(),
        pageNumber: page,
        pageSize: pageSize,
        sortColumn: 'TaskDate',
        sortType: 'ASC'
      });
      setPreviewData(data.response);
      setTotalRecords(data.totalRecords);
      setCurrentPage(page);
      setPreviewModalOpened(true);
    } catch (error) {
      setPreviewError(error.response?.data?.message || error.message || 'Failed to fetch preview data');
      console.error('Preview error:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    await handlePreview(page);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setResult(null);

    try {
      const data = await billingService.generateBillingInvoices({
        startDate: values.startDate,
        endDate: values.endDate,
        organizationId: localStoreService.getOrganizationID(),
      });
      setResult(data);
    } catch (error) {
      setResult({
        isSuccess: false,
        message: 'An error occurred while generating billing invoices',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromPreview = async () => {
    await handleSubmit(form.values);
  };

  const columns = [
    { key: 'recordType', label: 'Type', render: (value) => (
      <span style={{ 
        fontWeight: 'bold',
        color: value === 'Task' ? '#228be6' : '#40c057',
        fontSize: '12px'
      }}>
        {value}
      </span>
    )},
    { key: 'taskId', label: 'Task ID', render: (value) => <span style={{ fontSize: '12px' }}>{value}</span> },
    { key: 'clientName', label: 'Client', render: (value) => <span style={{ fontSize: '12px' }}>{value}</span> },
    { key: 'serviceProviderName', label: 'Service Provider', render: (value) => <span style={{ fontSize: '12px' }}>{value}</span> },
    { key: 'taskDate', label: 'Date', render: (value) => <span style={{ fontSize: '12px' }}>{new Date(value).toLocaleDateString()}</span> },
    { key: 'billingAmount', label: 'Billing Amount', render: (value) => <span style={{ fontSize: '12px' }}>{`${currencySign}${parseFloat(value).toFixed(2)}`}</span> },
    { key: 'expenseType', label: 'Expense Type', render: (value) => <span style={{ fontSize: '12px' }}>{value || '-'}</span> },
    { key: 'expenseAmount', label: 'Expense Amount', render: (value) => <span style={{ fontSize: '12px' }}>{value ? `${currencySign}${parseFloat(value).toFixed(2)}` : '-'}</span> },
  ];

  return (
    <>
      <AppContainer
        title="Generate Billing Invoices"
        icon={<IconReceipt size={24} />}
        showDivider={false}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <TextInput
              label="Start Date"
              placeholder="Select start date"
              type="date"
              value={form.values.startDate}
              onChange={(e) => form.setFieldValue('startDate', e.target.value)}
              icon={<IconCalendar size={16} />}
              required
              error={form.errors.startDate}
            />

            <TextInput
              label="End Date"
              placeholder="Select end date"
              type="date"
              value={form.values.endDate}
              onChange={(e) => form.setFieldValue('endDate', e.target.value)}
              icon={<IconCalendar size={16} />}
              required
              error={form.errors.endDate}
            />
          </div>

          <Group spacing="md" style={{ marginBottom: '20px' }}>
            <Button
              type="button"
              variant="outline"
              leftIcon={<IconEye size={16} />}
              onClick={() => handlePreview(1)}
              loading={previewLoading}
            >
              Preview Records
            </Button>

            <Button
              type="submit"
              loading={loading}
              leftIcon={<IconCheck size={16} />}
            >
              Generate Billing Invoices
            </Button>
          </Group>
        </form>

        {previewError && (
          <Alert
            color="red"
            title="Preview Error"
            mb="md"
          >
            {previewError}
          </Alert>
        )}

        {result && (
          <Alert
            color={result.isSuccess ? 'green' : 'red'}
            title={result.isSuccess ? 'Success' : 'Error'}
            icon={result.isSuccess ? <IconCheck size={16} /> : null}
          >
            {result.message}
            {result.isSuccess && result.generatedInvoices > 0 && (
              <div style={{ marginTop: '10px' }}>
                Generated {result.generatedInvoices} billing invoice(s).
              </div>
            )}
          </Alert>
        )}
      </AppContainer>

      <PreviewModal
        opened={previewModalOpened}
        onClose={() => setPreviewModalOpened(false)}
        title="Billing Invoices"
        data={previewData}
        loading={previewLoading}
        columns={columns}
        pageSize={pageSize}
        totalRecords={totalRecords}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onGenerate={handleGenerateFromPreview}
      />
    </>
  );
};

export default GenerateBilling; 