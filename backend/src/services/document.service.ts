import { query, withTransaction } from '../db/database';
import { errors } from '../middleware/errorHandler';

export interface DocumentDto {
  id: string;
  title: string;
  task_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  version_id?: string;
  version_number?: number;
  file_name?: string;
  file_path?: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  creator_name?: string;
  task_title?: string;
}

export interface DocumentVersionDto {
  id: string;
  document_id: string;
  version_number: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

export class DocumentService {
  /**
   * Create logical document and its first version inside a transaction
   */
  static async uploadDocument(
    userId: string,
    title: string,
    taskId: string | null,
    file: { originalname: string; path: string; mimetype: string; size: number }
  ): Promise<DocumentDto> {
    return withTransaction(async (client) => {
      // 1. Create logical document record
      const docResult = await client.query<any>(
        `INSERT INTO documents (title, task_id, created_by)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title, taskId || null, userId]
      );
      const document = docResult.rows[0];

      // 2. Create version 1 record
      const versionResult = await client.query<any>(
        `INSERT INTO document_versions (document_id, version_number, file_name, file_path, file_type, file_size, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [document.id, 1, file.originalname, file.path, file.mimetype, file.size, userId]
      );
      const version = versionResult.rows[0];

      return {
        ...document,
        version_id: version.id,
        version_number: version.version_number,
        file_name: version.file_name,
        file_path: version.file_path,
        file_type: version.file_type,
        file_size: version.file_size,
        uploaded_by: version.uploaded_by,
      };
    });
  }

  /**
   * Upload a new version to an existing document inside a transaction
   */
  static async uploadVersion(
    documentId: string,
    userId: string,
    file: { originalname: string; path: string; mimetype: string; size: number }
  ): Promise<DocumentVersionDto> {
    return withTransaction(async (client) => {
      // Verify document exists
      const docResult = await client.query<any>(
        `SELECT * FROM documents WHERE id = $1`,
        [documentId]
      );
      if (docResult.rows.length === 0) {
        throw errors.notFound('Document not found');
      }

      // Determine next version number
      const versionResult = await client.query<any>(
        `SELECT COALESCE(MAX(version_number), 0) as latest_version
         FROM document_versions
         WHERE document_id = $1`,
        [documentId]
      );
      const latestVersion = versionResult.rows[0]?.latest_version || 0;
      const nextVersion = latestVersion + 1;

      // Insert new version record
      const newVersionResult = await client.query<any>(
        `INSERT INTO document_versions (document_id, version_number, file_name, file_path, file_type, file_size, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [documentId, nextVersion, file.originalname, file.path, file.mimetype, file.size, userId]
      );

      // Touch document updated_at timestamp
      await client.query(
        `UPDATE documents SET updated_at = NOW() WHERE id = $1`,
        [documentId]
      );

      return newVersionResult.rows[0];
    });
  }

  /**
   * Get all documents with their latest version info, optionally filtered by task
   */
  static async getDocuments(taskId?: string | null): Promise<DocumentDto[]> {
    let sql = `
      SELECT d.*, v.id as version_id, v.version_number, v.file_name, v.file_path, v.file_type, v.file_size, v.created_at as uploaded_at, u.name as creator_name, t.title as task_title
      FROM documents d
      JOIN LATERAL (
        SELECT * FROM document_versions dv
        WHERE dv.document_id = d.id
        ORDER BY dv.version_number DESC
        LIMIT 1
      ) v ON true
      JOIN users u ON d.created_by = u.id
      LEFT JOIN tasks t ON d.task_id = t.id
    `;
    const params: any[] = [];

    if (taskId) {
      sql += ` WHERE d.task_id = $1`;
      params.push(taskId);
    }

    sql += ` ORDER BY d.updated_at DESC`;

    const { rows } = await query<any>(sql, params);
    return rows;
  }

  /**
   * Get logical document by id
   */
  static async getDocumentById(id: string): Promise<DocumentDto | null> {
    const { rows } = await query<any>(
      `SELECT d.*, u.name as creator_name
       FROM documents d
       JOIN users u ON d.created_by = u.id
       WHERE d.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Get specific version metadata by id
   */
  static async getVersionById(versionId: string): Promise<DocumentVersionDto | null> {
    const { rows } = await query<any>(
      `SELECT dv.*, u.name as uploader_name
       FROM document_versions dv
       JOIN users u ON dv.uploaded_by = u.id
       WHERE dv.id = $1`,
      [versionId]
    );
    return rows[0] || null;
  }

  /**
   * Get all versions of a document
   */
  static async getDocumentVersions(documentId: string): Promise<DocumentVersionDto[]> {
    const { rows } = await query<any>(
      `SELECT dv.*, u.name as uploader_name
       FROM document_versions dv
       JOIN users u ON dv.uploaded_by = u.id
       WHERE dv.document_id = $1
       ORDER BY dv.version_number DESC`,
      [documentId]
    );
    return rows;
  }

  /**
   * Link a document to a task
   */
  static async linkToTask(documentId: string, taskId: string | null): Promise<DocumentDto> {
    const { rows } = await query<any>(
      `UPDATE documents
       SET task_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [taskId || null, documentId]
    );

    if (rows.length === 0) {
      throw errors.notFound('Document not found');
    }

    return rows[0];
  }
}
