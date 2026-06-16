import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: any;
  timestamp: string;
  user_name?: string;
  user_email?: string;
}

export interface AuditLogResponse {
  logs: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

/**
 * Hook for loading audit logs (Admin only)
 */
export const useAudits = (filters: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audits', filters],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: AuditLogResponse }>(ENDPOINTS.audits.list, {
        params: filters,
      });
      return data.data;
    },
    staleTime: 10000, // Cache for 10s
  });
};
