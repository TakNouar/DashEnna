# Data sources & legitimacy

## Official aerodrome count

ENNA homepage (2026): **12 internationaux + 24 nationaux = 36**.

## ICAO codes

Verified against AIS Algeria AIP. Loader: `backend/src/data/airports.js`.

## Public traffic figures (enna.dz)

- Mouvements aérodromes **2025**: 253 340
- Survols **2025**: 276 899

## Real (API-backed) as of Phase 1

| Domain | Source | Notes |
|--------|--------|-------|
| Aerodromes | Static JSON from official list | 36 sites |
| Daily equipment logs | `POST /api/logs` → `db.daily_logs` | CNS derived from these |
| CNS availability | Computed from latest log status | Not external feed |
| Traffic series | `db.traffic_series` + CSV import | Public annual totals from enna.dz |
| **Incidents** | `db.incidents` via `/api/incidents` | **Real module — starts empty, no demo rows in UI** |
| **Equipment inventory** | `db.equipment` via `/api/equipment` | Seeded structured inventory; editable by root |

## Still illustrative

| Domain | Status | Decision |
|--------|--------|----------|
| Finance KPIs | Labeled placeholder pages | **Kept visible through Phase 4** (Master Plan §4.3) |
| HR / effectifs | Labeled placeholder (~3 300 agents) | Same as Finance |
| Per-airport map `traffic` field | Illustrative monthly average | Map UX only |

## Seed notes

- Daily log seeds exist so CNS charts are non-empty on first install.
- Incidents array is **empty** by default — the Incidents UI never shows hardcoded rows.
