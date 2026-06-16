import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  AddTask as AddTaskIcon,
  AccountCircle as AccountCircleIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/layouts/DashboardLayout';
import TaskFormModal from '@/components/tasks/TaskFormModal';
import { useCreateTask, CreateTaskDto, Task } from '@/hooks/useTasks';

// ─── Mock Data ───────────────────────────────────────────────────────────────
export interface Email {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  read: boolean;
}

const mockEmails: Email[] = [
  {
    id: '1',
    senderName: 'Sarah Jenkins',
    senderEmail: 'sarah.j@example.com',
    subject: 'Client Meeting Notes - Q3 Project',
    snippet: 'Here are the notes from our meeting with the Acme Corp team...',
    body: 'Hi Team,\n\nHere are the notes from our meeting with the Acme Corp team this morning. We need to prioritize the database migration and update the API endpoints by next Tuesday.\n\nCould someone create a task for this and assign it to the backend team?\n\nThanks,\nSarah',
    date: '10:30 AM',
    read: false,
  },
  {
    id: '2',
    senderName: 'System Alerts',
    senderEmail: 'alerts@system.local',
    subject: 'Server CPU Usage Alert',
    snippet: 'Warning: CPU usage on production-db-1 has exceeded 90% for 15 minutes.',
    body: 'Warning: CPU usage on production-db-1 has exceeded 90% for 15 minutes.\n\nPlease investigate immediately. This might require scaling up the instance or optimizing the recent queries deployed in release v2.4.\n\n- Automated Alert System',
    date: 'Yesterday',
    read: true,
  },
  {
    id: '3',
    senderName: 'Mike Ross',
    senderEmail: 'm.ross@example.com',
    subject: 'Marketing Assets for Review',
    snippet: 'I have attached the new banner designs. Let me know what you think.',
    body: 'Hey,\n\nI have attached the new banner designs for the upcoming campaign. Let me know what you think.\n\nWe should get these approved by Friday to stay on schedule.\n\nBest,\nMike',
    date: 'Mon',
    read: true,
  },
  {
    id: '4',
    senderName: 'HR Department',
    senderEmail: 'hr@example.com',
    subject: 'Upcoming Holiday Schedule',
    snippet: 'Please review the updated holiday schedule for the upcoming quarter.',
    body: 'Hello everyone,\n\nPlease review the updated holiday schedule for the upcoming quarter attached to this email. Ensure your out-of-office plans are logged in the system.\n\nRegards,\nHR Team',
    date: 'Oct 12',
    read: true,
  },
];

const InboxPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState<string>(mockEmails[0].id);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const createTask = useCreateTask();

  // Filter emails
  const filteredEmails = useMemo(() => {
    return mockEmails.filter(
      (email) =>
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.senderEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedEmail = mockEmails.find((e) => e.id === selectedEmailId);

  // Handle Convert to Task
  const handleConvertToTask = () => {
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = (data: CreateTaskDto) => {
    createTask.mutate(data, {
      onSuccess: () => setIsTaskModalOpen(false),
    });
  };

  // Generate initial data for Task modal from the selected email
  const taskInitialData: Partial<Task> = selectedEmail
    ? {
        title: selectedEmail.subject,
        email_subject: selectedEmail.subject,
        email_sender: `${selectedEmail.senderName} <${selectedEmail.senderEmail}>`,
        description: selectedEmail.body,
        priority: 'medium',
        status: 'todo',
      }
    : {};

  return (
    <DashboardLayout>
      <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', gap: 2 }}>
        
        {/* Left Pane: Email List */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 350 },
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* List Header & Search */}
          <Box p={2} borderBottom="1px solid" borderColor="divider" bgcolor="background.paper">
            <Typography variant="h6" fontWeight={800} mb={2}>
              Inbox
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}
            />
          </Box>

          {/* Email List */}
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {filteredEmails.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">No emails found</Typography>
              </Box>
            ) : (
              filteredEmails.map((email) => (
                <React.Fragment key={email.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={selectedEmailId === email.id}
                      onClick={() => setSelectedEmailId(email.id)}
                      sx={{
                        p: 2,
                        borderLeft: '4px solid',
                        borderColor: selectedEmailId === email.id ? 'primary.main' : 'transparent',
                        backgroundColor: selectedEmailId === email.id ? 'action.selected' : 'inherit',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: email.read ? 'action.disabledBackground' : 'primary.main', color: email.read ? 'text.secondary' : 'white', width: 40, height: 40 }}>
                          {email.senderName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography variant="subtitle2" fontWeight={email.read ? 600 : 800} noWrap sx={{ maxWidth: 180 }}>
                              {email.senderName}
                            </Typography>
                            <Typography variant="caption" color={email.read ? 'text.secondary' : 'primary.main'} fontWeight={email.read ? 400 : 700}>
                              {email.date}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.primary" fontWeight={email.read ? 400 : 600} noWrap mb={0.5}>
                              {email.subject}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              {email.snippet}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>

        {/* Right Pane: Email Detail */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {selectedEmail ? (
            <>
              {/* Detail Header / Actions */}
              <Box p={2} borderBottom="1px solid" borderColor="divider" display="flex" justifyContent="space-between" alignItems="center" bgcolor="action.hover">
                <Stack direction="row" spacing={1}>
                  <IconButton size="small"><ReplyIcon fontSize="small" /></IconButton>
                  <IconButton size="small"><ForwardIcon fontSize="small" /></IconButton>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddTaskIcon />}
                    onClick={handleConvertToTask}
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                  >
                    Convert to Task
                  </Button>
                  <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                </Stack>
              </Box>

              {/* Detail Content */}
              <Box p={4} flex={1} overflow="auto">
                <Typography variant="h5" fontWeight={800} mb={3}>
                  {selectedEmail.subject}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={4}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mr: 2 }}>
                    {selectedEmail.senderName.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {selectedEmail.senderName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      &lt;{selectedEmail.senderEmail}&gt;
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmail.date}
                  </Typography>
                </Box>

                <Box sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', typography: 'body1', lineHeight: 1.6 }}>
                  {selectedEmail.body}
                </Box>
              </Box>
            </>
          ) : (
            <Box display="flex" flex={1} alignItems="center" justifyContent="center">
              <Typography color="text.secondary">Select an email to view details</Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Task Creation Modal */}
      {isTaskModalOpen && (
        <TaskFormModal
          open={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={(data) => handleTaskSubmit(data as CreateTaskDto)}
          initialData={taskInitialData as Task}
          isSubmitting={createTask.isPending}
        />
      )}
    </DashboardLayout>
  );
};

export default InboxPage;
