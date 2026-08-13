const express = require('express');
const { getDb, save } = require('../db/store');
const { requireAuth, requirePage } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { incidentCreateSchema, incidentUpdateSchema } = require('../validation/schemas');

const router = express.Router();

function canReadIncidents(req, res, next) {
  if (req.user?.role === 'root') return next();
  const pages = req.user?.permissions?.pages || [];
  if (pages.includes('incidents') || pages.includes('traffic') || pages.includes('overview')) return next();
  return res.status(403).json({ error: 'Accès refusé aux incidents' });
}

router.get('/', requireAuth, canReadIncidents, (req, res) => {
  const db = getDb();
  let rows = [...(db.incidents || [])];
  const { site, severity, status, from, to } = req.query;
  if (site) rows = rows.filter((r) => r.site === site || r.site.includes(String(site)));
  if (severity) rows = rows.filter((r) => r.severity === severity);
  if (status) rows = rows.filter((r) => r.status === status);
  if (from) rows = rows.filter((r) => r.date >= from);
  if (to) rows = rows.filter((r) => r.date <= to);
  rows.sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });
  res.json(rows);
});

router.post('/', requireAuth, requirePage('incidents'), validateBody(incidentCreateSchema), (req, res) => {
  const db = getDb();
  if (!Array.isArray(db.incidents)) db.incidents = [];
  if (!db.nextIncidentId) db.nextIncidentId = 1;
  const body = req.body;
  const row = {
    id: db.nextIncidentId++,
    date: body.date,
    time: body.time,
    site: body.site,
    system: body.system || '',
    equipment_id: body.equipment_id ?? null,
    description: body.description,
    severity: body.severity,
    status: body.status || 'open',
    reported_by: req.user.username,
    resolution_notes: body.resolution_notes || '',
    created_at: new Date().toISOString(),
    closed_at: body.status === 'closed' ? new Date().toISOString() : null,
  };
  db.incidents.push(row);
  save();
  res.status(201).json(row);
});

router.put('/:id', requireAuth, requirePage('incidents'), validateBody(incidentUpdateSchema), (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const row = (db.incidents || []).find((r) => r.id === id);
  if (!row) return res.status(404).json({ error: 'Incident introuvable' });
  const { status, resolution_notes, description, severity } = req.body;
  if (status !== undefined) {
    row.status = status;
    row.closed_at = status === 'closed' ? new Date().toISOString() : null;
  }
  if (resolution_notes !== undefined) row.resolution_notes = resolution_notes;
  if (description !== undefined) row.description = description;
  if (severity !== undefined) row.severity = severity;
  save();
  res.json(row);
});

router.delete('/:id', requireAuth, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const idx = (db.incidents || []).findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Incident introuvable' });
  const row = db.incidents[idx];
  if (req.user.role !== 'root') {
    if (row.reported_by !== req.user.username) {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    const today = new Date().toISOString().slice(0, 10);
    if (row.date !== today) {
      return res.status(403).json({ error: 'Suppression autorisée uniquement le jour même (sauf root)' });
    }
  }
  db.incidents.splice(idx, 1);
  save();
  res.json({ ok: true });
});

module.exports = router;
