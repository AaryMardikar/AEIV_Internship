import { Request, Response } from 'express';
import { TaskService, TaskFilterOptions } from '../services/task.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';

export class TaskController {
  /**
   * Create a new task
   */
  static createTask = asyncHandler(async (req: Request, res: Response) => {
    const createdBy = req.user!.userId;
    const task = await TaskService.createTask(req.body, createdBy);

    return sendCreated(res, { task }, 'Task created successfully');
  });

  /**
   * Get tasks with pagination, search, and filtering
   */
  static getTasks = asyncHandler(async (req: Request, res: Response) => {
    const options: TaskFilterOptions = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await TaskService.getTasks(options);

    return sendSuccess(res, result, 'Tasks retrieved successfully');
  });

  /**
   * Get single task
   */
  static getTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const task = await TaskService.getTaskById(id);

    return sendSuccess(res, { task }, 'Task retrieved successfully');
  });

  /**
   * Update task
   */
  static updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedBy = req.user!.userId;
    const task = await TaskService.updateTask(id, req.body, updatedBy);

    return sendSuccess(res, { task }, 'Task updated successfully');
  });

  /**
   * Delete task
   */
  static deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await TaskService.deleteTask(id);

    return sendSuccess(res, null, 'Task deleted successfully');
  });

  /**
   * Mark task status (e.g., complete)
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.user!.userId;
    
    const task = await TaskService.updateTaskStatus(id, status, updatedBy);

    return sendSuccess(res, { task }, 'Task status updated successfully');
  });

  /**
   * Comments
   */
  static addComment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;
    const comment = await TaskService.addComment(id, userId, content);
    return sendCreated(res, { comment }, 'Comment added successfully');
  });

  static getComments = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const comments = await TaskService.getComments(id);
    return sendSuccess(res, { comments }, 'Comments retrieved successfully');
  });

  /**
   * Attachments
   */
  static addAttachment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { fileName, fileType, fileSize, fileData } = req.body;
    const userId = req.user!.userId;
    const attachment = await TaskService.addAttachment(id, userId, fileName, fileType, fileSize, fileData);
    return sendCreated(res, { attachment }, 'Attachment added successfully');
  });

  static getAttachments = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const attachments = await TaskService.getAttachments(id);
    return sendSuccess(res, { attachments }, 'Attachments retrieved successfully');
  });

  /**
   * Activities
   */
  static getActivities = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const activities = await TaskService.getActivities(id);
    return sendSuccess(res, { activities }, 'Activities retrieved successfully');
  });
}
