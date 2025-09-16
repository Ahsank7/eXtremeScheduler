import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Button,
  Select,
  Paper,
  NumberInput,
  TextInput,
  LoadingOverlay,
  Alert,
} from "@mantine/core";
import { AppContainer } from "shared/components";
import AppSimpleCard from "../components/AppSimpleCard";
import { 
  IconNotes, 
  IconUsers, 
  IconUserCheck, 
  IconCashBanknote, 
  IconReceipt, 
  IconRefresh,
  IconCalendar,
  IconChartPie,
  IconChartLine,
  IconChartBar
} from "@tabler/icons";
import { franchiseDashboardService } from "core/services/franchiseDashboardService";
import { localStoreService } from "core/services";
import { useParams } from "react-router-dom";
import { usePermissions } from "core/context/PermissionContext";

// Chart.js imports
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import { 
  Chart, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  Title as ChartTitle, 
  Tooltip, 
  Legend,
  ArcElement
} from "chart.js";

Chart.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ChartTitle, 
  Tooltip, 
  Legend,
  ArcElement
);

const FranchiseDashboard = () => {
  const { franchiseName } = useParams();
  const { loading: permissionsLoading, userInfo } = usePermissions();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!userInfo || !userInfo.UserID) {
        setError("User not authenticated. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Get franchise ID from local storage or use organization ID as fallback
      let franchiseId = localStoreService.getFranchiseID();
      if (!franchiseId) {
        franchiseId = localStoreService.getOrganizationID();
        if (!franchiseId) {
          setError("No franchise or organization ID found. Please log in again.");
          setLoading(false);
          return;
        }
      }
      
      console.log('Fetching dashboard data for franchise:', franchiseId);
      console.log('Date range:', filters.startDate, 'to', filters.endDate);
      
      const response = await franchiseDashboardService.getFranchiseDashboardData(
        franchiseId,
        filters.startDate,
        filters.endDate
      );

      if (response.isSuccess) {
        setDashboardData(response.data);
        console.log('Dashboard data loaded successfully:', response.data);
        console.log('Stats object:', response.data.stats);
        console.log('Service task statuses (popular services):', response.data.serviceTaskStatuses);
        console.log('Service task statuses colors:', response.data.serviceTaskStatuses?.map(s => ({ status: s.taskStatus, color: s.color, count: s.count })));
        console.log('Service types:', response.data.serviceTypes);
        console.log('Task status distribution:', response.data.taskStatusDistribution);
        console.log('Billing trend:', response.data.billingTrend);
        console.log('Wage trend:', response.data.wageTrend);
        console.log('Billing summary:', response.data.billingSummary);
        console.log('Wage summary:', response.data.wageSummary);
      } else {
        setError(response.message || "Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to view this dashboard.");
      } else {
        setError("An error occurred while fetching dashboard data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!permissionsLoading && userInfo) {
      fetchDashboardData();
    }
  }, [filters, permissionsLoading, userInfo]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    });
  };

  // Chart configurations
  const popularServicesChartData = {
    labels: dashboardData?.popularServices?.map(s => s.serviceType) || [],
    datasets: [{
      label: "Service Requests",
      data: dashboardData?.popularServices?.map(s => s.count) || [],
      backgroundColor: [
        "#228be6", "#40c057", "#fab005", "#fa5252", "#845ef7",
        "#15aabf", "#fd7e14", "#6f42c1", "#e83e8c", "#20c997"
      ],
      borderRadius: 6,
    }],
  };

  const taskStatusDistributionChartData = {
    labels: dashboardData?.serviceTaskStatuses?.map(s => s.taskStatus) || [],
    datasets: [{
      label: "Task Count",
      data: dashboardData?.serviceTaskStatuses?.map(s => s.count) || [],
      backgroundColor: dashboardData?.serviceTaskStatuses?.map(s => s.color) || [
        "#228be6", "#40c057", "#fab005", "#fa5252", "#845ef7",
        "#15aabf", "#fd7e14", "#6f42c1", "#e83e8c", "#20c997"
      ],
      borderRadius: 6,
    }],
  };

  // Debug logging for chart data
  console.log('Task Status Distribution Chart Data:', {
    labels: taskStatusDistributionChartData.labels,
    data: taskStatusDistributionChartData.datasets[0].data,
    colors: taskStatusDistributionChartData.datasets[0].backgroundColor
  });

  const taskStatusChartData = {
    labels: dashboardData?.taskStatusDistribution?.map(s => s.status) || [],
    datasets: [{
      data: dashboardData?.taskStatusDistribution?.map(s => s.count) || [],
      backgroundColor: dashboardData?.taskStatusDistribution?.map(s => s.color) || [],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const billingTrendChartData = {
    labels: dashboardData?.billingTrend?.map(b => b.month) || [],
    datasets: [{
      label: "Billing Amount",
      data: dashboardData?.billingTrend?.map(b => b.amount) || [],
      fill: false,
      backgroundColor: "#228be6",
      borderColor: "#228be6",
      tension: 0.4,
    }],
  };

  const wageTrendChartData = {
    labels: dashboardData?.wageTrend?.map(w => w.month) || [],
    datasets: [{
      label: "Wage Amount",
      data: dashboardData?.wageTrend?.map(w => w.amount) || [],
      fill: false,
      backgroundColor: "#40c057",
      borderColor: "#40c057",
      tension: 0.4,
    }],
  };

  const billingSummaryChartData = {
    labels: ["Paid", "Unpaid"],
    datasets: [{
      data: [
        dashboardData?.billingSummary?.paidCount || 0,
        dashboardData?.billingSummary?.unpaidCount || 0
      ],
      backgroundColor: ["#40c057", "#fa5252"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const wageSummaryChartData = {
    labels: ["Paid", "Unpaid"],
    datasets: [{
      data: [
        dashboardData?.wageSummary?.paidCount || 0,
        dashboardData?.wageSummary?.unpaidCount || 0
      ],
      backgroundColor: ["#40c057", "#fa5252"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "bottom" },
    },
  };

  if (permissionsLoading || loading) {
    return (
      <AppContainer title="Dashboard" showDivider="true" margionTop="2rem">
        <LoadingOverlay visible={true} />
      </AppContainer>
    );
  }

  if (error) {
    return (
      <AppContainer title="Dashboard" showDivider="true" margionTop="2rem">
        <Alert color="red" title="Error" mb="md">
          {error}
        </Alert>
        <Button onClick={handleRefresh} leftIcon={<IconRefresh size={16} />}>
          Retry
        </Button>
      </AppContainer>
    );
  }

  return (
    <AppContainer title="Dashboard" showDivider="true" margionTop="2rem">
      {/* Filters Section */}
      <Paper p="md" mb="lg" withBorder>
        <Group position="apart" mb="md">
          <Text weight={600} size="lg">Dashboard Filters</Text>
          <Group>
            <Button 
              variant="outline" 
              onClick={handleResetFilters}
              leftIcon={<IconCalendar size={16} />}
            >
              Reset to Current Month
            </Button>
            <Button 
              onClick={handleRefresh}
              leftIcon={<IconRefresh size={16} />}
            >
              Refresh
            </Button>
          </Group>
        </Group>
        
        <Grid>
          <Grid.Col md={4}>
            <TextInput
              label="Start Date"
              type="date"
              value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
              onChange={(event) => {
                const date = event.target.value ? new Date(event.target.value) : null;
                handleFilterChange('startDate', date);
              }}
              placeholder="Select start date"
            />
          </Grid.Col>
          <Grid.Col md={4}>
            <TextInput
              label="End Date"
              type="date"
              value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
              onChange={(event) => {
                const date = event.target.value ? new Date(event.target.value) : null;
                handleFilterChange('endDate', date);
              }}
              placeholder="Select end date"
            />
          </Grid.Col>
          <Grid.Col md={4}>
            <Text size="sm" color="dimmed" mt={28}>
              Showing data from {filters.startDate?.toLocaleDateString()} to {filters.endDate?.toLocaleDateString()}
            </Text>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Stats Section */}
      <Grid mb="lg">
        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Total Clients">
            <Group>
              <ThemeIcon variant="light" size={40} color="blue">
                <IconUsers size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalClients || 0}
                </Text>
                <Text size="xs" color="dimmed">Active Clients</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Service Providers">
            <Group>
              <ThemeIcon variant="light" size={40} color="green">
                <IconUserCheck size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalServiceProviders || 0}
                </Text>
                <Text size="xs" color="dimmed">Active Providers</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Total Staff">
            <Group>
              <ThemeIcon variant="light" size={40} color="violet">
                <IconNotes size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalStaff || 0}
                </Text>
                <Text size="xs" color="dimmed">Active Staff</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Total Tasks">
            <Group>
              <ThemeIcon variant="light" size={40} color="orange">
                <IconChartBar size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalTasks || 0}
                </Text>
                <Text size="xs" color="dimmed">This Period</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Billing Invoices">
            <Group>
              <ThemeIcon variant="light" size={40} color="cyan">
                <IconReceipt size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalBillingInvoices || 0}
                </Text>
                <Text size="xs" color="dimmed">This Period</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        <Grid.Col lg={2} md={4} sm={6}>
          <AppSimpleCard title="Total Wages">
            <Group>
              <ThemeIcon variant="light" size={40} color="red">
                <IconCashBanknote size={20} />
              </ThemeIcon>
              <Stack spacing="0">
                <Text size="xl" weight="bold">
                  {dashboardData?.stats?.totalWages || 0}
                </Text>
                <Text size="xs" color="dimmed">This Period</Text>
              </Stack>
            </Group>
          </AppSimpleCard>
        </Grid.Col>
      </Grid>



      {/* Charts Section */}
      <Grid>
        {/* Popular Services Chart */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Popular Services">
            <Box style={{ height: "300px" }}>
              <Bar
                data={popularServicesChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { display: true, text: "Most Requested Services" },
                  },
                }}
              />
            </Box>
          </AppSimpleCard>
        </Grid.Col>

        {/* Task Status Distribution Chart */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Task Status Distribution">
            <Box style={{ height: "300px" }}>
              <Bar
                data={taskStatusDistributionChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { display: true, text: "Task Status Breakdown" },
                  },
                }}
              />
            </Box>
          </AppSimpleCard>
        </Grid.Col>



        {/* Billing Summary */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Billing Summary">
            <Box style={{ height: "300px" }}>
              <Pie
                data={billingSummaryChartData}
                options={pieChartOptions}
              />
            </Box>
            <Group position="apart" mt="md">
              <Text size="sm">Total: ${dashboardData?.billingSummary?.totalAmount?.toFixed(2) || '0.00'}</Text>
              <Text size="sm" color="green">Paid: ${dashboardData?.billingSummary?.paidAmount?.toFixed(2) || '0.00'}</Text>
              <Text size="sm" color="red">Unpaid: ${dashboardData?.billingSummary?.unpaidAmount?.toFixed(2) || '0.00'}</Text>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        {/* Wage Summary */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Wage Summary">
            <Box style={{ height: "300px" }}>
              <Pie
                data={wageSummaryChartData}
                options={pieChartOptions}
              />
            </Box>
            <Group position="apart" mt="md">
              <Text size="sm">Total: ${dashboardData?.wageSummary?.totalAmount?.toFixed(2) || '0.00'}</Text>
              <Text size="sm" color="green">Paid: ${dashboardData?.wageSummary?.paidAmount?.toFixed(2) || '0.00'}</Text>
              <Text size="sm" color="red">Unpaid: ${dashboardData?.wageSummary?.unpaidAmount?.toFixed(2) || '0.00'}</Text>
            </Group>
          </AppSimpleCard>
        </Grid.Col>

        {/* Billing Trend */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Billing Trend (6 Months)">
            <Box style={{ height: "300px" }}>
              <Line
                data={billingTrendChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { display: true, text: "Monthly Billing Amounts" },
                  },
                }}
              />
            </Box>
          </AppSimpleCard>
        </Grid.Col>

        {/* Wage Trend */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Wage Trend (6 Months)">
            <Box style={{ height: "300px" }}>
              <Line
                data={wageTrendChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { display: true, text: "Monthly Wage Amounts" },
                  },
                }}
              />
            </Box>
          </AppSimpleCard>
        </Grid.Col>

        {/* Task Status Distribution */}
        <Grid.Col lg={6}>
          <AppSimpleCard title="Task Confirmation Distribution">
            <Box style={{ height: "300px" }}>
              <Doughnut
                data={taskStatusChartData}
                options={pieChartOptions}
              />
            </Box>
          </AppSimpleCard>
        </Grid.Col>

      </Grid>
    </AppContainer>
  );
};

export default FranchiseDashboard;
