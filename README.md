# DashEnna v2

Executive dashboard for **ENNA** (Etablissement National de la Navigation Aerienne).

**Stack:** React (Vite) + Node/Express + JSON file store + bcrypt/JWT

## Structure

```
DashEnna/
├── backend/                 # Express API
│   └── src/
│       ├── data/            # 36 official aerodromes
│       ├── db/store.js      # JSON persistence
│       ├── middleware/      # JWT auth
│       └── routes/          # auth, airports, logs, users
├── frontend/                # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── api.js
│       └── styles/
└── docs/
    ├── DATA_SOURCES.md
    └── ROADMAP.md
```

## Quick start

```bash
# Backend
cd backend && npm install && npm run dev
# -> http://localhost:4000

# Frontend (other terminal)
cd frontend && npm install && npm run dev
# -> http://localhost:5173  (proxies /api -> :4000)
```

**Login:** `root` / `admin123`

## What is real

- 36 aerodromes (12 INTL + 24 NTL), ICAO codes from AIS Algeria AIP
- Public traffic 2025: 253 340 movements, 276 899 overflights (enna.dz)
- Server-side auth (bcrypt + JWT)

Finance, live CNS %, and demo incident rows are **illustrative** — see `docs/DATA_SOURCES.md`.

## Security

Change `JWT_SECRET` and default passwords before any real deployment.
