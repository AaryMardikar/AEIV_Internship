import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { AuthTokenPayload, UserRole } from '../types';
import { errors } from './errorHandler';

// ─── JWT Authentication Middleware ────────────────────────────────────────────
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(errors.unauthorized('No token provided. Please log in.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = payload;
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      return next(errors.unauthorized('Your session has expired. Please log in again.'));
    }
    return next(errors.unauthorized('Invalid authentication token.'));
  }
};

// ─── Optional Authentication ──────────────────────────────────────────────────
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
  } catch {
    // silently ignore
  }
  next();
};

// ─── Role-Based Access Control ────────────────────────────────────────────────
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(errors.unauthorized('Authentication required.'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        errors.forbidden(
          `Access denied. Required: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }
    next();
  };
};

// ─── Self or Admin Guard ──────────────────────────────────────────────────────
export const authorizeSelfOrAdmin = (userIdParam = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(errors.unauthorized('Authentication required.'));
    const isOwn = req.user.userId === req.params[userIdParam];
    const isAdmin = req.user.role === 'admin';
    if (!isOwn && !isAdmin) {
      return next(errors.forbidden('You do not have permission to access this resource.'));
    }
    next();
  };
};

// ─── Token Utilities ──────────────────────────────────────────────────────────
export const generateAccessToken = (payload: AuthTokenPayload): string =>
  jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role, name: payload.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );

export const generateRefreshToken = (userId: string): string =>
  jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as jwt.SignOptions);

export const verifyRefreshToken = (token: string): { userId: string } =>
  jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
