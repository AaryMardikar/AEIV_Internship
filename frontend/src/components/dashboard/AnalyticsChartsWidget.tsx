import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { useAnalytics } from '@/hooks/useAnalytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const colors = [
  '#0078D4', // Blue
  '#107C10', // Green
  '#D83B01', // Orange
  '#6264A7', // Purple
  '#A4262C', // Red
  '#00B7C3', // Cyan
];

const AnalyticsChartsWidget: React.FC = () => {
  const { data, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>Failed to load analytics data.</Alert>
    );
  }

  // Tasks By Status
  const tasksChartData = {
    labels: data.tasksByStatus.map(d => d.status.toUpperCase()),
    datasets: [{
      data: data.tasksByStatus.map(d => d.count),
      backgroundColor: colors.slice(0, data.tasksByStatus.length),
    }]
  };

  // Approvals By Status
  const approvalsChartData = {
    labels: data.approvalsByStatus.map(d => d.status.toUpperCase()),
    datasets: [{
      data: data.approvalsByStatus.map(d => d.count),
      backgroundColor: [...colors].reverse().slice(0, data.approvalsByStatus.length),
    }]
  };

  // Workflow Executions
  const workflowChartData = {
    labels: data.workflowExecutions.map(d => d.status.toUpperCase()),
    datasets: [{
      label: 'Executions',
      data: data.workflowExecutions.map(d => d.count),
      backgroundColor: '#0078D4',
    }]
  };

  // Productivity Trend
  const trendChartData = {
    labels: data.productivityTrend.map(d => d.date),
    datasets: [{
      label: 'Completed Tasks',
      data: data.productivityTrend.map(d => d.count),
      borderColor: '#107C10',
      backgroundColor: 'rgba(16, 124, 16, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }} gutterBottom>Tasks by Status</Typography>
          <Box height={220} display="flex" justifyContent="center">
            {data.tasksByStatus.length > 0 ? <Doughnut data={tasksChartData} options={{ maintainAspectRatio: false }} /> : <Typography color="textSecondary" mt={10}>No tasks data</Typography>}
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }} gutterBottom>Approvals by Status</Typography>
          <Box height={220} display="flex" justifyContent="center">
             {data.approvalsByStatus.length > 0 ? <Pie data={approvalsChartData} options={{ maintainAspectRatio: false }} /> : <Typography color="textSecondary" mt={10}>No approvals data</Typography>}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }} gutterBottom>Workflow Executions</Typography>
          <Box height={220}>
            {data.workflowExecutions.length > 0 ? <Bar data={workflowChartData} options={{ maintainAspectRatio: false }} /> : <Typography color="textSecondary" align="center" mt={10}>No workflow data</Typography>}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6} lg={3}>
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }} gutterBottom>Productivity Trend (Last 7 Days)</Typography>
          <Box height={220}>
            {data.productivityTrend.length > 0 ? <Line data={trendChartData} options={{ maintainAspectRatio: false }} /> : <Typography color="textSecondary" align="center" mt={10}>No trend data</Typography>}
          </Box>
        </Paper>
      </Grid>

      {data.overdueTasks.length > 0 && (
        <Grid item xs={12}>
           <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
             <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700 }} gutterBottom color="error">Overdue Tasks ({data.overdueTasks.length})</Typography>
             <Box display="flex" flexDirection="column" gap={1}>
                {data.overdueTasks.map(t => (
                  <Box key={t.id} display="flex" justifyContent="space-between" p={1.5} bgcolor="action.hover" borderRadius={1}>
                    <Typography variant="body2" fontWeight={600}>{t.title}</Typography>
                    <Typography variant="body2" color="error" fontWeight={600}>Due: {new Date(t.due_date).toLocaleDateString()}</Typography>
                  </Box>
                ))}
             </Box>
           </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default AnalyticsChartsWidget;
