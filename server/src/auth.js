import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runDb } from './herd.js';

const JWT_SECRET = process.env.JWT_SECRET || 'top-goats-dev-secret-2026';
const JWT_EXPIRY = '7d';

// Hash a password (synchronous for reliability with shell execution)
export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Verify a password against a hash
export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Generate a JWT token
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Verify a JWT token and extract payload
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Register a new user
export function registerUser(email, password, handle, displayName) {
  // Check if email already exists
  const existing = runDb(`SELECT id FROM auth_users WHERE email = '${email.replace(/'/g, "''")}'`);
  if (existing && existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Check if handle already exists
  const handleCheck = runDb(`SELECT id FROM herd_users WHERE handle = '${handle.replace(/'/g, "''")}'`);
  if (handleCheck && handleCheck.length > 0) {
    throw new Error('Handle already taken');
  }

  const userId = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '') + '-' + Date.now().toString(36);
  const passwordHash = hashPassword(password);
  const safeEmail = email.replace(/'/g, "''");
  const safeHandle = handle.replace(/'/g, "''");
  const safeName = displayName.replace(/'/g, "''");
  const safeId = userId.replace(/'/g, "''");

  // Create auth user
  runDb(
    `INSERT INTO auth_users (id, email, password_hash) VALUES ('${safeId}', '${safeEmail}', '${passwordHash}')`
  );

  // Create herd profile
  runDb(
    `INSERT INTO herd_users (id, handle, display_name, xp, joined) VALUES ('${safeId}', '${safeHandle}', '${safeName}', 0, '${new Date().getFullYear()}')`
  );

  return { userId, handle, displayName };
}

// Login a user
export function loginUser(email, password) {
  const safeEmail = email.replace(/'/g, "''");
  const users = runDb(`SELECT * FROM auth_users WHERE email = '${safeEmail}'`);
  
  if (!users || users.length === 0) {
    throw new Error('Invalid email or password');
  }

  const authUser = users[0];
  const valid = verifyPassword(password, authUser.password_hash);
  
  if (!valid) {
    throw new Error('Invalid email or password');
  }

  // Get herd profile
  const profiles = runDb(`SELECT * FROM herd_users WHERE id = '${authUser.id.replace(/'/g, "''")}'`);
  const profile = profiles && profiles.length > 0 ? profiles[0] : null;

  const token = generateToken(authUser.id);
  return { token, user: { id: authUser.id, email: authUser.email, ...profile } };
}

// Get user from token
export function getUserFromToken(token) {
  const payload = verifyToken(token);
  if (!payload) return null;

  const users = runDb(`SELECT * FROM herd_users WHERE id = '${payload.userId.replace(/'/g, "''")}'`);
  if (!users || users.length === 0) return null;

  const authInfo = runDb(`SELECT email FROM auth_users WHERE id = '${payload.userId.replace(/'/g, "''")}'`);
  
  return {
    ...users[0],
    email: authInfo && authInfo.length > 0 ? authInfo[0].email : null,
  };
}

// Update user profile
export function updateProfile(userId, updates) {
  const allowedFields = ['display_name', 'handle', 'bio', 'location', 'genre'];
  const safeId = userId.replace(/'/g, "''");
  
  const setClauses = [];
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      setClauses.push(`${key} = '${String(value).replace(/'/g, "''")}'`);
    }
  }

  if (setClauses.length === 0) throw new Error('No valid fields to update');

  setClauses.push(`updated_at = datetime('now')`);

  runDb(`UPDATE herd_users SET ${setClauses.join(', ')} WHERE id = '${safeId}'`);

  const result = runDb(`SELECT * FROM herd_users WHERE id = '${safeId}'`);
  return result && result.length > 0 ? result[0] : null;
}