import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, exec } from './db.js';
import { addXp } from './herd.js';

const JWT_SECRET = process.env.JWT_SECRET || 'top-goats-dev-secret-2026';
const JWT_EXPIRY = '7d';

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Get user from token
export async function getUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const users = await query('SELECT * FROM herd_users WHERE id = $1', [payload.userId]);
  if (!users || users.length === 0) return null;

  const authInfo = await query('SELECT email FROM auth_users WHERE id = $1', [payload.userId]);

  return {
    ...users[0],
    email: authInfo && authInfo.length > 0 ? authInfo[0].email : null,
  };
}

// Register a new user
export async function registerUser(email, password, handle, displayName) {
  // Check email exists
  const existing = await query('SELECT id FROM auth_users WHERE email = $1', [email]);
  if (existing && existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Check handle exists
  const handleCheck = await query('SELECT id FROM herd_users WHERE handle = $1', [handle]);
  if (handleCheck && handleCheck.length > 0) {
    throw new Error('Handle already taken');
  }

  const userId = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') + '-' + Date.now().toString(36);
  const passwordHash = hashPassword(password);

  // Create auth user
  await exec(
    'INSERT INTO auth_users (id, email, password_hash) VALUES ($1, $2, $3)',
    [userId, email, passwordHash]
  );

  // Create herd profile
  await exec(
    'INSERT INTO herd_users (id, handle, display_name, xp, joined) VALUES ($1, $2, $3, 0, $4)',
    [userId, handle, displayName, new Date().getFullYear().toString()]
  );

  // Founding Goat: First 100 users get badge + Ram XP (2500)
  const userCount = await query('SELECT COUNT(*) as count FROM auth_users');
  const totalUsers = userCount[0] ? parseInt(userCount[0].count) : 0;
  if (totalUsers <= 100) {
    try {
      await exec(
        'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, 'founding-goat']
      );
      await exec('UPDATE herd_users SET xp = 2500 WHERE id = $1', [userId]);
      await exec(
        'INSERT INTO xp_events (user_id, action, xp_gained, description) VALUES ($1, $2, $3, $4)',
        [userId, 'founding_goat', 2500, 'Founding Goat bonus — instant Ram status']
      );
    } catch (e) { /* badge already exists — fine */ }
  }

  return { userId, handle, displayName };
}

// Login
export async function loginUser(email, password) {
  const users = await query('SELECT * FROM auth_users WHERE email = $1', [email]);

  if (!users || users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const authUser = users[0];
  const valid = verifyPassword(password, authUser.password_hash);

  if (!valid) {
    throw new Error('Invalid email or password');
  }

  const profiles = await query('SELECT * FROM herd_users WHERE id = $1', [authUser.id]);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  const token = generateToken(authUser.id);
  return {
    token,
    user: {
      id: authUser.id,
      email: authUser.email,
      handle: profile?.handle,
      display_name: profile?.display_name,
      xp: profile?.xp || 0,
      bio: profile?.bio || '',
      location: profile?.location || '',
      genre: profile?.genre || 'Underground',
    },
  };
}

// Update user profile
export async function updateProfile(userId, updates) {
  const allowedFields = ['display_name', 'handle', 'bio', 'location', 'genre'];
  const setClauses = [];
  const values = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }
  }

  if (setClauses.length === 0) throw new Error('No valid fields to update');

  values.push(userId);
  const userIdIdx = values.length;

  await exec(
    `UPDATE herd_users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${userIdIdx}`,
    values
  );

  const result = await query('SELECT * FROM herd_users WHERE id = $1', [userId]);
  return result && result.length > 0 ? result[0] : null;
}