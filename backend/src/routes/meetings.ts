import { Router } from 'express';
import { body, param } from 'express-validator';
import { MeetingController } from '../controllers/meeting.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
    body('meeting_date').isISO8601().withMessage('meeting_date must be a valid date'),
    body('notes').optional().isString(),
    body('participants').optional().isArray().withMessage('participants must be an array of strings'),
  ],
  validateRequest,
  MeetingController.createMeeting
);

router.get('/', MeetingController.getMeetings);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid Meeting ID format'),
  ],
  validateRequest,
  MeetingController.getMeetingById
);

router.post(
  '/:id/action-items',
  [
    param('id').isUUID().withMessage('Invalid Meeting ID format'),
    body('task_title').trim().notEmpty().withMessage('task_title is required').isLength({ max: 255 }),
    body('owner_id').optional({ nullable: true }).isUUID().withMessage('owner_id must be a valid UUID'),
    body('due_date').optional({ nullable: true }).isISO8601().withMessage('due_date must be a valid date'),
  ],
  validateRequest,
  MeetingController.addActionItem
);

router.post(
  '/action-items/:id/convert',
  [
    param('id').isUUID().withMessage('Invalid Action Item ID format'),
  ],
  validateRequest,
  MeetingController.convertActionItem
);

export default router;
