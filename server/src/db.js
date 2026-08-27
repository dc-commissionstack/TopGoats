import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

let pool = null;

function getPool() {
  if (!pool) {
    if (!DATABASE_URL) {
      console.warn('DATABASE_URL not set — DB operations will fail. Set the Neon Postgres URL.');
      // Create a pool anyway so callers don't crash on import
      pool = new Pool({ connectionString: 'postgres://localhost:5432/placeholder' });
    } else {
      pool = new Pool({
        connectionString: DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        ssl: { rejectUnauthorized: false },
      });
    }
  }
  return pool;
}

/**
 * Run a SQL query and return rows.
 * Use query() for reads, exec() for writes where you need the result.
 */
export async function query(text, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Execute a write query and return the full result (for rowCount etc).
 */
export async function exec(text, params = []) {
  const client = await getPool().connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

/**
 * Run schema migration — idempotent (CREATE IF NOT EXISTS).
 */
export async function migrate() {
  if (!DATABASE_URL) {
    console.log('DATABASE_URL not set — skipping migration');
    return;
  }
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const schemaPath = path.resolve(__dirname, '../schema.sql');
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    // Split into individual statements so this works over both pooled and
    // direct connections (multi-statement simple queries can fail on PgBouncer).
    const stmts = schema
      .split(';')
      .map((s) => s.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n').trim())
      .filter((s) => s.length > 0);
    for (const stmt of stmts) {
      await exec(stmt);
    }
    console.log(`Schema migration complete (${stmts.length} statements)`);
  } catch (err) {
    console.error('Schema migration failed:', err.message);
    // Don't crash the server — tables might already exist
  }
}

/**
 * Check if database is connected.
 */
export async function healthCheck() {
  if (!DATABASE_URL) return { connected: false, message: 'DATABASE_URL not configured' };
  try {
    const rows = await query('SELECT 1 AS ok');
    return { connected: true, message: 'PostgreSQL connected' };
  } catch (err) {
    return { connected: false, message: err.message };
  }
}