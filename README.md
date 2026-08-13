# DashEnna v2

Executive dashboard for **ENNA** (Établissement National de la Navigation Aérienne) — React frontend + Node/Express + JSON file store backend.

## What changed (Phase 0 + 1 migration)

- **Phase 0 — Data legitimacy**
  - Full official **36 aerodromes** (12 international + 24 national)
  - Correct ICAO codes from AIS Algeria AIP (fixed Ghardaïa `DAUG`, El Goléa `DAUE`, Tébessa `DABS`)
  - DSA region assignment aligned with real regional structure
  - Public 2025 traffic figures from enna.dz (253 340 movements, 276 899 overflights)
  - Clear labelling of illustrative vs official data

- **Phase 1 — Architecture**
  - Frontend migrated from plain HTML/JS → **React (Vite)**
  - Backend: **Node + Express + JSON file store** (pure JS, no native deps)
  - Real auth: **bcrypt** password hashing + **JWT** sessions (no more Base64)
  - Permissions and account management enforced server-side
  - Daily logs, airports, users served by REST API
  - Leaflet map with all 36 markers

## Quick start

### Backend
```bash
cd backend
npm install
npm run dev
# → http://localhost:4000
```
Default login: **root / admin123**

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173  (proxies /api → :4000)
```

## Data sources
- Aerodrome list: enna.dz – Aérodromes gérés
- ICAO codes: AIS Algeria AIP (sia-enna.dz)
- Traffic 2025: ENNA homepage

Change JWT_SECRET and default passwords before production use.
