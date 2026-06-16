import { Request, Response } from 'express';
import { MeetingService } from '../services/meeting.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { errors } from '../middleware/errorHandler';

export class MeetingController {
  /**
   * Create a new meeting
   */
  static createMeeting = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    if (!data.title || !data.meeting_date) {
      throw errors.badRequest('Title and meeting_date are required');
    }

    const meeting = await MeetingService.createMeeting(req.user!.userId, data);
    return sendSuccess(res, { meeting }, 'Meeting created successfully', 201);
  });

  /**
   * Get all meetings
   */
  static getMeetings = asyncHandler(async (req: Request, res: Response) => {
    const meetings = await MeetingService.getMeetings();
    return sendSuccess(res, { meetings }, 'Meetings retrieved successfully');
  });

  /**
   * Get meeting by ID
   */
  static getMeetingById = asyncHandler(async (req: Request, res: Response) => {
    const meeting = await MeetingService.getMeetingById(req.params.id);
    if (!meeting) {
      throw errors.notFound('Meeting not found');
    }
    return sendSuccess(res, { meeting }, 'Meeting retrieved successfully');
  });

  /**
   * Add an action item
   */
  static addActionItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // meeting ID
    const data = req.body;
    
    if (!data.task_title) {
      throw errors.badRequest('task_title is required');
    }

    const actionItem = await MeetingService.addActionItem({
      meeting_id: id,
      ...data
    });

    return sendSuccess(res, { actionItem }, 'Action item added successfully', 201);
  });

  /**
   * Convert action item to task
   */
  static convertActionItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // action item ID
    
    const actionItem = await MeetingService.convertActionItemToTask(id, req.user!.userId);
    return sendSuccess(res, { actionItem }, 'Action item converted to task successfully');
  });
}
