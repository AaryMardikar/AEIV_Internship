import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config/config';
import logger from './config/logger';
import { httpLogger, requestId, requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import apiRouter from './routes';

// ─── Express Application Factory ──────────────────────────────────────────────
const createApp = (): Application => {
  const app = express();

  // ── Security Headers ────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // ── CORS ────────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || config.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: ${origin} is not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  }));

  // ── Compression ─────────────────────────────────────────────────────────────
  app.use(compression());

  // ── Rate Limiting ───────────────────────────────────────────────────────────
  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
    },
    skip: (req) => req.url === '/health',
  }));

  // ── Body Parsers ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ── Request Tracing & Logging ────────────────────────────────────────────────
  app.use(requestId);
  app.use(httpLogger);
  app.use(requestLogger);

  // ── Liveness Probe (root level) ──────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ── API Routes ───────────────────────────────────────────────────────────────
  app.use(`/api/${config.apiVersion}`, apiRouter);

  // ── 404 Handler ─────────────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── Global Error Handler ─────────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

export default createApp;
