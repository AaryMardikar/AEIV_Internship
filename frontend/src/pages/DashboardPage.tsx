import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Chip,
  Avatar,
  Divider,
  Button,
  Paper,
} from '@mui/material';
import {
  Assignment as TasksIcon,
  Pending as PendingIcon,
  CheckCircle as CompletedIcon,
  Approval as ApprovalIcon,
  CalendarMonth as DeadlineIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/layouts/DashboardLayout';
import StatCard from '@/components/common/StatCard';
import TasksOverviewWidget from '@/components/dashboard/TasksOverviewWidget';
import UpcomingDeadlinesWidget from '@/components/dashboard/UpcomingDeadlinesWidget';
import PendingApprovalsWidget from '@/components/dashboard/PendingApprovalsWidget';
import ActivityFeedWidget from '@/components/dashboard/ActivityFeedWidget';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import AnalyticsChartsWidget from '@/components/dashboard/AnalyticsChartsWidget';
import { DASHBOARD_STATS, SAMPLE_TASKS } from '@/data/dashboardSampleData';

// ─── Greeting Helper ──────────────────────────────────────────────────────────
const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (): string =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

// ─── Stat Card Definitions ────────────────────────────────────────────────────
const buildStats = () => [
  {
    title: 'Total Tasks',
    value: DASHBOARD_STATS.totalTasks.toLocaleString(),
    icon: <TasksIcon />,
    color: '#0078D4',
    trend: { value: 12.5, label: 'vs last month', positive: true },
    progress: 76,
    subtitle: 'Across all projects',
  },
  {
    title: 'Pending Tasks',
    value: DASHBOARD_STATS.pendingTasks,
    icon: <PendingIcon />,
    color: '#D83B01',
    trend: { value: 4.2, label: 'vs last week', positive: false },
    progress: Math.round((DASHBOARD_STATS.pendingTasks / DASHBOARD_STATS.totalTasks) * 100),
    subtitle: 'In progress & to do',
  },
  {
    title: 'Completed',
    value: DASHBOARD_STATS.completedTasks.toLocaleString(),
    icon: <CompletedIcon />,
    color: '#107C10',
    trend: { value: 8.2, label: 'this week', positive: true },
    progress: Math.round((DASHBOARD_STATS.completedTasks / DASHBOARD_STATS.totalTasks) * 100),
    subtitle: `${Math.round((DASHBOARD_STATS.completedTasks / DASHBOARD_STATS.totalTasks) * 100)}% completion rate`,
  },
  {
    title: 'Pending Approvals',
    value: DASHBOARD_STATS.pendingApprovals,
    icon: <ApprovalIcon />,
    color: '#6264A7',
    trend: { value: 2, label: 'since yesterday', positive: false },
    progress: 48,
    subtitle: 'Awaiting your action',
  },
  {
    title: 'Deadlines',
    value: DASHBOARD_STATS.upcomingDeadlines,
    icon: <DeadlineIcon />,
    color: '#00B7C3',
    progress: 60,
    subtitle: 'Due in next 7 days',
  },
];

// ─── Task Status Distribution Bar ─────────────────────────────────────────────
const TaskDistributionBar: React.FC = () => {
  const statusCounts = {
    completed: SAMPLE_TASKS.filter((t) => t.status === 'completed').length,
    in_progress: SAMPLE_TASKS.filter((t) => t.status === 'in_progress').length,
    review: SAMPLE_TASKS.filter((t) => t.status === 'review').length,
    todo: SAMPLE_TASKS.filter((t) => t.status === 'todo').length,
    overdue: SAMPLE_TASKS.filter((t) => t.status === 'overdue').length,
  };
  const total = SAMPLE_TASKS.length;

  const segments = [
    { key: 'completed', color: '#107C10', label: 'Done' },
    { key: 'in_progress', color: '#0078D4', label: 'In Progress' },
    { key: 'review', color: '#6264A7', label: 'Review' },
    { key: 'todo', color: '#605E5C', label: 'To Do' },
    { key: 'overdue', color: '#A4262C', label: 'Overdue' },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: 2,
      }}
    >
      {/* Distribution bar */}
      <Box flex={1}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.75}>
          TASK DISTRIBUTION — {total} total
        </Typography>
        <Box
          sx={{
            display: 'flex',
            height: 10,
            borderRadius: 5,
            overflow: 'hidden',
            gap: '2px',
            backgroundColor: 'action.hover',
          }}
        >
          {segments.map((seg) => {
            const count = statusCounts[seg.key as keyof typeof statusCounts];
            const pct = (count / total) * 100;
            return pct > 0 ? (
              <Box
                key={seg.key}
                title={`${seg.label}: ${count}`}
                sx={{
                  width: `${pct}%`,
                  backgroundColor: seg.color,
                  borderRadius: 1,
                  transition: 'width 0.3s ease',
                }}
              />
            ) : null;
          })}
        </Box>
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        {segments.map((seg) => (
          <Stack key={seg.key} direction="row" alignItems="center" spacing={0.5}>
            <Box
              sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: seg.color, flexShrink: 0 }}
            />
            <Typography variant="caption" color="text.secondary">
              {seg.label} ({statusCounts[seg.key as keyof typeof statusCounts]})
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuth();
  const stats = buildStats();

  return (
    <DashboardLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <Box mb={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'flex-start' }}
          justifyContent="space-between"
          gap={2}
        >
          {/* Greeting */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 52,
                height: 52,
                background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                fontSize: '1rem',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {user?.name?.slice(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                  {getGreeting()}, {user?.name?.split(' ')[0] || 'User'} 👋
                </Typography>
                <Chip
                  label={user?.role ?? 'user'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    backgroundColor: 'primary.main',
                    color: 'white',
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                {formatDate()} · {DASHBOARD_STATS.pendingTasks} tasks pending · {DASHBOARD_STATS.pendingApprovals} awaiting approval
              </Typography>
            </Box>
          </Stack>

          {/* Quick Actions */}
          <Stack direction="row" spacing={1} flexShrink={0}>
            <Button
              id="dashboard-new-task-btn"
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #005A9E 0%, #464775 100%)' },
              }}
            >
              New Task
            </Button>
            <Button
              id="dashboard-filter-btn"
              variant="outlined"
              size="small"
              startIcon={<FilterIcon />}
              sx={{ fontWeight: 600 }}
            >
              Filter
            </Button>
            {hasRole('admin', 'manager') && (
              <Button
                id="dashboard-export-btn"
                variant="outlined"
                size="small"
                startIcon={<ExportIcon />}
                sx={{ fontWeight: 600 }}
              >
                Export
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={12 / 5} key={stat.title}>
            <StatCard {...stat} onClick={() => {}} />
          </Grid>
        ))}
      </Grid>

      {/* ── Task Distribution Bar ─────────────────────────────────────────── */}
      <Box mb={3}>
        <TaskDistributionBar />
      </Box>

      {/* ── Main Content Row: Tasks + Activity ───────────────────────────── */}
      <Box mb={3}>
        <AnalyticsChartsWidget />
      </Box>

      <Grid container spacing={2.5} mb={2.5}>
        {/* Tasks Overview */}
        <Grid item xs={12} xl={8}>
          <TasksOverviewWidget />
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} xl={4}>
          <Stack spacing={2.5}>
            <RemindersWidget />
            <ActivityFeedWidget />
          </Stack>
        </Grid>
      </Grid>

      {/* ── Bottom Row: Deadlines + Approvals ────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Upcoming Deadlines */}
        <Grid item xs={12} md={6}>
          <UpcomingDeadlinesWidget />
        </Grid>

        {/* Pending Approvals */}
        <Grid item xs={12} md={6}>
          <PendingApprovalsWidget />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default DashboardPage;
