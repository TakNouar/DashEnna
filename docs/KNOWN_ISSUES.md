# Known issues

Found while reorganizing the codebase. Nothing here was fixed in the reorg
pass on purpose — this is a map for what Phase 2/3 needs to address, and a
record so nobody re-discovers the same bugs from scratch.

## Security

- **`frontend/js/05-auth.js`** — passwords are stored and compared with
  `btoa()`/`atob()`. That's Base64 encoding, not hashing. Anyone with
  devtools open can decode every password in `db.accounts`, including root's,
  in one line: `atob(db.accounts[0].passHash)`.
- All authentication and permission checks run client-side only
  (`frontend/js/02-permissions.js`, `v5Can()`). Any user can bypass any
  permission by editing state in the browser console. There's no server to
  enforce anything.
- There is no real backend, so "real authentication" doesn't exist yet in
  this codebase — whatever's been discussed as already built needs to either
  be located and merged in, or built from scratch in Phase 2.

## Data accuracy

- **`frontend/js/09-airports-data.js`** — `airportsData` has **11 entries**,
  not the 36 the UI text claims (see the "36 Aérodromes" heading in
  `index.html`, `map_dsa` section).
- Two entries share the OACI code `DAAG` (Alger, and what's labeled
  "Ghardaïa"). Ghardaïa's real OACI code is `DAUG`. Anything that looks up an
  airport by OACI code will silently match the wrong one for whichever entry
  comes second in the array.

## Dead / disconnected features

- **`frontend/js/03-data-sync.js`**, `v5RefreshDashboard()` — calls
  `updateChartsFromData()` on every refresh, guarded by
  `if (typeof updateChartsFromData === 'function')`. That function is never
  defined anywhere in the codebase, so the guard silently no-ops. Charts
  never actually refresh from real data — they're static.
- **`frontend/js/11-charts.js`** — every chart (`initCharts()`) is seeded
  with hardcoded arrays, not derived from `db`, `airportsData`, or
  `dailyLogs`. The dashboard looks live but isn't.
- **`frontend/js/03-data-sync.js`**, `v5ImportExcel()` — imported Excel/CSV
  data is stored in `db.importedData` but only actually used for one narrow
  case: matching a sheet named like "aerodrome" to update the `horaire`
  field on existing airports. Everything else you import is stored and never
  read again.

## Persistence

- Everything lives in `localStorage`. There is no server, no real database.
  Data doesn't sync between devices/browsers and is lost if the user clears
  site data. This is expected for Phase 1 — flagged here so it's not
  mistaken for a bug introduced by the reorg.

## Naming / consistency

- Roughly half the functions are prefixed `v5*` (from a later rewrite layer
  bolted onto the original code), the rest aren't. Not a bug, but worth
  deciding on a single convention before Phase 2 adds more code.
