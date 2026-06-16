import { query } from './database';
import logger from '../config/logger';

// ─── Database Migration Script ────────────────────────────────────────────────

const migrations = [
  // ── 1. Auth Role Enum Type ──────────────────────────────────────────────────
  {
    name: 'create_user_role_enum',
    sql: `
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `,
  },

  // ── 2. Users Table ───────────────────────────────────────────────────────────
  {
    name: 'create_users_table_v2',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(200) NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role          user_role   NOT NULL DEFAULT 'employee',
        department    VARCHAR(100),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
    `,
  },

  // ── 3. Refresh Tokens Table ──────────────────────────────────────────────────
  {
    name: 'create_refresh_tokens_table_v2',
    sql: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        revoked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
    `,
  },

  // ── 4. Audit Logs Table ──────────────────────────────────────────────────────
  {
    name: 'create_audit_logs_table_v2',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
        action      VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id   UUID,
        ip_address  INET,
        user_agent  TEXT,
        metadata    JSONB       NOT NULL DEFAULT '{}',
        timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id    ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action     ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp  ON audit_logs(timestamp DESC);
    `,
  },

  // ── 5. Auto-update updated_at Trigger ────────────────────────────────────────
  {
    name: 'create_updated_at_trigger_v2',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },

  // ── 6. Seed Default Admin ─────────────────────────────────────────────────────
  // Default admin: admin@owh.com / Admin@123 (bcrypt hash)
  {
    name: 'seed_default_admin',
    sql: `
      INSERT INTO users (name, email, password_hash, role, department)
      VALUES (
        'System Admin',
        'admin@owh.com',
        '$2a$12$9A4TQXQI2RMiv3hQxYcA9exdh/XIik0LbYXVkRPI87JLpSHM4YiQS',
        'admin',
        'IT'
      )
      ON CONFLICT (email) DO NOTHING;
    `,
  },

  // ── 7. Tasks Table ────────────────────────────────────────────────────────────
  {
    name: 'create_tasks_table',
    sql: `
      DO $$ BEGIN
        CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
        CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'completed', 'overdue');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS tasks (
        id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
        email_subject VARCHAR(500),
        email_sender  VARCHAR(255),
        title         VARCHAR(255)  NOT NULL,
        description   TEXT,
        priority      task_priority NOT NULL DEFAULT 'medium',
        due_date      TIMESTAMPTZ,
        status        task_status   NOT NULL DEFAULT 'todo',
        assigned_to   UUID          REFERENCES users(id) ON DELETE SET NULL,
        created_by    UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  // ── 8. Advanced Task Module ───────────────────────────────────────────────────
  {
    name: 'advanced_task_module_v1',
    sql: `
      ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'draft';
      ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'assigned';
      ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'blocked';

      CREATE TABLE IF NOT EXISTS task_comments (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id     UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content     TEXT        NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_attachments (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id     UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        file_name   VARCHAR(255) NOT NULL,
        file_type   VARCHAR(100) NOT NULL,
        file_size   INTEGER     NOT NULL,
        file_data   TEXT        NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS task_activities (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id     UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action      VARCHAR(100) NOT NULL,
        metadata    JSONB       NOT NULL DEFAULT '{}',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_activities_task_id ON task_activities(task_id);
    `,
  },
  // ── 9. Approval Workflow Management ───────────────────────────────────────────
  {
    name: 'create_approvals_table_v1',
    sql: `
      DO $$ BEGIN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'escalated');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS approvals (
        id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
        title         VARCHAR(255)    NOT NULL,
        description   TEXT,
        type          VARCHAR(100)    NOT NULL DEFAULT 'general',
        requester_id  UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        approver_id   UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status        approval_status NOT NULL DEFAULT 'pending',
        comments      TEXT,
        created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_approvals_requester_id ON approvals(requester_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_approver_id ON approvals(approver_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);

      DROP TRIGGER IF EXISTS update_approvals_updated_at ON approvals;
      CREATE TRIGGER update_approvals_updated_at
        BEFORE UPDATE ON approvals
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  // ── 10. Workflow Automation ───────────────────────────────────────────────────
  {
    name: 'create_workflows_table_v1',
    sql: `
      DO $$ BEGIN
        CREATE TYPE workflow_trigger_type AS ENUM ('email_received', 'task_created', 'approval_submitted');
        CREATE TYPE workflow_action_type AS ENUM ('create_task', 'send_notification', 'start_approval');
        CREATE TYPE workflow_status AS ENUM ('active', 'inactive');
        CREATE TYPE workflow_execution_status AS ENUM ('pending', 'success', 'failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS workflows (
        id            UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(255)          NOT NULL,
        trigger_type  workflow_trigger_type NOT NULL,
        action_type   workflow_action_type  NOT NULL,
        status        workflow_status       NOT NULL DEFAULT 'active',
        created_by    UUID                  REFERENCES users(id) ON DELETE SET NULL,
        created_at    TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ           NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workflow_executions (
        id              UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id     UUID                      NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        trigger_payload JSONB                     NOT NULL DEFAULT '{}',
        status          workflow_execution_status NOT NULL DEFAULT 'pending',
        logs            TEXT,
        created_at      TIMESTAMPTZ               NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);
      CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
      CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);

      DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
      CREATE TRIGGER update_workflows_updated_at
        BEFORE UPDATE ON workflows
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `,
  },
  // ── 11. Notification Management ───────────────────────────────────────────────
  {
    name: 'create_notifications_table_v1',
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title       VARCHAR(255) NOT NULL,
        message     TEXT        NOT NULL,
        type        VARCHAR(100) NOT NULL DEFAULT 'info',
        read_status BOOLEAN     NOT NULL DEFAULT false,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON notifications(read_status);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
    `,
  },
  // ── 12. Smart Follow-Up Management ────────────────────────────────────────────
  {
    name: 'create_follow_ups_table_v1',
    sql: `
      CREATE TABLE IF NOT EXISTS follow_ups (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id         UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        reminder_date   TIMESTAMPTZ NOT NULL,
        escalation_date TIMESTAMPTZ,
        status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, escalated, overdue
        reminder_sent   BOOLEAN     NOT NULL DEFAULT false,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_timestamp_follow_ups
        BEFORE UPDATE ON follow_ups
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE INDEX IF NOT EXISTS idx_follow_ups_task_id ON follow_ups(task_id);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_reminder_date ON follow_ups(reminder_date);
      CREATE INDEX IF NOT EXISTS idx_follow_ups_escalation_date ON follow_ups(escalation_date);
    `,
  },
  // ── 13. Meetings & Action Items ──────────────────────────────────────────────────
  {
    name: 'create_meetings_and_action_items_v1',
    sql: `
      CREATE TABLE IF NOT EXISTS meetings (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        title           VARCHAR(255) NOT NULL,
        meeting_date    TIMESTAMPTZ NOT NULL,
        notes           TEXT,
        participants    TEXT[]      DEFAULT '{}',
        created_by      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_timestamp_meetings
        BEFORE UPDATE ON meetings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TABLE IF NOT EXISTS action_items (
        id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        meeting_id      UUID        NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
        task_title      VARCHAR(255) NOT NULL,
        owner_id        UUID        REFERENCES users(id) ON DELETE SET NULL,
        due_date        TIMESTAMPTZ,
        status          VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, converted
        task_id         UUID        REFERENCES tasks(id) ON DELETE SET NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_timestamp_action_items
        BEFORE UPDATE ON action_items
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(meeting_date DESC);
      CREATE INDEX IF NOT EXISTS idx_action_items_meeting ON action_items(meeting_id);
    `,
  },
  // ── 14. Document Management ──────────────────────────────────────────────────
  {
    name: 'create_documents_and_versions_v1',
    sql: `
      CREATE TABLE IF NOT EXISTS documents (
        id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        title         VARCHAR(255) NOT NULL,
        task_id       UUID        REFERENCES tasks(id) ON DELETE SET NULL,
        created_by    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TRIGGER set_timestamp_documents
        BEFORE UPDATE ON documents
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TABLE IF NOT EXISTS document_versions (
        id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id    UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        version_number INTEGER     NOT NULL,
        file_name      VARCHAR(255) NOT NULL,
        file_path      VARCHAR(500) NOT NULL,
        file_type      VARCHAR(100) NOT NULL,
        file_size      INTEGER     NOT NULL,
        uploaded_by    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_documents_task_id ON documents(task_id);
      CREATE INDEX IF NOT EXISTS idx_document_versions_doc_id ON document_versions(document_id);
    `,
  },
];

// ─── Run Migrations ───────────────────────────────────────────────────────────
async function runMigrations(): Promise<void> {
  logger.info('Starting database migrations...');

  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL      PRIMARY KEY,
      name       VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  for (const migration of migrations) {
    const { rows } = await query<{ name: string }>(
      'SELECT name FROM schema_migrations WHERE name = $1',
      [migration.name]
    );

    if (rows.length === 0) {
      logger.info(`Applying migration: ${migration.name}`);
      await query(migration.sql);
      await query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]);
      logger.info(`✓ Migration applied: ${migration.name}`);
    } else {
      logger.debug(`  Skipping (already applied): ${migration.name}`);
    }
  }

  logger.info('All migrations completed successfully');
}

runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Migration failed', { error: err.message, stack: err.stack });
    process.exit(1);
  });
