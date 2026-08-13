# DashEnna → ENNA ERP — Master Development Document
**Version 1.0 — 2026-08-13, baselined against commit `96ce06d`**

This document is the single build spec for taking DashEnna from its current state (a working dashboard MVP) to a full ENNA ERP system. It supersedes the old V2–V17 handover document as the active plan. `docs/DashEnna_Development_Charter.md` still governs *how* work is done (definitions of done, audit process, standards); this document governs *what gets built, in what order, with what shape*.

**Relationship to other docs:**
- `DashEnna_Development_Charter.md` — process rules, audit standards, standing prompt
- `docs/DATA_SOURCES.md` — what data is real vs. illustrative, updated as modules go live
- `docs/ROADMAP.md` — short rolling list, always in sync with Section 3 of this doc
- This document — the full architecture and phase-by-phase build plan

Any deviation from this document is a Decision Log entry in the Charter, dated, before work starts — not a silent scope change.

---

## 1. Current state (ground truth, not aspiration)

As of commit `96ce06d`:

- **Stack:** React (Vite) + Node/Express + flat JSON file (`backend/data/db.json`)
- **Auth:** bcrypt + JWT, 12h expiry, forced password change on first login, rate-limited login
- **Roles:** `root`, `dsa` — page-level permission arrays, enforced both client and server side
- **Domain data:** 36 real aerodromes with verified ICAO codes, daily equipment logs, CNS availability computed from logs, traffic figures (CSV import), Finance/HR pages as labeled placeholders
- **i18n:** FR/AR/EN across main pages
- **Validation:** zod schemas on all POST/PUT bodies
- **Security posture:** CORS allowlist, no wildcard origins, JWT secret required in production

This is the foundation everything below builds on. Nothing here gets rewritten from scratch — it gets extended.

---

## 2. Target end-state architecture

```
Users → (Web app first; Windows ANA Client later) → API Gateway (Express)
                                                          ↓
                                          Auth (JWT) + RBAC middleware
                                                          ↓
                        ┌──────────────┬──────────────┬──────────────┬──────────────┐
                    Sites/Airports  Equipment      Maintenance     Incidents      Reports
                        │              │              │              │              │
                        └──────────────┴──────────────┴──────────────┴──────────────┘
                                                          ↓
                                                    PostgreSQL
                                                          ↓
                                              KPI computation layer
                                                          ↓
                                        Dashboards (root/DG/CNS/DSA/Site/Viewer)
```

Key architectural decisions locked in for the ERP phase:

- **Database:** PostgreSQL. The JSON store is retired at Phase 2, not extended further.
- **API style:** REST, versioned under `/api/v1/` once Postgres migration starts (breaking change boundary).
- **Frontend:** stays React/Vite. No framework rewrite — the existing component/page structure extends cleanly.
- **Client:** web-first. The Windows ANA Client (Phase 6) is a wrapper/companion, not a replacement for the web app — both hit the same API.
- **Realtime:** move from polling (current 120s interval) to Server-Sent Events for live dashboard updates, introduced in Phase 3.

---

## 3. Phase plan (sequential, each phase gated on the previous)

| Phase | Name | Goal | Gate to start next phase |
|---|---|---|---|
| 0 | *(done)* | Dashboard MVP + security hygiene | — |
| 1 | MVP completion | Incidents + equipment, close remaining MVP gaps | All Phase 1 acceptance criteria met |
| 2 | Data foundation | Migrate JSON → PostgreSQL, no feature loss | Full data parity verified, rollback tested |
| 3 | Core ERP modules | Maintenance, downtime, expanded RBAC (DG/CNS/Viewer roles), SSE realtime | Modules pass acceptance criteria with real ENNA data |
| 4 | Intelligence layer | KPI engine, official reports, document generation | KPI formulas signed off by ENNA stakeholders |
| 5 | Hardening & deployment | Security audit, backups, TLS, monitoring, production launch | Passes Phase 5 security checklist in full |
| 6 | Windows ANA Client | Installed client, device authorization | Only after Phase 5 is stable in production |

Do not start a phase early because it seems easy. The gate exists because later phases depend on earlier ones being *correct*, not just *present* — a KPI engine built on bad maintenance data produces confidently wrong numbers, which is worse than no KPI engine.

---

## 4. Phase 1 — MVP completion

**Scope:** finish what the current dashboard needs to be a complete, honest MVP before any ERP work starts.

### 4.1 Incidents module
- New table (JSON store for now, becomes Postgres table in Phase 2): `incidents`
  - `id, date, time, site, system, equipment_id (nullable), description, severity (enum: minor/moderate/major), status (enum: open/in_review/closed), reported_by, resolution_notes, created_at, closed_at`
