# DashEnna v2.2

Executive dashboard for **ENNA** (Établissement National de la Navigation Aérienne).

**Stack:** React (Vite) + Node/Express + JSON file store + bcrypt/JWT

## Quick start

```bash
# Backend
cd backend && npm install && npm run dev
# → http://localhost:4000

# Frontend (other terminal)
cd frontend && npm install && npm run dev
# → http://localhost:5173  (proxies /api → :4000)
```

**Login:** `root` / `admin123`  
DSA demo: `DSA_Alger` / `alger123`

### Reset seed data (PowerShell)

```powershell
Remove-Item -Force -ErrorAction SilentlyContinue backend\data\db.json
```

### Reset seed data (bash)

```bash
rm -f backend/data/db.json
```

## What updates live

| Data | Source |
|------|--------|
| Airport counts / map | API `/airports` |
| CNS % gauges | Derived from daily logs |
| Traffic line chart | DB `traffic_series` (CSV import by root) |
| Daily log table | API `/logs` — refreshes after submit |

Finance & HR charts remain **illustrative** until internal ENNA feeds exist.

## Production

1. Copy `backend/.env.example` → project root `.env`
2. Set a long random `JWT_SECRET`
3. Set `NODE_ENV=production`
4. Change all default passwords
5. Prefer HTTPS reverse proxy (nginx / IIS)

See `docs/PRODUCTION.md`.

## Docs

- `docs/DATA_SOURCES.md` — legitimacy of figures
- `docs/ROADMAP.md` — phases done / next
- `docs/PRODUCTION.md` — deploy checklist
