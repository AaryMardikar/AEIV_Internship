import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Approval {
  id: string;
  title: string;
  description: string | null;
  type: string;
  requester_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  comments: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  requester_name?: string;
  requester_email?: string;
  requester_department?: string;
  approver_name?: string;
  approver_email?: string;
  approver_department?: string;
}

export interface ApprovalFilterOptions {
  status?: string;
  type?: string;
  role?: 'requester' | 'approver';
  page?: number;
  limit?: number;
}

export interface ApprovalPaginatedResponse {
  data: Approval[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateApprovalDto {
  title: string;
  description?: string;
  type?: string;
  approver_id: string;
}

export interface UpdateApprovalStatusDto {
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  comments?: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

const APPROVALS_QUERY_KEY = ['approvals'];

export const useApprovals = (options: ApprovalFilterOptions) => {
  return useQuery({
    queryKey: [...APPROVALS_QUERY_KEY, options],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: ApprovalPaginatedResponse }>(ENDPOINTS.approvals.list, {
        params: options,
      });
      return data.data;
    },
  });
};

export const useApproval = (id: string) => {
  return useQuery({
    queryKey: [...APPROVALS_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { approval: Approval } }>(ENDPOINTS.approvals.get(id));
      return data.data.approval;
    },
    enabled: !!id,
  });
};

export const useCreateApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (approvalData: CreateApprovalDto) => {
      const { data } = await apiClient.post<{ data: { approval: Approval } }>(ENDPOINTS.approvals.create, approvalData);
      return data.data.approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
    },
  });
};

export const useUpdateApprovalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateApprovalStatusDto }) => {
      const response = await apiClient.patch<{ data: { approval: Approval } }>(ENDPOINTS.approvals.updateStatus(id), data);
      return response.data.data.approval;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPROVALS_QUERY_KEY });
    },
  });
};
