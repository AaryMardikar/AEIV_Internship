import { query } from '../db/database';
import logger from '../config/logger';

export class AnalyticsService {
  /**
   * Get count of tasks grouped by status
   */
  async getTasksByStatus(): Promise<{ status: string; count: number }[]> {
    const { rows } = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`
    );
    return rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));
  }

  /**
   * Get count of approvals grouped by status
   */
  async getApprovalsByStatus(): Promise<{ status: string; count: number }[]> {
    const { rows } = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM approvals GROUP BY status`
    );
    return rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));
  }

  /**
   * Get count of workflow executions grouped by status
   */
  async getWorkflowExecutionsByStatus(): Promise<{ status: string; count: number }[]> {
    const { rows } = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM workflow_executions GROUP BY status`
    );
    return rows.map((r) => ({ status: r.status, count: parseInt(r.count, 10) }));
  }

  /**
   * Get overdue tasks (status != completed and due_date < NOW)
   */
  async getOverdueTasks(): Promise<any[]> {
    const { rows } = await query(
      `SELECT id, title, priority, due_date, status
       FROM tasks 
       WHERE due_date < NOW() AND status != 'completed' 
       ORDER BY due_date ASC 
       LIMIT 10`
    );
    return rows;
  }

  /**
   * Get productivity trend (completed tasks per day for last 7 days)
   */
  async getProductivityTrend(): Promise<{ date: string; count: number }[]> {
    const { rows } = await query<{ date: string; count: string }>(
      `SELECT DATE(updated_at) as date, COUNT(*) as count 
       FROM tasks 
       WHERE status = 'completed' AND updated_at >= NOW() - INTERVAL '7 days' 
       GROUP BY DATE(updated_at) 
       ORDER BY date ASC`
    );
    return rows.map((r) => ({ date: new Date(r.date).toISOString().split('T')[0], count: parseInt(r.count, 10) }));
  }
}

export const analyticsService = new AnalyticsService();
