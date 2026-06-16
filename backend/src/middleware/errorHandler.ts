import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// ─── Custom Application Error ─────────────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: { field: string; message: string }[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Common Error Factories ───────────────────────────────────────────────────
export const errors = {
  badRequest: (message = 'Bad request', errs?: { field: string; message: string }[]) =>
    new AppError(message, 400, true, errs),
  unauthorized: (message = 'Unauthorized') => new AppError(message, 401),
  forbidden: (message = 'Forbidden') => new AppError(message, 403),
  notFound: (message = 'Resource not found') => new AppError(message, 404),
  conflict: (message = 'Resource already exists') => new AppError(message, 409),
  unprocessable: (message = 'Unprocessable entity') => new AppError(message, 422),
  tooManyRequests: (message = 'Too many requests') => new AppError(message, 429),
  internal: (message = 'Internal server error') => new AppError(message, 500, false),
};

// ─── Global Error Handler Middleware ─────────────────────────────────────────
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Default error properties
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  let validationErrors: { field: string; message: string }[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    validationErrors = err.errors;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    isOperational = true;
  } else if ((err as NodeJS.ErrnoException).code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    message = 'Resource already exists';
    isOperational = true;
  } else if ((err as NodeJS.ErrnoException).code === '23503') {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference to related resource';
    isOperational = true;
  }

  // Log non-operational (unexpected) errors
  if (!isOperational) {
    const logger = require('../config/logger').default;
    logger.error('Unexpected error', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      requestId: req.requestId,
    });
  }

  const response: ApiResponse = {
    success: false,
    message,
    ...(validationErrors && { errors: validationErrors }),
    ...(process.env.NODE_ENV === 'development' && !isOperational && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

// ─── 404 Not Found Handler ────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(`Cannot ${req.method} ${req.url}`, 404));
};

// ─── Async Handler Wrapper ────────────────────────────────────────────────────
export const asyncHandler = <T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
