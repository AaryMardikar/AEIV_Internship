import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess } from '../utils/response';
import { errors } from '../middleware/errorHandler';
import fs from 'fs';

export class DocumentController {
  /**
   * Upload a new document (creates the logical document + version 1)
   */
  static uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw errors.badRequest('No file uploaded');
    }
    const { title, taskId } = req.body;
    if (!title) {
      throw errors.badRequest('Title is required');
    }

    const document = await DocumentService.uploadDocument(
      req.user!.userId,
      title,
      taskId || null,
      req.file
    );

    return sendSuccess(res, { document }, 'Document uploaded successfully', 201);
  });

  /**
   * Upload a new version to an existing document
   */
  static uploadVersion = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw errors.badRequest('No file uploaded');
    }
    const { id } = req.params; // document ID

    const version = await DocumentService.uploadVersion(
      id,
      req.user!.userId,
      req.file
    );

    return sendSuccess(res, { version }, 'New version uploaded successfully', 201);
  });

  /**
   * Get all documents (optionally filtered by taskId)
   */
  static getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.query.taskId as string | undefined;
    const documents = await DocumentService.getDocuments(taskId || null);
    return sendSuccess(res, { documents }, 'Documents retrieved successfully');
  });

  /**
   * Get all versions of a document
   */
  static getDocumentVersions = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // document ID
    const versions = await DocumentService.getDocumentVersions(id);
    return sendSuccess(res, { versions }, 'Document version history retrieved successfully');
  });

  /**
   * Download a specific document version file
   */
  static downloadVersion = asyncHandler(async (req: Request, res: Response) => {
    const { versionId } = req.params;
    const version = await DocumentService.getVersionById(versionId);
    if (!version) {
      throw errors.notFound('Document version not found');
    }

    if (!fs.existsSync(version.file_path)) {
      throw errors.notFound('File not found on disk');
    }

    res.download(version.file_path, version.file_name);
  });

  /**
   * Link or unlink a document to/from a task
   */
  static linkToTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // document ID
    const { taskId } = req.body;

    const document = await DocumentService.linkToTask(id, taskId || null);
    return sendSuccess(res, { document }, 'Document task linkage updated successfully');
  });
}
