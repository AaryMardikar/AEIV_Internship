import { Router } from 'express';
import { body, query } from 'express-validator';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Apply authentication to all task routes
router.use(authenticate);

// ─── Validators ───────────────────────────────────────────────────────────────

const validStatuses = ['todo', 'in_progress', 'review', 'completed', 'overdue', 'draft', 'assigned', 'blocked'];

const createTaskValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 255 }),
  body('email_subject').optional().isString().isLength({ max: 500 }),
  body('email_sender').optional().isString().isLength({ max: 255 }),
  body('description').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('due_date').optional({ nullable: true }).isISO8601().withMessage('Must be a valid date'),
  body('assigned_to').optional({ nullable: true }).isUUID().withMessage('Must be a valid user UUID'),
  body('status').optional().isIn(validStatuses),
  validateRequest,
];

const updateTaskValidation = [
  body('title').optional().notEmpty().isLength({ max: 255 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(validStatuses),
  body('due_date').optional({ nullable: true }).isISO8601(),
  body('assigned_to').optional({ nullable: true }).isUUID(),
  validateRequest,
];

const updateStatusValidation = [
  body('status').isIn(validStatuses).withMessage('Invalid status'),
  validateRequest,
];

const getTasksValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(validStatuses),
  query('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('search').optional().isString(),
  validateRequest,
];

const addCommentValidation = [
  body('content').notEmpty().withMessage('Content is required'),
  validateRequest,
];

const addAttachmentValidation = [
  body('fileName').notEmpty(),
  body('fileType').notEmpty(),
  body('fileSize').isInt({ min: 1 }),
  body('fileData').notEmpty(),
  validateRequest,
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.route('/')
  .post(createTaskValidation, TaskController.createTask)
  .get(getTasksValidation, TaskController.getTasks);

router.route('/:id')
  .get(TaskController.getTask)
  .put(updateTaskValidation, TaskController.updateTask)
  .delete(TaskController.deleteTask);

router.route('/:id/status')
  .patch(updateStatusValidation, TaskController.updateStatus);

router.route('/:id/comments')
  .get(TaskController.getComments)
  .post(addCommentValidation, TaskController.addComment);

router.route('/:id/attachments')
  .get(TaskController.getAttachments)
  .post(addAttachmentValidation, TaskController.addAttachment);

router.route('/:id/activities')
  .get(TaskController.getActivities);

export default router;
