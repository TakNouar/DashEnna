# DashEnna — Project Development Report

**Document type:** Consolidated progress report  
**Version:** 1.0  
**Date:** 2026-08-13  
**Baseline HEAD:** `758df1f` (phase1: Equipment inventory UI)  
**Governing docs:** `DashEnna_Development_Charter.md` (how) · `ENNA_ERP_Master_Plan.md` (what)

This report replaces scattered status notes, charts, and sprint summaries. It tracks **what was actually built in the repo**, not aspirations.

---

## 1. Project identity

| Item | Value |
|------|--------|
| Product name | DashEnna → path to ENNA ERP |
| Current product type | Internal executive **dashboard MVP** (Phase 0–1 complete) |
| Target product type | Full ENNA ERP (Phases 2–6, gated) |
| Stack today | React (Vite) + Node/Express + JSON file (`backend/data/db.json`) |
| Repo | https://github.com/TakNouar/DashEnna |
| Org domain | ENNA — Établissement National de la Navigation Aérienne (Algeria) |

---

## 2. Timeline of work done (chronological)

### 2.1 Research & legitimacy (pre-code foundation)

- Scanned original prototype repo (plain HTML/JS dashboard concept).
- Researched official ENNA sources (`enna.dz`, AIP Algeria).
- Corrected aerodrome set to **36 real sites** with verified ICAO codes (fixed wrong codes such as Ghardaïa DAUG, El Goléa DAUE, Tébessa DABS).
- Documented real vs illustrative data in `docs/DATA_SOURCES.md`.

### 2.2 Phase 0 — Dashboard MVP + stack migration

| Deliverable | Detail |
|-------------|--------|
| Frontend rewrite | Plain HTML → **React + Vite** |
| Backend | **Node + Express** REST API |
| Persistence | JSON store (`store.js` → `db.json`) after native SQLite build issues |
| Auth | bcrypt password hashes + JWT (12h), roles `root` / `dsa` |
| RBAC | Per-user page permissions; UI filter + server `requireAuth` / `requireRoot` / `requirePage` |
| Domain pages | Overview, Traffic, CNS, Map DSA, Daily logs, Accounts, Finance*, HR* |
| CNS | Availability **computed from daily logs** (not hardcoded) |
| Traffic | Series in DB + **CSV import** (root) |
| i18n | FR / AR / EN + RTL support for Arabic |
| Login UX | Fixed hooks order so login/logout update UI without full page refresh |

\*Finance and HR remain **labeled placeholders** (see §4).

### 2.3 Phase 0 — Security hygiene (Charter Immediate items 1–4)

| # | Item | Mechanism | Commit trail (examples) |
|---|------|-----------|-------------------------|
| 1 | Input validation | **zod** schemas on all POST/PUT bodies | `c066172`, `9c628044`, `c8fb9f3` |
| 2 | Login rate limit | **express-rate-limit**: 10 attempts / 15 min / IP on `/api/auth/login` only | `c066172` |
| 3 | CORS | **ALLOWED_ORIGINS** allowlist; no `origin: true` wildcard | `0161a97` |
| 4 | Forced password change | `must_change_password` on seeds; UI blocked via `ForceChangePassword` until change | `5d22add`, `96ce06d` |

### 2.4 Governance documents

| Document | Role |
|----------|------|
| `docs/DashEnna_Development_Charter.md` | Process, definition of done, audit format, Decision Log |
| `docs/ENNA_ERP_Master_Plan.md` | Full phase plan (1–6), SQL schema, RBAC matrix, KPI formulas |
| `docs/ROADMAP.md` | Short rolling checklist |
| `docs/DATA_SOURCES.md` | Real vs demo data |
| `docs/PRODUCTION.md` | Deploy checklist |
| **This file** | Single progress narrative |

**Decision Log highlights (2026-08-13):**

1. Charter established — MVP scope first; old V2–V17 ERP handover demoted to archival.
2. ERP path **authorized** — Master Plan becomes active build spec.
3. Finance/HR: keep as labeled placeholders through Phase 4 (do not hide from nav).

### 2.5 Phase 1 — MVP completion

| Item | Status | What exists in code |
|------|--------|---------------------|
| **Incidents module** | Done | Table `incidents` (JSON); API CRUD; zod; UI tab; starts **empty** (no demo rows) |
| **Equipment inventory** | Done | Table `equipment`; API CRUD; seed of 6 CNS items; UI tab + filters + detail; daily log can select equipment |
| **Finance/HR decision** | Done | Documented: keep placeholders through Phase 4 |
| **Auth/RBAC tests** | Done | `backend/test/auth.middleware.test.js` (`npm test`) |
| Docs sync | Done | ROADMAP + DATA_SOURCES updated |

API surface added: `/api/incidents`, `/api/equipment` (mounted in `index.js` v2.6.0).

---

## 3. Current system capability map

### 3.1 Verified working (code present; runtime tests partial)

