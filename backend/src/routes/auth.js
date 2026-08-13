const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const { getDb, save } = require('../db/store');
const { signToken, requireAuth } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../validation/schemas');

const router = express.Router();

// 10 attempts / 15 min / IP — scoped to login only (does not affect /api/health or other routes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

router.post('/login', loginLimiter, validateBody(loginSchema), (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.username === username);
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
      must_change_password: !!user.must_change_password,
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
    must_change_password: !!user.must_change_password,
  });
});

router.post('/change-password', requireAuth, validateBody(changePasswordSchema), (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const db = getDb();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user || !bcrypt.compareSync(oldPassword, user.password_hash)) {
    return res.status(400).json({ error: 'Ancien mot de passe incorrect' });
  }
  if (user.role !== 'root' && !user.must_change_password) {
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
  user.must_change_password = false;
  save();
  res.json({
    ok: true,
    last_pwd_change: user.last_pwd_change,
    must_change_password: false,
  });
});

module.exports = router;
