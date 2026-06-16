import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export interface TasksByStatus {
  status: string;
  count: number;
}

export interface ApprovalsByStatus {
  status: string;
  count: number;
}

export interface WorkflowExecutions {
  status: string;
  count: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  priority: string;
  due_date: string;
  status: string;
}

export interface ProductivityTrend {
  date: string;
  count: number;
}

export interface DashboardMetricsData {
  tasksByStatus: TasksByStatus[];
  approvalsByStatus: ApprovalsByStatus[];
  workflowExecutions: WorkflowExecutions[];
  overdueTasks: OverdueTask[];
  productivityTrend: ProductivityTrend[];
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async (): Promise<DashboardMetricsData> => {
      const { data } = await apiClient.get(ENDPOINTS.analytics.dashboard);
      return data.data;
    },
  });
};
