# DashEnna → ENNA ERP — Master Development Document

**Version 1.0 — 2026-08-13, baselined against commit 96ce06d**

This document is the **single build spec** for taking DashEnna from its current state (a working dashboard MVP) to a full ENNA ERP system. It supersedes the old V2–V17 handover document as the active plan. `docs/DashEnna_Development_Charter.md` still governs **how** work is done (definitions of done, audit process, standards); this document governs **what** gets built, in what order, with what shape.

## Relationship to other docs

| Doc | Role |
|-----|------|
| `DashEnna_Development_Charter.md` | Process rules, audit standards, standing prompt |
| `docs/DATA_SOURCES.md` | What data is real vs. illustrative |
| `docs/ROADMAP.md` | Short rolling list, always in sync with Section 3 of this doc |
| **This document** | Full architecture and phase-by-phase build plan |

Any deviation from this document is a **Decision Log** entry in the Charter, dated, before work starts — not a silent scope change.

---

## 1. Current state (ground truth, not aspiration)

As of commit `96ce06d`:

- Stack: React (Vite) + Node/Express + flat JSON file (`backend/data/db.json`)
- Auth: bcrypt + JWT, 12h expiry, forced password change on first login, rate-limited login
- Roles: root, dsa — page-level permission arrays, enforced client and server
- Domain: 36 real aerodromes, daily equipment logs, CNS from logs, traffic (CSV import), Finance/HR as labeled placeholders
- i18n: FR/AR/EN across main pages
- Validation: zod on all POST/PUT bodies
- Security: CORS allowlist, JWT secret required in production

This is the foundation. Nothing here gets rewritten from scratch — it gets **extended**.

---

## 2. Target end-state architecture

```
Users → (Web app first; Windows ANA Client later) → API Gateway (Express)
                                                          ↓
                                          Auth (JWT) + RBAC middleware
                                                          ↓
                        Sites/Airports · Equipment · Maintenance · Incidents · Reports
                                                          ↓
                                                    PostgreSQL
                                                          ↓
                                              KPI computation layer
                                                          ↓
                                        Dashboards (root/DG/CNS/DSA/Site/Viewer)
```

Locked decisions for the ERP phase:

- **Database:** PostgreSQL. JSON store retired at Phase 2, not extended further.
- **API:** REST, versioned under `/api/v1/` once Postgres migration starts.
- **Frontend:** stays React/Vite — no framework rewrite.
- **Client:** web-first. Windows ANA Client (Phase 6) is a companion, same API.
- **Realtime:** SSE in Phase 3 (replace 120s polling).

---

## 3. Phase plan (sequential, gated)

| Phase | Name | Goal | Gate to next |
|-------|------|------|--------------|
| 0 (done) | Dashboard MVP + security hygiene | — | — |
| **1** | MVP completion | Incidents + equipment; close MVP gaps | All Phase 1 acceptance criteria met |
| **2** | Data foundation | JSON → PostgreSQL, no feature loss | Full parity, rollback tested |
| **3** | Core ERP modules | Maintenance, downtime, expanded RBAC, SSE | Modules pass with real ENNA data |
| **4** | Intelligence layer | KPI engine, reports, PDF | KPI formulas signed off by ENNA |
| **5** | Hardening & deployment | Security audit, backups, TLS, monitoring | Phase 5 checklist complete |
| **6** | Windows ANA Client | Installed client, device authorization | After Phase 5 stable in production |

Do not start a phase early. Later phases depend on earlier ones being **correct**, not just present.

---

## 4. Phase 1 — MVP completion

Scope: finish what the dashboard needs before any ERP work starts.

### 4.1 Incidents module

- Table `incidents` (JSON for now → Postgres in Phase 2):
  `id, date, time, site, system, equipment_id (nullable), description, severity (minor|moderate|major), status (open|in_review|closed), reported_by, resolution_notes, created_at, closed_at`
- API: `GET /api/incidents` (filters), `POST` (root+dsa), `PUT /:id`, `DELETE /:id` (root or same-day rule)
- Zod schema; UI replaces illustrative Traffic incidents; own tab if needed
- Acceptance: no hardcoded incident rows; `DATA_SOURCES.md` marks incidents as real

### 4.2 Equipment inventory

- Table `equipment`:
  `id, site, system_family, name, manufacturer, model, install_date, status (operational|degraded|down), responsible_service, notes, created_at, updated_at`
- API: GET filterable; POST/PUT/DELETE (root create/delete; dsa can update status)
- UI: Equipment tab, filters, detail
- Forward link: daily logs should pick equipment from dropdown once shipped

### 4.3 Close remaining MVP gaps

- Finance/HR: explicit decision — keep labeled placeholders through Phase 4 **or** hide from nav now
- Tests: unit tests on `middleware/auth.js` (requireAuth, requireRoot, requirePage) and login rate limiter before Phase 2

**Phase 1 acceptance:**

- [ ] Incidents live, no demo data in UI
- [ ] Equipment inventory live, filterable
- [ ] Finance/HR status decided and documented
- [ ] Auth/RBAC middleware has tests
- [ ] ROADMAP + DATA_SOURCES updated

---

## 5. Phase 2 — PostgreSQL migration

Highest-risk phase. Rollback plan required.

Core tables: `users`, `permissions`, `sites`, `equipment`, `daily_logs`, `incidents`, `maintenance`, `downtime`, `traffic_series`, `kpi_snapshots`, `reports`, `audit_log`.

Migration process (mandatory order): stand up Postgres → one-time script from `db.json` → run on copy → row parity → swap store behind same signatures → keep JSON cold backup one cycle → concurrent-write load test.

UTF-8 / Arabic / French round-trip is a required test case.

**Phase 2 acceptance:** schema deployed; migration repeatable with parity; no regressions; concurrent-write pass; UTF-8 pass; rollback documented and tested once.

---

## 6. Phase 3 — Core ERP modules

Postgres only. Expanded roles: root, dg, cns, dsa, site, viewer with **scope** filtering (region/site), not only page lists. Maintenance CRUD + overdue detection. Downtime explicit or derived from logs (document choice). SSE for live updates; polling fallback.

---

## 7. Phase 4 — Intelligence layer

KPI formulas (Availability, MTTR, MTBF, incident rate) documented and ENNA-signed before authoritative display. Computed from operational data into `kpi_snapshots`. Report workflow Draft → Reviewed → Validated → Official. PDF from validated reports (2–3 types first).

---

## 8. Phase 5 — Hardening & deployment

Checklist-only phase: TLS, secrets, password rotation verified, no committed DB credentials, audit log, Postgres backups + restore test, rate limits if needed, monitoring, load test, OWASP API Top 10 review. Every box needs evidence.

---

## 9. Phase 6 — Windows ANA Client

After ≥1 month stable production. Same API auth. Device ID + root approval. Graceful offline. Update prompt sufficient at ENNA scale.

---

## 10. Explicit non-goals (for now)

Unless a dated Decision Log entry adds them:

- Mobile native apps
- Multi-tenant
- Generic report-template builder before 2–3 real templates
- External ENNA integrations beyond Finance/HR feeds when available

---

## 11. How this document is used

- Each phase becomes its own execution prompt when work starts.
- After each phase, run the Charter standing audit against **this** document’s acceptance criteria.
- Update Section 3 with actual dates/commits as phases complete.
