import { Router } from 'express';
import { body } from 'express-validator';
import { WorkflowController } from '../controllers/workflow.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Apply authentication
router.use(authenticate);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('trigger_type').isIn(['email_received', 'task_created', 'approval_submitted']).withMessage('Invalid trigger_type'),
    body('action_type').isIn(['create_task', 'send_notification', 'start_approval']).withMessage('Invalid action_type'),
  ],
  validateRequest,
  WorkflowController.createWorkflow
);

router.get('/', WorkflowController.getWorkflows);

router.get('/executions', WorkflowController.getExecutions);

router.patch(
  '/:id/status',
  [
    body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  ],
  validateRequest,
  WorkflowController.updateStatus
);

// Mock webhook for email
router.post('/trigger/email', WorkflowController.triggerEmail);

export default router;
