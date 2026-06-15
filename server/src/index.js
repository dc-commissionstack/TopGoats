import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { getRank, addXp, calculateRank, getTiers, getBadges, XP_RULES } from './herd.js';

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