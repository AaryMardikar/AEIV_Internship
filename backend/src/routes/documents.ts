import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { DocumentController } from '../controllers/document.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Protect all document routes
router.use(authenticate);

// Route mapping
router.post(
  '/',
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }),
    body('taskId').optional({ checkFalsy: true }).isUUID().withMessage('taskId must be a valid UUID'),
  ],
  validateRequest,
  DocumentController.uploadDocument
);

router.post(
  '/:id/versions',
  upload.single('file'),
  [
    param('id').isUUID().withMessage('Invalid Document ID format'),
  ],
  validateRequest,
  DocumentController.uploadVersion
);

router.get(
  '/',
  [
    query('taskId').optional({ checkFalsy: true }).isUUID().withMessage('taskId query must be a valid UUID'),
  ],
  validateRequest,
  DocumentController.getDocuments
);

router.get(
  '/:id/versions',
  [
    param('id').isUUID().withMessage('Invalid Document ID format'),
  ],
  validateRequest,
  DocumentController.getDocumentVersions
);

router.get(
  '/versions/:versionId/download',
  [
    param('versionId').isUUID().withMessage('Invalid Version ID format'),
  ],
  validateRequest,
  DocumentController.downloadVersion
);

router.patch(
  '/:id/link',
  [
    param('id').isUUID().withMessage('Invalid Document ID format'),
    body('taskId').optional({ nullable: true }).custom(value => {
      if (value !== null && value !== '' && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)) {
        throw new Error('taskId must be a valid UUID or null');
      }
      return true;
    }),
  ],
  validateRequest,
  DocumentController.linkToTask
);

export default router;
