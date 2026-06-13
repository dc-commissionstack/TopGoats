# Top Goats 🐐

All-in-one social and commercial ecosystem for independent musicians.

## Architecture

```
top-goats/
├── client/          # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArtistPage.jsx   # Sovereign artist template
│   │   │   ├── MusicPlayer.jsx  # Track player
│   │   │   └── RankBadge.jsx    # Herd ranking badge
│   │   ├── App.jsx
│   │   ├── index.css            # Tailwind + brand styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/          # Express backend
│   ├── src/
│   │   ├── index.js             # API routes (Herd, Deals, System)
│   │   └── herd.js              # Ranking logic & XP rules
│   ├── package.json
│   └── ...
├── package.json     # Root workspace scripts
└── README.md
```

## Quick Start

```bash
# Install all dependencies
npm run install:all

# Build client
cd client && npm run build

# Start server on port 3000
cd server && node src/index.js
```

## API Endpoints

- `GET /api/hello` — Health check with DB status
- `GET /api/herd/tiers` — 5 Herd ranking tiers
- `GET /api/herd/badges` — Available badges
- `GET /api/herd/xp-rules` — XP earning rules
- `GET /api/herd/rank/:userId` — User rank & XP
- `POST /api/herd/xp` — Add XP for an action
- `GET /api/herd/leaderboard` — Top artists by XP
- `GET /api/herd/user/:userId` — Full user profile
- `POST /api/deals/flash` — Create flash liquidation deal
- `GET /api/deals/active` — Check active flash deal

## Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Turso (SQLite via team-db CLI)
- **Payment:** Stripe Connect (planned)
- **Ranking:** 5-tier Herd system (Kid → Top Goat)
