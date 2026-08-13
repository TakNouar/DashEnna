# Roadmap

Source of truth for "what's next" is Section 5 of `docs/DashEnna_Development_Charter.md`.

## Done — Immediate (Section 5 items 1–4)

- [x] **1. Zod validation** on POST/PUT bodies in `auth`, `users`, `logs`, `traffic` (`backend/src/validation/schemas.js` + `middleware/validate.js`)
- [x] **2. Rate limit** on `POST /api/auth/login` — 10 attempts / 15 min / IP (`express-rate-limit` in `routes/auth.js`)
- [x] **3. CORS allowlist** via `ALLOWED_ORIGINS` env (`index.js`); documented in `.env.example` and `PRODUCTION.md`
- [x] **4. Force password change** — `must_change_password` on seeded users; login flags it; frontend blocks tabs until `POST /auth/change-password` clears it

## Near-term (Section 5)

- [ ] 5. Incidents module (daily_logs pattern)
- [ ] 6. Equipment inventory table

## Deferred (Section 7 decision required)

- [ ] PostgreSQL, KPI engine, reports, Windows client, Excel import
