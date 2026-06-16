import { Router } from 'express';
import { body, param } from 'express-validator';
import { FollowUpController } from '../controllers/follow-up.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    body('task_id').isUUID().withMessage('task_id must be a valid UUID'),
    body('reminder_date').isISO8601().withMessage('reminder_date must be a valid date'),
    body('escalation_date').optional({ nullable: true }).isISO8601().withMessage('escalation_date must be a valid date'),
  ],
  validateRequest,
  FollowUpController.createFollowUp
);

router.get('/', FollowUpController.getUserFollowUps);

router.get(
  '/task/:taskId',
  [
    param('taskId').isUUID().withMessage('Invalid Task ID format'),
  ],
  validateRequest,
  FollowUpController.getFollowUpsByTask
);

router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid Follow-up ID format'),
    body('status').optional().isIn(['pending', 'completed', 'escalated', 'overdue']).withMessage('Invalid status'),
    body('reminder_date').optional().isISO8601().withMessage('reminder_date must be a valid date'),
    body('escalation_date').optional({ nullable: true }).isISO8601().withMessage('escalation_date must be a valid date'),
  ],
  validateRequest,
  FollowUpController.updateFollowUp
);

export default router;
