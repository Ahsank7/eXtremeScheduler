import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Grid, 
  Paper, 
  Table, 
  Text, 
  Title, 
  Group, 
  Divider, 
  Card, 
  Stack,
  LoadingOverlay,
  Button
} from '@mantine/core';
import { localStoreService, organizationService, paymentService, profileService } from "core/services";
import { helperFunctions } from "shared/utils";
import Moment from 'moment';
import { IconFileText } from '@tabler/icons';

export default function PaymentReport({ info, type }) {
  const [organizationInfo, setOrganizationInfo] = useState(null);
  const [listData, setListData] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currencySign, setCurrencySign] = useState('$');

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch currency sign
        await fetchCurrencySign();
        
        // Fetch organization info
        const orgResponse = await organizationService.getOrganizationById(localStoreService.getOrganizationID());
        if (orgResponse.isSuccess) {
          setOrganizationInfo(orgResponse.data);
        }

        // Fetch list data
        const request = {
          sortColumn: "id",
          sortType: "desc",
          pageNumber: 1,
          pageSize: 100,
        };

        let dataList = [];
        if (type === 'billing') {
          request.billingId = info.id;
          const response = await paymentService.getBillingInfoList(request);
          dataList = response.response || [];
        } else if (type === 'wage') {
          request.wageId = info.id;
          const response = await paymentService.getWageInfoList(request);
          dataList = response.response || [];
        }
        setListData(dataList);

        // Fetch user info
        let userId = type === 'wage' ? info.serviceProviderId : info.clientId;
        if (userId) {
          const userResponse = await profileService.getUserByID(userId);
          if (userResponse.isSuccess) {
            setUserInfo(userResponse.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (info?.id) {
      fetchData();
    }
  }, [info?.id, type]);

  const formatAmount = (amount) => {
    return helperFunctions.formatCurrency(amount, currencySign);
  };

  const openAsA4 = () => {
    // Create a new window with A4 styling
    const printWindow = window.open('', '_blank');
    
    // Generate the HTML content with professional A4 styling
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${type === 'billing' ? 'Invoice' : 'Payroll'} Report - A4</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.4;
              color: #333;
              background: white;
            }
            
            .header {
              background: linear-gradient(135deg, #2A5DAA 0%, #1e4a8a 100%);
              color: white;
              padding: 30px;
              margin-bottom: 30px;
              border-radius: 8px 8px 0 0;
            }
            
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .header-left {
              display: flex;
              align-items: center;
              gap: 20px;
            }
            
            .header-icon {
              width: 60px;
              height: 60px;
              background: rgba(255,255,255,0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            
            .header-title {
              font-size: 32px;
              font-weight: bold;
              margin: 0;
            }
            
            .header-right {
              text-align: right;
            }
            
            .company-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            
            .company-address {
              font-size: 14px;
              line-height: 1.6;
            }
            
            .main-content {
              padding: 0 30px 30px 30px;
            }
            
            .billing-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            
            .bill-to {
              flex: 1;
            }
            
            .bill-to-label {
              font-size: 16px;
              font-weight: bold;
              color: #2A5DAA;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            
            .client-details {
              font-size: 14px;
              line-height: 1.8;
            }
            
            .client-name {
              font-weight: bold;
              font-size: 16px;
              color: #333;
            }
            
            .invoice-details {
              text-align: right;
              flex: 1;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              min-width: 200px;
            }
            
            .detail-label {
              font-weight: bold;
              color: #666;
            }
            
            .detail-value {
              color: #333;
              font-weight: 600;
            }
            
            .divider {
              height: 2px;
              background: #e0e0e0;
              margin: 30px 0;
            }
            
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            
            .items-table th {
              background-color: #f8f9fa;
              border-bottom: 2px solid #2A5DAA;
              padding: 15px 10px;
              text-align: left;
              font-weight: bold;
              color: #333;
              font-size: 14px;
              text-transform: uppercase;
            }
            
            .items-table td {
              padding: 15px 10px;
              border-bottom: 1px solid #e0e0e0;
              font-size: 13px;
            }
            
            .items-table .item-name {
              text-align: left;
              font-weight: 600;
              color: #2A5DAA;
            }
            
            .items-table .quantity {
              text-align: left;
            }
            
            .items-table .price {
              text-align: left;
            }
            
            .items-table .tax {
              text-align: left;
            }
            
            .items-table .amount {
              text-align: left;
              font-weight: 600;
            }
            
            .footer {
              display: flex;
              justify-content: space-between;
              margin-top: 30px;
            }
            
            .notes-section {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-right: 20px;
            }
            
            .notes-label {
              font-size: 16px;
              font-weight: bold;
              color: #2A5DAA;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            
            .notes-text {
              font-size: 13px;
              line-height: 1.6;
              color: #666;
            }
            
            .total-section {
              flex: 1;
              margin-top: 30px;
              border-top: 2px solid #2A5DAA;
              padding-top: 20px;
            }
            
            .subtotal-section {
              margin-bottom: 20px;
            }
            
            .subtotal-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              font-size: 14px;
            }
            
            .subtotal-label {
              font-weight: 500;
              color: #555;
            }
            
            .subtotal-value {
              font-weight: 600;
              color: #333;
            }
            
            .subtotal-value.discount {
              color: #dc3545;
            }
            
            .subtotal-value.tax {
              color: #28a745;
            }
            
            .final-total {
              border-top: 1px solid #e0e0e0;
              padding-top: 15px;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 0;
            }
            
            .total-label {
              font-size: 18px;
              font-weight: bold;
              color: #2A5DAA;
              text-transform: uppercase;
            }
            
            .total-value {
              font-size: 20px;
              font-weight: bold;
              color: #2A5DAA;
            }
            
            .due-date-warning {
              background: #ffebee;
              border: 1px solid #f44336;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            
            .due-date-label {
              font-size: 14px;
              color: #d32f2f;
              font-weight: bold;
              text-transform: uppercase;
              margin-bottom: 10px;
            }
            
            .due-date-value {
              font-size: 20px;
              color: #d32f2f;
              font-weight: bold;
            }
            
            .no-print {
              margin-top: 50px;
              text-align: center;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            
            .print-button {
              padding: 15px 30px;
              font-size: 16px;
              background: #2A5DAA;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: bold;
              margin-bottom: 15px;
            }
            
            .print-button:hover {
              background: #1e4a8a;
            }
            
            .print-instructions {
              color: #666;
              font-size: 14px;
              line-height: 1.6;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0;
              }
              
              .no-print {
                display: none;
              }
              
              .header {
                border-radius: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-content">
              <div class="header-left">
                <div class="header-icon">
                  ${type === 'billing' ? '📄' : '💰'}
                </div>
                <h1 class="header-title">${type === 'billing' ? 'INVOICE' : 'PAYROLL'}</h1>
              </div>
              <div class="header-right">
                <div class="company-name">${organizationInfo?.name || 'Your Company Name'}</div>
                <div class="company-address">
                  ${organizationInfo?.completeAddress || 'Your Business Address'}<br>
                  ${organizationInfo?.contactNo || 'City, Country'}<br>
                  ${organizationInfo?.email || 'Postal Code'}
                </div>
              </div>
            </div>
          </div>
          
          <div class="main-content">
            ${type !== 'wage' && info.DueDate ? `
              <div class="due-date-warning">
                <div class="due-date-label">Payment Due Date</div>
                <div class="due-date-value">${Moment(info.DueDate).format('MMMM DD, YYYY')}</div>
              </div>
            ` : ''}
            
            <div class="billing-section">
              <div class="bill-to">
                <div class="bill-to-label">Bill To:</div>
                <div class="client-details">
                  <div class="client-name">${userInfo ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}` : (type === 'billing' ? 'Client Company Name' : 'Service Provider Name')}</div>
                  <div>${userInfo?.addressLine1 || 'Address Line 1'}</div>
                  <div>${userInfo?.phoneNo || 'City, Country'}</div>
                  <div>${userInfo?.email || 'Postal Code'}</div>
                </div>
              </div>
              
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">${type === 'billing' ? 'INVOICE #' : 'PAYROLL #'}:</span>
                  <span class="detail-value">${info.id}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">DATE:</span>
                  <span class="detail-value">${info.date ? Moment(info.date).format('MM/DD/YY') : 'N/A'}</span>
                </div>
                ${type !== 'wage' && info.DueDate ? `
                  <div class="detail-row">
                    <span class="detail-label">INVOICE DUE DATE:</span>
                    <span class="detail-value">${Moment(info.DueDate).format('MM/DD/YY')}</span>
                  </div>
                ` : ''}
              </div>
            </div>
            
            <div class="divider"></div>
            
            <table class="items-table">
              <thead>
                <tr>
                  <th>ITEMS</th>
                  <th>QUANTITY</th>
                  <th>PRICE</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                ${listData && listData.length > 0 ? listData.map(item => `
                  <tr>
                    <td class="item-name">${item.serviceType || 'Service'}</td>
                    <td class="quantity">${item.qty || '1'}</td>
                    <td class="price">${formatAmount(item.rate)}</td>
                    <td class="amount">${formatAmount(item.amount)}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td class="item-name">${type === 'billing' ? 'Service 1' : 'Work Hours'}</td>
                    <td class="quantity">1</td>
                    <td class="price">${formatAmount(info.totalAmount)}</td>
                    <td class="amount">${formatAmount(info.totalAmount)}</td>
                  </tr>
                `}
               
              </tbody>
            </table>
            
            <div class="footer">
              <div class="notes-section">
                <div class="notes-label">Notes:</div>
                <div class="notes-text">
                  ${type === 'billing' ? 
                    'Thank you for your business. Please ensure payment is received by the due date. For any questions regarding this invoice, please contact our billing department.' : 
                    'This payroll report reflects the total hours worked and compensation earned for the specified period. Please review and confirm the details.'
                  }
                </div>
              </div>
              
              
              <div class="total-section">
                <div class="subtotal-section">
                  <div class="subtotal-row">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="subtotal-value">${formatAmount(info.totalAmount)}</span>
                  </div>
                  ${type !== 'wage' && info.discountPercentage ? `
                    <div class="subtotal-row">
                      <span class="subtotal-label">Discount (${info.discountPercentage}%):</span>
                      <span class="subtotal-value discount">-${formatAmount((info.totalAmount * info.discountPercentage) / 100)}</span>
                    </div>
                  ` : ''}
                  ${type !== 'wage' && info.taxPercentage ? `
                    <div class="subtotal-row">
                      <span class="subtotal-label">Tax (${info.taxPercentage}%):</span>
                      <span class="subtotal-value tax">${formatAmount((info.amountAfterDiscount * info.taxPercentage) / 100)}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="final-total">
                  <div class="total-row">
                    <span class="total-label">Total:</span>
                    <span class="total-value">${formatAmount(type !== 'wage' ? info.amountAfterTax : info.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="no-print">
            <button class="print-button" onclick="window.print()">
              Print / Save as PDF
            </button>
            <div class="print-instructions">
              <p><strong>Instructions:</strong></p>
              <p>1. Click the button above to open the print dialog</p>
              <p>2. Select "Save as PDF" as the destination</p>
              <p>3. Choose A4 paper size</p>
              <p>4. Set margins to "Minimum" or "None" for best results</p>
              <p>5. Click "Save" to download your PDF</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
  };

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  if (!info) {
    return (
      <Container size="lg" py="xl">
        <Text align="center" color="dimmed">No payment information available</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      {/* Header Info */}
      <Card shadow="sm" p="md" mb="lg" withBorder>
        <Group position="apart">
          <div>
            <Title order={4} color="dark">
              {type === 'wage' ? 'Payroll Report' : 'Invoice Report'}
            </Title>
            <Text size="sm" color="dimmed">
              {type === 'wage' ? 'Payroll' : 'Invoice'} #{info.id} - {Moment(info.date).format('MMM DD, YYYY')}
            </Text>
          </div>
          <Group>
            <Button
              variant="outline"
              leftIcon={<IconFileText size={16} />}
              onClick={openAsA4}
              size="sm"
              title="Open as A4 format for printing/PDF"
            >
              Download
            </Button>
            {type !== 'wage' && info.DueDate && (
              <div style={{ textAlign: 'right' }}>
                <Text size="sm" color="dimmed">Payment Due-Date</Text>
                <Text size="lg" weight={600} color="red">
                  {Moment(info.DueDate).format('MMM DD, YYYY')}
                </Text>
              </div>
            )}
          </Group>
        </Group>
      </Card>

      <Grid gutter="lg">
        {/* Sidebar */}
        <Grid.Col span={3}>
          <Card shadow="sm" p="lg" withBorder style={{ background: 'linear-gradient(135deg, #2A5DAA 0%, #1e4a8a 100%)', color: 'white' }}>
            <Stack spacing="md" align="center">
              <Title order={2} style={{ color: 'white', textAlign: 'center' }}>
                {type === 'wage' ? 'PAYROLL' : 'INVOICE'}
              </Title>
              
              {organizationInfo && (
                <Paper radius="md" shadow="sm" p="md" style={{ background: 'rgba(255,255,255,0.9)', color: '#333', width: '100%' }}>
                  <Text weight={600} size="sm" align="center" color="dark">
                    {organizationInfo.name}
                  </Text>
                </Paper>
              )}
              
              {organizationInfo && (
                <Stack spacing="xs" align="center">
                  <Text size="sm" align="center">{organizationInfo.completeAddress}</Text>
                  <Text size="sm" align="center">{organizationInfo.contactNo}</Text>
                  <Text size="sm" align="center">{organizationInfo.email}</Text>
                  {organizationInfo.webSite && (
                    <Text size="sm" align="center">{organizationInfo.webSite}</Text>
                  )}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Main Content */}
        <Grid.Col span={9}>
          <Stack spacing="lg">
            {/* Header Info */}
            <Card shadow="sm" p="md" withBorder>
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">Date</Text>
                  <Text weight={600}>{Moment(info.date).format('MMM DD, YYYY')}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" color="dimmed">{type === 'wage' ? 'Payroll No' : 'Invoice No'}</Text>
                  <Text weight={600} color="blue">#{info.id}</Text>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Client/Service Provider Info */}
            <Card shadow="sm" p="md" withBorder>
            <Grid>
            <Grid.Col span={6}>
               <Title order={5} mb="md">TO:</Title>
              {userInfo ? (
                <Stack spacing="xs">
                  <Text size="lg" weight={600}>{userInfo.firstName} {userInfo.lastName}  ({userInfo.userNo})</Text>
                  <Text size="sm">{userInfo.phoneNo}</Text>
                  <Text size="sm">{userInfo.email}</Text>
                  <Text size="sm">{userInfo.addressLine1}</Text>
                </Stack>
              ) : (
                <Text color="dimmed">User information not available</Text>
              )}
              </Grid.Col>
              <Grid.Col span={6}>
                  <Stack spacing="xs" align="flex-end">
                    <Text size="lg" weight={700} color="dark">
                      Subtotal: {formatAmount(info.totalAmount)}
                    </Text>
                    
                    {type !== 'wage' && (
                      <>
                        <Text size="sm">
                          Discount Rate: {info.discountPercentage || 0}%
                        </Text>
                        <Text size="sm">
                          Discounted Amount: {formatAmount(info.amountAfterDiscount)}
                        </Text>
                        <Text size="sm">
                          Tax Rate: {info.taxPercentage || 0}%
                        </Text>
                        <Text size="lg" weight={700} color="red">
                          Balance Due: {formatAmount(info.amountAfterTax)}
                        </Text>
                      </>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>

            {/* Services Table */}
            <Card shadow="sm" p="md" withBorder>
              <Table striped highlightOnHover withBorder>
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Service Type</th>
                    <th style={{ width: '15%' }}>Qty/hrs</th>
                    <th style={{ width: '15%' }}>Rate (Per Hour)</th>
                    <th style={{ width: '20%', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {listData && listData.length > 0 ? (
                    listData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Text weight={500}>{item.serviceType || '-'}</Text>
                        </td>
                        <td>{item.qty || '-'}</td>
                        <td>{formatAmount(item.rate)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <Text weight={600}>{formatAmount(item.amount)}</Text>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Text align="center" color="dimmed" py="md">
                          No service details available
                        </Text>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>

          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
