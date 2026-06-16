import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

// ─── Validation Result Handler ────────────────────────────────────────────────
// Checks express-validator results and throws formatted AppError if invalid
export const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.type === 'field' ? err.path : 'general',
      message: err.msg,
    }));

    return next(new AppError('Validation failed', 400, true, errors));
  }

  next();
};