- API: `GET /api/incidents` (filterable by site, severity, status, date range), `POST /api/incidents` (root + dsa), `PUT /api/incidents/:id` (status/resolution updates), `DELETE /api/incidents/:id` (root only, or same-day rule matching `logs.js` pattern)
- Validation: zod schema matching the style in `backend/src/validation/schemas.js`
- UI: replace the static illustrative table in `Traffic.jsx` with a real, paginated, filterable incidents view. Move it to its own page/tab if it grows beyond a widget.
- Acceptance: no hardcoded incident rows remain anywhere in the frontend; `docs/DATA_SOURCES.md` updated to mark incidents as real.

### 4.2 Equipment inventory
- New table: `equipment`
  - `id, site, system_family (Radar/VOR-DME/ILS/VHF/etc.), name, manufacturer, model, install_date, status (operational/degraded/down), responsible_service, notes, created_at, updated_at`
- API: `GET /api/equipment` (filterable by site, system_family, status), `POST/PUT/DELETE` (root only for create/delete, dsa can update status)
- UI: new page under an "Equipment" tab, table view with filters, detail view per item
- Link forward: `daily_logs.equip` should eventually reference `equipment.id` instead of a free-text string — plan this now even if not enforced until Phase 2, to avoid a painful data-cleanup later. Start requiring new logs to pick from the equipment list via a dropdown once this ships.

### 4.3 Close remaining MVP gaps
- Finance/HR pages: explicit decision required — either commit to leaving them as clearly-labeled placeholders through Phase 4 (when real feeds might exist) or hide them from navigation now. Do not leave them ambiguous.
- Basic test coverage: minimum bar for exiting Phase 1 is unit tests on `middleware/auth.js` (`requireAuth`, `requireRoot`, `requirePage`) and the login rate limiter. This is the highest blast-radius code and must not go into Phase 2's bigger refactor untested.

**Phase 1 acceptance criteria:**
- [ ] Incidents module live, no demo data left in UI
- [ ] Equipment inventory live, browsable and filterable
- [ ] Finance/HR status explicitly decided and documented
- [ ] Auth/RBAC middleware has test coverage
- [ ] `docs/ROADMAP.md` and `docs/DATA_SOURCES.md` updated

---

## 5. Phase 2 — Data foundation (PostgreSQL migration)

This is the highest-risk phase. Treat it as its own mini-project with a rollback plan, not a routine feature.

### 5.1 Target schema (core tables)

```sql
-- Users & access
users (
  id serial PK, username text unique, password_hash text,
  role text check (role in ('root','dg','cns','dsa','site','viewer')),
  dsa_region text nullable, site_id int nullable references sites(id),
  must_change_password bool, last_pwd_change date,
  created_at timestamptz, updated_at timestamptz
)

permissions (
  id serial PK, user_id int references users(id),
  page_id text, granted bool default true
)

-- Organizational structure
sites (
  id serial PK, name text, oaci text unique, type text check (type in ('INTL','NTL')),
  dsa_region text, horaire text check (horaire in ('H24','H12')),
  latitude numeric, longitude numeric, created_at timestamptz
)

-- Equipment (from Phase 1, migrated + normalized)
equipment (
  id serial PK, site_id int references sites(id), system_family text,
  name text, manufacturer text, model text, install_date date,
  status text check (status in ('operational','degraded','down')),
  responsible_service text, notes text,
  created_at timestamptz, updated_at timestamptz
)

-- Daily equipment logs (migrated from JSON, now FK'd to equipment)
daily_logs (
  id serial PK, equipment_id int references equipment(id), site_id int references sites(id),
  date date, time time, status text, start_time time nullable, end_time time nullable,
  why text, author_id int references users(id), created_at timestamptz
)

-- Incidents (from Phase 1, migrated + normalized)
incidents (
  id serial PK, site_id int references sites(id), equipment_id int nullable references equipment(id),
  date date, time time, description text,
  severity text check (severity in ('minor','moderate','major')),
  status text check (status in ('open','in_review','closed')),
  reported_by int references users(id), resolution_notes text,
  created_at timestamptz, closed_at timestamptz nullable
)

-- Maintenance (Phase 3)
maintenance (
  id serial PK, equipment_id int references equipment(id), type text check (type in ('preventive','corrective')),
  scheduled_date date, completed_date date nullable, team text,
  status text check (status in ('scheduled','in_progress','completed','overdue')),
  remarks text, created_at timestamptz
)

-- Downtime (Phase 3, can be derived from daily_logs + maintenance, or tracked explicitly)
downtime (
  id serial PK, equipment_id int references equipment(id),
  start_ts timestamptz, end_ts timestamptz nullable, cause text, impact text,
  created_at timestamptz
)

-- Traffic (migrated from traffic_series)
traffic_series (
  id serial PK, month date, label text, movements int, created_at timestamptz
)

-- KPI snapshots (Phase 4 — computed and cached, not hand-entered)
kpi_snapshots (
  id serial PK, metric text, scope_type text check (scope_type in ('site','dsa','national')),
  scope_id text, period date, value numeric, computed_at timestamptz
)

-- Reports (Phase 4)
reports (
  id serial PK, type text, title text, generated_by int references users(id),
  status text check (status in ('draft','reviewed','validated','official')),
  content_ref text, created_at timestamptz, validated_at timestamptz nullable, validated_by int nullable
)

-- Audit log (should exist from Phase 2 onward, not deferred further)
audit_log (
  id serial PK, user_id int references users(id), action text, target_type text,
  target_id text, details jsonb, ip text, created_at timestamptz
)
```

