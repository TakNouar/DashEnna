# Data sources & legitimacy (Phase 0)

## Official aerodrome count

ENNA homepage (2026): **12 internationaux + 24 nationaux = 36**.

Page [Aérodromes gérés](https://enna.dz/fr/a-propos/aerodrome-geres/) lists the same 36 names.

## ICAO codes

Verified against AIS Algeria AIP (sia-enna.dz), Part 3 AD:

| Name | Correct OACI | Old (wrong) |
|------|--------------|-------------|
| Ghardaïa – Noumérat | **DAUG** | DAAG (duplicate of Alger) |
| El Goléa | **DAUE** | DAAE (which is Béjaïa) |
| Tébessa | **DABS** | DAAF |

Full list of 36 codes:
- `backend/src/data/airports_p1.json` (18)
- `backend/src/data/airports_p2.json` (18)
- `backend/src/data/airports.js` (loader that merges both)

## DSA regions (dashboard model)

Mapped for operational grouping (not an official org chart):

- DSA Alger (Centre)
- DSA Oran (Ouest) / DSA Oran (Béchar)
- DSA Constantine (Est)
- DSA Annaba (Est)
- DSA Sud (Hassi-Messaoud) / (Ouargla) / (Adrar) / (Tamanrasset)

Real ENNA structure also includes DDNA, DENA, DTNA, DRFC, DJRH, CQRENA, FIU, and regional divisions (Algiers, Constantine, Hassi-Messaoud, Oran, Annaba — AEFMP).

## Public traffic figures

From enna.dz homepage:

- Mouvements aérodromes **2025**: 253 340
- Survols **2025**: 276 899

Per-airport monthly `traffic` values in the DB are **illustrative** averages for map/table UX only.

## What is NOT real

- Live CNS availability percentages
- Finance KPIs (CA, résultat)
- Incident journal entries (demo)
- Daily log seed rows (demo)

These are labelled in the UI and must be replaced by internal ENNA data feeds for production use.
