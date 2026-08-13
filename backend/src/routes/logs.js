const express = require('express');
const { getDb, save } = require('../db/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const rows = [...db.daily_logs].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });
  res.json(rows.slice(0, 200));
});

router.post('/', requireAuth, (req, res) => {
  const { date, time, site, equip, status, start_time, end_time, why } = req.body || {};
  if (!date || !time || !site || !equip || !status) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }
  const db = getDb();
  const row = {
    id: db.nextLogId++,
    date,
    time,
    site,
    equip,
    status,
    start_time: start_time || null,
    end_time: end_time || null,
    why: why || '',
    author: req.user.username,
    created_at: new Date().toISOString(),
  };
  db.daily_logs.push(row);
  save();
  res.status(201).json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const idx = db.daily_logs.findIndex((l) => l.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Rapport introuvable' });
  const log = db.daily_logs[idx];
  if (req.user.role !== 'root' && log.author !== req.user.username) {
    return res.status(403).json({ error: 'Non autorisé' });
  }
  if (req.user.role !== 'root') {
    const today = new Date().toISOString().slice(0, 10);
    if (log.date !== today) {
      return res.status(403).json({ error: 'Modification autorisée uniquement le jour même' });
    }
  }
  db.daily_logs.splice(idx, 1);
  save();
  res.json({ ok: true });
});

module.exports = router;
