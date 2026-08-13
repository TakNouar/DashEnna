# Roadmap

## Done — Phase 0 + 1

- [x] Official 36 aerodromes + correct ICAO codes
- [x] React frontend (Vite) + Express JSON backend
- [x] bcrypt + JWT auth
- [x] Daily logs, map, accounts
- [x] Legacy HTML removed

## Done — Phase 2

- [x] CNS from daily logs (`GET /api/logs/cns-stats`)
- [x] Traffic series + CSV import (`GET/POST /api/traffic`)
- [x] Overview charts wired to live series / CNS
- [x] Env JWT (`JWT_SECRET`, required in production)
- [x] RBAC page permissions (UI + API)
- [x] Login/logout without full page refresh (hooks order fixed)

## Done — Phase 2.2

- [x] Instant session switch on login/logout
- [x] API route page checks (logs write, airports, cns-stats)
- [x] Refresh data after daily log submit (`onChange` → refresh)

## Next

- [ ] Production hardening: rotate default passwords, deploy checklist
- [ ] i18n FR / AR / EN
- [ ] Optional Postgres
- [ ] Real-time push (SSE) instead of 2 min poll
- [ ] Finance / HR only with official internal feeds
