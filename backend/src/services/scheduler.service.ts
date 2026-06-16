import cron from 'node-cron';
import logger from '../config/logger';
import { FollowUpService } from './follow-up.service';
import { NotificationService } from './notification.service';

export class SchedulerService {
  private static reminderJob: any;
  private static escalationJob: any;

  /**
   * Start the background scheduler jobs
   */
  static start() {
    logger.info('Starting SchedulerService...');

    // Reminder Job: Every 1 minute
    this.reminderJob = cron.schedule('* * * * *', async () => {
      try {
        const reminders = await FollowUpService.getDueReminders();
        
        if (reminders.length > 0) {
          logger.info(`Processing ${reminders.length} due reminders...`);
          
          for (const followUp of reminders) {
            // Notify Assignee
            await NotificationService.createNotification({
              user_id: followUp.assignee_id,
              title: `Reminder: ${followUp.task_title}`,
              message: 'This is an automated reminder for your task.',
              type: 'info'
            });

            // Mark reminder as sent
            await FollowUpService.updateFollowUp(followUp.id, {
              reminder_sent: true,
              // If there's no escalation date, we can mark it completed so it doesn't just sit there
              // However, since we filter by reminder_sent=false, it won't trigger again anyway.
              // Let's just update the status to 'overdue' if we want it to be red in UI.
              status: followUp.escalation_date ? 'pending' : 'overdue',
            });
          }
        }
      } catch (error) {
        logger.error('Error processing reminder job', { error });
      }
    });

    // Escalation Job: Every 1 minute
    this.escalationJob = cron.schedule('* * * * *', async () => {
      try {
        const escalations = await FollowUpService.getDueEscalations();
        
        if (escalations.length > 0) {
          logger.info(`Processing ${escalations.length} due escalations...`);
          
          for (const followUp of escalations) {
            // Notify Manager/Creator
            await NotificationService.createNotification({
              user_id: followUp.creator_id,
              title: `Escalation: ${followUp.task_title}`,
              message: `The task assigned has breached the escalation date.`,
              type: 'warning'
            });

            // Notify Assignee
            await NotificationService.createNotification({
              user_id: followUp.assignee_id,
              title: `Escalated: ${followUp.task_title}`,
              message: `This task has been escalated.`,
              type: 'warning'
            });

            // Mark as escalated
            await FollowUpService.updateFollowUp(followUp.id, {
              status: 'escalated'
            });
          }
        }
      } catch (error) {
        logger.error('Error processing escalation job', { error });
      }
    });

    logger.info('SchedulerService jobs registered successfully.');
  }

  /**
   * Stop the background scheduler jobs
   */
  static stop() {
    if (this.reminderJob) {
      this.reminderJob.stop();
    }
    if (this.escalationJob) {
      this.escalationJob.stop();
    }
    logger.info('SchedulerService stopped.');
  }
}
