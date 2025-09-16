import React, { useState, useEffect } from 'react';
import { Modal, Button, Text, Group, Pagination, LoadingOverlay } from '@mantine/core';
import { IconDownload, IconX } from '@tabler/icons';
import { AppTable } from 'shared/components';

const PreviewModal = ({ 
  opened, 
  onClose, 
  title, 
  data, 
  loading, 
  columns, 
  pageSize = 15,
  totalRecords = 0,
  currentPage = 1,
  onPageChange,
  onGenerate 
}) => {
  const downloadToExcel = () => {
    if (!data || data.length === 0) return;

    // Create CSV content
    const headers = columns.map(col => col.label).join(',');
    const rows = data.map(item => 
      columns.map(col => {
        const value = item[col.key];
        // Handle special cases like dates and numbers
        if (col.key === 'taskDate') {
          return new Date(value).toLocaleDateString();
        }
        if (col.key === 'billingAmount' || col.key === 'wageAmount') {
          return parseFloat(value).toFixed(2);
        }
        return value || '';
      }).join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title}_Preview_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate();
    }
    onClose();
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="xl"
      closeButtonProps={{ icon: <IconX size={16} /> }}
    >
      <div style={{ position: 'relative', minHeight: '400px' }}>
        <LoadingOverlay visible={loading} />
        
        {data && data.length > 0 && (
          <>
            <Group position="apart" mb="md">
              <Text size="sm" color="dimmed">
                {totalRecords} record(s) will be affected
              </Text>
              <Button
                leftIcon={<IconDownload size={16} />}
                onClick={downloadToExcel}
                variant="outline"
                size="sm"
              >
                Download Excel (CSV)
              </Button>
            </Group>

            <AppTable
              thead={columns.map(col => col.label)}
              currentPage={currentPage}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPagination={onPageChange}
              showPagination={false}
            >
              {data.map((item, index) => (
                <tr key={index}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </AppTable>

            {totalPages > 1 && (
              <Group position="center" mt="md">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={onPageChange}
                  size="sm"
                />
              </Group>
            )}
          </>
        )}

        {data && data.length === 0 && (
          <Text align="center" color="dimmed" py="xl">
            No records found for the selected date range.
          </Text>
        )}

        <Group position="right" mt="xl">
          {data && data.length > 0 && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} color="green">
                Generate {title}
              </Button>
            </>
          )}
          {(!data || data.length === 0) && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </Group>
      </div>
    </Modal>
  );
};

export default PreviewModal; 