import { Router, Request, Response } from 'express';
import { checkDatabaseHealth, getPoolStats } from '../db/database';
import config from '../config/config';

const router = Router();

// ─── Health Check Endpoint ────────────────────────────────────────────────────
// GET /health  — Lightweight liveness probe
// GET /api/v1/health — Full readiness check with DB status
router.get('/', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  const poolStats = getPoolStats();

  const status = dbHealth.healthy ? 'healthy' : 'degraded';
  const statusCode = dbHealth.healthy ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    services: {
      database: {
        status: dbHealth.healthy ? 'connected' : 'disconnected',
        latency: dbHealth.latency ? `${dbHealth.latency}ms` : undefined,
        error: dbHealth.error,
        pool: {
          total: poolStats.totalCount,
          idle: poolStats.idleCount,
          waiting: poolStats.waitingCount,
        },
      },
      api: {
        status: 'running',
        version: config.apiVersion,
      },
    },
    memory: {
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
    },
  });
});

export default router;
