import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface Workflow {
  id: string;
  name: string;
  trigger_type: 'email_received' | 'task_created' | 'approval_submitted';
  action_type: 'create_task' | 'send_notification' | 'start_approval';
  status: 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
  creator_name?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  trigger_payload: any;
  status: 'pending' | 'success' | 'failed';
  logs: string;
  created_at: string;
  workflow_name?: string;
  trigger_type?: string;
  action_type?: string;
}

export interface CreateWorkflowDto {
  name: string;
  trigger_type: string;
  action_type: string;
}

const WORKFLOWS_KEY = ['workflows'];
const EXECUTIONS_KEY = ['workflow_executions'];

export const useWorkflows = () => {
  return useQuery({
    queryKey: WORKFLOWS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { workflows: Workflow[] } }>(ENDPOINTS.workflows.list);
      return data.data.workflows;
    },
  });
};

export const useWorkflowExecutions = (limit = 50) => {
  return useQuery({
    queryKey: [...EXECUTIONS_KEY, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { executions: WorkflowExecution[] } }>(ENDPOINTS.workflows.executions, {
        params: { limit },
      });
      return data.data.executions;
    },
    refetchInterval: 5000, // Poll every 5 seconds to see new executions
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWorkflowDto) => {
      const { data } = await apiClient.post<{ data: { workflow: Workflow } }>(ENDPOINTS.workflows.create, payload);
      return data.data.workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
};

export const useUpdateWorkflowStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { data } = await apiClient.patch<{ data: { workflow: Workflow } }>(ENDPOINTS.workflows.updateStatus(id), { status });
      return data.data.workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKFLOWS_KEY });
    },
  });
};

export const useTriggerEmailWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post(ENDPOINTS.workflows.triggerEmail, payload);
    },
    onSuccess: () => {
      // Invalidate executions since an email might trigger a workflow
      queryClient.invalidateQueries({ queryKey: EXECUTIONS_KEY });
    },
  });
};
