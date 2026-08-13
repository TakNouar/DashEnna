# Roadmap

## Done — Phase 0 + 1 (current main)

- [x] Official 36 aerodromes + correct ICAO codes (AIS Algeria AIP)
- [x] React frontend (Vite)
- [x] Node/Express + JSON file store backend
- [x] bcrypt + JWT auth (no client-side Base64)
- [x] Server-side account management
- [x] Daily logs API
- [x] Leaflet map with all 36 aerodromes
- [x] Charts wired in React lifecycle
- [x] Data sources documented (`docs/DATA_SOURCES.md`)
- [x] Legacy plain HTML/JS/CSS removed from repo

## Next

- [ ] Env-based `JWT_SECRET` & production config
- [ ] Role-based page permissions stored in DB and enforced in API + UI
- [ ] Excel/CSV import endpoint for aerodrome metadata updates
- [ ] Real CNS availability model derived from daily logs
- [ ] Optional Postgres for multi-instance deploy
- [ ] i18n (FR / AR / EN) fully wired
- [ ] Connect finance/HR only when official internal feeds exist
