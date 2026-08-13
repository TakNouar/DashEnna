const express = require('express');
const { getDb, save, DEFAULT_TRAFFIC } = require('../db/store');
const { requireAuth, requireRoot } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { trafficImportSchema } = require('../validation/schemas');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const series = db.traffic_series || DEFAULT_TRAFFIC;
  const total = series.reduce((s, r) => s + (Number(r.movements) || 0), 0);
  res.json({
    series,
    total,
    public_2025: { movements: 253340, overflights: 276899 },
    source: 'db.traffic_series',
  });
});

router.post('/import', requireAuth, requireRoot, validateBody(trafficImportSchema), (req, res) => {
  const csv = req.body.csv || req.body.text || '';

  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    if (/^month/i.test(line)) continue;
    const parts = line.split(/[,;\t]/).map((p) => p.trim());
    if (parts.length < 2) continue;
    let month, label, movements;
    if (parts.length >= 3) {
      [month, label, movements] = parts;
    } else {
      month = parts[0];
      movements = parts[1];
      label = month.slice(5) || month;
    }
    const n = Number(String(movements).replace(/\s/g, ''));
    if (!month || Number.isNaN(n) || n < 0) continue;
    rows.push({ month, label: label || month, movements: n });
  }

  if (!rows.length) {
    return res.status(400).json({ error: 'Aucune ligne valide dans le CSV' });
  }

  rows.sort((a, b) => a.month.localeCompare(b.month));
  const db = getDb();
  db.traffic_series = rows;
  save();
  res.json({ ok: true, count: rows.length, series: rows });
});

module.exports = router;
