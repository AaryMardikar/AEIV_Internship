import { query } from '../db/database';

export interface SearchResult {
  tasks: any[];
  approvals: any[];
  meetings: any[];
  documents: any[];
  notifications: any[];
}

export class SearchService {
  /**
   * Search globally or filter by type across tasks, approvals, meetings, documents, and notifications.
   */
  static async globalSearch(userId: string, q: string, type: string = 'all'): Promise<SearchResult> {
    const searchPattern = `%${q}%`;
    const results: SearchResult = {
      tasks: [],
      approvals: [],
      meetings: [],
      documents: [],
      notifications: [],
    };

    // 1. Task search (Search on title, description, email subject/sender)
    const tasksPromise = (type === 'all' || type === 'tasks')
      ? query<any>(
          `SELECT id, title, description, status, priority, created_at, 'task' as type
           FROM tasks
           WHERE title ILIKE $1 OR description ILIKE $1 OR email_subject ILIKE $1 OR email_sender ILIKE $1
           ORDER BY created_at DESC
           LIMIT 10`,
          [searchPattern]
        ).then(res => res.rows)
      : Promise.resolve([]);

    // 2. Approvals search (Only approvals where user is requester or approver. Search on title, description, type)
    const approvalsPromise = (type === 'all' || type === 'approvals')
      ? query<any>(
          `SELECT id, title, description, status, type as category, created_at, 'approval' as type
           FROM approvals
           WHERE (requester_id = $2 OR approver_id = $2)
             AND (title ILIKE $1 OR description ILIKE $1 OR type ILIKE $1)
           ORDER BY created_at DESC
           LIMIT 10`,
          [searchPattern, userId]
        ).then(res => res.rows)
      : Promise.resolve([]);

    // 3. Meetings search (Search on title, notes, participants)
    const meetingsPromise = (type === 'all' || type === 'meetings')
      ? query<any>(
          `SELECT id, title, notes as description, meeting_date, participants, created_at, 'meeting' as type
           FROM meetings
           WHERE title ILIKE $1 OR notes ILIKE $1 OR array_to_string(participants, ',') ILIKE $1
           ORDER BY meeting_date DESC
           LIMIT 10`,
          [searchPattern]
        ).then(res => res.rows)
      : Promise.resolve([]);

    // 4. Documents search (Search on title, latest version filename)
    const documentsPromise = (type === 'all' || type === 'documents')
      ? query<any>(
          `SELECT d.id, d.title, v.file_name as description, v.version_number, v.file_type, v.file_size, d.updated_at as created_at, 'document' as type
           FROM documents d
           JOIN LATERAL (
             SELECT file_name, version_number, file_type, file_size FROM document_versions dv
             WHERE dv.document_id = d.id
             ORDER BY dv.version_number DESC
             LIMIT 1
           ) v ON true
           WHERE d.title ILIKE $1 OR v.file_name ILIKE $1
           ORDER BY d.updated_at DESC
           LIMIT 10`,
          [searchPattern]
        ).then(res => res.rows)
      : Promise.resolve([]);

    // 5. Notifications search (Only own notifications. Search on title, message)
    const notificationsPromise = (type === 'all' || type === 'notifications')
      ? query<any>(
          `SELECT id, title, message as description, type as category, read_status, created_at, 'notification' as type
           FROM notifications
           WHERE user_id = $2 AND (title ILIKE $1 OR message ILIKE $1)
           ORDER BY created_at DESC
           LIMIT 10`,
          [searchPattern, userId]
        ).then(res => res.rows)
      : Promise.resolve([]);

    // Execute concurrently
    const [tasks, approvals, meetings, documents, notifications] = await Promise.all([
      tasksPromise,
      approvalsPromise,
      meetingsPromise,
      documentsPromise,
      notificationsPromise,
    ]);

    results.tasks = tasks;
    results.approvals = approvals;
    results.meetings = meetings;
    results.documents = documents;
    results.notifications = notifications;

    return results;
  }
}
