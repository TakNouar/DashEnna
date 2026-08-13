# DashEnna — Development Charter & Standing Audit Prompt

**Version 1.1 — established 2026-08-13; updated with ERP path decision**

This document has two jobs:

1. It is the governing spec for **how** DashEnna gets built — what "done" means, what's non-negotiable, audit process.

2. It is a standing prompt you can paste to any AI for code-verified audits.

**What** gets built is defined in `docs/ENNA_ERP_Master_Plan.md` (active as of Decision Log 2026-08-13).

Nothing in here overrides reality. If the repo contradicts this document, the repo wins and this document gets updated — never the other way around.

## 1. Prime directive for whoever audits this repo (human or AI)

Never report on claims. Report on code. Every status statement must be traceable to a specific file, line, or commit. "The roadmap says X is done" is not evidence that X is done. If you cannot point to the code that implements a claim, the claim is UNVERIFIED, not TRUE.

Concretely, an auditor must:

- Actually git pull / clone and read the current main before saying anything about status.
- Open and read the actual route/component files for anything marked "done" — not just README.md or ROADMAP.md.
- Distinguish explicitly between: Verified working, Present but untested, Stubbed/placeholder, Claimed but absent, Not started.
- Flag any gap between what a commit message / doc says and what the diff actually contains.
- Never round up. A half-implemented feature is not "mostly done" — state the specific missing piece.

## 2. Project identity

**Current product:** internal executive dashboard (MVP complete at Phase 0).

**Authorized path (Decision Log 2026-08-13):** extend toward ENNA ERP per `docs/ENNA_ERP_Master_Plan.md`, phase-gated. Phase 1 (incidents + equipment) stays on the JSON store; PostgreSQL begins only at Phase 2.

- Stack (Phase 0–1): React (Vite) + Node/Express + JSON file persistence
- Auth: bcrypt + JWT, root / dsa (expand roles in Phase 3)
- Domain now: 36 ENNA aerodromes, daily logs, CNS, traffic; Phase 1 adds incidents + equipment

The old V2–V17 handover document remains archival only. The Master Plan is the active build spec.

## 3. Non-negotiable engineering standards

These apply to every PR/commit from this point forward. A feature that violates these is not done, regardless of whether it "works" in a demo.

### Security (hard gate — blocks merge)

- No secret, credential, or seed password may be introduced with a real-looking default in committed source. Dev fallbacks are allowed only behind `NODE_ENV !== 'production'` checks, following the existing pattern in `middleware/auth.js`.
- Every new route that touches non-public data must call `requireAuth`, and if it's role-scoped, `requireRoot` or `requirePage`. No route ships with authorization "to be added later."
- Every POST/PUT route must validate input shape and types (zod), not just presence.
- No `origin: true` wildcard CORS in any config destined for a non-local environment.

### Data integrity

- Any dashboard value that is not backed by a real computation or a cited public source must be visually labeled as illustrative/demo.
- No feature may silently replace real data with placeholder data without updating `docs/DATA_SOURCES.md` in the same commit.

### Process

- No feature is "Done" without: the route/component existing, being reachable from the UI (or documented as API-only), and matching its own claimed behavior when read.
- `docs/ROADMAP.md` must be updated in the same PR that completes the item.
- Tests: Phase 1 requires unit tests on auth/RBAC middleware and login rate limiter before Phase 2.

## 4. Definition of "Done" per feature type

| Feature type | Done means |
|--------------|------------|
| API route | Exists, has correct requireAuth/requireRoot/requirePage, validates input, is called from a real UI path OR documented as intentionally API-only |
| UI page | Renders real data from a live API call, not hardcoded values; empty/error states handled; role-gated in App.jsx's canAccess() |
| Security fix | Verified by reading the actual code path |
| i18n string | Present in all three locale files (ar.js, en.js, fr.js) |
| Data module | Persistence model, API route with validation, UI page, reflected in DATA_SOURCES.md as real vs. demo |

## 5. Current roadmap

Short list lives in `docs/ROADMAP.md`. Full phase plan lives in `docs/ENNA_ERP_Master_Plan.md`.

**Active work:** Phase 1 — Incidents, Equipment, Finance/HR decision, auth tests.

**Deferred until prior phase gates pass:** PostgreSQL (Phase 2), expanded RBAC/maintenance/SSE (Phase 3), KPIs/reports (Phase 4), production hardening (Phase 5), Windows client (Phase 6).

## 6. Standing audit prompt

You are auditing the repo github.com/TakNouar/DashEnna, branch main. Clone or fetch the current code — do not rely on memory of prior conversations or on the repo's own README/ROADMAP as ground truth; verify against actual source files. Apply the standards in DashEnna_Development_Charter.md (Sections 1–4) exactly. For every claim of progress, cite the specific file and what it actually contains. Categorize every feature as one of: Verified working / Present but untested / Stubbed / Claimed but absent / Not started. Do not round up completion percentages. Flag any commit whose message overstates what the diff contains. Compare current state against `docs/ROADMAP.md` and the active phase acceptance criteria in `docs/ENNA_ERP_Master_Plan.md`. Output a report in the format specified in Section 8.

## 7. Decision log

(Append-only.)

- **2026-08-13** — Charter established. Confirmed project scope is "internal dashboard MVP," not full ERP. V2–V17 handover doc downgraded to aspirational appendix, not active roadmap.
- **2026-08-13** — Charter committed to `docs/DashEnna_Development_Charter.md` on main.
- **2026-08-13** — **ERP path authorized.** `docs/ENNA_ERP_Master_Plan.md` v1.0 adopted as the active build plan (baselined at commit 96ce06d). Phase 0 (MVP + security hygiene) is complete. Next executable work is **Phase 1** (incidents + equipment + tests + Finance/HR decision). PostgreSQL and later phases remain gated per Master Plan Section 3. Old V2–V17 remains archival only.

## 8. Required report format

Every audit report must contain, in this order:

1. Commit reference — exact commit hash scanned and date
2. Delta since last report — what changed, file by file, since the previous audit
3. Active phase status — each acceptance criterion with evidence
4. New violations of Section 3 standards
5. Updated completion percentages (by phase / category)
6. Recommended next 3 actions
7. Nothing else
