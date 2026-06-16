import { query } from '../db/database';

export interface CreateFollowUpDto {
  task_id: string;
  reminder_date: string;
  escalation_date?: string;
}

export interface UpdateFollowUpDto {
  reminder_date?: string;
  escalation_date?: string;
  status?: 'pending' | 'completed' | 'escalated' | 'overdue';
  reminder_sent?: boolean;
}

export class FollowUpService {
  /**
   * Create a new follow-up
   */
  static async createFollowUp(data: CreateFollowUpDto) {
    const { task_id, reminder_date, escalation_date } = data;

    const { rows } = await query<any>(
      `INSERT INTO follow_ups (task_id, reminder_date, escalation_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [task_id, reminder_date, escalation_date]
    );

    return rows[0];
  }

  /**
   * Get all follow-ups for a user (based on tasks assigned to them)
   */
  static async getUserFollowUps(userId: string) {
    const { rows } = await query<any>(
      `SELECT f.*, t.title as task_title, t.status as task_status
       FROM follow_ups f
       JOIN tasks t ON f.task_id = t.id
       WHERE t.assigned_to = $1
       ORDER BY f.reminder_date ASC`,
      [userId]
    );
    return rows;
  }

  /**
   * Get follow-ups by task ID
   */
  static async getFollowUpsByTask(taskId: string) {
    const { rows } = await query<any>(
      `SELECT * FROM follow_ups WHERE task_id = $1 ORDER BY reminder_date ASC`,
      [taskId]
    );
    return rows;
  }

  /**
   * Update a follow-up
   */
  static async updateFollowUp(id: string, data: UpdateFollowUpDto) {
    const setValues: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        setValues.push(`${key} = $${paramIndex}`);
        queryParams.push(value);
        paramIndex++;
      }
    });

    if (setValues.length === 0) return null;

    queryParams.push(id);

    const { rows } = await query<any>(
      `UPDATE follow_ups 
       SET ${setValues.join(', ')} 
       WHERE id = $${paramIndex} 
       RETURNING *`,
      queryParams
    );

    return rows[0];
  }

  /**
   * Get all pending follow-ups due for reminder
   */
  static async getDueReminders() {
    const { rows } = await query<any>(
      `SELECT f.*, t.assigned_to AS assignee_id, t.title as task_title
       FROM follow_ups f
       JOIN tasks t ON f.task_id = t.id
       WHERE f.status = 'pending' AND f.reminder_sent = false AND f.reminder_date <= NOW()`
    );
    return rows;
  }

  /**
   * Get all pending follow-ups due for escalation
   */
  static async getDueEscalations() {
    const { rows } = await query<any>(
      `SELECT f.*, t.assigned_to AS assignee_id, t.created_by AS creator_id, t.title as task_title
       FROM follow_ups f
       JOIN tasks t ON f.task_id = t.id
       WHERE f.status = 'pending' AND f.escalation_date <= NOW()`
    );
    return rows;
  }
}
