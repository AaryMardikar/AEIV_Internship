import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import config from './config';

// ─── Custom Log Formats ───────────────────────────────────────────────────────
const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
});

const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  json()
);

// ─── Daily Rotate File Transport ─────────────────────────────────────────────
const dailyRotateTransport = new DailyRotateFile({
  filename: path.join(config.logging.dir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const errorRotateTransport = new DailyRotateFile({
  filename: path.join(config.logging.dir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: fileFormat,
});

// ─── Logger Instance ─────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: 'outlook-workflow-hub' },
  transports: [
    dailyRotateTransport,
    errorRotateTransport,
  ],
});

// Console transport for non-production
if (config.env !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    })
  );
}

// ─── Stream for Morgan HTTP Logger ───────────────────────────────────────────
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger;
