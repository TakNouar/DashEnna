# Roadmap

**What:** `docs/ENNA_ERP_Master_Plan.md`  
**How:** `docs/DashEnna_Development_Charter.md`

## Phase 0 — Done

- [x] Dashboard MVP + security hygiene (zod, rate-limit, CORS, must_change_password)

## Phase 1 — MVP completion

- [x] 4.1 Incidents module (API + UI, empty by default, no demo rows)
- [x] 4.2 Equipment inventory (API + UI + daily log dropdown)
- [x] 4.3 Finance/HR: **keep labeled placeholders through Phase 4** (documented in DATA_SOURCES.md)
- [x] 4.3 Auth/RBAC unit tests (`backend/test/auth.middleware.test.js`)
- [x] DATA_SOURCES + ROADMAP updated

## Phase 2+ (gated)

PostgreSQL → Core ERP → KPIs → Hardening → Windows client — see Master Plan.
