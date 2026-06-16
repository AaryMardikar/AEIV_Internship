import apiClient from './client';
import { ApiResponse, AuthResponse, User, RegisterCredentials, LoginCredentials } from '@/types';

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  register: async (data: Omit<RegisterCredentials, 'confirmPassword'>): Promise<AuthResponse> => {
    const { data: res } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data!;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data: res } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data!;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data: res } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return res.data!;
  },

  getMe: async (): Promise<User> => {
    const { data: res } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data!.user;
  },
};

// ─── Health API ───────────────────────────────────────────────────────────────

export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const { data } = await apiClient.get('/health');
    return data;
  },
};

// ─── Endpoints Dictionary ─────────────────────────────────────────────────────

export const ENDPOINTS = {
  tasks: {
    list: '/tasks',
    create: '/tasks',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    updateStatus: (id: string) => `/tasks/${id}/status`,
    delete: (id: string) => `/tasks/${id}`,
    comments: (id: string) => `/tasks/${id}/comments`,
    attachments: (id: string) => `/tasks/${id}/attachments`,
    activities: (id: string) => `/tasks/${id}/activities`,
  },
  approvals: {
    list: '/approvals',
    create: '/approvals',
    get: (id: string) => `/approvals/${id}`,
    updateStatus: (id: string) => `/approvals/${id}/status`,
  },
  workflows: {
    list: '/workflows',
    create: '/workflows',
    updateStatus: (id: string) => `/workflows/${id}/status`,
    executions: '/workflows/executions',
    triggerEmail: '/workflows/trigger/email',
  },
  notifications: {
    list: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
  },
  followUps: {
    list: '/follow-ups',
    create: '/follow-ups',
    getByTask: (taskId: string) => `/follow-ups/task/${taskId}`,
    update: (id: string) => `/follow-ups/${id}`,
  },
  meetings: {
    list: '/meetings',
    create: '/meetings',
    getById: (id: string) => `/meetings/${id}`,
    addActionItem: (id: string) => `/meetings/${id}/action-items`,
    convertActionItem: (id: string) => `/meetings/action-items/${id}/convert`,
  },
  documents: {
    list: '/documents',
    create: '/documents',
    uploadVersion: (id: string) => `/documents/${id}/versions`,
    versions: (id: string) => `/documents/${id}/versions`,
    download: (versionId: string) => `/documents/versions/${versionId}/download`,
    link: (id: string) => `/documents/${id}/link`,
  },
  search: {
    query: '/search',
  },
  audits: {
    list: '/audits',
  },
  analytics: {
    dashboard: '/analytics',
  },
};
