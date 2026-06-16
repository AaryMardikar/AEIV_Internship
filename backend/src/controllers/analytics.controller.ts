import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analytics.service';

export class AnalyticsController {
  async getDashboardMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        tasksByStatus,
        approvalsByStatus,
        workflowExecutions,
        overdueTasks,
        productivityTrend,
      ] = await Promise.all([
        analyticsService.getTasksByStatus(),
        analyticsService.getApprovalsByStatus(),
        analyticsService.getWorkflowExecutionsByStatus(),
        analyticsService.getOverdueTasks(),
        analyticsService.getProductivityTrend(),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          tasksByStatus,
          approvalsByStatus,
          workflowExecutions,
          overdueTasks,
          productivityTrend,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
