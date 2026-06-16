import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import {
  registerValidators,
  loginValidators,
  refreshValidators,
} from '../utils/validators';

const router = Router();

// ─── Auth Routes ──────────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register
 * @desc    Create a new user account
 * @access  Public
 */
router.post(
  '/register',
  registerValidators,
  validateRequest,
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & return JWT tokens
 * @access  Public
 */
router.post(
  '/login',
  loginValidators,
  validateRequest,
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Issue a new access token using a valid refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  refreshValidators,
  validateRequest,
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Revoke a single refresh token
 * @access  Public (token optional — silently ignored if missing)
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Revoke ALL refresh tokens for the authenticated user
 * @access  Protected
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the currently authenticated user's profile
 * @access  Protected
 */
router.get('/me', authenticate, authController.getMe);

export default router;
