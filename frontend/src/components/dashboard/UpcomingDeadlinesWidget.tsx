import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import SectionCard from '@/components/common/SectionCard';
import { SAMPLE_DEADLINES, Deadline } from '@/data/dashboardSampleData';

// ─── Urgency Configuration ────────────────────────────────────────────────────
const getUrgency = (daysLeft: number): { color: string; bg: string; label: string } => {
  if (daysLeft <= 1) return { color: '#A4262C', bg: '#FDE7E9', label: 'Critical' };
  if (daysLeft <= 3) return { color: '#D83B01', bg: '#FFF4CE', label: 'Urgent' };
  if (daysLeft <= 7) return { color: '#F7630C', bg: '#FFF4CE', label: 'Soon' };
  return { color: '#107C10', bg: '#EFF7EF', label: 'On Track' };
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#A4262C',
  high: '#D83B01',
  medium: '#F7630C',
};

// ─── Deadline Item ────────────────────────────────────────────────────────────
const DeadlineItem: React.FC<{ item: Deadline; isLast: boolean }> = ({ item, isLast }) => {
  const urgency = getUrgency(item.daysLeft);
  const priorityColor = PRIORITY_COLORS[item.priority];

  const daysLabel =
    item.daysLeft === 0
      ? 'Due today'
      : item.daysLeft === 1
      ? '1 day left'
      : `${item.daysLeft} days left`;

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.75,
        borderLeft: `3px solid ${priorityColor}`,
        borderBottom: isLast ? 'none' : '1px solid',
        borderBottomColor: 'divider',
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: 'action.hover' },
        ml: 0, // flush left
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
        {/* Left: title + project */}
        <Box minWidth={0} flex={1}>
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            title={item.title}
          >
            {item.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.project}
          </Typography>
        </Box>

        {/* Right: days left badge */}
        <Chip
          icon={<ClockIcon sx={{ fontSize: '0.75rem !important' }} />}
          label={daysLabel}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontWeight: 700,
            flexShrink: 0,
            backgroundColor: urgency.bg,
            color: urgency.color,
            border: `1px solid ${urgency.color}30`,
            '& .MuiChip-icon': { color: urgency.color, ml: 0.5 },
          }}
        />
      </Box>

      {/* Progress + Assignees */}
      <Box mt={1.25} display="flex" alignItems="center" gap={1.5}>
        <Box flex={1}>
          <LinearProgress
            variant="determinate"
            value={item.progress}
            sx={{
              height: 5,
              borderRadius: 4,
              backgroundColor: `${priorityColor}18`,
              '& .MuiLinearProgress-bar': { backgroundColor: priorityColor, borderRadius: 4 },
            }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, fontWeight: 600 }}>
          {item.progress}%
        </Typography>
        <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.55rem', fontWeight: 700 } }}>
          {item.assignees.map((a, i) => (
            <Tooltip key={i} title={a.name}>
              <Avatar sx={{ backgroundColor: a.color }}>{a.initials}</Avatar>
            </Tooltip>
          ))}
        </AvatarGroup>
      </Box>
    </Box>
  );
};

// ─── Deadline Summary Header ──────────────────────────────────────────────────
const DeadlineHeaderAction: React.FC = () => {
  const critical = SAMPLE_DEADLINES.filter((d) => d.daysLeft <= 1).length;
  return critical > 0 ? (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <DotIcon sx={{ fontSize: 10, color: '#A4262C' }} />
      <Typography variant="caption" fontWeight={700} color="error">
        {critical} critical
      </Typography>
    </Stack>
  ) : null;
};

// ─── Upcoming Deadlines Widget ────────────────────────────────────────────────
const UpcomingDeadlinesWidget: React.FC = () => (
  <SectionCard
    title="Upcoming Deadlines"
    subtitle={`Next ${SAMPLE_DEADLINES.length} deadlines`}
    headerAction={<DeadlineHeaderAction />}
    noPadding
    onViewAll={() => {}}
    viewAllLabel="View All Deadlines"
  >
    <Box>
      {SAMPLE_DEADLINES.map((item, idx) => (
        <DeadlineItem key={item.id} item={item} isLast={idx === SAMPLE_DEADLINES.length - 1} />
      ))}
    </Box>
  </SectionCard>
);

export default UpcomingDeadlinesWidget;
