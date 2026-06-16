import React, { useState } from 'react';
import {
  Box, Typography, Paper, Divider, Stack, Chip, Button, TextField, CircularProgress, IconButton, Avatar
} from '@mui/material';
import { Add as AddIcon, CheckCircle as ConvertedIcon, Assignment as TaskIcon } from '@mui/icons-material';
import dayjs from 'dayjs';
import { Meeting, useMeeting, useAddActionItem, useConvertActionItem } from '../../hooks/useMeetings';

interface MeetingDetailsProps {
  meetingId: string;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meetingId }) => {
  const { data: meeting, isLoading } = useMeeting(meetingId);
  const addActionItem = useAddActionItem();
  const convertActionItem = useConvertActionItem();
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddActionItem = async () => {
    if (!newTaskTitle.trim()) return;
    
    await addActionItem.mutateAsync({
      meetingId,
      payload: {
        task_title: newTaskTitle,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
      }
    });

    setNewTaskTitle('');
    setNewDueDate('');
  };

  const handleConvert = (actionItemId: string) => {
    convertActionItem.mutate({ actionItemId, meetingId });
  };

  if (isLoading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (!meeting) return <Typography p={4}>Meeting not found</Typography>;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight={800} mb={1}>{meeting.title}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {dayjs(meeting.meeting_date).format('dddd, MMMM D, YYYY • h:mm A')} • Created by {meeting.creator_name}
        </Typography>

        {meeting.participants && meeting.participants.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Participants</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {meeting.participants.map((p, i) => (
                <Chip key={i} label={p} size="small" />
              ))}
            </Stack>
          </Box>
        )}

        {meeting.notes && (
          <Box mt={3}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Notes</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
              {meeting.notes}
            </Typography>
          </Box>
        )}
      </Paper>

      <Typography variant="h6" fontWeight={700} mb={2}>Action Items</Typography>
      
      <Stack spacing={2} mb={4}>
        {meeting.actionItems?.map((item) => (
          <Paper key={item.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ textDecoration: item.status === 'converted' ? 'line-through' : 'none' }}>
                {item.task_title}
              </Typography>
              {item.due_date && (
                <Typography variant="caption" color="text.secondary">
                  Due: {dayjs(item.due_date).format('MMM D, YYYY')}
                </Typography>
              )}
            </Box>
            
            {item.status === 'converted' ? (
              <Chip icon={<ConvertedIcon />} label="Converted to Task" color="success" size="small" />
            ) : (
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={convertActionItem.isPending && convertActionItem.variables?.actionItemId === item.id ? <CircularProgress size={16} /> : <TaskIcon />}
                onClick={() => handleConvert(item.id)}
                disabled={convertActionItem.isPending}
              >
                Convert to Task
              </Button>
            )}
          </Paper>
        ))}
        {(!meeting.actionItems || meeting.actionItems.length === 0) && (
          <Typography variant="body2" color="text.secondary">No action items yet.</Typography>
        )}
      </Stack>

      <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Typography variant="subtitle2" fontWeight={700} mb={2}>Add Action Item</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          <TextField
            size="small"
            label="Task Title"
            fullWidth
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <TextField
            size="small"
            label="Due Date"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
          />
          <Button 
            variant="contained" 
            onClick={handleAddActionItem}
            disabled={!newTaskTitle.trim() || addActionItem.isPending}
            startIcon={addActionItem.isPending ? <CircularProgress size={16} /> : <AddIcon />}
            sx={{ flexShrink: 0, height: 40 }}
          >
            Add
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default MeetingDetails;
