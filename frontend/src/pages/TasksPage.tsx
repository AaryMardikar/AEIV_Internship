import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  TablePagination,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  CheckCircle as CompleteIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewList as ViewListIcon,
  ViewKanban as ViewKanbanIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskDetailsDrawer from '@/components/tasks/TaskDetailsDrawer';
import { useLocation } from 'react-router-dom';
import {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useUpdateTaskStatus,
  Task,
  CreateTaskDto,
  UpdateTaskDto,
} from '@/hooks/useTasks';

// ─── Status & Priority Configs ────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#605E5C', bg: '#F3F2F1' },
  todo: { label: 'To Do', color: '#605E5C', bg: '#F3F2F1' },
  assigned: { label: 'Assigned', color: '#8A8886', bg: '#E1DFDD' },
  in_progress: { label: 'In Progress', color: '#0078D4', bg: '#EFF6FC' },
  blocked: { label: 'Blocked', color: '#A4262C', bg: '#FDE7E9' },
  review: { label: 'In Review', color: '#6264A7', bg: '#EEF0FF' },
  completed: { label: 'Completed', color: '#107C10', bg: '#EFF7EF' },
  overdue: { label: 'Overdue', color: '#A4262C', bg: '#FDE7E9' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#A4262C' },
  high: { label: 'High', color: '#D83B01' },
  medium: { label: 'Medium', color: '#F7630C' },
  low: { label: 'Low', color: '#107C10' },
};

const TasksPage: React.FC = () => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(viewMode === 'kanban' ? 100 : 10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlTaskId = queryParams.get('taskId');

  const { data: urlTask } = useTask(urlTaskId || '');

  React.useEffect(() => {
    if (urlTask) {
      setActiveTask(urlTask);
      setIsDrawerOpen(true);
    }
  }, [urlTask]);

  // ─── Hooks ──────────────────────────────────────────────────────────────────
  const { data: tasksData, isLoading } = useTasks({
    page: page + 1,
    limit: rowsPerPage,
    search: search || undefined,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleViewModeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'list' | 'kanban' | null,
  ) => {
    if (newView !== null) {
      setViewMode(newView);
      if (newView === 'kanban') setRowsPerPage(100);
      else setRowsPerPage(10);
      setPage(0);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setActiveTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateNew = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    setEditingTask(activeTask);
    setIsModalOpen(true);
    handleMenuClose();
  };

  const handleMarkComplete = () => {
    if (activeTask) {
      updateStatus.mutate({ id: activeTask.id, status: 'completed' });
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (activeTask && window.confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(activeTask.id);
    }
    handleMenuClose();
    setIsDrawerOpen(false);
  };

  const handleTaskClick = (task: Task) => {
    setActiveTask(task);
    setIsDrawerOpen(true);
  };

  const handleModalSubmit = (data: CreateTaskDto | UpdateTaskDto) => {
    if (editingTask) {
      updateTask.mutate(
        { id: editingTask.id, data: data as UpdateTaskDto },
        { onSuccess: () => setIsModalOpen(false) }
      );
    } else {
      createTask.mutate(data as CreateTaskDto, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={800}>
          Task Management
        </Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
          >
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" sx={{ mr: 1 }} /> List
            </ToggleButton>
            <ToggleButton value="kanban">
              <ViewKanbanIcon fontSize="small" sx={{ mr: 1 }} /> Kanban
            </ToggleButton>
          </ToggleButtonGroup>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ fontWeight: 700 }}
          >
            Create Task
          </Button>
        </Stack>
      </Box>

      {/* Filters & Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search tasks, emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <MenuItem key={key} value={key}>{val.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(PRIORITY_CONFIG).map(([key, val]) => (
              <MenuItem key={key} value={key}>{val.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Main Content Area */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={6}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard tasks={tasksData?.data || []} onTaskClick={handleTaskClick} />
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Task Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email Source</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasksData?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">No tasks found matching your criteria.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasksData?.data.map((task) => (
                    <TableRow 
                      key={task.id} 
                      hover 
                      onClick={() => handleTaskClick(task)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                        {task.description && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                            {task.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.email_subject ? (
                          <>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {task.email_subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {task.email_sender}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {task.priority && PRIORITY_CONFIG[task.priority] && (
                          <Chip
                            label={PRIORITY_CONFIG[task.priority].label}
                            size="small"
                            sx={{
                              backgroundColor: `${PRIORITY_CONFIG[task.priority].color}15`,
                              color: PRIORITY_CONFIG[task.priority].color,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {task.status && STATUS_CONFIG[task.status] && (
                          <Chip
                            label={STATUS_CONFIG[task.status].label}
                            size="small"
                            sx={{
                              backgroundColor: STATUS_CONFIG[task.status].bg,
                              color: STATUS_CONFIG[task.status].color,
                              border: `1px solid ${STATUS_CONFIG[task.status].color}30`,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 22,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {task.due_date ? (
                          <Typography variant="body2">
                            {new Date(task.due_date).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, task)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={tasksData?.pagination.total || 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      )}

      {/* Task Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {activeTask?.status !== 'completed' && (
          <MenuItem onClick={handleMarkComplete}>
            <CompleteIcon fontSize="small" color="success" sx={{ mr: 1.5 }} />
            Mark Complete
          </MenuItem>
        )}
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
          Edit Task
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" color="error" sx={{ mr: 1.5 }} />
          Delete Task
        </MenuItem>
      </Menu>

      {/* Form Modal */}
      <TaskFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
        isSubmitting={createTask.isPending || updateTask.isPending}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer 
        open={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        task={activeTask} 
      />
    </DashboardLayout>
  );
};

export default TasksPage;
