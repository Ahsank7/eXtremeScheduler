import React, { useRef } from 'react';
import { Button, Group, Paper, Text, Divider, Stack } from '@mantine/core';
import { IconDownload, IconPrinter } from '@tabler/icons';

/**
 * ReportLayout Component
 * Provides a standardized A4-sized layout for all reports with download and print functionality
 * 
 * @param {Object} props
 * @param {string} props.title - Report title
 * @param {ReactNode} props.children - Report content
 * @param {string} props.reportType - Type of report (for filename)
 * @param {Object} props.headerInfo - Additional header information
 * @param {ReactNode} props.customActions - Custom action buttons
 */
export default function ReportLayout({ 
  title, 
  children, 
  reportType = 'report',
  headerInfo = null,
  customActions = null 
}) {

  const handleDownloadPDF = () => {
    // Create a new window with the report content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to download the report');
      return;
    }

    const reportContent = document.getElementById('report-content').innerHTML;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @page {
              size: A4;
              margin: 0;
            }

            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }

              .no-print {
                display: none !important;
              }

              body {
                margin: 0;
                padding: 0;
              }
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }

            .a4-container {
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }

            .report-header {
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #228be6;
            }

            .report-title {
              font-size: 28px;
              font-weight: 700;
              color: #1a1a1a;
              margin-bottom: 10px;
            }

            .report-subtitle {
              font-size: 14px;
              color: #666;
            }

            .report-meta {
              margin-top: 15px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 15px;
            }

            .meta-item {
              display: flex;
              flex-direction: column;
            }

            .meta-label {
              font-size: 12px;
              color: #868e96;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }

            .meta-value {
              font-size: 14px;
              font-weight: 600;
              color: #1a1a1a;
            }

            .report-content {
              margin-top: 30px;
            }

            .print-button {
              background: #228be6;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 8px;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 8px;
              margin: 30px auto;
              transition: background 0.2s;
            }

            .print-button:hover {
              background: #1c7ed6;
            }

            .print-instructions {
              background: #e7f5ff;
              border: 1px solid #339af0;
              border-radius: 8px;
              padding: 20px;
              margin-top: 20px;
            }

            .print-instructions p {
              margin: 8px 0;
              color: #1864ab;
            }

            .print-instructions strong {
              color: #1864ab;
              font-weight: 700;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }

            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #dee2e6;
            }

            th {
              background: #f8f9fa;
              font-weight: 600;
              color: #495057;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }

            tr:hover {
              background: #f8f9fa;
            }

            .section-title {
              font-size: 20px;
              font-weight: 600;
              color: #1a1a1a;
              margin: 30px 0 15px 0;
              padding-bottom: 10px;
              border-bottom: 2px solid #e9ecef;
            }

            .card {
              background: #fff;
              border: 1px solid #dee2e6;
              border-radius: 8px;
              padding: 20px;
              margin: 15px 0;
            }

            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 20px 0;
            }

            .stat-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }

            .stat-value {
              font-size: 32px;
              font-weight: 700;
              margin: 10px 0;
            }

            .stat-label {
              font-size: 14px;
              opacity: 0.9;
            }
          </style>
        </head>
        <body>
          <div class="a4-container">
            ${reportContent}
          </div>
          
          <div class="no-print">
            <button class="print-button" onclick="window.print()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9V2h12v7"></path>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <path d="M6 14h12v8H6z"></path>
              </svg>
              Print / Save as PDF
            </button>
            <div class="print-instructions">
              <p><strong>How to Download as PDF:</strong></p>
              <p>1. Click the "Print / Save as PDF" button above</p>
              <p>2. In the print dialog, select "Save as PDF" as the destination</p>
              <p>3. Ensure paper size is set to A4 (210 x 297 mm)</p>
              <p>4. Set margins to "Default" or "Minimum" for best results</p>
              <p>5. Click "Save" to download your PDF report</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div>
      {/* Action Buttons */}
      <Paper p="md" mb="lg" withBorder>
        <Group position="apart">
          <div>
            <Text size="sm" color="dimmed" mb={4}>
              Report Actions
            </Text>
            <Text size="xs" color="dimmed">
              Download or print your report in A4 format
            </Text>
          </div>
          <Group>
            {customActions}
            <Button
              variant="filled"
              color="blue"
              leftIcon={<IconDownload size={16} />}
              onClick={handleDownloadPDF}
            >
              Download as PDF
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Report Preview Container */}
      <Paper 
        shadow="md" 
        p={0}
        style={{
          maxWidth: '210mm',
          margin: '0 auto',
          background: 'white'
        }}
      >
        {/* This is the content that will be captured for PDF */}
        <div id="report-content">
          <div className="report-header">
            <div className="report-title">{title}</div>
            {headerInfo && (
              <div className="report-meta">
                {Object.entries(headerInfo).map(([key, value]) => (
                  <div key={key} className="meta-item">
                    <span className="meta-label">{key}</span>
                    <span className="meta-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="report-content">
            {children}
          </div>
        </div>
      </Paper>
    </div>
  );
}

