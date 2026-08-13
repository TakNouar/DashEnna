# Roadmap

## Done — Phase 0 + 1

- [x] Official 36 aerodromes + correct ICAO codes
- [x] React frontend (Vite)
- [x] Node/Express + JSON file store
- [x] bcrypt + JWT auth
- [x] Server-side account management
- [x] Daily logs API
- [x] Leaflet map with all aerodromes
- [x] Legacy plain HTML/JS/CSS removed

## Done — Phase 2 (current)

- [x] CNS availability derived from daily logs (`GET /api/logs/cns-stats`)
- [x] Overview + CNS pages consume live CNS stats
- [x] Monthly traffic series in DB (`GET /api/traffic`)
- [x] CSV import for traffic series (root) (`POST /api/traffic/import`)
- [x] Overview traffic chart uses DB series
- [x] Env-based JWT (`JWT_SECRET`, fails in production if missing)
- [x] Role-based page permissions (stored on user, enforced in UI)
- [x] Accounts UI to toggle page access per DSA user

## Next

- [ ] Optional Postgres for multi-instance deploy
- [ ] i18n (FR / AR / EN)
- [ ] Connect finance/HR when official internal feeds exist
- [ ] Real-time push (SSE/WebSocket) instead of polling
