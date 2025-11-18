import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Title, 
  Text, 
  Grid, 
  Group, 
  Stack,
  Button,
  Badge,
  ActionIcon,
  Paper
} from '@mantine/core';
import { 
  IconFileInvoice, 
  IconCash, 
  IconChartBar,
  IconCalendar,
  IconUsers,
  IconClock,
  IconFileText,
  IconArrowRight
} from '@tabler/icons';
import { AppContainer } from 'shared/components';
import BillingReport from '../components/BillingReport';
import PayrollReport from '../components/PayrollReport';
import TaskSummaryReport from '../components/TaskSummaryReport';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportConfig, setReportConfig] = useState(null);

  // Available report types
  const reportTypes = [
    {
      id: 'billing',
      title: 'Billing Invoice Report',
      description: 'Generate comprehensive billing reports for clients with detailed invoices',
      icon: IconFileInvoice,
      color: 'blue',
      badge: 'Financial',
      component: BillingReport
    },
    {
      id: 'payroll',
      title: 'Payroll Report',
      description: 'Generate detailed payroll reports for service providers with wage breakdowns',
      icon: IconCash,
      color: 'green',
      badge: 'Financial',
      component: PayrollReport
    },
    {
      id: 'task-summary',
      title: 'Task Summary Report',
      description: 'Overview of tasks completed, pending, and scheduled with detailed statistics',
      icon: IconChartBar,
      color: 'violet',
      badge: 'Operations',
      component: TaskSummaryReport
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Track service provider attendance, check-ins, and working hours',
      icon: IconClock,
      color: 'orange',
      badge: 'Operations',
      status: 'Coming Soon'
    },
    {
      id: 'client-summary',
      title: 'Client Summary Report',
      description: 'Detailed overview of client activities, services, and transaction history',
      icon: IconUsers,
      color: 'teal',
      badge: 'Analytics',
      status: 'Coming Soon'
    },
    {
      id: 'monthly-summary',
      title: 'Monthly Summary Report',
      description: 'Comprehensive monthly business overview with key metrics and insights',
      icon: IconCalendar,
      color: 'pink',
      badge: 'Analytics',
      status: 'Coming Soon'
    }
  ];

  const handleSelectReport = (report) => {
    if (report.status === 'Coming Soon') {
      return; // Don't allow selection of coming soon reports
    }
    setSelectedReport(report);
    setReportConfig({});
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setReportConfig(null);
  };

  // If a report is selected, render it
  if (selectedReport && selectedReport.component) {
    const ReportComponent = selectedReport.component;
    return (
      <AppContainer
        title={selectedReport.title}
        button={
          <Button
            variant="outline"
            onClick={handleBackToList}
            leftIcon={<IconArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
          >
            Back to Reports
          </Button>
        }
        showDivider={true}
      >
        <ReportComponent config={reportConfig} />
      </AppContainer>
    );
  }

  // Report selection view
  return (
    <AppContainer
      title="Reports"
      showDivider={true}
    >
      <Container size="xl" px={0}>
        <Paper p="md" mb="xl" withBorder radius="md" style={{ backgroundColor: '#f8f9fa' }}>
          <Group>
            <IconFileText size={24} color="#228be6" />
            <div>
              <Text size="lg" weight={600} color="dark">
                Select a Report Type
              </Text>
              <Text size="sm" color="dimmed">
                Choose from the available report types below to generate comprehensive A4-sized reports with download capabilities
              </Text>
            </div>
          </Group>
        </Paper>

        <Grid gutter="lg">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isComingSoon = report.status === 'Coming Soon';
            
            return (
              <Grid.Col key={report.id} span={12} sm={6} md={4}>
                <Card
                  shadow="sm"
                  p="lg"
                  radius="md"
                  withBorder
                  style={{
                    height: '100%',
                    cursor: isComingSoon ? 'not-allowed' : 'pointer',
                    opacity: isComingSoon ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    border: `2px solid ${isComingSoon ? '#dee2e6' : 'transparent'}`,
                  }}
                  onClick={() => handleSelectReport(report)}
                  sx={(theme) => ({
                    '&:hover': {
                      transform: isComingSoon ? 'none' : 'translateY(-4px)',
                      boxShadow: isComingSoon ? 'sm' : 'lg',
                      borderColor: isComingSoon ? '#dee2e6' : theme.colors[report.color][5],
                    }
                  })}
                >
                  <Stack spacing="md">
                    <Group position="apart">
                      <ActionIcon
                        size="xl"
                        radius="md"
                        variant="light"
                        color={report.color}
                        style={{ pointerEvents: 'none' }}
                      >
                        <Icon size={28} />
                      </ActionIcon>
                      <Badge color={report.color} variant="light">
                        {report.badge}
                      </Badge>
                    </Group>

                    <div>
                      <Title order={4} mb={4}>
                        {report.title}
                      </Title>
                      <Text size="sm" color="dimmed" lineClamp={3}>
                        {report.description}
                      </Text>
                    </div>

                    {isComingSoon ? (
                      <Badge 
                        color="gray" 
                        variant="filled" 
                        fullWidth 
                        size="lg"
                        style={{ marginTop: 'auto' }}
                      >
                        Coming Soon
                      </Badge>
                    ) : (
                      <Button
                        variant="light"
                        color={report.color}
                        fullWidth
                        rightIcon={<IconArrowRight size={16} />}
                        style={{ marginTop: 'auto' }}
                      >
                        Generate Report
                      </Button>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>
    </AppContainer>
  );
}

