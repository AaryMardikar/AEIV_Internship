import { Request, Response } from 'express';
import { FollowUpService } from '../services/follow-up.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { errors } from '../middleware/errorHandler';

export class FollowUpController {
  /**
   * Create a new follow-up
   */
  static createFollowUp = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    if (!data.task_id || !data.reminder_date) {
      throw errors.badRequest('task_id and reminder_date are required');
    }

    const followUp = await FollowUpService.createFollowUp({
      task_id: data.task_id,
      reminder_date: data.reminder_date,
      escalation_date: data.escalation_date,
    });

    return sendSuccess(res, { followUp }, 'Follow-up created successfully', 201);
  });

  /**
   * Get user follow-ups
   */
  static getUserFollowUps = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const followUps = await FollowUpService.getUserFollowUps(userId);
    return sendSuccess(res, { followUps }, 'Follow-ups retrieved successfully');
  });

  /**
   * Get follow-ups by task ID
   */
  static getFollowUpsByTask = asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const followUps = await FollowUpService.getFollowUpsByTask(taskId);
    return sendSuccess(res, { followUps }, 'Follow-ups retrieved successfully');
  });

  /**
   * Update follow-up status or dates
   */
  static updateFollowUp = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;
    
    const followUp = await FollowUpService.updateFollowUp(id, data);
    
    if (!followUp) {
      throw errors.notFound('Follow-up not found');
    }

    return sendSuccess(res, { followUp }, 'Follow-up updated successfully');
  });
}
