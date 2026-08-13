# Production checklist

1. Set `NODE_ENV=production` and `JWT_SECRET` (required — process exits without it).
2. Set `ALLOWED_ORIGINS` to a comma-separated list of real frontend origins (e.g. `https://dash.enna.dz`). Wildcard CORS is not used.
3. Delete or rotate seed passwords: every seeded account has `must_change_password: true` and is blocked from the dashboard until password change.
4. Do not commit `backend/data/db.json` or `.env`.
5. Serve frontend build: `cd frontend && npm run build`, then run API with static `frontend/dist`.
6. Put TLS in front (nginx / Caddy / IIS).
7. Back up `backend/data/db.json` regularly (or migrate to Postgres — not required yet).
8. Finance / HR pages: hide or leave labelled until official feeds are connected.
9. Login rate limit: 10 attempts / 15 minutes / IP on `POST /api/auth/login` only.
