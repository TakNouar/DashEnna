const express = require('express');
const { getDb, save } = require('../db/store');
const { requireAuth, requireRoot } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { equipmentCreateSchema, equipmentUpdateSchema } = require('../validation/schemas');

const router = express.Router();

function canReadEquipment(req, res, next) {
  if (req.user?.role === 'root') return next();
  const pages = req.user?.permissions?.pages || [];
  if (pages.includes('equipment') || pages.includes('cns') || pages.includes('daily_log')) return next();
  return res.status(403).json({ error: 'Accès refusé au parc équipements' });
}

router.get('/', requireAuth, canReadEquipment, (req, res) => {
  const db = getDb();
  let rows = [...(db.equipment || [])];
  const { site, system_family, status } = req.query;
  if (site) rows = rows.filter((r) => r.site === site || r.site.includes(String(site)));
  if (system_family) rows = rows.filter((r) => r.system_family === system_family);
  if (status) rows = rows.filter((r) => r.status === status);
  rows.sort((a, b) => a.site.localeCompare(b.site, 'fr') || a.name.localeCompare(b.name, 'fr'));
  res.json(rows);
});

router.get('/:id', requireAuth, canReadEquipment, (req, res) => {
  const db = getDb();
  const row = (db.equipment || []).find((r) => r.id === Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Équipement introuvable' });
  res.json(row);
});

router.post('/', requireAuth, requireRoot, validateBody(equipmentCreateSchema), (req, res) => {
  const db = getDb();
  if (!Array.isArray(db.equipment)) db.equipment = [];
  if (!db.nextEquipmentId) db.nextEquipmentId = 1;
  const now = new Date().toISOString();
  const body = req.body;
  const row = {
    id: db.nextEquipmentId++,
    site: body.site,
    system_family: body.system_family,
    name: body.name,
    manufacturer: body.manufacturer || '',
    model: body.model || '',
    install_date: body.install_date || null,
    status: body.status || 'operational',
    responsible_service: body.responsible_service || '',
    notes: body.notes || '',
    created_at: now,
    updated_at: now,
  };
  db.equipment.push(row);
  save();
  res.status(201).json(row);
});

router.put('/:id', requireAuth, validateBody(equipmentUpdateSchema), (req, res) => {
  const db = getDb();
  const row = (db.equipment || []).find((r) => r.id === Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Équipement introuvable' });
  if (req.user.role !== 'root') {
    const pages = req.user.permissions?.pages || [];
    if (!pages.includes('equipment')) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    const allowed = {};
    if (req.body.status !== undefined) allowed.status = req.body.status;
    if (req.body.notes !== undefined) allowed.notes = req.body.notes;
    if (!Object.keys(allowed).length) {
      return res.status(403).json({ error: 'DSA: seuls statut et notes sont modifiables' });
    }
    Object.assign(row, allowed);
  } else {
    Object.assign(row, req.body);
  }
  row.updated_at = new Date().toISOString();
  save();
  res.json(row);
});

router.delete('/:id', requireAuth, requireRoot, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const before = (db.equipment || []).length;
  db.equipment = (db.equipment || []).filter((r) => r.id !== id);
  if (db.equipment.length === before) {
    return res.status(404).json({ error: 'Équipement introuvable' });
  }
  save();
  res.json({ ok: true });
});

module.exports = router;
