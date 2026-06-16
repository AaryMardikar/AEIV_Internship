import { Pool, PoolClient } from 'pg';
import config from '../config/config';
import logger from '../config/logger';

// ─── PostgreSQL Connection Pool ───────────────────────────────────────────────
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: config.db.pool.max,
  idleTimeoutMillis: config.db.pool.idleTimeoutMillis,
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMillis,
});

// ─── Pool Event Listeners ─────────────────────────────────────────────────────
pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected to pool');
});

pool.on('error', (err: Error) => {
  logger.error('Unexpected PostgreSQL pool error', { error: err.message, stack: err.stack });
});

pool.on('remove', () => {
  logger.debug('PostgreSQL client removed from pool');
});

// ─── Query Helper ─────────────────────────────────────────────────────────────
export const query = async <T = unknown>(
  text: string,
  params?: unknown[]
): Promise<{ rows: T[]; rowCount: number | null }> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', {
      query: text,
      duration: `${duration}ms`,
      rowCount: result.rowCount,
    });
    return { rows: result.rows as T[], rowCount: result.rowCount };
  } catch (error) {
    logger.error('Database query error', {
      query: text,
      params,
      error: (error as Error).message,
    });
    throw error;
  }
};

// ─── Transaction Helper ───────────────────────────────────────────────────────
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    logger.debug('Transaction committed successfully');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error: (error as Error).message });
    throw error;
  } finally {
    client.release();
  }
};

// ─── Health Check ─────────────────────────────────────────────────────────────
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> => {
  const start = Date.now();
  try {
    await pool.query('SELECT 1');
    return { healthy: true, latency: Date.now() - start };
  } catch (error) {
    return { healthy: false, error: (error as Error).message };
  }
};

// ─── Pool Stats ───────────────────────────────────────────────────────────────
export const getPoolStats = () => ({
  totalCount: pool.totalCount,
  idleCount: pool.idleCount,
  waitingCount: pool.waitingCount,
});

export default pool;
