import React, { useState } from 'react';
import {
  Drawer, Box, Typography, IconButton, Divider, TextField, Button,
  Avatar, List, ListItem, ListItemAvatar, ListItemText, Stack, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip
} from '@mui/material';
import {
  Close as CloseIcon, Send as SendIcon, AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon, Link as LinkIcon, LinkOff as LinkOffIcon,
  Download as DownloadIcon, History as HistoryIcon, Upload as UploadIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
  Task, useTaskComments, useAddComment,
  useTaskActivities
} from '@/hooks/useTasks';
import { Alarm as AlarmIcon } from '@mui/icons-material';
import FollowUpDialog from './FollowUpDialog';
import { useDocuments, useLinkDocument, useDownloadVersion } from '@/hooks/useDocuments';
import UploadDocumentDialog from '../documents/UploadDocumentDialog';
import VersionHistoryDialog from '../documents/VersionHistoryDialog';

interface TaskDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface LinkExistingDialogProps {
  open: boolean;
  onClose: () => void;
  onLink: (documentId: string) => Promise<void>;
  currentTaskId: string;
}

const LinkExistingDialog: React.FC<LinkExistingDialogProps> = ({ open, onClose, onLink, currentTaskId }) => {
  const { data: allDocs, isLoading } = useDocuments();
  const [selectedId, setSelectedId] = useState('');

  const handleLink = async () => {
    if (!selectedId) return;
    await onLink(selectedId);
    setSelectedId('');
    onClose();
  };

  const linkableDocs = allDocs?.filter(d => d.task_id !== currentTaskId) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Link Existing Document</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : linkableDocs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            No other documents available to link.
          </Typography>
        ) : (
          <TextField
            select
            fullWidth
            label="Select Document"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
          >
            <option value="" disabled></option>
            {linkableDocs.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.file_name})
              </option>
            ))}
          </TextField>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleLink} variant="contained" disabled={!selectedId}>Link</Button>
      </DialogActions>
    </Dialog>
  );
};

