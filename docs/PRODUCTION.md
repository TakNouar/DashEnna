# Production checklist

1. Set `NODE_ENV=production` and `JWT_SECRET` (required — process exits without it).
2. Delete seed passwords: change `root` and all DSA accounts before exposing the network.
3. Do not commit `backend/data/db.json` or `.env`.
4. Serve frontend build: `cd frontend && npm run build`, then run API with static `frontend/dist`.
5. Put TLS in front (nginx / Caddy / IIS).
6. Back up `backend/data/db.json` regularly (or migrate to Postgres — not required yet).
7. Finance / HR pages: hide or leave labelled until official feeds are connected.
