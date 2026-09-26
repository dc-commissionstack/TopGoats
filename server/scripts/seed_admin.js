/**
 * Seed the admin user into Neon Postgres.
 *
 * Run (from repo root) with the production DATABASE_URL:
 *   DATABASE_URL=$(grep '^DATABASE_URL=' .env.prod | cut -d= -f2- | tr -d '"') node server/scripts/seed_admin.js
 */

import { query, exec } from '../src/db.js';
import { hashPassword } from '../src/auth.js';

const ADMIN_EMAIL = 'dc.budge86@gmail.com';
const ADMIN_PASSWORD = 'topDC20063081$';
const ADMIN_HANDLE = 'admin';
const ADMIN_DISPLAY_NAME = 'Top Goats Admin';

async function main() {
  const existing = await query('SELECT id FROM auth_users WHERE email = $1', [ADMIN_EMAIL]);

  if (existing && existing.length > 0) {
    const id = existing[0].id;
    await exec('UPDATE auth_users SET is_admin = true WHERE email = $1', [ADMIN_EMAIL]);
    console.log(`admin already existed (id=${id}) — set is_admin = true`);
    return;
  }

  const id = 'admin-' + Date.now().toString(36);
  const passwordHash = hashPassword(ADMIN_PASSWORD);

  await exec(
    'INSERT INTO auth_users (id, email, password_hash, is_admin) VALUES ($1, $2, $3, $4)',
    [id, ADMIN_EMAIL, passwordHash, true]
  );
  await exec(
    'INSERT INTO herd_users (id, handle, display_name) VALUES ($1, $2, $3)',
    [id, ADMIN_HANDLE, ADMIN_DISPLAY_NAME]
  );

  console.log(`admin created (id=${id}) with is_admin = true`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('seed failed:', err.message);
    process.exit(1);
  });