const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({ open, onClose, task }) => {
  const [commentText, setCommentText] = useState('');
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versionUploadOpen, setVersionUploadOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedDocTitle, setSelectedDocTitle] = useState<string | undefined>(undefined);
  
  const { data: comments, isLoading: loadingComments } = useTaskComments(task?.id || '');
  const { data: taskDocuments, isLoading: loadingDocs } = useDocuments(task?.id || null);
  const { data: activities, isLoading: loadingActivities } = useTaskActivities(task?.id || '');
  
  const addComment = useAddComment();
  const linkDocument = useLinkDocument();
  const downloadVersion = useDownloadVersion();

  const handleCommentSubmit = () => {
    if (!task || !commentText.trim()) return;
    addComment.mutate(
      { taskId: task.id, content: commentText.trim() },
      { onSuccess: () => setCommentText('') }
    );
  };

  if (!task) return null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 400, md: 500 } } }}>
      {/* Header */}
      <Box p={2} display="flex" alignItems="center" justifyContent="space-between" borderBottom="1px solid" borderColor="divider">
        <Typography variant="h6" fontWeight={700}>Task Details</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Button 
            size="small" 
            variant="outlined" 
            startIcon={<AlarmIcon />} 
            onClick={() => setFollowUpOpen(true)}
          >
            Follow-up
          </Button>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </Box>

      <Box p={3} flex={1} overflow="auto">
        {/* Overview */}
        <Box mb={4}>
          <Typography variant="h5" fontWeight={800} mb={1}>{task.title}</Typography>
          
          <Stack direction="row" spacing={1} mb={2}>
            <Chip label={task.status.toUpperCase()} size="small" color="primary" sx={{ fontWeight: 700 }} />
            <Chip label={task.priority.toUpperCase()} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
          </Stack>

          {task.description && (
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
              {task.description}
            </Typography>
          )}

          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {task.assignee_name ? task.assignee_name.charAt(0) : '?'}
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Assigned To</Typography>
              <Typography variant="body2" fontWeight={600}>{task.assignee_name || 'Unassigned'}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Attachments Section */}
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>Attached Documents</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<LinkIcon />} onClick={() => setLinkOpen(true)}>
                Link Existing
              </Button>
              <Button size="small" startIcon={<AttachFileIcon />} onClick={() => setUploadOpen(true)}>
                Upload
              </Button>
            </Stack>
          </Box>
          
          {loadingDocs ? <CircularProgress size={24} /> : !taskDocuments || taskDocuments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No documents attached yet.</Typography>
          ) : (
            <List dense disablePadding>
              {taskDocuments.map(doc => (
                <ListItem 
                  key={doc.id} 
                  sx={{ 
                    bgcolor: 'action.hover', 
                    mb: 1, 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                    <Avatar sx={{ bgcolor: 'transparent', color: 'primary.main', width: 32, height: 32 }}>
                      <FileIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {doc.file_name} • v{doc.version_number} • {(doc.file_size ? doc.file_size / 1024 : 0).toFixed(1)} KB
                      </Typography>
                    </Box>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Download Latest">
                      <span>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => doc.version_id && downloadVersion.mutateAsync(doc.version_id)}
                          disabled={downloadVersion.isPending}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Upload New Version">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setSelectedDocTitle(doc.title);
                          setVersionUploadOpen(true);
                        }}
                      >
                        <UploadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Version History">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setSelectedDocTitle(doc.title);
                          setHistoryOpen(true);
                        }}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Unlink from Task">
                      <span>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => linkDocument.mutate({ documentId: doc.id, taskId: null })}
                          disabled={linkDocument.isPending}
                        >
                          <LinkOffIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Activity Timeline */}
        <Box mb={4}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Activity</Typography>
          {loadingActivities ? <CircularProgress size={24} /> : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {activities?.map(act => (
                <Box key={act.id} display="flex" gap={1.5}>
                  <Box sx={{ width: 2, bgcolor: 'divider', my: 1, ml: 1.5, position: 'relative' }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', position: 'absolute', top: 0, left: -3 }} />
                  </Box>
                  <Box flex={1} pb={1}>
                    <Typography variant="body2">
                      <Typography component="span" fontWeight={600}>{act.user_name || 'System'}</Typography> 
                      {' '}{act.action.replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(act.created_at).format('MMM D, h:mm A')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comments Section */}
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>Comments</Typography>
          
          <Box mb={2} display="flex" flexDirection="column" gap={2}>
            {loadingComments ? <CircularProgress size={24} /> : comments?.map(comment => (
              <Box key={comment.id} display="flex" gap={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
                  {comment.user_name?.charAt(0) || '?'}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="baseline" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700}>{comment.user_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dayjs(comment.created_at).format('MMM D, h:mm A')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
                    {comment.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box display="flex" gap={1} alignItems="flex-end">
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Write a comment..."
              variant="outlined"
              size="small"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <IconButton 
              color="primary" 
              onClick={handleCommentSubmit} 
              disabled={!commentText.trim() || addComment.isPending}
              sx={{ bgcolor: 'action.hover' }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {task && (
        <>
          <FollowUpDialog
            open={followUpOpen}
            onClose={() => setFollowUpOpen(false)}
            taskId={task.id}
            taskTitle={task.title}
          />
          <UploadDocumentDialog
            open={uploadOpen}
            onClose={() => setUploadOpen(false)}
            taskId={task.id}
          />
          <LinkExistingDialog
            open={linkOpen}
            onClose={() => setLinkOpen(false)}
            currentTaskId={task.id}
            onLink={async (docId) => {
              await linkDocument.mutateAsync({ documentId: docId, taskId: task.id });
            }}
          />
          {selectedDocId && (
            <UploadDocumentDialog
              open={versionUploadOpen}
              onClose={() => {
                setVersionUploadOpen(false);
                setSelectedDocId(undefined);
                setSelectedDocTitle(undefined);
              }}
              documentId={selectedDocId}
              documentTitle={selectedDocTitle}
            />
          )}
          {selectedDocId && (
            <VersionHistoryDialog
              open={historyOpen}
              onClose={() => {
                setHistoryOpen(false);
                setSelectedDocId(undefined);
                setSelectedDocTitle(undefined);
              }}
              documentId={selectedDocId}
              documentTitle={selectedDocTitle || ''}
            />
          )}
        </>
      )}
    </Drawer>
  );
};

export default TaskDetailsDrawer;
