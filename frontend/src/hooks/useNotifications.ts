import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read_status: boolean;
  created_at: string;
}

export const NOTIFICATIONS_KEY = ['notifications'];

export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { notifications: Notification[] } }>(ENDPOINTS.notifications.list);
      return data.data.notifications;
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch<{ data: { notification: Notification } }>(ENDPOINTS.notifications.markAsRead(id));
      return data.data.notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch(ENDPOINTS.notifications.markAllAsRead);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};
