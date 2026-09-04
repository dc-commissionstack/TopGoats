-- Top Goats Schema — Neon Postgres
-- Run: psql $DATABASE_URL -f schema.sql

-- Auth users
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Herd users (artist profiles)
CREATE TABLE IF NOT EXISTS herd_users (
  id TEXT PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  handle TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  genre TEXT DEFAULT 'Underground',
  xp INTEGER DEFAULT 0,
  joined TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- XP events log
CREATE TABLE IF NOT EXISTS xp_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES herd_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  xp_gained INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges earned by users
CREATE TABLE IF NOT EXISTS user_badges (
  user_id TEXT NOT NULL REFERENCES herd_users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Tracks
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES herd_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  plays INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (sales recorded from Stripe Checkout)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES herd_users(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  type TEXT NOT NULL,
  amount_total INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe webhook events (idempotency guard)
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Premium subscription columns on herd_users
ALTER TABLE herd_users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE herd_users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE herd_users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_herd_users_xp ON herd_users (xp DESC);
CREATE INDEX IF NOT EXISTS idx_herd_users_handle ON herd_users (handle);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_user ON tracks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users (email);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, created_at DESC);