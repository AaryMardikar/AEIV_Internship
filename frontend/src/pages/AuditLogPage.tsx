import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import { InfoOutlined as InfoIcon } from '@mui/icons-material';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAudits, AuditLog } from '../hooks/useAudits';
import dayjs from 'dayjs';

const AuditLogPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Selected log details dialog state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading } = useAudits({
    page: page + 1,
    limit: rowsPerPage,
    action: actionFilter || undefined,
    entityType: typeFilter || undefined,
  });

  const logs = data?.logs || [];
  const totalLogs = data?.meta?.total || 0;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('login')) return 'success';
    if (act.includes('create')) return 'primary';
    if (act.includes('update')) return 'info';
    if (act.includes('action')) return 'warning';
    if (act.includes('execution')) return 'secondary';
    return 'default';
  };

  return (
    <DashboardLayout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={800}>Audit Logs</Typography>
        <Typography variant="body2" color="text.secondary">
          Security events and action trail monitoring for administrators.
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Filter Toolbar */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          select
          label="Filter Action"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Actions</MenuItem>
          <MenuItem value="login">Login</MenuItem>
          <MenuItem value="task_created">Task Created</MenuItem>
          <MenuItem value="task_updated">Task Updated</MenuItem>
          <MenuItem value="approval_created">Approval Created</MenuItem>
          <MenuItem value="approval_action">Approval Action</MenuItem>
          <MenuItem value="workflow_execution">Workflow Execution</MenuItem>
        </TextField>

        <TextField
          select
          label="Filter Entity Type"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Entity Types</MenuItem>
          <MenuItem value="user">User</MenuItem>
          <MenuItem value="task">Task</MenuItem>
          <MenuItem value="approval">Approval</MenuItem>
          <MenuItem value="workflow">Workflow</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : logs.length > 0 ? (
        <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity Type</TableCell>
                  <TableCell>Entity ID</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell align="center">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    sx={{
                      transition: 'background-color 0.2s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell sx={{ py: 1.5 }}>
                      {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {log.user_name ? (
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {log.user_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.user_email}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          System / Guest
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action.toUpperCase()}
                        size="small"
                        color={getActionColor(log.action)}
                        sx={{ fontSize: '0.65rem', fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {log.entity_type}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        {log.entity_id || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {log.ip_address || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => setSelectedLog(log)}>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={totalLogs}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No audit logs found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No system events matched the filter parameters.
          </Typography>
        </Paper>
      )}

      {/* Details Dialog */}
      <Dialog
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Audit Log Payload</DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">LOG ID</Typography>
                <Typography variant="body2" fontWeight={600} fontFamily="monospace">{selectedLog.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">USER AGENT</Typography>
                <Typography variant="body2">{selectedLog.user_agent || '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">METADATA PAYLOAD</Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    mt: 0.5,
                    bgcolor: 'action.hover',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLog(null)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default AuditLogPage;
