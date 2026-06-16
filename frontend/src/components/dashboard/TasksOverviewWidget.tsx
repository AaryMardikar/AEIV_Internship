import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import SectionCard from '@/components/common/SectionCard';
import { SAMPLE_TASKS, Task, TaskPriority, TaskStatus } from '@/data/dashboardSampleData';

// ─── Config Maps ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  todo: { label: 'To Do', color: '#605E5C', bg: '#F3F2F1' },
  in_progress: { label: 'In Progress', color: '#0078D4', bg: '#EFF6FC' },
  review: { label: 'In Review', color: '#6264A7', bg: '#EEF0FF' },
  completed: { label: 'Completed', color: '#107C10', bg: '#EFF7EF' },
  overdue: { label: 'Overdue', color: '#A4262C', bg: '#FDE7E9' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  critical: { color: '#A4262C', label: 'Critical' },
  high: { color: '#D83B01', label: 'High' },
  medium: { color: '#F7630C', label: 'Medium' },
  low: { color: '#107C10', label: 'Low' },
};

type FilterTab = 'all' | 'in_progress' | 'review' | 'completed' | 'overdue';

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Done' },
  { value: 'overdue', label: 'Overdue' },
];

// ─── Due Date Formatter ───────────────────────────────────────────────────────
const formatDueDate = (dateStr: string, status: TaskStatus): { text: string; color: string } => {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (status === 'overdue') return { text: `Overdue · ${formatted}`, color: '#A4262C' };
  if (diffDays === 0) return { text: 'Due today', color: '#D83B01' };
  if (diffDays === 1) return { text: 'Due tomorrow', color: '#D83B01' };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, color: '#A4262C' };
  return { text: formatted, color: 'text.secondary' };
};

// ─── Tasks Overview Widget ────────────────────────────────────────────────────
const TasksOverviewWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredTasks = activeTab === 'all'
    ? SAMPLE_TASKS
    : SAMPLE_TASKS.filter((t) => t.status === activeTab);

  // Tabs component (passed as headerAction)
  const tabs = (
    <Tabs
      value={activeTab}
      onChange={(_e, v) => setActiveTab(v as FilterTab)}
      sx={{
        minHeight: 32,
        '& .MuiTab-root': { minHeight: 32, py: 0.5, fontSize: '0.78rem', fontWeight: 600 },
        '& .MuiTabs-indicator': { height: 2 },
      }}
    >
      {TABS.map((t) => {
        const count = t.value === 'all'
          ? SAMPLE_TASKS.length
          : SAMPLE_TASKS.filter((task) => task.status === t.value).length;
        return (
          <Tab
            key={t.value}
            value={t.value}
            label={
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span>{t.label}</span>
                {count > 0 && (
                  <Chip
                    label={count}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      minWidth: 20,
                      '& .MuiChip-label': { px: 0.5 },
                    }}
                  />
                )}
              </Stack>
            }
          />
        );
      })}
    </Tabs>
  );

  return (
    <SectionCard
      title="Task Overview"
      subtitle={`${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''} shown`}
      headerAction={tabs}
      noPadding
      minHeight={400}
      onViewAll={() => {}}
      viewAllLabel="View All Tasks"
    >
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', pl: 2.5, width: '38%' }}>TASK</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '14%' }}>ASSIGNEE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '12%' }}>PRIORITY</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '14%' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '14%' }}>DUE DATE</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', width: '8%', pr: 2.5 }} align="right">
                PROGRESS
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.map((task: Task) => {
              const statusCfg = STATUS_CONFIG[task.status];
              const priorityCfg = PRIORITY_CONFIG[task.priority];
              const due = formatDueDate(task.dueDate, task.status);

              return (
                <TableRow
                  key={task.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:last-child td': { border: 0 },
                    '&:hover .action-btn': { opacity: 1 },
                  }}
                >
                  {/* Task name + project */}
                  <TableCell sx={{ pl: 2.5, py: 1.5 }}>
                    <Tooltip title={task.title} placement="top">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{
                          maxWidth: 220,
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                          color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.title}
                      </Typography>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {task.project}
                    </Typography>
                  </TableCell>

                  {/* Assignee */}
                  <TableCell>
                    <Tooltip title={task.assignee.name}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          backgroundColor: task.assignee.color,
                        }}
                      >
                        {task.assignee.initials}
                      </Avatar>
                    </Tooltip>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <DotIcon sx={{ fontSize: 8, color: priorityCfg.color, flexShrink: 0 }} />
                      <Typography variant="caption" fontWeight={600} sx={{ color: priorityCfg.color }}>
                        {priorityCfg.label}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Chip
                      label={statusCfg.label}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        backgroundColor: statusCfg.bg,
                        color: statusCfg.color,
                        border: `1px solid ${statusCfg.color}30`,
                      }}
                    />
                  </TableCell>

                  {/* Due date */}
                  <TableCell>
                    <Typography variant="caption" sx={{ color: due.color, fontWeight: 500 }}>
                      {due.text}
                    </Typography>
                  </TableCell>

                  {/* Progress + actions */}
                  <TableCell align="right" sx={{ pr: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                      <Box width={60}>
                        <LinearProgress
                          variant="determinate"
                          value={task.progress}
                          sx={{
                            height: 4,
                            borderRadius: 4,
                            backgroundColor: `${statusCfg.color}18`,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: statusCfg.color,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 28, textAlign: 'right' }}>
                        {task.progress}%
                      </Typography>
                      <IconButton
                        size="small"
                        className="action-btn"
                        sx={{ opacity: 0, transition: 'opacity 0.15s', p: 0.25 }}
                      >
                        <MoreVertIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}

            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks in this category.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
};

export default TasksOverviewWidget;
