import { Router } from 'express';
import { body, query } from 'express-validator';
import { ApprovalController } from '../controllers/approval.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// ─── Approval Routes ──────────────────────────────────────────────────────────

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('approver_id').isUUID().withMessage('Valid approver_id UUID is required'),
    body('type').optional().isString(),
  ],
  validateRequest,
  ApprovalController.createApproval
);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('role').optional().isIn(['requester', 'approver']),
    query('status').optional().isString(),
  ],
  validateRequest,
  ApprovalController.getApprovals
);

router.get('/:id', ApprovalController.getApproval);

router.patch(
  '/:id/status',
  [
    body('status').optional().isIn(['pending', 'approved', 'rejected', 'escalated']),
    body('comments').optional().isString(),
  ],
  validateRequest,
  ApprovalController.updateStatus
);

export default router;
