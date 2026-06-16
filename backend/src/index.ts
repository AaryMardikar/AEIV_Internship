import 'dotenv/config';
import createApp from './app';
import config from './config/config';
import logger from './config/logger';
import pool from './db/database';
import { SocketService } from './services/socket.service';
import { SchedulerService } from './services/scheduler.service';
import fs from 'fs';
import path from 'path';

// ─── Server Entry Point ───────────────────────────────────────────────────────
const startServer = async (): Promise<void> => {
  // Ensure the uploads directory exists
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created upload directory at: ${uploadDir}`);
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`🚀 Outlook Workflow Hub API started`, {
      environment: config.env,
      port: config.port,
      apiBase: `/api/${config.apiVersion}`,
      healthCheck: `http://localhost:${config.port}/health`,
    });
  });

  // Initialize Socket.IO
  SocketService.initialize(server);
  
  // Start Background Jobs
  SchedulerService.start();

  // ── Graceful Shutdown ──────────────────────────────────────────────────────
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);
    SchedulerService.stop();

    server.close(async () => {
      logger.info('HTTP server closed');

      try {
        await pool.end();
        logger.info('Database pool closed');
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during database pool shutdown', { error: (err as Error).message });
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, 30_000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // ── Unhandled Errors ──────────────────────────────────────────────────────
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception - shutting down', {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Promise Rejection - shutting down', { reason });
    process.exit(1);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
