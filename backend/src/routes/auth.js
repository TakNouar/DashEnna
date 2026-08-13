const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb, save } = require('../db/store');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }
  const db = getDb();
  const user = db.users.find((u) => u.username === username.trim());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      dsa_region: user.dsa_region,
      last_pwd_change: user.last_pwd_change,
      permissions: user.permissions,
    },
  });
});

router.get('/me', requireAuth, (req, res) => {
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    dsa_region: user.dsa_region,
    last_pwd_change: user.last_pwd_change,
    permissions: user.permissions,
  });
});

router.post('/change-password', requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
  }
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
  }
  if (user.role !== 'root') {
    const last = new Date(user.last_pwd_change || '2026-01-01');
    const days = Math.ceil(Math.abs(Date.now() - last) / 86400000);
    if (days < 30) {
      return res.status(400).json({
        error: `Modification refusée : une fois par mois (${30 - days} jours restants)`,
      });
    }
  }
  user.password_hash = bcrypt.hashSync(newPassword, 10);
  user.last_pwd_change = new Date().toISOString().slice(0, 10);
  save();
  res.json({ ok: true, last_pwd_change: user.last_pwd_change });
});

module.exports = router;
