# DashEnna — Development Charter & Standing Audit Prompt

**Version 1.0 — established 2026-08-13, against commit e9b1cf3**

This document has two jobs:

1. It is the governing spec for how DashEnna gets built from here — what "done" means, what's non-negotiable, what order things happen in.

2. It is a standing prompt you can paste to any AI to get the same strict, code-verified audit process applied consistently.

Nothing in here overrides reality. If the repo contradicts this document, the repo wins and this document gets updated — never the other way around.

## 1. Prime directive for whoever audits this repo (human or AI)

Never report on claims. Report on code. Every status statement must be traceable to a specific file, line, or commit. "The roadmap says X is done" is not evidence that X is done. If you cannot point to the code that implements a claim, the claim is UNVERIFIED, not TRUE.

Concretely, an auditor must:

- Actually git pull / clone and read the current main before saying anything about status.
- Open and read the actual route/component files for anything marked "done" — not just README.md or ROADMAP.md.
- Distinguish explicitly between: Verified working, Present but untested, Stubbed/placeholder, Claimed but absent, Not started.
- Flag any gap between what a commit message / doc says and what the diff actually contains.
- Never round up. A half-implemented feature is not "mostly done" — state the specific missing piece.

## 2. Project identity (locked — do not scope-creep silently)

DashEnna is, right now, an **internal executive dashboard**, not an ERP:

- React (Vite) frontend + Node/Express backend + JSON file persistence
- Auth: bcrypt + JWT, role-based (root / dsa, extensible via per-user page permissions)
- Domain: 36 ENNA aerodromes, daily equipment logs, CNS availability computed from those logs, traffic figures
- Explicitly NOT (yet): PostgreSQL, a Windows client, incident/maintenance/KPI/reporting modules, Excel import, multi-role hierarchy (DG/CNS/Viewer)

The V2–V17 "ERP handover" document is treated as an aspirational appendix, not a specification. Nothing in it is "in progress" unless it is separately, explicitly added to Section 5 (Roadmap) below with real repo evidence.

Any decision to expand scope toward the full ERP vision must be an explicit, dated decision recorded in Section 7 (Decision Log).

## 3. Non-negotiable engineering standards

These apply to every PR/commit from this point forward. A feature that violates these is not done, regardless of whether it "works" in a demo.

### Security (hard gate — blocks merge)

- No secret, credential, or seed password may be introduced with a real-looking default in committed source. Dev fallbacks are allowed only behind `NODE_ENV !== 'production'` checks, following the existing pattern in `middleware/auth.js`.
- Every new route that touches non-public data must call `requireAuth`, and if it's role-scoped, `requireRoot` or `requirePage`. No route ships with authorization "to be added later."
- Every POST/PUT route must validate input shape and types, not just presence.
- No `origin: true` wildcard CORS in any config destined for a non-local environment.

### Data integrity

- Any dashboard value that is not backed by a real computation or a cited public source must be visually labeled as illustrative/demo.
- No feature may silently replace real data with placeholder data without updating `docs/DATA_SOURCES.md` in the same commit.

### Process

- No feature is "Done" without: the route/component existing, being reachable from the UI (or documented as API-only), and matching its own claimed behavior when read.
- `docs/ROADMAP.md` must be updated in the same PR that completes the item.
- Tests are currently at 0% — accepted debt. Once any test infrastructure is introduced, auth/RBAC middleware must be covered first.

## 4. Definition of "Done" per feature type

| Feature type | Done means |
|--------------|------------|
| API route | Exists, has correct requireAuth/requireRoot/requirePage, validates input, is called from a real UI path OR documented as intentionally API-only |
| UI page | Renders real data from a live API call, not hardcoded values; empty/error states handled; role-gated in App.jsx's canAccess() |
| Security fix | Verified by reading the actual code path |
| i18n string | Present in all three locale files (ar.js, en.js, fr.js) |
| Data module | Persistence model, API route with validation, UI page, reflected in DATA_SOURCES.md as real vs. demo |

## 5. Current roadmap (only source of "what's next")

### Immediate (security/hygiene — do before new features)

1. Add a validation layer (zod or equivalent) to replace ad hoc presence checks
2. Add rate limiting to `/api/auth/login`
3. Replace wildcard CORS with an explicit allowlist before any non-local deployment
4. Force password change on first login for seeded accounts

### Near-term (extends what already works)

5. Real incidents module, following the existing daily_logs pattern
6. Equipment inventory table (foundation for future maintenance/KPI work)

### Deferred until explicitly decided (Section 7 decision required first)

7. PostgreSQL migration
8. KPI engine / MTTR / MTBF
9. Report generation / validation workflow
10. Windows ANA Client
11. Excel import (CSV import already exists — don't build until a real need is confirmed)

## 6. Standing audit prompt

You are auditing the repo github.com/TakNouar/DashEnna, branch main. Clone or fetch the current code — do not rely on memory of prior conversations or on the repo's own README/ROADMAP as ground truth; verify against actual source files. Apply the standards in DashEnna_Development_Charter.md (Sections 1–4) exactly. For every claim of progress, cite the specific file and what it actually contains. Categorize every feature as one of: Verified working / Present but untested / Stubbed / Claimed but absent / Not started. Do not round up completion percentages. Flag any commit whose message overstates what the diff contains. Compare current state only against Section 5 of the charter — ignore the old V2–V17 ERP handover document unless Section 7 has recorded an explicit decision to pursue it. Output a report in the format specified in Section 8.

## 7. Decision log

(Append-only.)

- **2026-08-13** — Charter established. Confirmed project scope is "internal dashboard MVP," not full ERP. V2–V17 handover doc downgraded to aspirational appendix, not active roadmap.
- **2026-08-13** — Charter committed to `docs/DashEnna_Development_Charter.md` on main.

## 8. Required report format

Every audit report must contain, in this order:

1. Commit reference — exact commit hash scanned and date
2. Delta since last report — what changed, file by file, since the previous audit
3. Section 5 roadmap status — each numbered item with evidence
4. New violations of Section 3 standards
5. Updated completion percentages
6. Recommended next 3 actions
7. Nothing else
