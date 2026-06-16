import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useCreateFollowUp } from '../../hooks/useFollowUps';
import dayjs from 'dayjs';

interface FollowUpDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const FollowUpDialog: React.FC<FollowUpDialogProps> = ({ open, onClose, taskId, taskTitle }) => {
  const [reminderDate, setReminderDate] = useState<string>('');
  const [escalationDate, setEscalationDate] = useState<string>('');
  const createFollowUp = useCreateFollowUp();

  const handleClose = () => {
    setReminderDate('');
    setEscalationDate('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!reminderDate) return;
    
    await createFollowUp.mutateAsync({
      task_id: taskId,
      reminder_date: new Date(reminderDate).toISOString(),
      escalation_date: escalationDate ? new Date(escalationDate).toISOString() : undefined,
    });
    
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Follow-up</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set an automated reminder for the task: <strong>{taskTitle}</strong>
        </Typography>

        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Reminder Date & Time"
            type="datetime-local"
            fullWidth
            required
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: dayjs().format('YYYY-MM-DDTHH:mm')
            }}
          />

          <TextField
            label="Escalation Date & Time (Optional)"
            type="datetime-local"
            fullWidth
            value={escalationDate}
            onChange={(e) => setEscalationDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: reminderDate || dayjs().format('YYYY-MM-DDTHH:mm')
            }}
            helperText="If the task is still pending after this date, the manager will be notified."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={createFollowUp.isPending}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!reminderDate || createFollowUp.isPending}
          startIcon={createFollowUp.isPending ? <CircularProgress size={20} /> : undefined}
        >
          Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FollowUpDialog;
