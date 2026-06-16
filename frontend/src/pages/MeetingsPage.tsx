import React, { useState } from 'react';
import {
  Box, Typography, Button, Stack, Paper, CircularProgress, Divider, Drawer
} from '@mui/material';
import { Add as AddIcon, Group as MeetingIcon } from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useMeetings, Meeting } from '@/hooks/useMeetings';
import MeetingDialog from '@/components/meetings/MeetingDialog';
import MeetingDetails from '@/components/meetings/MeetingDetails';
import dayjs from 'dayjs';

const MeetingsPage: React.FC = () => {
  const { data: meetings, isLoading } = useMeetings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={800}>Meetings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your meeting notes and track action items.
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => setDialogOpen(true)}
          sx={{ background: 'linear-gradient(135deg, #0078D4 0%, #6264A7 100%)' }}
        >
          Schedule Meeting
        </Button>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : meetings && meetings.length > 0 ? (
        <Stack spacing={2}>
          {meetings.map((meeting: Meeting) => (
            <Paper 
              key={meeting.id} 
              sx={{ p: 2.5, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3 } }}
              onClick={() => setSelectedMeetingId(meeting.id)}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.dark', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MeetingIcon />
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={700}>{meeting.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(meeting.meeting_date).format('dddd, MMMM D, YYYY • h:mm A')}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No meetings found</Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Schedule your first meeting to start tracking action items.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Schedule Meeting
          </Button>
        </Paper>
      )}

      {/* Meeting Dialog for creating */}
      <MeetingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      {/* Meeting Details Drawer */}
      <Drawer
        anchor="right"
        open={!!selectedMeetingId}
        onClose={() => setSelectedMeetingId(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, p: 3 } }}
      >
        {selectedMeetingId && <MeetingDetails meetingId={selectedMeetingId} />}
      </Drawer>
    </DashboardLayout>
  );
};

export default MeetingsPage;
