import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import logger, { morganStream } from '../config/logger';

// ─── Request ID Middleware ────────────────────────────────────────────────────
// Attaches a unique request ID to each request for tracing
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// ─── Morgan HTTP Logging Token ────────────────────────────────────────────────
morgan.token('request-id', (req: Request) => req.requestId || '-');
morgan.token('user-id', (req: Request) => req.user?.userId || 'anonymous');
morgan.token('user-role', (req: Request) => req.user?.role || '-');

// ─── Morgan Format String ─────────────────────────────────────────────────────
const morganFormat = [
  ':request-id',
  ':method',
  ':url',
  ':status',
  ':res[content-length]',
  '-',
  ':response-time ms',
  '| user=:user-id',
  'role=:user-role',
  'ip=:remote-addr',
].join(' ');

// ─── HTTP Request Logger Middleware ──────────────────────────────────────────
export const httpLogger = morgan(morganFormat, {
  stream: morganStream,
  skip: (req) => req.url === '/health' || req.url === '/api/health',
});

// ─── Request Context Logger ───────────────────────────────────────────────────
// Adds structured context to each request for downstream logging
export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  logger.debug('Incoming request', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  next();
};
