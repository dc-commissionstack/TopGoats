---
name: project-scaffold
description: Scaffold a new React + Express monorepo project with Turso DB integration, connected to the team's shared Kanban task board.
---

# Top Goats Project Scaffold

Sets up a React (Vite) + Express monorepo with Turso database integration via `team-db` CLI.

## Structure Created

```
project-root/
├── client/             # React 19 + Vite frontend
│   ├── src/
│   │   ├── App.jsx     # Main app with API health check
│   │   ├── App.css     # Dark-themed styling
│   │   └── main.jsx    # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js  # Proxy /api to :3000 in dev
├── server/             # Express backend
│   ├── src/
│   │   └── index.js    # Server on 0.0.0.0:3000, serves built frontend
│   └── package.json
├── package.json        # Root scripts: install:all, dev, build, start
├── README.md
└── .gitignore
```

## Steps

1. Create directories: `mkdir -p project/client/src project/client/public project/server/src`
2. Write all project files (use WriteFile tool)
3. Configure git: set user.email, user.name, branch -m main, add, commit
4. Install root deps: `npm install`
5. Install client deps: `cd client && npm install`
6. Install server deps: `cd server && npm install`
7. Build client: `cd client && npx vite build`
8. Start server: `cd server && nohup node src/index.js > /tmp/srv.log 2>&1 &`
9. Verify: `curl http://localhost:3000/api/hello`

## Key Gotchas

- **Server must bind to `0.0.0.0` not `127.0.0.1`** — Express defaults to loopback
- **Terminal sessions** may buffer old output — use `input` action instead of `text` for reliable display
- **Turso DB integration** uses `execSync('team-db "SELECT ..."')` — always wrap in try/catch
- **Share the project** with `cp -r ~/project /home/team/shared/` for team access
- **GitHub push** requires owner to connect a GitHub account first via `get_git_credentials`

## Server Entry Point (key parts)

```js
import { execSync } from 'child_process';
// Query Turso via team-db CLI
const result = execSync('team-db "SELECT COUNT(*) as count FROM agents"', 
  { encoding: 'utf8', timeout: 5000 });

// Bind to all interfaces
app.listen(PORT, '0.0.0.0', () => { ... });
```