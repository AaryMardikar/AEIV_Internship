import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';

export class NotificationController {
  /**
   * Get user notifications
   */
  static getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const notifications = await NotificationService.getUserNotifications(userId);
    return sendSuccess(res, { notifications }, 'Notifications retrieved');
  });

  /**
   * Mark notification as read
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const notification = await NotificationService.markAsRead(id, userId);
    return sendSuccess(res, { notification }, 'Notification marked as read');
  });

  /**
   * Mark all notifications as read
   */
  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    await NotificationService.markAllAsRead(userId);
    return sendSuccess(res, null, 'All notifications marked as read');
  });
}
