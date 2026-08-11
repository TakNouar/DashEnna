# DashEnna

Executive dashboard for ENNA (Établissement National de la Navigation Aérienne) —
network-wide traffic, CNS/DSA equipment availability, finance, HR, and aerodrome
tracking across Algeria's aviation infrastructure.

## Current status

**Phase 1 (this commit): frontend reorganized, no behavior changes.**

The dashboard was a single 1,657-line HTML file with all CSS and JS inlined.
It has been split into a proper `frontend/` project — same UI, same features,
same bugs (see `docs/KNOWN_ISSUES.md`) — just organized so it's possible to work
on it. Nothing was rewritten or fixed in this pass on purpose, so the diff is
reviewable and low-risk.

There is **no real backend yet**. All data still lives in the browser's
`localStorage`, seeded from hardcoded defaults in `frontend/js/01-state.js`.
That's the next phase — see `docs/ROADMAP.md`.

## Structure

```
dashenna/
├── frontend/
│   ├── index.html          # shell: markup only, loads css/ and js/
│   ├── css/                # split by concern (variables, layout, components, ...)
│   └── js/                 # split by concern, numbered for load order
├── backend/                # placeholder — Phase 2, see ROADMAP.md
└── docs/
    ├── KNOWN_ISSUES.md      # bugs and gaps found during the reorg, not yet fixed
    └── ROADMAP.md            # path to a real client-server app
```

## Running it locally

Static files only, no build step:

```bash
cd frontend
python3 -m http.server 8000
# open http://localhost:8000
```

Login as `root` / `admin123` (default seed account — see
`docs/KNOWN_ISSUES.md` for why this needs to change before this ever
touches real data).

## Load order matters

`frontend/js/*.js` are loaded as plain `<script>` tags (no bundler, no
modules) in the numbered order set in `index.html`. They share one global
scope on purpose, the same way the original single file did — `01-state.js`
must load before anything that reads `db` or `currentUser`, etc. If you add
a file, give it a number that reflects its dependencies and wire it into
`index.html`.
