import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Tabs, Tab, Stack, Switch, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Email as EmailIcon } from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  useWorkflows, useWorkflowExecutions, useCreateWorkflow,
  useUpdateWorkflowStatus, useTriggerEmailWebhook, CreateWorkflowDto
} from '@/hooks/useWorkflows';
import { useToast } from '@/contexts/ToastContext';
import dayjs from 'dayjs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TRIGGER_TYPES = [
  { value: 'email_received', label: 'Email Received' },
  { value: 'task_created', label: 'Task Created' },
  { value: 'approval_submitted', label: 'Approval Submitted' },
];

const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Task' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'start_approval', label: 'Start Approval' },
];

const WorkflowsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState<CreateWorkflowDto>({
    name: '',
    trigger_type: 'email_received',
    action_type: 'create_task',
  });

  const { data: workflows, isLoading: isWorkflowsLoading } = useWorkflows();
  const { data: executions, isLoading: isExecutionsLoading } = useWorkflowExecutions();
  const createMutation = useCreateWorkflow();
  const updateStatusMutation = useUpdateWorkflowStatus();
  const triggerEmailMutation = useTriggerEmailWebhook();
  const { showSuccess } = useToast();

  const handleCreateSubmit = () => {
    if (!newWorkflow.name) return;
    createMutation.mutate(newWorkflow, {
      onSuccess: () => {
        setCreateModalOpen(false);
        setNewWorkflow({ name: '', trigger_type: 'email_received', action_type: 'create_task' });
      }
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateStatusMutation.mutate({
      id,
      status: currentStatus === 'active' ? 'inactive' : 'active'
    });
  };

  const handleMockEmail = () => {
    triggerEmailMutation.mutate({
      subject: 'Mock Email Triggered Workflow',
      body: 'This is a test email sent from the workflow page.',
    });
    showSuccess('Mock email received event triggered successfully!');
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Workflow Automation
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={handleMockEmail}
            sx={{ fontWeight: 600 }}
          >
            Mock Receive Email
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Create Rule
          </Button>
        </Stack>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} sx={{ px: 2 }}>
            <Tab label="Rules" sx={{ fontWeight: 600 }} />
            <Tab label="Execution History" sx={{ fontWeight: 600 }} />
          </Tabs>
        </Box>

        {/* Rules Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Trigger</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Toggle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isWorkflowsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : workflows?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No workflows created yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows?.map((wf) => (
                    <TableRow key={wf.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{wf.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={TRIGGER_TYPES.find(t => t.value === wf.trigger_type)?.label || wf.trigger_type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ACTION_TYPES.find(t => t.value === wf.action_type)?.label || wf.action_type}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={wf.status.toUpperCase()}
                          size="small"
                          color={wf.status === 'active' ? 'success' : 'default'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Switch
                          checked={wf.status === 'active'}
                          onChange={() => handleToggleStatus(wf.id, wf.status)}
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Executions Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Workflow</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Logs</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isExecutionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : executions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No executions found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  executions?.map((ex) => (
                    <TableRow key={ex.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {dayjs(ex.created_at).format('MMM D, YYYY HH:mm:ss')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {ex.workflow_name || 'Unknown'}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {ex.trigger_type} &rarr; {ex.action_type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ex.status.toUpperCase()}
                          size="small"
                          color={ex.status === 'success' ? 'success' : ex.status === 'failed' ? 'error' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="body2" sx={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          fontFamily: 'monospace',
                          bgcolor: 'action.hover',
                          p: 0.5,
                          borderRadius: 1
                        }}>
                          {ex.logs || 'No logs available'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Create Workflow Rule</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} mt={1}>
            <TextField
              label="Rule Name"
              fullWidth
              value={newWorkflow.name}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
            />
            <TextField
              select
              label="When this happens (Trigger)"
              fullWidth
              value={newWorkflow.trigger_type}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger_type: e.target.value as any })}
            >
              {TRIGGER_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Then do this (Action)"
              fullWidth
              value={newWorkflow.action_type}
              onChange={(e) => setNewWorkflow({ ...newWorkflow, action_type: e.target.value as any })}
            >
              {ACTION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateModalOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!newWorkflow.name || createMutation.isPending}
          >
            Create Rule
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default WorkflowsPage;
