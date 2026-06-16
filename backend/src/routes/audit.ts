import { Router } from 'express';
import { query } from 'express-validator';
import { AuditController } from '../controllers/audit.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Secure all audit route endpoints
router.use(authenticate);

// Retrieve audit entries
router.get(
  '/',
  [
    query('userId').optional({ checkFalsy: true }).isUUID().withMessage('userId must be a valid UUID'),
    query('action').optional().isString().trim(),
    query('entityType').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('limit must be between 1 and 100'),
  ],
  validateRequest,
  AuditController.getLogs
);

export default router;
