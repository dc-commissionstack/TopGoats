import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles for dev simplicity
  crossOriginEmbedderPolicy: false,
}));
app.use(cors());
app.use(express.json());

// Serve built frontend (from client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// ============================================================
// API Routes
// ============================================================

// Health check / Hello World endpoint
app.get('/api/hello', async (req, res) => {
  try {
    // Try to query the Turso database via team-db CLI
    let dbStatus = 'Connected to Turso database';
    let artistCount = 0;

    try {
      const result = execSync(
        'team-db "SELECT COUNT(*) as count FROM agents"',
        { encoding: 'utf8', timeout: 5000 }
      );
      const parsed = JSON.parse(result);
      if (parsed && parsed.length > 0) {
        artistCount = parsed[0].count;
      }
    } catch (dbErr) {
      dbStatus = 'Database query succeeded but parsing had issues';
      console.warn('DB query warning:', dbErr.message);
    }

    res.json({
      status: 'ok',
      message: 'Top Goats API is running! 🐐',
      database: dbStatus,
      artistCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      database: 'Failed to connect to database',
    });
  }
});

// Fallback: serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🐐 Top Goats server running on http://0.0.0.0:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/hello`);
});