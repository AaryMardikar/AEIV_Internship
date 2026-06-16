import { Request, Response } from 'express';
import { ApprovalService, ApprovalFilterOptions } from '../services/approval.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';

export class ApprovalController {
  /**
   * Create a new approval request
   */
  static createApproval = asyncHandler(async (req: Request, res: Response) => {
    const requesterId = req.user!.userId;
    const approval = await ApprovalService.createApproval(req.body, requesterId);

    return sendCreated(res, { approval }, 'Approval created successfully');
  });

  /**
   * Get approvals with pagination and filters
   */
  static getApprovals = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    
    const options: ApprovalFilterOptions = {
      userId,
      role: req.query.role as 'requester' | 'approver',
      status: req.query.status as string,
      type: req.query.type as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await ApprovalService.getApprovals(options);

    return sendSuccess(res, result, 'Approvals retrieved successfully');
  });

  /**
   * Get single approval
   */
  static getApproval = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const approval = await ApprovalService.getApprovalById(id);

    return sendSuccess(res, { approval }, 'Approval retrieved successfully');
  });

  /**
   * Update approval status
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    
    const approval = await ApprovalService.updateApprovalStatus(id, userId, req.body);

    return sendSuccess(res, { approval }, 'Approval status updated successfully');
  });
}
