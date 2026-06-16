// ─── Core Backend TypeScript Types ───────────────────────────────────────────

export type UserRole = 'admin' | 'manager' | 'employee';

// ── Database row as returned from PostgreSQL ──────────────────────────────────
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: string | null;
  created_at: Date;
  updated_at: Date;
}

// ── Safe public version (no password) ─────────────────────────────────────────
export type UserPublic = Omit<UserRow, 'password_hash'>;

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  meta?: PaginationMeta;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  department?: string;
}

// ─── Express Extensions ───────────────────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      requestId?: string;
      file?: any;
    }
  }
}
