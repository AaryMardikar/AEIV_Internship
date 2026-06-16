import { ApiResponse } from '../types';
import { Response } from 'express';

// ─── Standard API Response Helpers ───────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

export const sendCreated = <T>(res: Response, data: T, message = 'Created successfully'): Response =>
  sendSuccess(res, data, message, 201);

export const sendNoContent = (res: Response): Response => res.status(204).send();

// ─── Pagination Helper ────────────────────────────────────────────────────────
export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): { page: number; limit: number; offset: number } => {
  const parsedPage = Math.max(1, parseInt(String(page || 1), 10));
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20), 10)));
  const offset = (parsedPage - 1) * parsedLimit;
  return { page: parsedPage, limit: parsedLimit, offset };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): ApiResponse['meta'] => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
