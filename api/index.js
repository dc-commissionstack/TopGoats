// Vercel serverless function wrapper for the Top Goats Express API.

import app from '../server/src/index.js';

// Ensure migration runs once per cold start
let migrated = false;
async function ensureMigration() {
  if (migrated) return;
  const { migrate } = await import('../server/src/db.js');
  try { await migrate(); } catch (e) { console.error('Migration error:', e.message); }
  migrated = true;
}

export default async function handler(req, res) {
  await ensureMigration();
  return app(req, res);
}