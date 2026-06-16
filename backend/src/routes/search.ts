import { Router } from 'express';
import { query } from 'express-validator';
import { SearchController } from '../controllers/search.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Secure all search endpoints
router.use(authenticate);

// Global search query
router.get(
  '/',
  [
    query('q').trim().notEmpty().withMessage('Search query (q) is required'),
    query('type').optional().isIn(['all', 'tasks', 'approvals', 'meetings', 'documents', 'notifications']).withMessage('Invalid search type'),
  ],
  validateRequest,
  SearchController.search
);

export default router;
