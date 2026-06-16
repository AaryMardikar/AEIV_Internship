import { query } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { WorkflowEngineService } from './workflow-engine.service';
import { AuditService } from './audit.service';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface CreateTaskDto {
  title: string;
  email_subject?: string;
  email_sender?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  assigned_to?: string;
  status?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: 'draft' | 'assigned' | 'in_progress' | 'blocked' | 'completed' | 'todo' | 'review' | 'overdue';
}

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface Task {
  id: string;
  email_subject: string | null;
  email_sender: string | null;
  title: string;
  description: string | null;
  priority: string;
  due_date: string | null;
  status: string;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_data: string;
  created_at: string;
  user_name?: string;
}

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  metadata: any;
  created_at: string;
  user_name?: string;
}

// ─── Task Service ─────────────────────────────────────────────────────────────

export class TaskService {
  /**
   * Log an activity
   */
  static async logActivity(taskId: string, userId: string, action: string, metadata: any = {}): Promise<void> {
    await query(
      `INSERT INTO task_activities (task_id, user_id, action, metadata) VALUES ($1, $2, $3, $4)`,
      [taskId, userId, action, metadata]
    );
  }

  /**
   * Create a new task
   */
  static async createTask(data: CreateTaskDto, createdBy: string): Promise<Task> {
    const { rows } = await query<Task>(
      `INSERT INTO tasks (
         title, email_subject, email_sender, description, 
         priority, due_date, assigned_to, created_by, status
       ) 
       VALUES ($1, $2, $3, $4, COALESCE($5::text, 'medium')::task_priority, $6, $7, $8, COALESCE($9::text, 'todo')::task_status) 
       RETURNING *`,
      [
        data.title,
        data.email_subject || null,
        data.email_sender || null,
        data.description || null,
        data.priority || null,
        data.due_date || null,
        data.assigned_to || null,
        createdBy,
        data.status || null,
      ]
    );

    const task = rows[0];
    await this.logActivity(task.id, createdBy, 'task_created', { title: task.title });
    
    // Log audit event for task creation
    await AuditService.log(createdBy, 'task_created', 'task', task.id, { title: task.title });

    // Dispatch to workflow engine (fire and forget)
    WorkflowEngineService.handleEvent('task_created', { task, userId: createdBy }).catch(console.error);

    return task;
  }

  /**
   * Get tasks with filtering, search, and pagination
   */
  static async getTasks(options: TaskFilterOptions) {
    const { status, priority, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (priority) {
      conditions.push(`priority = $${paramIndex++}`);
      values.push(priority);
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR email_subject ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM tasks ${whereClause}`;
    const { rows: countRows } = await query<{ count: string }>(countQuery, values);
    const total = parseInt(countRows[0].count, 10);

    // Get paginated data
    const dataQuery = `
      SELECT t.*, 
             u.name as assignee_name, u.email as assignee_email,
             c.name as creator_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN users c ON t.created_by = c.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    values.push(limit, offset);
    const { rows } = await query<any>(dataQuery, values);

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(taskId: string): Promise<Task> {
    const { rows } = await query<Task>(
      `SELECT t.*, 
              u.name as assignee_name, u.email as assignee_email,
              c.name as creator_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.id = $1`,
      [taskId]
    );

    if (rows.length === 0) {
      throw new AppError('Task not found', 404);
    }

    return rows[0];
  }

  /**
   * Update a task
   */
  static async updateTask(taskId: string, data: UpdateTaskDto, updatedBy: string): Promise<Task> {
    // Check if exists
    await this.getTaskById(taskId);

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return this.getTaskById(taskId);
    }

    values.push(taskId);
    const { rows } = await query<Task>(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    await this.logActivity(taskId, updatedBy, 'task_updated', { updates: Object.keys(data) });

    // Log audit event for task update
    await AuditService.log(updatedBy, 'task_updated', 'task', taskId, { updates: Object.keys(data) });

    return rows[0];
  }

  /**
   * Delete a task
   */
  static async deleteTask(taskId: string): Promise<void> {
    const { rowCount } = await query('DELETE FROM tasks WHERE id = $1', [taskId]);
    
    if (rowCount === 0) {
      throw new AppError('Task not found', 404);
    }
  }

  /**
   * Update task status (e.g., mark complete)
   */
  static async updateTaskStatus(taskId: string, status: string, updatedBy: string): Promise<Task> {
    const { rows } = await query<Task>(
      `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
      [status, taskId]
    );

    if (rows.length === 0) {
      throw new AppError('Task not found', 404);
    }

    await this.logActivity(taskId, updatedBy, 'status_changed', { status });

    return rows[0];
  }

  /**
   * Add a comment
   */
  static async addComment(taskId: string, userId: string, content: string): Promise<TaskComment> {
    const { rows } = await query<TaskComment>(
      `INSERT INTO task_comments (task_id, user_id, content) VALUES ($1, $2, $3) RETURNING *`,
      [taskId, userId, content]
    );
    await this.logActivity(taskId, userId, 'comment_added', { commentId: rows[0].id });
    return rows[0];
  }

  /**
   * Get comments for a task
   */
  static async getComments(taskId: string): Promise<TaskComment[]> {
    const { rows } = await query<TaskComment>(
      `SELECT c.*, u.name as user_name 
       FROM task_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.task_id = $1 
       ORDER BY c.created_at ASC`,
      [taskId]
    );
    return rows;
  }

  /**
   * Add an attachment
   */
  static async addAttachment(taskId: string, userId: string, fileName: string, fileType: string, fileSize: number, fileData: string): Promise<TaskAttachment> {
    const { rows } = await query<TaskAttachment>(
      `INSERT INTO task_attachments (task_id, user_id, file_name, file_type, file_size, file_data) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [taskId, userId, fileName, fileType, fileSize, fileData]
    );
    await this.logActivity(taskId, userId, 'attachment_added', { fileName });
    return rows[0];
  }

  /**
   * Get attachments for a task
   */
  static async getAttachments(taskId: string): Promise<Omit<TaskAttachment, 'file_data'>[]> {
    const { rows } = await query<Omit<TaskAttachment, 'file_data'>>(
      `SELECT a.id, a.task_id, a.user_id, a.file_name, a.file_type, a.file_size, a.created_at, u.name as user_name 
       FROM task_attachments a
       JOIN users u ON a.user_id = u.id
       WHERE a.task_id = $1 
       ORDER BY a.created_at DESC`,
      [taskId]
    );
    return rows;
  }

  /**
   * Get activities for a task
   */
  static async getActivities(taskId: string): Promise<TaskActivity[]> {
    const { rows } = await query<TaskActivity>(
      `SELECT a.*, u.name as user_name 
       FROM task_activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.task_id = $1 
       ORDER BY a.created_at DESC`,
      [taskId]
    );
    return rows;
  }
}
