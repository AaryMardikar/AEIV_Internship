import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface ActionItem {
  id: string;
  meeting_id: string;
  task_title: string;
  owner_id?: string;
  owner_name?: string;
  due_date?: string;
  status: 'pending' | 'converted';
  task_id?: string;
  task_status?: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
  notes?: string;
  participants?: string[];
  created_by: string;
  creator_name?: string;
  created_at: string;
  actionItems?: ActionItem[];
}

export const MEETINGS_KEY = ['meetings'];

export const useMeetings = () => {
  return useQuery({
    queryKey: MEETINGS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { meetings: Meeting[] } }>(ENDPOINTS.meetings.list);
      return data.data.meetings;
    },
  });
};

export const useMeeting = (id?: string) => {
  return useQuery({
    queryKey: [...MEETINGS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await apiClient.get<{ data: { meeting: Meeting } }>(ENDPOINTS.meetings.getById(id));
      return data.data.meeting;
    },
    enabled: !!id,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; meeting_date: string; notes?: string; participants?: string[] }) => {
      const { data } = await apiClient.post<{ data: { meeting: Meeting } }>(ENDPOINTS.meetings.create, payload);
      return data.data.meeting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEETINGS_KEY });
    },
  });
};

export const useAddActionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ meetingId, payload }: { meetingId: string; payload: { task_title: string; owner_id?: string; due_date?: string } }) => {
      const { data } = await apiClient.post<{ data: { actionItem: ActionItem } }>(ENDPOINTS.meetings.addActionItem(meetingId), payload);
      return data.data.actionItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MEETINGS_KEY, variables.meetingId] });
    },
  });
};

export const useConvertActionItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ actionItemId, meetingId }: { actionItemId: string; meetingId: string }) => {
      const { data } = await apiClient.post<{ data: { actionItem: ActionItem } }>(ENDPOINTS.meetings.convertActionItem(actionItemId));
      return data.data.actionItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...MEETINGS_KEY, variables.meetingId] });
      // Also invalidate tasks since we just created one
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
