import { query } from '../db/database';
import { AppError } from '../middleware/errorHandler';
import { WorkflowEngineService } from './workflow-engine.service';
import { AuditService } from './audit.service';

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

export interface ApprovalFilterOptions {
  status?: string;
  type?: string;
  role?: 'requester' | 'approver';
  userId: string;
  page?: number;
  limit?: number;
}

export class ApprovalService {
  /**
   * Create a new approval request
   */
  static async createApproval(data: CreateApprovalDto, requesterId: string) {
    const { title, description, type = 'general', approver_id } = data;

    const { rows } = await query<any>(
      `INSERT INTO approvals (title, description, type, requester_id, approver_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, description, type, requesterId, approver_id]
    );

    const approval = await this.getApprovalById(rows[0].id);

    // Log audit event for approval creation
    await AuditService.log(requesterId, 'approval_created', 'approval', approval.id, { title: approval.title });

    // Dispatch to workflow engine
    WorkflowEngineService.handleEvent('approval_submitted', { approval, userId: requesterId }).catch(console.error);

    return approval;
  }

  /**
   * Get approvals based on filters (pagination, status, user role)
   */
  static async getApprovals(options: ApprovalFilterOptions) {
    const { status, type, role, userId, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT a.*,
             req.name as requester_name, req.email as requester_email, req.department as requester_department,
             app.name as approver_name, app.email as approver_email, app.department as approver_department
      FROM approvals a
      JOIN users req ON a.requester_id = req.id
      JOIN users app ON a.approver_id = app.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (role === 'requester') {
      baseQuery += ` AND a.requester_id = $${paramIndex++}`;
      params.push(userId);
    } else if (role === 'approver') {
      baseQuery += ` AND a.approver_id = $${paramIndex++}`;
      params.push(userId);
    } else {
      // By default, if no role specified, get approvals where user is either requester or approver
      baseQuery += ` AND (a.requester_id = $${paramIndex} OR a.approver_id = $${paramIndex})`;
      params.push(userId);
      paramIndex++;
    }

    if (status) {
      baseQuery += ` AND a.status = $${paramIndex++}`;
      params.push(status);
    }

    if (type) {
      baseQuery += ` AND a.type = $${paramIndex++}`;
      params.push(type);
    }

    // Count total rows
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_table`;
    const { rows: countRows } = await query<any>(countQuery, params);
    const total = parseInt(countRows[0].count, 10);

    // Add pagination and ordering
    baseQuery += ` ORDER BY a.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await query<any>(baseQuery, params);

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
   * Get a single approval by ID
   */
  static async getApprovalById(id: string) {
    const { rows } = await query<any>(
      `SELECT a.*,
              req.name as requester_name, req.email as requester_email, req.department as requester_department,
              app.name as approver_name, app.email as approver_email, app.department as approver_department
       FROM approvals a
       JOIN users req ON a.requester_id = req.id
       JOIN users app ON a.approver_id = app.id
       WHERE a.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      throw new AppError('Approval not found', 404);
    }

    return rows[0];
  }

  /**
   * Update approval status (Approve, Reject, Clarify/Escalate)
   */
  static async updateApprovalStatus(id: string, userId: string, data: UpdateApprovalStatusDto) {
    const { status, comments } = data;
    
    const approval = await this.getApprovalById(id);
    
    // Only approver can approve/reject, but requester might escalate/cancel. Let's restrict to approver for now.
    // If it's a clarification, requester might also reply.
    if (approval.approver_id !== userId && approval.requester_id !== userId) {
      throw new AppError('Unauthorized to update this approval', 403);
    }

    const { rows } = await query<any>(
      `UPDATE approvals
       SET status = COALESCE($1::text::approval_status, status),
           comments = CASE WHEN $2::text IS NOT NULL THEN CONCAT(COALESCE(comments, ''), E'\\n', $2::text) ELSE comments END,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status || approval.status, comments ? `[${new Date().toISOString()}] ${comments}` : null, id]
    );

    // Log audit event for approval status update action
    await AuditService.log(userId, 'approval_action', 'approval', id, { status, comments });

    return this.getApprovalById(rows[0].id);
  }
}
