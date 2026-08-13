# Roadmap

## Done — Phase 0–2.2

- [x] Official 36 aerodromes + ICAO legitimacy
- [x] React + Express + JWT + JSON store
- [x] CNS from daily logs + traffic CSV import
- [x] RBAC (UI + API)
- [x] Login/logout without page refresh

## Done — Phase 2.3 (i18n)

- [x] FR / AR / EN dictionaries
- [x] Language switcher (login + topbar)
- [x] `dir=rtl` for Arabic
- [x] Tabs, topbar, login, overview, CNS, traffic translated
- [x] Preference stored in `localStorage` (`dashenna_lang`)

## Next

- [ ] Finish i18n on remaining pages (map, daily logs, accounts, finance, HR)
- [ ] Production hardening (password rotation; checklist in docs/PRODUCTION.md)
- [ ] Optional Postgres for multi-instance
- [ ] SSE / WebSocket live push
- [ ] Finance / HR official feeds only when available
