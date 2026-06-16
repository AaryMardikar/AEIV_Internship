import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Divider,
  Button,
  Skeleton,
} from '@mui/material';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

// ─── Section Card Props ───────────────────────────────────────────────────────
export interface SectionCardProps {
  title: string;
  subtitle?: string;
  /** Slot for header-right content (e.g. tabs, filter chips, buttons) */
  headerAction?: React.ReactNode;
  /** Show "View All" link button */
  viewAllLabel?: string;
  onViewAll?: () => void;
  /** Card min height */
  minHeight?: number | string;
  /** Loading skeleton state */
  loading?: boolean;
  children: React.ReactNode;
  /** Remove internal padding for children (useful for full-bleed tables) */
  noPadding?: boolean;
  sx?: object;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  headerAction,
  viewAllLabel = 'View All',
  onViewAll,
  minHeight,
  loading = false,
  children,
  noPadding = false,
  sx,
}) => (
  <Card
    sx={{
      height: '100%',
      minHeight,
      display: 'flex',
      flexDirection: 'column',
      ...sx,
    }}
  >
    {/* ── Card Header ──────────────────────────────────────────────────── */}
    <Box
      px={2.5}
      pt={2.5}
      pb={headerAction ? 1.5 : 2}
      display="flex"
      alignItems="flex-start"
      justifyContent="space-between"
      gap={2}
    >
      <Box minWidth={0}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {loading ? <Skeleton width={160} /> : title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {loading ? <Skeleton width={100} /> : subtitle}
          </Typography>
        )}
      </Box>
      {!loading && headerAction && (
        <Box flexShrink={0}>{headerAction}</Box>
      )}
    </Box>

    <Divider />

    {/* ── Card Body ────────────────────────────────────────────────────── */}
    <CardContent
      sx={{
        flex: 1,
        p: noPadding ? 0 : 2.5,
        '&:last-child': { pb: noPadding ? 0 : 2.5 },
        overflow: 'auto',
      }}
    >
      {loading ? (
        <Box>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height={52} sx={{ mb: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ) : (
        children
      )}
    </CardContent>

    {/* ── Card Footer — View All ────────────────────────────────────────── */}
    {onViewAll && !loading && (
      <>
        <Divider />
        <CardActions sx={{ px: 2.5, py: 1.5 }}>
          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={onViewAll}
            sx={{ fontWeight: 600, fontSize: '0.8rem' }}
          >
            {viewAllLabel}
          </Button>
        </CardActions>
      </>
    )}
  </Card>
);

export default SectionCard;
