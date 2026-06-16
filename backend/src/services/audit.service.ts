import { query } from '../db/database';

export interface AuditLogDto {
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

export interface AuditLogFilters {
  action?: string;
  entityType?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export class AuditService {
  /**
   * Log an audit event
   */
  static async log(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string | null,
    metadata: any = {},
    req?: any
  ): Promise<void> {
    const ipAddress = req ? req.ip : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    try {
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId || null,
          action,
          entityType,
          entityId || null,
          ipAddress || null,
          userAgent || null,
          JSON.stringify(metadata),
        ]
      );
    } catch (err) {
      // Standard catch block preventing logging failures from disrupting workflow requests
      console.error('Audit logging failed:', err);
    }
  }

  /**
   * Fetch audit logs with pagination and filters (for Admin dashboard)
   */
  static async getLogs(filters: AuditLogFilters) {
    const { action, entityType, userId, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (action) {
      baseQuery += ` AND a.action = $${paramIndex++}`;
      params.push(action);
    }

    if (entityType) {
      baseQuery += ` AND a.entity_type = $${paramIndex++}`;
      params.push(entityType);
    }

    if (userId) {
      baseQuery += ` AND a.user_id = $${paramIndex++}`;
      params.push(userId);
    }

    // Get count
    const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as count_table`;
    const { rows: countRows } = await query<any>(countQuery, params);
    const total = parseInt(countRows[0].count, 10);

    // Fetch details
    baseQuery += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const { rows } = await query<AuditLogDto>(baseQuery, params);

    return {
      logs: rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
