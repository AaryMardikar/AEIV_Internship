import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, Chip, Paper, IconButton,
  Menu, MenuItem, TextField, TablePagination, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Help as ClarifyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useApprovals, useUpdateApprovalStatus, useCreateApproval, Approval } from '@/hooks/useApprovals';
import { useToast } from '@/contexts/ToastContext';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#B8860B', bg: '#FFF8DC' },
  approved: { label: 'Approved', color: '#107C10', bg: '#EFF7EF' },
  rejected: { label: 'Rejected', color: '#A4262C', bg: '#FDE7E9' },
  escalated: { label: 'Escalated', color: '#D83B01', bg: '#FDE7E9' },
};

const ApprovalsPage: React.FC = () => {
  const { showInfo } = useToast();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [roleFilter, setRoleFilter] = useState<'approver' | 'requester'>('approver');
  const [statusFilter, setStatusFilter] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeApproval, setActiveApproval] = useState<Approval | null>(null);

  const [clarifyDialogOpen, setClarifyDialogOpen] = useState(false);
  const [clarifyComment, setClarifyComment] = useState('');

  const { data: approvalsData, isLoading } = useApprovals({
    page: page + 1,
    limit: rowsPerPage,
    role: roleFilter,
    status: statusFilter || undefined,
  });

  const updateStatus = useUpdateApprovalStatus();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, approval: Approval) => {
    setAnchorEl(event.currentTarget);
    setActiveApproval(approval);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApprove = () => {
    if (activeApproval) {
      updateStatus.mutate({ id: activeApproval.id, data: { status: 'approved' } });
    }
    handleMenuClose();
  };

  const handleReject = () => {
    if (activeApproval) {
      updateStatus.mutate({ id: activeApproval.id, data: { status: 'rejected' } });
    }
    handleMenuClose();
  };

  const handleClarifyOpen = () => {
    setClarifyComment('');
    setClarifyDialogOpen(true);
    handleMenuClose();
  };

  const submitClarification = () => {
    if (activeApproval && clarifyComment.trim()) {
      updateStatus.mutate(
        { id: activeApproval.id, data: { status: 'escalated', comments: clarifyComment } },
        { onSuccess: () => setClarifyDialogOpen(false) }
      );
    }
  };

  return (
    <DashboardLayout>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Typography variant="h5" fontWeight={800}>
          Approval Queue
        </Typography>
        {/* Simplified for prototype: no Create Approval modal built yet, but button exists */}
        <Button variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 700 }} onClick={() => showInfo('Create Approval Modal to be implemented in full production version')}>
          Request Approval
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            size="small"
            label="My Role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setPage(0);
            }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="approver">Needs My Approval</MenuItem>
            <MenuItem value="requester">Requested By Me</MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <MenuItem key={key} value={key}>{val.label}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Approvals List */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={6}>
            <CircularProgress />
          </Box>
        ) : approvalsData?.data.length === 0 ? (
          <Box p={6} textAlign="center">
            <Typography color="text.secondary">No approvals found.</Typography>
          </Box>
        ) : (
          <Box>
            {approvalsData?.data.map((approval, idx) => {
              const statusCfg = STATUS_CONFIG[approval.status];
              return (
                <Box
                  key={approval.id}
                  px={3} py={2}
                  sx={{
                    borderBottom: idx === approvalsData.data.length - 1 ? 'none' : '1px solid',
                    borderBottomColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                      {roleFilter === 'approver' ? approval.requester_name?.charAt(0) : approval.approver_name?.charAt(0)}
                    </Avatar>
                    
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {approval.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {roleFilter === 'approver' ? `Requested by ${approval.requester_name}` : `Sent to ${approval.approver_name}`} • {dayjs(approval.created_at).format('MMM D, YYYY')}
                          </Typography>
                        </Box>
                        <Chip
                          label={statusCfg.label}
                          size="small"
                          sx={{
                            bgcolor: statusCfg.bg,
                            color: statusCfg.color,
                            fontWeight: 700,
                            border: `1px solid ${statusCfg.color}30`
                          }}
                        />
                      </Box>
                      
                      {approval.description && (
                        <Typography variant="body2" sx={{ mb: 1.5, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
                          {approval.description}
                        </Typography>
                      )}

                      {approval.comments && (
                        <Box mt={2} pl={2} borderLeft="3px solid" borderColor="divider">
                          <Typography variant="caption" fontWeight={700} color="text.secondary">Latest Comments:</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{approval.comments}</Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Actions Menu */}
                    <IconButton onClick={(e) => handleMenuOpen(e, approval)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
        
        {/* Pagination */}
        <TablePagination
          component="div"
          count={approvalsData?.pagination.total || 0}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {activeApproval?.status === 'pending' && roleFilter === 'approver' && [
          <MenuItem key="approve" onClick={handleApprove} sx={{ color: 'success.main', fontWeight: 600 }}>
            <ApproveIcon fontSize="small" sx={{ mr: 1.5 }} /> Approve
          </MenuItem>,
          <MenuItem key="reject" onClick={handleReject} sx={{ color: 'error.main', fontWeight: 600 }}>
            <RejectIcon fontSize="small" sx={{ mr: 1.5 }} /> Reject
          </MenuItem>,
          <Divider key="div" />,
          <MenuItem key="clarify" onClick={handleClarifyOpen}>
            <ClarifyIcon fontSize="small" sx={{ mr: 1.5 }} color="action" /> Request Clarification
          </MenuItem>
        ]}
        {activeApproval?.status !== 'pending' && (
           <MenuItem disabled>No further actions</MenuItem>
        )}
      </Menu>

      {/* Clarification Dialog */}
      <Dialog open={clarifyDialogOpen} onClose={() => setClarifyDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Request Clarification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Add a comment explaining what additional information you need. This will escalate the approval and notify the requester.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your comment here..."
            value={clarifyComment}
            onChange={(e) => setClarifyComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setClarifyDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={submitClarification} variant="contained" disabled={!clarifyComment.trim()}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default ApprovalsPage;
