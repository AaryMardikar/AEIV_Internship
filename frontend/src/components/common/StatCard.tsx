import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NeutralIcon,
} from '@mui/icons-material';

// ─── Stat Card Props ──────────────────────────────────────────────────────────
export interface StatCardProps {
  /** Card title / metric label */
  title: string;
  /** Primary display value */
  value: string | number;
  /** Icon element */
  icon: React.ReactNode;
  /** Accent color hex */
  color: string;
  /** Optional trend badge */
  trend?: {
    value: number;   // e.g. 12.5 for +12.5%
    label: string;   // e.g. "vs last month"
    positive: boolean;
  };
  /** Progress bar fill (0–100) */
  progress?: number;
  /** Small subtext below value */
  subtitle?: string;
  /** Click handler */
  onClick?: () => void;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  progress,
  subtitle,
  onClick,
}) => {
  const TrendIcon = trend
    ? trend.positive
      ? TrendingUpIcon
      : TrendingDownIcon
    : NeutralIcon;

  return (
    <Card
      onClick={onClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderTop: `4px solid ${color}`,
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        '&:hover': onClick
          ? { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
          : undefined,
        // Decorative background circle
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -30,
          right: -30,
          width: 130,
          height: 130,
          borderRadius: '50%',
          backgroundColor: `${color}09`,
          pointerEvents: 'none',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        {/* ── Row 1: Icon + Trend ───────────────────────────────────────── */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              backgroundColor: `${color}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              flexShrink: 0,
              '& svg': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>

          {trend && (
            <Tooltip title={`${trend.positive ? '+' : ''}${trend.value}% ${trend.label}`}>
              <Chip
                icon={<TrendIcon sx={{ fontSize: '0.85rem !important' }} />}
                label={`${trend.positive ? '+' : ''}${trend.value}%`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: trend.positive ? '#107C1015' : '#A4262C15',
                  color: trend.positive ? '#107C10' : '#A4262C',
                  border: `1px solid ${trend.positive ? '#107C1030' : '#A4262C30'}`,
                  '& .MuiChip-icon': {
                    color: trend.positive ? '#107C10' : '#A4262C',
                    ml: 0.5,
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* ── Row 2: Value ─────────────────────────────────────────────── */}
        <Typography
          variant="h4"
          fontWeight={800}
          lineHeight={1}
          mb={0.5}
          sx={{ color: 'text.primary', letterSpacing: '-0.5px' }}
        >
          {value}
        </Typography>

        {/* ── Row 3: Label ─────────────────────────────────────────────── */}
        <Typography
          variant="caption"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing={0.6}
          color="text.secondary"
          display="block"
          mb={subtitle ? 0.5 : 0}
        >
          {title}
        </Typography>

        {/* ── Optional Subtitle ─────────────────────────────────────────── */}
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
            {subtitle}
          </Typography>
        )}

        {/* ── Optional Progress Bar ────────────────────────────────────── */}
        {progress !== undefined && (
          <Box mt={1.5}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 5,
                borderRadius: 4,
                backgroundColor: `${color}18`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                  borderRadius: 4,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              mt={0.5}
              display="block"
              textAlign="right"
            >
              {progress}%
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
