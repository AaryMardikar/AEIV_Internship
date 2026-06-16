import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, CircularProgress, IconButton } from '@mui/material';
import { Alarm as AlarmIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import SectionCard from '../common/SectionCard';
import { useFollowUps, useUpdateFollowUp } from '../../hooks/useFollowUps';
import dayjs from 'dayjs';

const RemindersWidget: React.FC = () => {
  const { data: followUps, isLoading } = useFollowUps();
  const updateFollowUp = useUpdateFollowUp();

  const handleMarkComplete = (id: string) => {
    updateFollowUp.mutate({ id, status: 'completed' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'error';
      case 'escalated': return 'warning';
      case 'completed': return 'success';
      default: return 'primary';
    }
  };

  const activeFollowUps = followUps?.filter(f => f.status !== 'completed').slice(0, 5) || [];

  return (
    <SectionCard
      title="Reminders & Follow-Ups"
      headerAction={
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, cursor: 'pointer' }}>
          View all
        </Typography>
      }
    >
      {isLoading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={24} />
        </Box>
      ) : activeFollowUps.length === 0 ? (
        <Box p={3} textAlign="center">
          <Typography variant="body2" color="text.secondary">No active reminders.</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {activeFollowUps.map((followUp, index) => (
            <Box key={followUp.id}>
              <ListItem
                sx={{
                  py: 1.5,
                  px: 2,
                  bgcolor: 'transparent',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    size="small" 
                    color="success" 
                    onClick={() => handleMarkComplete(followUp.id)}
                    title="Mark as completed"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: `${getStatusColor(followUp.status)}.main` }}>
                    <AlarmIcon sx={{ fontSize: 18, color: 'white' }} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>
                        {followUp.task_title || 'Unknown Task'}
                      </Typography>
                      <Chip 
                        label={followUp.status} 
                        size="small" 
                        color={getStatusColor(followUp.status) as any} 
                        sx={{ height: 20, fontSize: '0.65rem', textTransform: 'capitalize' }} 
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Reminder: {dayjs(followUp.reminder_date).format('MMM D, h:mm A')}
                      {followUp.escalation_date && ` • Escalation: ${dayjs(followUp.escalation_date).format('MMM D')}`}
                    </Typography>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>
      )}
    </SectionCard>
  );
};

export default RemindersWidget;