### 5.2 Migration process (mandatory steps, in order)
1. Stand up Postgres in a non-production environment.
2. Write a one-time migration script that reads `backend/data/db.json` and inserts into the new schema — do not hand-retype seed data.
3. Run the migration against a copy, not the live file.
4. Verify row-for-row parity: every user, airport, log, and (post-Phase-1) incident/equipment record present and correctly typed.
5. Swap `backend/src/db/store.js` for a Postgres-backed equivalent behind the *same function signatures* (`getDb`, `save`, `load`) where reasonable, or refactor routes incrementally — do not do a big-bang rewrite of every route in one PR.
6. Keep the JSON file as a cold backup for at least one full deployment cycle after cutover.
7. Load-test basic concurrent writes (the exact failure mode the JSON store couldn't handle) before declaring this phase done.

### 5.3 Encoding
- All Postgres text columns UTF-8 (default) — explicitly verify French/Arabic accented and RTL characters round-trip correctly through API → DB → API, not just DB → UI.
- This was flagged as a known past failure point (per the old handover doc) — treat it as a required test case, not an assumption.

**Phase 2 acceptance criteria:**
- [ ] Full schema deployed
- [ ] Migration script exists, is repeatable, and has been run against a full data copy with verified parity
- [ ] All Phase 0/1 features work identically against Postgres (no regressions)
- [ ] Concurrent-write test passes (the specific bug class JSON couldn't handle)
- [ ] UTF-8/Arabic/French round-trip test passes
- [ ] Rollback procedure documented and tested at least once

---

## 6. Phase 3 — Core ERP modules

Builds only on top of the Postgres foundation. No module in this phase ships against JSON.

### 6.1 Expanded RBAC
Extend `role` beyond `root`/`dsa` to the full set: `root, dg, cns, site, viewer` (dsa stays as-is).

| Role | Scope | Can view | Can edit |
|---|---|---|---|
| root | All ENNA | Everything | Everything, incl. user/role admin |
| dg | National, executive | High-level KPIs, summaries only | Nothing operational |
| cns | Technical, national | CNS/equipment/maintenance across all sites | Equipment, maintenance |
| dsa | Regional | Own DSA region's sites | Logs, incidents in own region |
| site | Single site | Own site only | Logs, incidents for own site |
| viewer | Configurable | Whatever root grants, read-only | Nothing |

- Extend `requirePage` middleware to also check scope (region/site), not just page access — this is a real change to the middleware, not just new role strings.
- Every existing route that filters by `dsa_region` needs a matching `site_id`-based filter path for the new `site` role.

### 6.2 Maintenance module
- CRUD on `maintenance` table (see schema above)
- Auto-flag `overdue` status via a scheduled check (cron-style, can run in-process on interval for now — don't over-engineer a job scheduler yet)
- UI: calendar or list view, filterable by equipment/site/status

### 6.3 Downtime tracking
- Either explicit CRUD on `downtime`, or (preferred, less error-prone) derive downtime windows automatically from `daily_logs` status transitions (ON → Degradee/OFF → ON) — decide which approach before building, document the choice.

### 6.4 Realtime (SSE)
- Replace the 120-second polling in `App.jsx` with Server-Sent Events for logs/incidents/equipment status changes.
- Keep polling as a fallback if SSE connection drops.

**Phase 3 acceptance criteria:**
- [ ] All 6 roles enforced correctly, server-side, with scope filtering (not just page-list filtering)
- [ ] Maintenance module live with overdue detection
- [ ] Downtime tracked (explicit or derived — documented which)
- [ ] Dashboard updates in near-real-time without manual refresh
- [ ] No route exists that's reachable by a role that shouldn't see that data — verified by an actual cross-role test pass, not just code review

---

## 7. Phase 4 — Intelligence layer

### 7.1 KPI engine
Formulas must be documented and signed off before being displayed as authoritative:

- **Availability** = Operational time / Total required time (per equipment, aggregable by site/DSA/national)
- **MTTR** (Mean Time To Repair) = Σ(downtime durations) / count of repair events
- **MTBF** (Mean Time Between Failures) = Total operational time / count of failures
- **Incident rate** = incidents / (movements or operational hours, specify denominator)

All KPIs computed from `daily_logs`, `maintenance`, `downtime`, `incidents` — never hand-entered. Cache results in `kpi_snapshots`, recomputed on a schedule (e.g. nightly) rather than live-computed on every dashboard load, for performance.

### 7.2 Reports
- Workflow: Draft → Reviewed → Validated → Official (matches `reports.status` enum above)
- Only `validated`/`official` reports are exportable as final documents
- Templates: start with 2–3 report types (monthly summary, incident report, equipment report) — don't build a generic template engine before there's a second real template to generalize from

### 7.3 Document generation
- PDF export from validated report data — this is presentation logic, not a new data model
- Use a standard library (e.g. a PDF-generation package appropriate to the Node ecosystem) rather than hand-rolling PDF layout

**Phase 4 acceptance criteria:**
- [ ] KPI formulas documented and approved by an actual ENNA stakeholder, not just internally
- [ ] KPIs computed from real operational data, cached, not manually entered
- [ ] Report validation workflow enforced (drafts can't be exported as official)
- [ ] At least 2 report types generate correct PDF output from real data

---

## 8. Phase 5 — Hardening & deployment

This phase is a checklist, not new features. Nothing in Phase 6 starts until every item here is checked against the actual running system, not just planned.

- [ ] TLS/HTTPS in front of the API (reverse proxy — nginx/Caddy)
- [ ] `JWT_SECRET` and `ALLOWED_ORIGINS` set correctly in production env, verified not to fall back to dev defaults
- [ ] All seeded/demo passwords rotated (should already be forced via `must_change_password`, verify it actually happened for every account)
- [ ] Database credentials not committed anywhere, verified via a repo secret-scan
- [ ] Audit log capturing all admin actions (user create/delete, permission changes, report validation)
- [ ] Backup procedure for Postgres — automated, tested restore at least once
- [ ] Rate limiting extended beyond login to other write-heavy endpoints if load testing shows need
- [ ] Basic monitoring/alerting (uptime, error rate) — doesn't need to be sophisticated, needs to exist
- [ ] Load test with realistic concurrent user count for ENNA's actual staff size
- [ ] Full security review pass against the OWASP API Top 10, documented findings and fixes

**Phase 5 acceptance criteria:** every box above checked with evidence (a log, a test result, a config diff) — not verbal confirmation.

---

## 9. Phase 6 — Windows ANA Client

Only start after Phase 5 is stable in real production use for a meaningful period (recommend: at least one full month of stable operation before committing to client development).

- Client authenticates against the same API — no parallel auth system
- Device identification: client generates and persists a device ID on first run, sent alongside user auth; root can view/revoke authorized devices
- Startup sequence: launch → contact server → identify device → identify user → check authorization → (wait for root approval if new device) → load user's dashboard
- Update mechanism: client checks for its own version against a server-provided minimum, prompts update if stale — don't build a full auto-updater unless genuinely needed; a "please update" prompt with a download link may be sufficient for ENNA's scale
- Offline/server-unavailable state: client must fail gracefully with a clear message, not crash or hang

**Phase 6 acceptance criteria:**
- [ ] Client authenticates and displays the same dashboard as the web app for a given user
- [ ] Device authorization flow works end-to-end, including root approval of new devices
- [ ] Server-unavailable and update-required states handled gracefully

---

## 10. Explicit non-goals (for now)

To keep scope honest, these are *not* part of this plan unless a dated Decision Log entry adds them:
- Mobile native apps (web app is responsive; that's the mobile story for now)
- Multi-tenant support (this is single-organization software for ENNA)
- A generic report-template builder (build specific templates first; generalize only if a real second/third use case demands it)
- Integration with external ENNA systems beyond what's needed for Finance/HR feeds, if/when those become available

---

## 11. How this document gets used

- Each phase becomes its own execution prompt (same pattern as the Sprint 1 prompt already used for Phase 1's security items) when work actually starts on it.
- After each phase's work, run the standing audit prompt from the Charter against the *acceptance criteria in this document*, not just "does it look done."
- Update this document's Section 3 phase table with actual dates/commits as phases complete — this becomes the historical record instead of the old, inaccurate handover doc.