| Capability | Location |
|------------|----------|
| 36 aerodromes + map | `backend/src/data/airports*.json`, Map page |
| JWT login / logout / me / change-password | `routes/auth.js` |
| Forced first password change | `must_change_password` + ForceChangePassword UI |
| Rate-limited login | `express-rate-limit` on login route |
| CORS allowlist | `ALLOWED_ORIGINS` in `index.js` |
| Zod validation on writes | `validation/schemas.js` |
| Daily logs + CNS stats from logs | `routes/logs.js`, `db/cns.js` |
| Traffic series + CSV import | `routes/traffic.js` |
| Incidents CRUD + filters | `routes/incidents.js`, `pages/Incidents.jsx` |
| Equipment CRUD + filters | `routes/equipment.js`, `pages/Equipment.jsx` |
| Page-level RBAC (UI + API) | `App.jsx` canAccess, middleware |
| i18n FR/AR/EN | `frontend/src/i18n/` |
| Auth middleware unit tests | `backend/test/auth.middleware.test.js` |

### 3.2 Present but limited / illustrative

| Item | Limitation |
|------|------------|
| Finance page | Placeholder KPIs — not ENNA feeds |
| HR page | Placeholder headcount — public ~3 300 figure only |
| Daily log seed rows | Demo operational seed for non-empty CNS charts |
| Equipment seed | Structured sample inventory (not full national fleet) |
| Traffic monthly series | Editable; annual public totals from enna.dz are real |
| Integration tests / E2E | **Not started** (only auth unit tests) |
| PostgreSQL | Not started (Phase 2) |

### 3.3 Explicitly not started (Master Plan Phases 2–6)

| Phase | Scope |
|-------|--------|
| **2** | PostgreSQL migration, full schema, parity script, concurrent-write test, UTF-8 round-trip |
| **3** | Roles dg/cns/site/viewer + scope filters; maintenance module; downtime; SSE realtime |
| **4** | KPI engine (Availability, MTTR, MTBF, incident rate); report workflow; PDF export |
| **5** | Production hardening checklist (TLS, backups, audit log, monitoring, OWASP review) |
| **6** | Windows ANA Client (device auth, same API) |

---

## 4. Data honesty summary

| Data | Classification |
|------|----------------|
| 36 aerodromes + ICAO | **Real** (official lists / AIP) |
| Public 2025 movements / overflights | **Real** (enna.dz) |
| Daily logs (user-entered) | **Real operational path** |
| CNS % from logs | **Computed real from app data** |
| Incidents | **Real module**; journal empty until users enter data |
| Equipment | **Real module**; seed sample + root-editable |
| Finance / HR | **Illustrative** until Phase 4 feeds |

---

## 5. What is left (ordered)

### Immediate residual (optional polish before Phase 2)

1. Run `npm test` in CI or locally after every auth change.
2. Confirm DailyLogs equipment dropdown on a fresh `db.json`.
3. Expand i18n strings for new Incidents/Equipment labels if any remain French-only.
4. Optional: rate-limit other write-heavy routes if abuse testing shows need.

### Phase 2 — Data foundation (next major gate)

- Stand up PostgreSQL in non-prod.
- One-time migration script from `db.json` → schema in Master Plan §5.1.
- Row parity verification; keep JSON as cold backup one cycle.
- Swap persistence behind routes without feature regression.
- Concurrent write + UTF-8/Arabic/French round-trip tests.
- Document and test rollback once.

### Phase 3 — Core ERP

- Expanded RBAC matrix (root / dg / cns / dsa / site / viewer) with **scope** filtering.
- Maintenance CRUD + overdue detection.
- Downtime (derived from logs preferred — document choice).
- SSE live updates; keep polling as fallback.

### Phase 4 — Intelligence

- Stakeholder-signed KPI formulas; `kpi_snapshots` cache.
- Report statuses Draft → Official; PDF for ≥2 report types.

### Phase 5 — Production

- Full checklist in Master Plan §8 with **evidence** per item (not verbal).

### Phase 6 — Windows client

- Only after ≥1 month stable production (Master Plan recommendation).

### Explicit non-goals (unless Decision Log adds them)

- Mobile native apps  
- Multi-tenant  
- Generic report template builder before 2–3 real templates  
- Broad external system integration beyond future Finance/HR feeds  

---

## 6. Rough completion view (honest, not marketing)

| Layer | Approx. state |
|-------|----------------|
| Dashboard MVP (Phase 0–1) | **Complete for charter acceptance** |
| Security hygiene for MVP | **Complete** (zod, rate limit, CORS, forced pwd) |
| Data legitimacy labeling | **Good** for aerodromes/traffic/incidents/equipment |
| Test coverage | **Minimal** (auth middleware only) |
| ERP (Phases 2–6) | **Not started** (~0% of ERP target) |
| Production-ready ENNA deployment | **Not ready** — still JSON, no TLS/backup/audit pipeline |

Do **not** treat Phase 1 as “ERP done.” Phase 1 closes the **honest dashboard MVP** so Phase 2 can migrate real modules without inventing them on Postgres.

---

## 7. How to use this report

- Update this file at the end of each completed Master Plan phase (add section + date + commit hash).
- For audits, prefer Charter §8 format against **code**; this report is the human narrative companion.
- Short checklist remains `docs/ROADMAP.md`; architecture detail remains `docs/ENNA_ERP_Master_Plan.md`.

---

## 8. Quick start for a new contributor

```bash
git clone https://github.com/TakNouar/DashEnna.git
cd DashEnna/backend && npm install && npm test && npm run dev
# other terminal
cd DashEnna/frontend && npm install && npm run dev
# login root / admin123 → forced password change → dashboard
```

Read order: `PROJECT_DEVELOPMENT.md` (this) → `ROADMAP.md` → `ENNA_ERP_Master_Plan.md` § current phase → Charter §3 standards before any PR.
