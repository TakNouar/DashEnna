const express = require('express');
const { getDb } = require('../db/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function requireAnyPage(...pages) {
  return (req, res, next) => {
    if (req.user?.role === 'root') return next();
    const userPages = req.user?.permissions?.pages || [];
    if (pages.some((p) => userPages.includes(p))) return next();
    if (!userPages.length && pages.some((p) => ['overview', 'cns', 'map_dsa', 'daily_log'].includes(p))) {
      return next();
    }
    return res.status(403).json({ error: 'Accès refusé' });
  };
}

router.get('/', requireAuth, requireAnyPage('overview', 'map_dsa', 'daily_log', 'cns', 'traffic'), (req, res) => {
  const db = getDb();
  const rows = [...db.airports].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'INTL' ? -1 : 1;
    return a.name.localeCompare(b.name, 'fr');
  });
  res.json(rows);
});

router.get('/stats', requireAuth, requireAnyPage('overview', 'map_dsa', 'traffic'), (req, res) => {
  const db = getDb();
  const apts = db.airports;
  const total = apts.length;
  const intl = apts.filter((a) => a.type === 'INTL').length;
  const ntl = total - intl;
  const h24 = apts.filter((a) => a.horaire === 'H24').length;
  const h12 = total - h24;
  const byDsaMap = {};
  for (const a of apts) {
    byDsaMap[a.dsa] = (byDsaMap[a.dsa] || 0) + 1;
  }
  const byDsa = Object.entries(byDsaMap)
    .map(([dsa, count]) => ({ dsa, count }))
    .sort((a, b) => b.count - a.count);
  res.json({ total, intl, ntl, h24, h12, byDsa });
});

router.get('/:oaci', requireAuth, requireAnyPage('map_dsa', 'overview', 'daily_log'), (req, res) => {
  const db = getDb();
  const row = db.airports.find((a) => a.oaci === req.params.oaci.toUpperCase());
  if (!row) return res.status(404).json({ error: 'Aérodrome introuvable' });
  res.json(row);
});

module.exports = router;
