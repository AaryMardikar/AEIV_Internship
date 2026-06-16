import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';
import { asyncHandler, errors } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

export class AuditController {
  /**
   * Retrieve audit log entries with filters. Enforces Admin role checking.
   */
  static getLogs = asyncHandler(async (req: Request, res: Response) => {
    // Assert Admin permissions
    if (req.user!.role !== 'admin') {
      throw errors.forbidden('Only administrators can access audit logs');
    }

    const action = req.query.action as string | undefined;
    const entityType = req.query.entityType as string | undefined;
    const userId = req.query.userId as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const data = await AuditService.getLogs({
      action,
      entityType,
      userId,
      page,
      limit,
    });

    return sendSuccess(res, data, 'Audit logs retrieved successfully');
  });
}
