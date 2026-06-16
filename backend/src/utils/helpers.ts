import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import config from '../config/config';

// ─── Password Utilities ───────────────────────────────────────────────────────
export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, config.security.bcryptRounds);

export const comparePassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

// ─── Token Hash (for storing refresh tokens securely) ─────────────────────────
export const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// ─── String Helpers ───────────────────────────────────────────────────────────
export const sanitizeEmail = (email: string): string =>
  email.toLowerCase().trim();

export const buildFullName = (firstName: string, lastName: string): string =>
  `${firstName} ${lastName}`.trim();

// ─── Date Helpers ─────────────────────────────────────────────────────────────
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isExpired = (date: Date): boolean => new Date() > date;
