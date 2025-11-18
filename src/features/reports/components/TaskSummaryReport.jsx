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
import { localStoreService, scheduleService } from 'core/services';
import { helperFunctions } from 'shared/utils';
import Moment from 'moment';
import ReportLayout from './ReportLayout';

export default function TaskSummaryReport({ config }) {
  const [startDate, setStartDate] = useState(Moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(Moment(new Date()).format('YYYY-MM-DD'));
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaskData = useCallback(async () => {
    setIsLoading(true);
    try {
      const franchise = localStoreService.getFranchiseID();
      
      // This is a placeholder - adjust based on your actual API
      const request = {
        franchiseId: franchise,
        startDate: Moment(startDate).format('YYYY-MM-DD'),
        endDate: Moment(endDate).format('YYYY-MM-DD'),
        pageNumber: 1,
        pageSize: 1000,
      };

      // Placeholder for actual task data fetching
      // You would call your actual task service here
      // const result = await scheduleService.getTaskList(request);
      
      // Mock data for demonstration
      const mockTasks = [
        { id: 1, title: 'House Cleaning', client: 'John Doe', serviceProvider: 'Jane Smith', date: new Date(), status: 'Completed', duration: 120 },
        { id: 2, title: 'Garden Maintenance', client: 'Alice Brown', serviceProvider: 'Bob Wilson', date: new Date(), status: 'Completed', duration: 90 },
        { id: 3, title: 'Window Cleaning', client: 'Carol Davis', serviceProvider: 'Dave Miller', date: new Date(), status: 'Pending', duration: 60 },
      ];

      // Calculate summary statistics
      const totalTasks = mockTasks.length;
      const completedTasks = mockTasks.filter(t => t.status === 'Completed').length;
      const pendingTasks = mockTasks.filter(t => t.status === 'Pending').length;
      const cancelledTasks = mockTasks.filter(t => t.status === 'Cancelled').length;
      const totalHours = mockTasks.reduce((sum, t) => sum + (t.duration || 0), 0) / 60;

      setReportData({
        tasks: mockTasks,
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          cancelledTasks,
          totalHours: totalHours.toFixed(2)
        }
      });

    } catch (error) {
      console.error('Error fetching task data:', error);
      setReportData({ tasks: [], summary: {} });
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  const handleGenerateReport = () => {
    fetchTaskData();
  };

  const handleReset = () => {
    setStartDate(Moment(new Date(new Date().getFullYear(), new Date().getMonth(), 1)).format('YYYY-MM-DD'));
    setEndDate(Moment(new Date()).format('YYYY-MM-DD'));
    setReportData(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#d3f9d8', color: '#2f9e44' };
      case 'Pending': return { bg: '#fff3bf', color: '#f59f00' };
      case 'Cancelled': return { bg: '#ffe3e3', color: '#c92a2a' };
      default: return { bg: '#e9ecef', color: '#495057' };
    }
  };

  const headerInfo = reportData ? {
    'Report Period': `${Moment(startDate).format('MMM DD, YYYY')} - ${Moment(endDate).format('MMM DD, YYYY')}`,
    'Generated On': Moment().format('MMM DD, YYYY HH:mm'),
    'Total Tasks': reportData.summary.totalTasks || 0,
    'Total Hours': `${reportData.summary.totalHours || 0} hrs`
  } : null;

  return (
    <>
      {/* Filter Section */}
      <Paper p="md" mb="lg" withBorder>
        <Stack spacing="md">
          <Text size="lg" weight={600}>Report Filters</Text>
          
          <Grid>
            <Grid.Col span={12} sm={6} md={4}>
              <TextInput
                label="Start Date"
                placeholder="Select start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Grid.Col>
            
            <Grid.Col span={12} sm={6} md={4}>
              <TextInput
                label="End Date"
                placeholder="Select end date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Grid.Col>

            <Grid.Col span={12} sm={6} md={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
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
          title="Task Summary Report"
          reportType="task-summary"
          headerInfo={headerInfo}
        >
          {/* Summary Cards */}
          <div className="grid">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value">{reportData.summary.totalTasks}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
              <div className="stat-label">Completed</div>
              <div className="stat-value">{reportData.summary.completedTasks}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' }}>
              <div className="stat-label">Pending</div>
              <div className="stat-value">{reportData.summary.pendingTasks}</div>
            </div>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)' }}>
              <div className="stat-label">Total Hours</div>
              <div className="stat-value">{reportData.summary.totalHours}</div>
            </div>
          </div>

          {/* Task Status Distribution */}
          <div className="section-title">Task Status Distribution</div>
          <div className="card">
            <div className="grid">
              <div>
                <Text size="sm" color="dimmed" mb={8}>Completed Tasks</Text>
                <div style={{ 
                  background: '#d3f9d8', 
                  height: '40px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#2f9e44'
                }}>
                  {reportData.summary.completedTasks} ({reportData.summary.totalTasks > 0 ? Math.round((reportData.summary.completedTasks / reportData.summary.totalTasks) * 100) : 0}%)
                </div>
              </div>
              <div>
                <Text size="sm" color="dimmed" mb={8}>Pending Tasks</Text>
                <div style={{ 
                  background: '#fff3bf', 
                  height: '40px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#f59f00'
                }}>
                  {reportData.summary.pendingTasks} ({reportData.summary.totalTasks > 0 ? Math.round((reportData.summary.pendingTasks / reportData.summary.totalTasks) * 100) : 0}%)
                </div>
              </div>
              <div>
                <Text size="sm" color="dimmed" mb={8}>Cancelled Tasks</Text>
                <div style={{ 
                  background: '#ffe3e3', 
                  height: '40px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  color: '#c92a2a'
                }}>
                  {reportData.summary.cancelledTasks} ({reportData.summary.totalTasks > 0 ? Math.round((reportData.summary.cancelledTasks / reportData.summary.totalTasks) * 100) : 0}%)
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="section-title">Task Details</div>
          
          <table>
            <thead>
              <tr>
                <th>Task #</th>
                <th>Title</th>
                <th>Client</th>
                <th>Service Provider</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.tasks.map((task) => {
                const statusStyle = getStatusColor(task.status);
                return (
                  <tr key={task.id}>
                    <td>#{task.id}</td>
                    <td style={{ fontWeight: 500 }}>{task.title || '-'}</td>
                    <td>{task.client || '-'}</td>
                    <td>{task.serviceProvider || '-'}</td>
                    <td>{Moment(task.date).format('MMM DD, YYYY')}</td>
                    <td>{task.duration ? `${task.duration} min` : '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: statusStyle.bg,
                        color: statusStyle.color
                      }}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {reportData.tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#868e96' }}>
              <Text>No tasks found for the selected period</Text>
            </div>
          )}
        </ReportLayout>
      )}

      {!reportData && !isLoading && (
        <Paper p="xl" style={{ textAlign: 'center' }}>
          <Text size="lg" color="dimmed">
            Configure filters above and click "Generate" to create your task summary report
          </Text>
        </Paper>
      )}
    </>
  );
}

