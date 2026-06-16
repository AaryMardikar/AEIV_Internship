import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Task, CreateTaskDto, UpdateTaskDto } from '@/hooks/useTasks';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskDto | UpdateTaskDto) => void;
  initialData?: Task | null;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  email_subject: string;
  email_sender: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  assigned_to: string;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}) => {
  const isEditing = !!initialData;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      email_subject: '',
      email_sender: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      assigned_to: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title: initialData.title || '',
          email_subject: initialData.email_subject || '',
          email_sender: initialData.email_sender || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          status: initialData.status || 'todo',
          due_date: initialData.due_date ? new Date(initialData.due_date).toISOString().split('T')[0] : '',
          assigned_to: initialData.assigned_to || '',
        });
      } else {
        reset({
          title: '',
          email_subject: '',
          email_sender: '',
          description: '',
          priority: 'medium',
          status: 'todo',
          due_date: '',
          assigned_to: '',
        });
      }
    }
  }, [open, initialData, reset]);

  const onFormSubmit = (data: FormValues) => {
    const payload: CreateTaskDto | UpdateTaskDto = {
      title: data.title,
      email_subject: data.email_subject || undefined,
      email_sender: data.email_sender || undefined,
      description: data.description || undefined,
      priority: data.priority,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      assigned_to: data.assigned_to || null,
      ...(isEditing ? { status: data.status } : {}),
    };
    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Core Task Info */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Task title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Task Title"
                    fullWidth
                    required
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            {/* Email Source Fields */}
            <Grid item xs={12}>
              <Box p={2} sx={{ backgroundColor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Email Details (Optional)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email_subject"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Email Subject" fullWidth size="small" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="email_sender"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Email Sender" fullWidth size="small" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>

            {/* Properties */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Priority" fullWidth>
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            
            {isEditing && (
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Status" fullWidth>
                      <MenuItem value="todo">To Do</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="review">Review</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="overdue">Overdue</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Due Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Assignee placeholder (in a real app, this would be an autocomplete fetching users) */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="assigned_to"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Assignee User ID (UUID)"
                    fullWidth
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    helperText="In production, this would be a user dropdown"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
          >
            {isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskFormModal;
