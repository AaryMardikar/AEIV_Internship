import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, withTransaction } from '../db/database';
import config from '../config/config';
import logger from '../config/logger';
import {
  UserRow,
  UserPublic,
  UserRole,
  AuthTokens,
  RegisterRequest,
} from '../types';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

const toPublic = (user: UserRow): UserPublic => {
  const { password_hash, ...pub } = user;
  void password_hash; // explicitly unused
  return pub;
};

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  // ── Register ────────────────────────────────────────────────────────────────
  async register(data: RegisterRequest): Promise<{ user: UserPublic; tokens: AuthTokens }> {
    const { name, email, password, role = 'employee', department } = data;

    // Duplicate check
    const { rows: existing } = await query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );
    if (existing.length > 0) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const password_hash = await bcrypt.hash(password, config.security.bcryptRounds);

    const { rows } = await query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role, department ?? null]
    );

    const user = rows[0];
    const tokens = await authService._issueTokens(user.id, user.email, user.role, user.name);

    logger.info('New user registered', { userId: user.id, email: user.email, role });
    return { user: toPublic(user), tokens };
  },

  // ── Login ────────────────────────────────────────────────────────────────────
  async login(email: string, password: string): Promise<{ user: UserPublic; tokens: AuthTokens }> {
    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    const user = rows[0];

    // Always run bcrypt compare to prevent timing attacks
    const isValid = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(password, '$2a$12$invalidhashtopreventtimingattacks');

    if (!user || !isValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Update last login timestamp
    await query('UPDATE users SET updated_at = NOW() WHERE id = $1', [user.id]);

    const tokens = await authService._issueTokens(user.id, user.email, user.role, user.name);

    logger.info('User logged in', { userId: user.id, email: user.email });
    return { user: toPublic(user), tokens };
  },

  // ── Refresh Access Token ──────────────────────────────────────────────────────
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    // Verify JWT
    let decoded: { userId: string };
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const tokenHash = hashToken(refreshToken);

    // Lookup token in DB
    const { rows: tokenRows } = await query<{
      id: string;
      user_id: string;
      expires_at: Date;
      revoked_at: Date | null;
    }>(
      `SELECT id, user_id, expires_at, revoked_at
       FROM refresh_tokens
       WHERE token_hash = $1`,
      [tokenHash]
    );

    const storedToken = tokenRows[0];
    if (!storedToken || storedToken.revoked_at || new Date() > storedToken.expires_at) {
      throw new AppError('Refresh token is invalid or has been revoked.', 401);
    }

    if (storedToken.user_id !== decoded.userId) {
      // Token theft detected — revoke all tokens for user
      await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1', [
        storedToken.user_id,
      ]);
      throw new AppError('Token mismatch detected. All sessions revoked.', 401);
    }

    // Fetch user
    const { rows: userRows } = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    const user = userRows[0];
    if (!user) throw new AppError('User not found.', 401);

    // Rotate: revoke old, issue new
    return withTransaction(async (client) => {
      await client.query(
        'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
        [storedToken.id]
      );
      return authService._issueTokens(user.id, user.email, user.role, user.name);
    });
  },

  // ── Logout ───────────────────────────────────────────────────────────────────
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL',
      [tokenHash]
    );
    logger.info('Refresh token revoked', { tokenHash: tokenHash.slice(0, 10) });
  },

  // ── Logout All Devices ────────────────────────────────────────────────────────
  async logoutAll(userId: string): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId]
    );
    logger.info('All sessions revoked for user', { userId });
  },

  // ── Get Current User ──────────────────────────────────────────────────────────
  async getMe(userId: string): Promise<UserPublic> {
    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    if (!rows[0]) throw new AppError('User not found.', 404);
    return toPublic(rows[0]);
  },

  // ── Internal: Issue Token Pair ────────────────────────────────────────────────
  async _issueTokens(
    userId: string,
    email: string,
    role: UserRole,
    name: string
  ): Promise<AuthTokens> {
    const accessToken = generateAccessToken({ userId, email, role, name });
    const refreshToken = generateRefreshToken(userId);
    const tokenHash = hashToken(refreshToken);

    // Persist refresh token (7 days)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  },
};
