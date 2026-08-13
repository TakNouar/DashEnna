const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dashenna-dev-secret-change-in-production';

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, dsa_region: user.dsa_region },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
}

function requireRoot(req, res, next) {
  if (req.user?.role !== 'root') {
    return res.status(403).json({ error: 'Accès réservé à root' });
  }
  next();
}

module.exports = { signToken, requireAuth, requireRoot, JWT_SECRET };
