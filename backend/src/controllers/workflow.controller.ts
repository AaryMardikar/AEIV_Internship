import { Request, Response } from 'express';
import { WorkflowService } from '../services/workflow.service';
import { WorkflowEngineService } from '../services/workflow-engine.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';

export class WorkflowController {
  /**
   * Create a new workflow
   */
  static createWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const workflow = await WorkflowService.createWorkflow(req.body, userId);
    return sendCreated(res, { workflow }, 'Workflow created successfully');
  });

  /**
   * Get all workflows
   */
  static getWorkflows = asyncHandler(async (req: Request, res: Response) => {
    const workflows = await WorkflowService.getWorkflows();
    return sendSuccess(res, { workflows }, 'Workflows retrieved successfully');
  });

  /**
   * Update workflow status
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const workflow = await WorkflowService.updateWorkflowStatus(id, status);
    return sendSuccess(res, { workflow }, 'Workflow status updated');
  });

  /**
   * Get executions
   */
  static getExecutions = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const executions = await WorkflowService.getWorkflowExecutions(limit);
    return sendSuccess(res, { executions }, 'Workflow executions retrieved');
  });

  /**
   * Mock endpoint to trigger an email_received event
   */
  static triggerEmail = asyncHandler(async (req: Request, res: Response) => {
    const payload = {
      ...req.body,
      userId: req.user?.userId,
      event: 'mock_email_received'
    };
    
    // We intentionally don't await this so it runs asynchronously, like a real webhook trigger
    WorkflowEngineService.handleEvent('email_received', payload).catch(console.error);
    
    return sendSuccess(res, null, 'Email received trigger dispatched');
  });
}
