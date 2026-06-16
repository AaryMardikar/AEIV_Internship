import { query } from '../db/database';
import { AppError } from '../middleware/errorHandler';

export interface CreateWorkflowDto {
  name: string;
  trigger_type: 'email_received' | 'task_created' | 'approval_submitted';
  action_type: 'create_task' | 'send_notification' | 'start_approval';
  status?: 'active' | 'inactive';
}

export class WorkflowService {
  /**
   * Create a new workflow
   */
  static async createWorkflow(data: CreateWorkflowDto, createdBy: string) {
    const { name, trigger_type, action_type, status = 'active' } = data;

    const { rows } = await query<any>(
      `INSERT INTO workflows (name, trigger_type, action_type, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, trigger_type, action_type, status, createdBy]
    );

    return rows[0];
  }

  /**
   * Get all workflows
   */
  static async getWorkflows() {
    const { rows } = await query<any>(
      `SELECT w.*, u.name as creator_name 
       FROM workflows w
       LEFT JOIN users u ON w.created_by = u.id
       ORDER BY w.created_at DESC`
    );
    return rows;
  }

  /**
   * Update workflow status (active/inactive)
   */
  static async updateWorkflowStatus(id: string, status: 'active' | 'inactive') {
    const { rows } = await query<any>(
      `UPDATE workflows SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (rows.length === 0) {
      throw new AppError('Workflow not found', 404);
    }

    return rows[0];
  }

  /**
   * Get workflow execution history
   */
  static async getWorkflowExecutions(limit = 50) {
    const { rows } = await query<any>(
      `SELECT e.*, w.name as workflow_name, w.trigger_type, w.action_type
       FROM workflow_executions e
       JOIN workflows w ON e.workflow_id = w.id
       ORDER BY e.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return rows;
  }
}
