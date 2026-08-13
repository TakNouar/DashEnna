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

const PORT = process.env.PORT || 4000;
load();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'DashEnna API',
    version: '2.1.0',
    phase: '2 — live stats + RBAC + traffic import',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);
app.use('/api/traffic', trafficRoutes);

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
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(PORT, () => {
  console.log(`DashEnna API listening on http://localhost:${PORT}`);
  console.log('Default login: root / admin123');
});
