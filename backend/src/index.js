const express = require('express');
const cors = require('cors');
const path = require('path');
const { load } = require('./db/store');

const authRoutes = require('./routes/auth');
const airportRoutes = require('./routes/airports');
const logRoutes = require('./routes/logs');
const userRoutes = require('./routes/users');

const PORT = process.env.PORT || 4000;

load();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'DashEnna API',
    version: '2.0.0',
    phase: '0+1 React/Express migration',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/users', userRoutes);

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
