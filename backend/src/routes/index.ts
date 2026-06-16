import { Router } from 'express';
import healthRouter from './health';
import authRouter from './auth';
import taskRouter from './tasks';
import approvalsRouter from './approvals';
import workflowsRouter from './workflows';
import notificationsRouter from './notifications';
import followUpsRouter from './follow-ups';
import meetingsRouter from './meetings';
import documentsRouter from './documents';
import searchRouter from './search';
import auditRouter from './audit';
import analyticsRouter from './analytics';

// ─── API v1 Router ────────────────────────────────────────────────────────────
const apiRouter = Router();

// ── Core ──────────────────────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);

// ── Auth Module ───────────────────────────────────────────────────────────────
apiRouter.use('/auth', authRouter);

// ── Task Module ───────────────────────────────────────────────────────────────
apiRouter.use('/tasks', taskRouter);

// ── Approvals Module ──────────────────────────────────────────────────────────
apiRouter.use('/approvals', approvalsRouter);

// ── Workflows Module ──────────────────────────────────────────────────────────
apiRouter.use('/workflows', workflowsRouter);

// ── Notifications Module ──────────────────────────────────────────────────────
apiRouter.use('/notifications', notificationsRouter);

// ── Follow-Ups Module ─────────────────────────────────────────────────────────
apiRouter.use('/follow-ups', followUpsRouter);

// ── Meetings Module ───────────────────────────────────────────────────────────
apiRouter.use('/meetings', meetingsRouter);

// ── Document Management Module ────────────────────────────────────────────────
apiRouter.use('/documents', documentsRouter);

// ── Global Search Module ──────────────────────────────────────────────────────
apiRouter.use('/search', searchRouter);

// ── Audit Logging Module ──────────────────────────────────────────────────────
apiRouter.use('/audits', auditRouter);

// ── Analytics Module ──────────────────────────────────────────────────────────
apiRouter.use('/analytics', analyticsRouter);

export default apiRouter;
