const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, save } = require('../db/store');
const { requireAuth, requireRoot } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createUserSchema, permissionsSchema } = require('../validation/schemas');

const router = express.Router();

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    dsa_region: u.dsa_region,
    last_pwd_change: u.last_pwd_change,
    permissions: u.permissions,
    must_change_password: !!u.must_change_password,
    created_at: u.created_at,
  };
}

router.get('/', requireAuth, requireRoot, (req, res) => {
  const db = getDb();
  res.json(db.users.map(publicUser).sort((a, b) => a.username.localeCompare(b.username)));
});

router.post('/', requireAuth, requireRoot, validateBody(createUserSchema), (req, res) => {
  const { username, password, role, dsa_region, permissions } = req.body;
  const db = getDb();
  if (db.users.some((u) => u.username === username)) {
    return res.status(409).json({ error: 'Identifiant déjà utilisé' });
  }
  const user = {
    id: db.nextUserId++,
    username,
    password_hash: bcrypt.hashSync(password, 10),
    role: role || 'dsa',
    dsa_region: dsa_region || null,
    last_pwd_change: new Date().toISOString().slice(0, 10),
    must_change_password: true,
    permissions: permissions || { pages: ['overview', 'cns', 'map_dsa', 'daily_log'] },
    created_at: new Date().toISOString().slice(0, 10),
  };
  db.users.push(user);
  save();
  res.status(201).json(publicUser(user));
});

router.delete('/:id', requireAuth, requireRoot, (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const user = db.users.find((u) => u.id === id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.username === 'root') {
    return res.status(400).json({ error: 'Impossible de supprimer le compte root' });
  }
  db.users = db.users.filter((u) => u.id !== id);
  save();
  res.json({ ok: true });
});

router.put('/:id/permissions', requireAuth, requireRoot, validateBody(permissionsSchema), (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  user.permissions = req.body.permissions;
  save();
  res.json({ ok: true });
});

module.exports = router;
