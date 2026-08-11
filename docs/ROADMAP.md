# Roadmap

Target: a real client-server app — backend + database, real auth, the
frontend talking to an API instead of `localStorage`. This is the path to
get there without a rewrite.

## Phase 1 — Reorganize the frontend (done)

Split the single HTML file into `frontend/{index.html, css/, js/}`, no
behavior changes. See `docs/KNOWN_ISSUES.md` for what was found but
deliberately not fixed yet.

## Phase 2 — Backend + real auth + real database

- Stand up `backend/` — Node/Express (fits the rest of the stack) serving a
  REST API.
- Pick a database. SQLite is the obvious start for a single-node deployment
  this size (accounts, daily logs, airports, imported data) — easy to run,
  easy to back up, no separate server process. Postgres if this ever needs
  multiple concurrent writers or a managed cloud DB.
- Replace `btoa()`/`atob()` with real password hashing (bcrypt or argon2)
  and move login off the client entirely: the server checks credentials,
  issues a session token or JWT, and the frontend stops being able to see
  anyone's password, ever.
- Move the permission model (`02-permissions.js`) enforcement server-side.
  The client-side matrix UI can stay for editing permissions, but every
  page/action check needs to also be enforced by the API, not just hidden
  in the DOM.
- Migrate `frontend/js/01-state.js` from a localStorage-backed `db` object
  to `fetch()` calls against the new API. This is the biggest single change
  and touches most of the other JS files, since they all read/write `db`
  directly today.

## Phase 3 — Data accuracy & feature completion

- Fill in the remaining aerodromes (11 → 36) and fix the duplicate OACI code
  (see `docs/KNOWN_ISSUES.md`).
- Wire the charts (`11-charts.js`) to real data instead of hardcoded arrays
  — either define the missing `updateChartsFromData()` or replace the
  refresh call with something that actually rebuilds each chart's dataset
  from `db`/`airportsData`/`dailyLogs`.
- Decide what the Excel/CSV import is actually for and make it consistent:
  either it's a full data-refresh mechanism (import replaces/updates
  airports, logs, etc.) or a narrower "update horaire" tool — right now it's
  ambiguously both.

## Notes

- Phase 2 is the one to scope carefully before starting — it touches every
  other file. Worth doing as its own focused pass rather than mixed in with
  data or feature fixes.
- Keep `docs/KNOWN_ISSUES.md` updated as items get resolved, so it stays a
  reliable list of what's actually still outstanding.
