import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface FollowUp {
  id: string;
  task_id: string;
  reminder_date: string;
  escalation_date?: string;
  status: 'pending' | 'completed' | 'escalated' | 'overdue';
  reminder_sent: boolean;
  task_title?: string;
  task_status?: string;
}

export const FOLLOW_UPS_KEY = ['follow-ups'];

export const useFollowUps = () => {
  return useQuery({
    queryKey: FOLLOW_UPS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { followUps: FollowUp[] } }>(ENDPOINTS.followUps.list);
      return data.data.followUps;
    },
  });
};

export const useFollowUpsByTask = (taskId?: string) => {
  return useQuery({
    queryKey: [...FOLLOW_UPS_KEY, 'task', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data } = await apiClient.get<{ data: { followUps: FollowUp[] } }>(ENDPOINTS.followUps.getByTask(taskId));
      return data.data.followUps;
    },
    enabled: !!taskId,
  });
};

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { task_id: string; reminder_date: string; escalation_date?: string }) => {
      const { data } = await apiClient.post<{ data: { followUp: FollowUp } }>(ENDPOINTS.followUps.create, payload);
      return data.data.followUp;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_KEY });
      queryClient.invalidateQueries({ queryKey: [...FOLLOW_UPS_KEY, 'task', variables.task_id] });
    },
  });
};

export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status?: string; reminder_date?: string; escalation_date?: string }) => {
      const { data } = await apiClient.patch<{ data: { followUp: FollowUp } }>(ENDPOINTS.followUps.update(id), payload);
      return data.data.followUp;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: FOLLOW_UPS_KEY });
      if (data.task_id) {
        queryClient.invalidateQueries({ queryKey: [...FOLLOW_UPS_KEY, 'task', data.task_id] });
      }
    },
  });
};
