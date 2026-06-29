import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { getRank, addXp, calculateRank, getTiers, getBadges, XP_RULES, runDb } from './herd.js';
import { registerUser, loginUser, getUserFromToken, updateProfile, generateToken } from './auth.js';
import { calculatePayout } from './stripe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Serve built frontend (from client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// ============================================================
// System API Routes
// ============================================================

// Health check
app.get('/api/hello', (req, res) => {
  try {
    let dbStatus = 'Connected to Turso database';
    let artistCount = 0;
    try {
      const result = execSync(
        'team-db "SELECT COUNT(*) as count FROM herd_users"',
        { encoding: 'utf8', timeout: 5000 }
      );
      const parsed = JSON.parse(result);
      if (parsed && parsed.length > 0) artistCount = parsed[0].count;
    } catch (dbErr) {
      dbStatus = 'Database query returned unexpected format';
    }
    res.json({ status: 'ok', message: 'Top Goats API is running! 🐐', database: dbStatus, artistCount, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// ============================================================
// Herd Ranking API Routes (per researcher/community_ranking_logic.md)
// ============================================================

// GET /api/herd/tiers — list all ranking tiers
app.get('/api/herd/tiers', (req, res) => {
  res.json({ tiers: getTiers() });
});

// GET /api/herd/badges — list available badges
app.get('/api/herd/badges', (req, res) => {
  res.json({ badges: getBadges() });
});

// GET /api/herd/xp-rules — list XP earning rules
app.get('/api/herd/xp-rules', (req, res) => {
  res.json({ rules: XP_RULES });
});

// GET /api/herd/rank/:userId — fetch user's rank and XP
app.get('/api/herd/rank/:userId', (req, res) => {
  try {
    const data = getRank(req.params.userId);
    if (!data) return res.status(404).json({ error: 'Artist not found in the Herd' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/herd/xp — add XP for an action
app.post('/api/herd/xp', (req, res) => {
  try {
    const { userId, action } = req.body;
    if (!userId || !action) {
      return res.status(400).json({ error: 'userId and action are required' });
    }

    const validActions = Object.keys(XP_RULES);
    if (!validActions.includes(action)) {
      return res.status(400).json({
        error: `Invalid action. Valid actions: ${validActions.join(', ')}`,
      });
    }

    const result = addXp(userId, action);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/herd/leaderboard — top artists by XP
app.get('/api/herd/leaderboard', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = execSync(
      `team-db "SELECT id, handle, display_name, xp FROM herd_users ORDER BY xp DESC LIMIT ${limit}"`,
      { encoding: 'utf8', timeout: 5000 }
    );
    const users = JSON.parse(result);
    const leaderboard = users.map((u, i) => ({
      rank: i + 1, ...u, tier: calculateRank(u.xp).current.name,
    }));
    res.json({ leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/herd/user/:userId — full user profile for artist page
app.get('/api/herd/user/:userId', (req, res) => {
  try {
    const data = getRank(req.params.userId);
    if (!data) {
      return res.json({
        user: {
          id: req.params.userId,
          handle: `@${req.params.userId}`,
          display_name: req.params.userId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          xp: 0,
          bio: 'Independent artist. No label. No compromises.',
          location: '', genre: 'Underground',
          joined: new Date().getFullYear().toString(),
        },
        rank: calculateRank(0),
        events: [], badges: [],
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

// Auth middleware: extract user from Bearer token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.currentUser = user;
  next();
}

// POST /api/auth/register — create account
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

// POST /api/auth/login — sign in
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

// GET /api/auth/me — get current user profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.currentUser });
});

// PUT /api/auth/profile — update profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  try {
    const { display_name, handle, bio, location, genre } = req.body;
    const updated = updateProfile(req.currentUser.id, { display_name, handle, bio, location, genre });
    res.json({ user: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// Music Upload & Distribution
// ============================================================

const uploadsDir = path.resolve(__dirname, '../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only audio files (MP3, WAV, FLAC, AAC, OGG, M4A) are allowed'));
  },
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// POST /api/tracks/upload — upload a track (requires auth)
app.post('/api/tracks/upload', authMiddleware, upload.single('audio'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file provided' });
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Track title is required' });

    const trackId = uuidv4();
    const safeTitle = title.replace(/'/g, "''");
    const safeId = trackId.replace(/'/g, "''");
    const safeUserId = req.currentUser.id.replace(/'/g, "''");
    const filePath = `/uploads/${req.file.filename}`;

    runDb(
      `INSERT INTO tracks (id, user_id, title, file_path, file_size) VALUES ('${safeId}', '${safeUserId}', '${safeTitle}', '${filePath}', ${req.file.size})`
    );

    // Award XP for uploading
    try {
      addXp(req.currentUser.id, 'first_upload');
    } catch (xpErr) { /* silent */ }

    res.status(201).json({ track: { id: trackId, title, filePath, fileSize: req.file.size } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tracks/:userId — list tracks for a user
app.get('/api/tracks/:userId', (req, res) => {
  try {
    const safeId = req.params.userId.replace(/'/g, "''");
    const tracks = runDb(`SELECT id, title, file_path, file_size, duration, plays, created_at FROM tracks WHERE user_id = '${safeId}' ORDER BY created_at DESC`);
    res.json({ tracks: tracks || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tracks/:trackId/play — increment play count
app.put('/api/tracks/:trackId/play', (req, res) => {
  try {
    const safeId = req.params.trackId.replace(/'/g, "''");
    runDb(`UPDATE tracks SET plays = plays + 1 WHERE id = '${safeId}'`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Flash Liquidation Deals (Owner Vision)
// ============================================================

// In-memory store for flash deals
let activeFlashDeal = null;

// POST /api/deals/flash — create a flash liquidation deal
app.post('/api/deals/flash', (req, res) => {
  try {
    const { price, duration, description } = req.body;
    if (!price) return res.status(400).json({ error: 'price is required' });

    activeFlashDeal = {
      price: Math.min(price, 1.00), // Owner wants ~$1/song
      duration: duration || 3600, // default 1 hour
      description: description || 'Platform Flash Liquidation Deal',
      active: true,
      started_at: new Date().toISOString(),
    };

    res.json({ deal: activeFlashDeal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/deals/active — check if flash deal is active
app.get('/api/deals/active', (req, res) => {
  res.json({ deal: activeFlashDeal || { active: false } });
});

// DELETE /api/deals/flash — end active flash deal
app.delete('/api/deals/flash', (req, res) => {
  activeFlashDeal = null;
  res.json({ message: 'Flash deal ended', deal: { active: false } });
});

// ============================================================
// Sovereign Sound Foundation (SSF) API
// ============================================================

// GET /api/ssf/status — SSF pool and grant info
app.get('/api/ssf/status', (req, res) => {
  // Mock data for SSF pool — in production, this would query a real database
  const poolAmount = 128470; // Accumulated 1% from all platform fees
  const totalDistributed = 11000; // Grants paid out
  const grantCount = 5;
  
  res.json({
    poolAmount,
    totalDistributed,
    grantCount,
    ssfRate: 0.01,
    isFlashLiquidation: false,
    lastUpdated: new Date().toISOString(),
  });
});

// GET /api/stripe/estimate — calculate payout estimate
app.get('/api/stripe/estimate', (req, res) => {
  const price = parseFloat(req.query.price) || 10;
  const rank = req.query.rank || 'Kid';
  const flash = req.query.flash === 'true';
  const estimate = calculatePayout(price, rank, flash);
  res.json(estimate);
});

// ============================================================
// Sovereignty Shield (Mock ACRCloud Fingerprinting)
// ============================================================

// In-memory SSF pool (mocked)
let ssfPool = 128470;

// POST /api/shield/fingerprint — mock fingerprint a track
app.post('/api/shield/fingerprint', (req, res) => {
  const { trackId, title } = req.body;
  const fingerprintId = 'FP-' + Date.now().toString(36).toUpperCase();
  
  // Award copyright XP
  try {
    const users = runDb(`SELECT user_id FROM tracks WHERE id = '${(trackId || '').replace(/'/g, "''")}'`);
    if (users && users.length > 0) {
      addXp(users[0].user_id, 'copyright_fingerprint');
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
// Mock Checkout & SSF Pool
// ============================================================

// POST /api/checkout — mock purchase flow
app.post('/api/checkout', authMiddleware, (req, res) => {
  try {
    const { price, rank } = req.body;
    if (!price) return res.status(400).json({ error: 'Price is required' });

    const userRank = rank || 'Kid';
    const estimate = calculatePayout(price, userRank);
    
    // Update SSF pool
    ssfPool += Math.round(estimate.ssfFee * 100);
    
    // Award XP for sale
    try {
      addXp(req.currentUser.id, 'first_sale');
    } catch (e) { /* silent */ }

    // Record sale event
    const saleId = 'SALE-' + Date.now().toString(36).toUpperCase();
    
    res.json({
      success: true,
      saleId,
      transaction: {
        gross: price,
        stripeFee: estimate.stripeFee,
        platformFee: estimate.platformFee,
        ssfFee: estimate.ssfFee,
        artistPayout: estimate.artistPayout,
      },
      ssfPool: ssfPool,
      message: `Purchase complete. Artist receives ${estimate.artistPayout}. SSF Pool: ${ssfPool.toLocaleString()}.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/checkout/flash — mock flash liquidation purchase
app.post('/api/checkout/flash', authMiddleware, (req, res) => {
  try {
    const { rank } = req.body;
    const flashPrice = 1.00;
    const userRank = rank || 'Kid';
    const estimate = calculatePayout(flashPrice, userRank, true);
    
    // Double SSF during flash deals
    ssfPool += Math.round(estimate.ssfFee * 200);
    
    const saleId = 'FLASH-' + Date.now().toString(36).toUpperCase();
    
    res.json({
      success: true,
      saleId,
      transaction: estimate,
      ssfPool: ssfPool,
      message: `Flash deal complete! Artist receives ${estimate.artistPayout}. SSF contribution doubled.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// Fallback
// ============================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐐 Top Goats server running on http://0.0.0.0:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/hello`);
  console.log(`   Tiers: http://localhost:${PORT}/api/herd/tiers`);
  console.log(`   XP Rules: http://localhost:${PORT}/api/herd/xp-rules`);
  console.log(`   Badges: http://localhost:${PORT}/api/herd/badges`);
});