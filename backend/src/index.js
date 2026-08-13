const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
}

const express = require('express');
const cors = require('cors');
const { load } = require('./db/store');

const authRoutes = require('./routes/auth');
const airportRoutes = require('./routes/airports');
const logRoutes = require('./routes/logs');
const userRoutes = require('./routes/users');
const trafficRoutes = require('./routes/traffic');
const incidentRoutes = require('./routes/incidents');
const equipmentRoutes = require('./routes/equipment');

const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';
load();

const app = express();

function buildCorsOrigin() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length) {
    return (origin, cb) => {
      if (!origin || list.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS: origin non autorisée: ${origin}`));
    };
  }
  if (!isProd) {
    return ['http://localhost:5173', 'http://127.0.0.1:5173'];
  }
  console.warn('[cors] ALLOWED_ORIGINS not set in production — denying all browser origins');
  return [];
}

app.use(cors({ origin: buildCorsOrigin(), credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'DashEnna API',
    version: '2.6.0',
    phase: '3.0 — Phase 1: incidents + equipment',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/equipment', equipmentRoutes);

const clientDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const index = path.join(clientDist, 'index.html');
  res.sendFile(index, (err) => {
    if (err) res.status(404).json({ error: 'Frontend not built yet. Run the React app separately in dev.' });
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`DashEnna API listening on http://localhost:${PORT}`);
  console.log('Default login: root / admin123 (must change password on first login)');
});
