import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  email_subject: string | null;
  email_sender: string | null;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string | null;
  status: string; // Updated to be flexible string to support Kanban columns
  assigned_to: string | null;
  assignee_name?: string;
  assignee_email?: string;
  created_by: string;
  creator_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskPaginatedResponse {
  data: Task[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTaskDto {
  title: string;
  email_subject?: string;
  email_sender?: string;
  description?: string;
  priority?: string;
  due_date?: string | null;
  assigned_to?: string | null;
  status?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  user_name?: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  metadata: any;
  created_at: string;
  user_name?: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const TASKS_QUERY_KEY = ['tasks'];

export const useTasks = (options: TaskFilterOptions) => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, options],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TaskPaginatedResponse }>(ENDPOINTS.tasks.list, {
        params: options,
      });
      return data.data;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { task: Task } }>(ENDPOINTS.tasks.get(id));
      return data.data.task;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: CreateTaskDto) => {
      const { data } = await apiClient.post<{ data: { task: Task } }>(ENDPOINTS.tasks.create, taskData);
      return data.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskDto }) => {
      const response = await apiClient.put<{ data: { task: Task } }>(ENDPOINTS.tasks.update(id), data);
      return response.data.data.task;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.id] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch<{ data: { task: Task } }>(ENDPOINTS.tasks.updateStatus(id), { status });
      return response.data.data.task;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.id] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.tasks.delete(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
};

// ─── Sub-resource Hooks ───────────────────────────────────────────────────────

export const useTaskComments = (taskId: string) => {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { comments: TaskComment[] } }>(ENDPOINTS.tasks.comments(taskId));
      return data.data.comments;
    },
    enabled: !!taskId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, content }: { taskId: string; content: string }) => {
      const { data } = await apiClient.post<{ data: { comment: TaskComment } }>(ENDPOINTS.tasks.comments(taskId), { content });
      return data.data.comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.taskId] });
    },
  });
};

export const useTaskAttachments = (taskId: string) => {
  return useQuery({
    queryKey: ['attachments', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { attachments: TaskAttachment[] } }>(ENDPOINTS.tasks.attachments(taskId));
      return data.data.attachments;
    },
    enabled: !!taskId,
  });
};

export const useAddAttachment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, fileData }: { taskId: string; fileData: { fileName: string; fileType: string; fileSize: number; fileData: string } }) => {
      const { data } = await apiClient.post<{ data: { attachment: TaskAttachment } }>(ENDPOINTS.tasks.attachments(taskId), fileData);
      return data.data.attachment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attachments', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['activities', variables.taskId] });
    },
  });
};

export const useTaskActivities = (taskId: string) => {
  return useQuery({
    queryKey: ['activities', taskId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { activities: TaskActivity[] } }>(ENDPOINTS.tasks.activities(taskId));
      return data.data.activities;
    },
    enabled: !!taskId,
  });
};
