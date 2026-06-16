import { query } from '../db/database';
import { TaskService } from './task.service';
import { errors } from '../middleware/errorHandler';

export interface CreateMeetingDto {
  title: string;
  meeting_date: string;
  notes?: string;
  participants?: string[];
}

export interface CreateActionItemDto {
  meeting_id: string;
  task_title: string;
  owner_id?: string;
  due_date?: string;
}

export class MeetingService {
  /**
   * Create a new meeting
   */
  static async createMeeting(userId: string, data: CreateMeetingDto) {
    const { title, meeting_date, notes, participants } = data;

    const { rows } = await query<any>(
      `INSERT INTO meetings (title, meeting_date, notes, participants, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, meeting_date, notes, participants || [], userId]
    );

    return rows[0];
  }

  /**
   * Get all meetings
   */
  static async getMeetings() {
    const { rows } = await query<any>(
      `SELECT m.*, u.name as creator_name
       FROM meetings m
       JOIN users u ON m.created_by = u.id
       ORDER BY m.meeting_date DESC`
    );
    return rows;
  }

  /**
   * Get meeting by ID
   */
  static async getMeetingById(id: string) {
    const { rows } = await query<any>(
      `SELECT m.*, u.name as creator_name
       FROM meetings m
       JOIN users u ON m.created_by = u.id
       WHERE m.id = $1`,
      [id]
    );
    
    if (!rows[0]) return null;

    const actionItems = await this.getActionItems(id);
    return { ...rows[0], actionItems };
  }

  /**
   * Add an action item to a meeting
   */
  static async addActionItem(data: CreateActionItemDto) {
    const { meeting_id, task_title, owner_id, due_date } = data;

    const { rows } = await query<any>(
      `INSERT INTO action_items (meeting_id, task_title, owner_id, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [meeting_id, task_title, owner_id || null, due_date || null]
    );

    return rows[0];
  }

  /**
   * Get action items for a meeting
   */
  static async getActionItems(meetingId: string) {
    const { rows } = await query<any>(
      `SELECT a.*, u.name as owner_name, t.status as task_status
       FROM action_items a
       LEFT JOIN users u ON a.owner_id = u.id
       LEFT JOIN tasks t ON a.task_id = t.id
       WHERE a.meeting_id = $1
       ORDER BY a.created_at ASC`,
      [meetingId]
    );
    return rows;
  }

  /**
   * Convert action item to task
   */
  static async convertActionItemToTask(actionItemId: string, userId: string) {
    // 1. Get Action Item
    const { rows } = await query<any>(
      `SELECT * FROM action_items WHERE id = $1`,
      [actionItemId]
    );
    const actionItem = rows[0];

    if (!actionItem) {
      throw errors.notFound('Action item not found');
    }

    if (actionItem.status === 'converted') {
      throw errors.badRequest('Action item is already converted to a task');
    }

    // 2. Get Meeting context
    const meeting = await this.getMeetingById(actionItem.meeting_id);

    // 3. Create Task
    const taskData = {
      title: actionItem.task_title,
      description: `Auto-generated from action item in meeting: ${meeting?.title}`,
      assigned_to: actionItem.owner_id || userId, // fallback to creator
      due_date: actionItem.due_date,
      priority: 'medium' as any,
    };

    const task = await TaskService.createTask(taskData, userId);

    // 4. Update Action Item status and task_id
    const { rows: updatedRows } = await query<any>(
      `UPDATE action_items 
       SET status = 'converted', task_id = $1
       WHERE id = $2
       RETURNING *`,
      [task.id, actionItemId]
    );

    return updatedRows[0];
  }
}
