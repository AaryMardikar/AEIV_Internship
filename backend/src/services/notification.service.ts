import { query } from '../db/database';
import { SocketService } from './socket.service';

export interface CreateNotificationDto {
  user_id: string;
  title: string;
  message: string;
  type?: string;
}

export class NotificationService {
  /**
   * Create a new notification and emit socket event
   */
  static async createNotification(data: CreateNotificationDto) {
    const { user_id, title, message, type = 'info' } = data;

    const { rows } = await query<any>(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, title, message, type]
    );

    const notification = rows[0];

    // Emit event to connected user
    SocketService.sendNotificationToUser(user_id, 'new_notification', notification);

    return notification;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId: string, limit = 20) {
    const { rows } = await query<any>(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );
    return rows;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string, userId: string) {
    const { rows } = await query<any>(
      `UPDATE notifications 
       SET read_status = true 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );
    return rows[0];
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    await query<any>(
      `UPDATE notifications 
       SET read_status = true 
       WHERE user_id = $1 AND read_status = false`,
      [userId]
    );
  }
}
