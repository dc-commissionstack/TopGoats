import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getRank, addXp, calculateRank, getTiers, getBadges, XP_RULES } from './herd.js';
import { registerUser, loginUser, getUserFromToken, updateProfile, generateToken } from './auth.js';
import { calculatePayout, createCheckoutSession, handleStripeWebhook, isStripeConfigured } from './stripe.js';
import { query, exec, migrate, healthCheck as dbHealth } from './db.js';
import { isS3Configured, isS3Key, uploadTrack, getTrackUrl, deleteTrack } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());

// Stripe webhook — MUST be registered before express.json() so the raw body is preserved
// for signature verification. Stripe sends the event as application/json.
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());

// Serve built frontend (from client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// ============================================================
// System API Routes
// ============================================================

app.get('/api/hello', async (req, res) => {
  try {
    const dbStatus = await dbHealth();
    let artistCount = 0;
    try {
      const rows = await query('SELECT COUNT(*) as count FROM herd_users');
      if (rows && rows.length > 0) artistCount = parseInt(rows[0].count);
    } catch (dbErr) {
      // ignore
    }
    res.json({
      status: 'ok',
      message: 'Top Goats API is running! 🐐',
      database: dbStatus.connected ? 'Neon PostgreSQL connected' : 'Database not connected',
      artistCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// ============================================================
// Herd Ranking API Routes
// ============================================================

app.get('/api/herd/tiers', (req, res) => {
  res.json({ tiers: getTiers() });
});

app.get('/api/herd/badges', (req, res) => {
  res.json({ badges: getBadges() });
});

app.get('/api/herd/xp-rules', (req, res) => {
  res.json({ rules: XP_RULES });
});

app.get('/api/herd/rank/:userId', async (req, res) => {
  try {
    const data = await getRank(req.params.userId);
    if (!data) return res.status(404).json({ error: 'Artist not found in the Herd' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/herd/xp', async (req, res) => {
  try {
    const { userId, action } = req.body;
    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }
    const validActions = Object.keys(XP_RULES);
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Valid actions: ${validActions.join(', ')}` });
    }
    const result = await addXp(userId, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/herd/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const users = await query(
      'SELECT id, handle, display_name, xp FROM herd_users ORDER BY xp DESC LIMIT $1',
      [limit]
    );
    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      ...u,
      tier: calculateRank(u.xp).current.name,
    }));
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/herd/user/:userId', async (req, res) => {
  try {
    const data = await getRank(req.params.userId);
    if (!data) {
      return res.json({
        user: {
          id: req.params.userId,
          handle: `@${req.params.userId}`,
          display_name: req.params.userId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          xp: 0,
          bio: 'Independent artist. No label. No compromises.',
          location: '',
          genre: 'Underground',
          joined: new Date().getFullYear().toString(),
        },
        rank: calculateRank(0),
        events: [],
        badges: [],
      });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Auth API Routes
// ============================================================

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const user = await getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.currentUser = user;
  next();
}

// Optional auth: sets req.currentUser when a valid token is present, otherwise continues.
async function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const user = await getUserFromToken(token);
    if (user) req.currentUser = user;
  }
  next();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, handle, displayName } = req.body;
    if (!email || !password || !handle || !displayName) {
      return res.status(400).json({ error: 'email, password, handle, and displayName are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const result = await registerUser(email, password, handle, displayName);
    const token = generateToken(result.userId);
    res.status(201).json({ token, user: { id: result.userId, handle, displayName } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.currentUser });
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { display_name, handle, bio, location, genre } = req.body;
    const updated = await updateProfile(req.currentUser.id, { display_name, handle, bio, location, genre });
    res.json({ user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// Music Upload & Distribution (Neon Object Storage / S3)
// ============================================================

// multer buffers the file in memory, then we stream it to S3 via PutObject.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only audio files (MP3, WAV, FLAC, AAC, OGG, M4A) are allowed'));
  },
});

// POST /api/tracks/upload — upload a track to Neon Object Storage (requires auth)
app.post('/api/tracks/upload', authMiddleware, (req, res) => {
  upload.single('audio')(req, res, async (uploadErr) => {
    try {
      if (uploadErr) return res.status(400).json({ error: uploadErr.message });
      if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
      const { title } = req.body;
      if (!title) return res.status(400).json({ error: 'Track title is required' });
      if (!isS3Configured()) return res.status(503).json({ error: 'Object storage is not configured' });

      const trackId = uuidv4();
      const ext = path.extname(req.file.originalname);
      const key = `uploads/${trackId}${ext}`;

      await uploadTrack(req.file.buffer, key, req.file.mimetype);

      await exec(
        'INSERT INTO tracks (id, user_id, title, file_path, file_size) VALUES ($1, $2, $3, $4, $5)',
        [trackId, req.currentUser.id, title, key, req.file.size]
      );

      // Award XP for upload
      try {
        await addXp(req.currentUser.id, 'first_upload');
      } catch (xpErr) { /* silent */ }

      res.status(201).json({ track: { id: trackId, title, filePath: key, fileSize: req.file.size } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// GET /api/tracks/play/:trackId — generate a short-lived presigned GET URL for playback/download
app.get('/api/tracks/play/:trackId', async (req, res) => {
  try {
    const rows = await query('SELECT file_path FROM tracks WHERE id = $1', [req.params.trackId]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Track not found' });
    const filePath = rows[0].file_path;
    if (!isS3Key(filePath)) return res.status(500).json({ error: 'Track has no object storage key' });
    const url = await getTrackUrl(filePath);
    if (!url) return res.status(500).json({ error: 'Unable to generate playback URL' });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracks/:userId — list tracks for a user, resolving presigned playback URLs
app.get('/api/tracks/:userId', async (req, res) => {
  try {
    const tracks = await query(
      'SELECT id, title, file_path, file_size, duration, plays, created_at FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.params.userId]
    );
    const resolved = await Promise.all((tracks || []).map(async (t) => {
      if (isS3Key(t.file_path)) {
        t.file_path = await getTrackUrl(t.file_path) || t.file_path;
      }
      return t;
    }));
    res.json({ tracks: resolved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/tracks/:trackId/play', async (req, res) => {
  try {
    await exec('UPDATE tracks SET plays = plays + 1 WHERE id = $1', [req.params.trackId]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tracks/:trackId', authMiddleware, async (req, res) => {
  try {
    const tracks = await query('SELECT * FROM tracks WHERE id = $1 AND user_id = $2', [req.params.trackId, req.currentUser.id]);
    if (!tracks || tracks.length === 0) {
      return res.status(404).json({ error: 'Track not found or not yours' });
    }
    const filePath = tracks[0].file_path;
    // Delete the object from S3 (best-effort)
    if (isS3Key(filePath)) {
      try { await deleteTrack(filePath); } catch (e) { /* best-effort */ }
    }
    await exec('DELETE FROM tracks WHERE id = $1', [req.params.trackId]);
    res.json({ message: 'Track deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Flash Liquidation Deals
// ============================================================

let activeFlashDeal = null;

app.post('/api/deals/flash', (req, res) => {
  try {
    const { price, duration, description } = req.body;
    if (!price) return res.status(400).json({ error: 'price is required' });
    activeFlashDeal = {
      price: Math.min(price, 1.00),
      duration: duration || 3600,
      description: description || 'Platform Flash Liquidation Deal',
      active: true,
      started_at: new Date().toISOString(),
    };
    res.json({ deal: activeFlashDeal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/deals/active', (req, res) => {
  res.json({ deal: activeFlashDeal || { active: false } });
});

app.delete('/api/deals/flash', (req, res) => {
  activeFlashDeal = null;
  res.json({ message: 'Flash deal ended', deal: { active: false } });
});

// ============================================================
// Sovereign Sound Foundation (SSF) API
// ============================================================

function ssfGet(req, res) {
  res.json({
    poolAmount: globalThis.ssfPool || 0,
    totalDistributed: 0,
    grantCount: 0,
    ssfRate: 0.01,
    isFlashLiquidation: false,
    lastUpdated: new Date().toISOString(),
  });
}
app.get('/api/ssf/status', ssfGet);

app.get('/api/stripe/estimate', (req, res) => {
  const price = parseFloat(req.query.price) || 10;
  const rank = req.query.rank || 'Kid';
  const flash = req.query.flash === 'true';
  const estimate = calculatePayout(price, rank, flash);
  res.json(estimate);
});

// POST /api/checkout/session — create a Stripe Checkout Session and return the hosted URL
app.post('/api/checkout/session', optionalAuthMiddleware, async (req, res) => {
  try {
    const { type, artistId, trackId, successUrl, cancelUrl, amountCents } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });
    if (!isStripeConfigured()) return res.status(503).json({ error: 'Payments are not configured' });

    // Account-tied products require a logged-in user (to grant Premium / attribute the filing).
    const accountBound = type === 'premium' || type === 'copyright_filing';
    if (accountBound && !req.currentUser) {
      return res.status(401).json({ error: 'Please log in to continue' });
    }

    // Donation is pay-what-you-want; validate the chosen amount (whole cents, $1–$10k).
    if (type === 'donation' && amountCents != null) {
      const cents = Number(amountCents);
      if (!Number.isInteger(cents) || cents < 100 || cents > 1000000) {
        return res.status(400).json({ error: 'Donation amount must be between $1.00 and $10,000.00' });
      }
    }

    const session = await createCheckoutSession(type, {
      userId: req.currentUser?.id || null,
      artistId: artistId || null,
      trackId: trackId || null,
      successUrl: successUrl || `${req.protocol}://${req.get('host')}/?checkout=success`,
      cancelUrl: cancelUrl || `${req.protocol}://${req.get('host')}/?checkout=cancelled`,
      amountCents: type === 'donation' && amountCents != null ? Number(amountCents) : undefined,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Sovereignty Shield (Mock ACRCloud Fingerprinting)
// ============================================================

// In-memory SSF pool (starts at $0)
globalThis.ssfPool = globalThis.ssfPool || 0;

app.post('/api/shield/fingerprint', async (req, res) => {
  const { trackId, title } = req.body;
  const fingerprintId = 'FP-' + Date.now().toString(36).toUpperCase();

  try {
    const tracks = await query('SELECT user_id FROM tracks WHERE id = $1', [trackId || '']);
    if (tracks && tracks.length > 0) {
      await addXp(tracks[0].user_id, 'copyright_fingerprint');
    }
  } catch (e) { /* silent */ }

  res.json({
    success: true,
    fingerprintId,
    title: title || 'Unknown Track',
    status: 'protected',
    algorithm: 'ACRCloud (Mock)',
    timestamp: new Date().toISOString(),
    message: 'Your track is now fingerprint-protected. Any unauthorized uploads will be flagged.',
  });
});

// ============================================================
// Fallback
// ============================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Run migration on startup
let migrationDone = false;
async function ensureMigrated() {
  if (!migrationDone) {
    try { await migrate(); } catch (e) { console.error('Migration warning:', e.message); }
    migrationDone = true;
  }
}

// Export the app for Vercel serverless use
export default app;

// For direct Node execution (local dev): run migration + listen
if (process.argv[1] && (process.argv[1].endsWith('index.js') || process.argv[1].endsWith('src/index.js'))) {
  ensureMigrated().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🐐 Top Goats server running on http://0.0.0.0:${PORT}`);
      console.log(`   DB: ${process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'DATABASE_URL not set'}`);
    });
  });
}