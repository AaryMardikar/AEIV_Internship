import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress
} from '@mui/material';
import { useCreateMeeting } from '../../hooks/useMeetings';
import dayjs from 'dayjs';

interface MeetingDialogProps {
  open: boolean;
  onClose: () => void;
}

const MeetingDialog: React.FC<MeetingDialogProps> = ({ open, onClose }) => {
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [participants, setParticipants] = useState('');
  const createMeeting = useCreateMeeting();

  const handleClose = () => {
    setTitle('');
    setMeetingDate('');
    setNotes('');
    setParticipants('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!title || !meetingDate) return;

    const parts = participants.split(',').map(p => p.trim()).filter(p => p.length > 0);

    await createMeeting.mutateAsync({
      title,
      meeting_date: new Date(meetingDate).toISOString(),
      notes,
      participants: parts.length > 0 ? parts : undefined,
    });

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule Meeting</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <TextField
            label="Meeting Title"
            fullWidth
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Date & Time"
            type="datetime-local"
            fullWidth
            required
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: dayjs().format('YYYY-MM-DDTHH:mm')
            }}
          />
          <TextField
            label="Participants (comma separated emails/names)"
            fullWidth
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
          <TextField
            label="Meeting Notes / Agenda"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit" disabled={createMeeting.isPending}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={!title || !meetingDate || createMeeting.isPending}
          startIcon={createMeeting.isPending ? <CircularProgress size={20} /> : undefined}
        >
          Create Meeting
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeetingDialog;
