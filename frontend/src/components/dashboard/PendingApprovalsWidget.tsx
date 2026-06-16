import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Stack,
  Tooltip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ExpandMore as ExpandIcon,
  BeachAccess as LeaveIcon,
  AttachMoney as ExpenseIcon,
  VpnKey as AccessIcon,
  WorkOutline as ProjectIcon,
  ShoppingCart as PurchaseIcon,
} from '@mui/icons-material';
import SectionCard from '@/components/common/SectionCard';
import { SAMPLE_APPROVALS, Approval, ApprovalType } from '@/data/dashboardSampleData';

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ApprovalType, { label: string; icon: React.ReactElement; color: string }> = {
  leave: { label: 'Leave', icon: <LeaveIcon sx={{ fontSize: 14 }} />, color: '#0078D4' },
  expense: { label: 'Expense', icon: <ExpenseIcon sx={{ fontSize: 14 }} />, color: '#D83B01' },
  access: { label: 'Access', icon: <AccessIcon sx={{ fontSize: 14 }} />, color: '#6264A7' },
  project: { label: 'Project', icon: <ProjectIcon sx={{ fontSize: 14 }} />, color: '#107C10' },
  purchase: { label: 'Purchase', icon: <PurchaseIcon sx={{ fontSize: 14 }} />, color: '#C43E1C' },
};

// ─── Approval Item ────────────────────────────────────────────────────────────
const ApprovalItem: React.FC<{ item: Approval; isLast: boolean }> = ({ item, isLast }) => {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const typeCfg = TYPE_CONFIG[item.type];

  if (status !== 'pending') {
    return (
      <Box
        px={2.5}
        py={1.5}
        display="flex"
        alignItems="center"
        gap={1.5}
        sx={{
          borderBottom: isLast ? 'none' : '1px solid',
          borderBottomColor: 'divider',
          backgroundColor: status === 'approved' ? '#EFF7EF' : '#FDE7E9',
          transition: 'background-color 0.3s',
        }}
      >
        <Typography variant="caption" color="text.secondary" flex={1} noWrap>
          {item.title}
        </Typography>
        <Chip
          label={status === 'approved' ? '✓ Approved' : '✗ Rejected'}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.68rem',
            fontWeight: 700,
            backgroundColor: status === 'approved' ? '#107C1018' : '#A4262C18',
            color: status === 'approved' ? '#107C10' : '#A4262C',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        borderBottom: isLast ? 'none' : '1px solid',
        borderBottomColor: 'divider',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
    >
      <Box px={2.5} py={1.75}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          {/* Requester Avatar */}
          <Tooltip title={`${item.requester.name} · ${item.requester.department}`}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: item.requester.color,
                flexShrink: 0,
              }}
            >
              {item.requester.initials}
            </Avatar>
          </Tooltip>

          {/* Content */}
          <Box flex={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={0.25}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {item.title}
              </Typography>
              {item.priority === 'urgent' && (
                <Chip
                  label="Urgent"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    backgroundColor: '#FDE7E9',
                    color: '#A4262C',
                  }}
                />
              )}
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" color="text.secondary">
                {item.requester.name}
              </Typography>
              <Typography variant="caption" color="text.disabled">·</Typography>
              <Chip
                icon={typeCfg.icon}
                label={typeCfg.label}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  backgroundColor: `${typeCfg.color}12`,
                  color: typeCfg.color,
                  '& .MuiChip-icon': { color: typeCfg.color },
                }}
              />
              {item.amount && (
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {item.amount}
                </Typography>
              )}
              <Typography variant="caption" color="text.disabled">
                {item.requestedAt}
              </Typography>
            </Stack>
          </Box>

          {/* Expand toggle */}
          <IconButton
            size="small"
            onClick={() => setExpanded((e) => !e)}
            sx={{
              p: 0.5,
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <ExpandIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Expanded description */}
        <Collapse in={expanded}>
          <Box
            mt={1.25}
            p={1.5}
            sx={{ backgroundColor: 'action.hover', borderRadius: 1.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {item.description}
            </Typography>
          </Box>
        </Collapse>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} mt={1.5}>
          <Button
            size="small"
            variant="contained"
            startIcon={<ApproveIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setStatus('approved')}
            sx={{
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#107C10',
              px: 1.5,
              '&:hover': { backgroundColor: '#0B5C0B' },
            }}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RejectIcon sx={{ fontSize: '14px !important' }} />}
            onClick={() => setStatus('rejected')}
            sx={{
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 700,
              borderColor: '#A4262C',
              color: '#A4262C',
              px: 1.5,
              '&:hover': { borderColor: '#771B1E', backgroundColor: '#FDE7E9' },
            }}
          >
            Reject
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

// ─── Pending Approvals Widget ─────────────────────────────────────────────────
const PendingApprovalsWidget: React.FC = () => (
  <SectionCard
    title="Pending Approvals"
    subtitle={`${SAMPLE_APPROVALS.length} requests awaiting action`}
    headerAction={
      <Chip
        label={`${SAMPLE_APPROVALS.filter((a) => a.priority === 'urgent').length} urgent`}
        size="small"
        sx={{
          height: 22,
          fontSize: '0.68rem',
          fontWeight: 700,
          backgroundColor: '#FDE7E9',
          color: '#A4262C',
        }}
      />
    }
    noPadding
    onViewAll={() => {}}
    viewAllLabel="View All Approvals"
  >
    <Box>
      {SAMPLE_APPROVALS.map((item, idx) => (
        <ApprovalItem
          key={item.id}
          item={item}
          isLast={idx === SAMPLE_APPROVALS.length - 1}
        />
      ))}
    </Box>
  </SectionCard>
);

export default PendingApprovalsWidget;
