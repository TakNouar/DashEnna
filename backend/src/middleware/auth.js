const jwt = require('jsonwebtoken');

const isProd = process.env.NODE_ENV === 'production';
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (isProd ? null : 'dashenna-dev-secret-change-in-production');

if (isProd && !process.env.JWT_SECRET) {
  console.error('[auth] FATAL: JWT_SECRET is required in production');
  process.exit(1);
}
if (!isProd && !process.env.JWT_SECRET) {
  console.warn('[auth] Using default JWT_SECRET (dev only). Set JWT_SECRET in .env for production.');
}

const DEFAULT_DSA_PAGES = ['overview', 'cns', 'map_dsa', 'daily_log', 'incidents', 'equipment'];

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      dsa_region: user.dsa_region,
      permissions: user.permissions || null,
    },
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

function userPages(user) {
  if (!user) return [];
  if (user.role === 'root') return null;
  const pages = user.permissions?.pages;
  if (Array.isArray(pages) && pages.length) return pages;
  return DEFAULT_DSA_PAGES;
}

function requirePage(pageId) {
  return (req, res, next) => {
    if (req.user?.role === 'root') return next();
    const pages = userPages(req.user);
    if (pages.includes(pageId)) return next();
    return res.status(403).json({ error: `Accès refusé à la page: ${pageId}` });
  };
}

module.exports = {
  signToken,
  requireAuth,
  requireRoot,
  requirePage,
  userPages,
  JWT_SECRET,
  DEFAULT_DSA_PAGES,
};
