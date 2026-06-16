import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  AddTask as TaskCreatedIcon,
  CheckCircleOutline as TaskCompletedIcon,
  PersonAdd as AssignedIcon,
  HourglassTop as ApprovalIcon,
  VerifiedUser as ApprovedIcon,
  ChatBubbleOutline as CommentIcon,
  UploadFile as UploadIcon,
  EventNote as DeadlineIcon,
} from '@mui/icons-material';
import SectionCard from '@/components/common/SectionCard';
import { SAMPLE_ACTIVITY, ActivityItem, ActivityType } from '@/data/dashboardSampleData';

// ─── Activity Type Config ─────────────────────────────────────────────────────
const TYPE_CONFIG: Record<ActivityType, { icon: React.ReactNode; color: string; bg: string }> = {
  task_created: {
    icon: <TaskCreatedIcon sx={{ fontSize: 14 }} />,
    color: '#0078D4',
    bg: '#EFF6FC',
  },
  task_completed: {
    icon: <TaskCompletedIcon sx={{ fontSize: 14 }} />,
    color: '#107C10',
    bg: '#EFF7EF',
  },
  task_assigned: {
    icon: <AssignedIcon sx={{ fontSize: 14 }} />,
    color: '#6264A7',
    bg: '#EEF0FF',
  },
  approval_requested: {
    icon: <ApprovalIcon sx={{ fontSize: 14 }} />,
    color: '#F7630C',
    bg: '#FFF4CE',
  },
  approval_granted: {
    icon: <ApprovedIcon sx={{ fontSize: 14 }} />,
    color: '#107C10',
    bg: '#EFF7EF',
  },
  comment_added: {
    icon: <CommentIcon sx={{ fontSize: 14 }} />,
    color: '#038387',
    bg: '#E8F7F7',
  },
  file_uploaded: {
    icon: <UploadIcon sx={{ fontSize: 14 }} />,
    color: '#8764B8',
    bg: '#F3EEF8',
  },
  deadline_set: {
    icon: <DeadlineIcon sx={{ fontSize: 14 }} />,
    color: '#D83B01',
    bg: '#FFF0EB',
  },
};

// ─── Activity Item Row ────────────────────────────────────────────────────────
const ActivityRow: React.FC<{ item: ActivityItem; isLast: boolean }> = ({ item, isLast }) => {
  const cfg = TYPE_CONFIG[item.type];

  return (
    <Box
      display="flex"
      gap={1.5}
      px={2.5}
      py={1.5}
      sx={{
        borderBottom: isLast ? 'none' : '1px solid',
        borderBottomColor: 'divider',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'action.hover' },
        position: 'relative',
      }}
    >
      {/* Timeline line (hidden for last) */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: 39,
            top: 44,
            bottom: 0,
            width: 1,
            backgroundColor: 'divider',
          }}
        />
      )}

      {/* User avatar */}
      <Tooltip title={item.user.name}>
        <Avatar
          sx={{
            width: 28,
            height: 28,
            fontSize: '0.6rem',
            fontWeight: 700,
            backgroundColor: item.user.color,
            flexShrink: 0,
            zIndex: 1,
          }}
        >
          {item.user.initials}
        </Avatar>
      </Tooltip>

      {/* Content */}
      <Box flex={1} minWidth={0}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography variant="body2" color="text.primary" lineHeight={1.4}>
              <Box component="span" fontWeight={700}>
                {item.user.name}
              </Box>{' '}
              <Box component="span" color="text.secondary">
                {item.action}
              </Box>{' '}
              <Box component="span" fontWeight={600} color="primary.main">
                {item.target}
              </Box>
            </Typography>
          </Box>

          {/* Activity type icon */}
          <Box
            flexShrink={0}
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: cfg.bg,
              color: cfg.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cfg.icon}
          </Box>
        </Box>

        <Typography variant="caption" color="text.disabled" display="block" mt={0.25}>
          {item.timeAgo}
        </Typography>
      </Box>
    </Box>
  );
};

// ─── Activity Feed Widget ─────────────────────────────────────────────────────
const ActivityFeedWidget: React.FC = () => (
  <SectionCard
    title="Activity Feed"
    subtitle="Recent team activity"
    noPadding
    onViewAll={() => {}}
    viewAllLabel="View Full History"
  >
    <Stack>
      {SAMPLE_ACTIVITY.map((item, idx) => (
        <ActivityRow
          key={item.id}
          item={item}
          isLast={idx === SAMPLE_ACTIVITY.length - 1}
        />
      ))}
    </Stack>
  </SectionCard>
);

export default ActivityFeedWidget;
