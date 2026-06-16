import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import { AuditService } from '../services/audit.service';

// ─── Auth Controller ──────────────────────────────────────────────────────────

// POST /api/v1/auth/register
export const register = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { name, email, password, role, department } = req.body;
  const { user, tokens } = await authService.register({ name, email, password, role, department });

  return sendCreated(res, { user, ...tokens }, 'Account created successfully');
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.login(email, password);

  // Log audit entry for login
  await AuditService.log(
    user.id,
    'login',
    'user',
    user.id,
    { email: user.email },
    req
  );

  return sendSuccess(res, { user, ...tokens }, 'Login successful');
});

// POST /api/v1/auth/refresh
export const refreshToken = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);

  return sendSuccess(res, tokens, 'Token refreshed successfully');
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  return sendSuccess(res, null, 'Logged out successfully');
});

// POST /api/v1/auth/logout-all
export const logoutAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const userId = req.user!.userId;
  await authService.logoutAll(userId);

  return sendSuccess(res, null, 'All sessions terminated successfully');
});

// GET /api/v1/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = await authService.getMe(req.user!.userId);

  return sendSuccess(res, { user }, 'User retrieved successfully');
});
