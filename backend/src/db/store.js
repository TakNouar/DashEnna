const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { AIRPORTS } = require('../data/airports');
const { computeCnsStats } = require('./cns');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const ALL_PAGES = [
  'overview', 'traffic', 'cns', 'finance', 'hr', 'map_dsa', 'daily_log', 'accounts',
];

const DEFAULT_TRAFFIC = [
  { month: '2025-09', label: 'Sep', movements: 19800 },
  { month: '2025-10', label: 'Oct', movements: 20100 },
  { month: '2025-11', label: 'Nov', movements: 21500 },
  { month: '2025-12', label: 'Dec', movements: 22000 },
  { month: '2026-01', label: 'Jan', movements: 23200 },
  { month: '2026-02', label: 'Fev', movements: 24100 },
  { month: '2026-03', label: 'Mar', movements: 24800 },
  { month: '2026-04', label: 'Avr', movements: 25500 },
  { month: '2026-05', label: 'Mai', movements: 26200 },
  { month: '2026-06', label: 'Juin', movements: 26800 },
  { month: '2026-07', label: 'Juil', movements: 27400 },
  { month: '2026-08', label: 'Aout', movements: 27940 },
];

function seedLogs() {
  return [
    { id: 1, date: '2026-08-10', time: '08:30', site: 'Alger (DAAG)', equip: 'PSR', status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Alger', created_at: '2026-08-10T08:30:00Z' },
    { id: 2, date: '2026-08-10', time: '09:15', site: 'Oran (DAOO)', equip: 'ILS', status: 'Degradee', start_time: '09:00', end_time: '11:00', why: 'Maintenance', author: 'DSA_Oran', created_at: '2026-08-10T09:15:00Z' },
    { id: 3, date: '2026-08-11', time: '07:00', site: 'Constantine (DABC)', equip: 'VOR', status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Constantine', created_at: '2026-08-11T07:00:00Z' },
    { id: 4, date: '2026-08-11', time: '14:20', site: 'Annaba (DABB)', equip: 'COM_VHF', status: 'OFF', start_time: '13:00', end_time: '16:00', why: 'Panne', author: 'DSA_Annaba', created_at: '2026-08-11T14:20:00Z' },
    { id: 5, date: '2026-08-12', time: '08:00', site: 'Hassi Messaoud (DAUH)', equip: 'SSR', status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Sud', created_at: '2026-08-12T08:00:00Z' },
    { id: 6, date: '2026-08-12', time: '10:00', site: 'Alger (DAAG)', equip: 'ILS', status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Alger', created_at: '2026-08-12T10:00:00Z' },
  ];
}

function defaultDb() {
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);
  const dsaPerms = { pages: ['overview', 'cns', 'map_dsa', 'daily_log'] };
  // Seeded accounts must change password on first login
  return {
    users: [
      { id: 1, username: 'root', password_hash: hash('admin123'), role: 'root', dsa_region: null, last_pwd_change: '2026-01-01', must_change_password: true, permissions: { pages: ALL_PAGES }, created_at: '2026-01-01' },
      { id: 2, username: 'DSA_Alger', password_hash: hash('alger123'), role: 'dsa', dsa_region: 'DSA Alger (Centre)', last_pwd_change: '2026-08-01', must_change_password: true, permissions: dsaPerms, created_at: '2026-08-01' },
      { id: 3, username: 'DSA_Oran', password_hash: hash('oran123'), role: 'dsa', dsa_region: 'DSA Oran (Ouest)', last_pwd_change: '2026-08-01', must_change_password: true, permissions: dsaPerms, created_at: '2026-08-01' },
      { id: 4, username: 'DSA_Constantine', password_hash: hash('const123'), role: 'dsa', dsa_region: 'DSA Constantine (Est)', last_pwd_change: '2026-08-01', must_change_password: true, permissions: dsaPerms, created_at: '2026-08-01' },
      { id: 5, username: 'DSA_Sud', password_hash: hash('sud123'), role: 'dsa', dsa_region: 'DSA Sud (Hassi-Messaoud)', last_pwd_change: '2026-08-01', must_change_password: true, permissions: dsaPerms, created_at: '2026-08-01' },
      { id: 6, username: 'DSA_Annaba', password_hash: hash('annaba123'), role: 'dsa', dsa_region: 'DSA Annaba (Est)', last_pwd_change: '2026-08-01', must_change_password: true, permissions: dsaPerms, created_at: '2026-08-01' },
    ],
    airports: AIRPORTS,
    daily_logs: seedLogs(),
    traffic_series: DEFAULT_TRAFFIC,
    nextUserId: 7,
    nextLogId: 7,
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    cache = defaultDb();
    save();
    console.log('[db] Created db.json (36 airports, traffic series, permissions)');
  } else {
    cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!cache.airports || cache.airports.length !== AIRPORTS.length) {
      cache.airports = AIRPORTS;
      save();
    }
    if (!cache.traffic_series || !cache.traffic_series.length) {
      cache.traffic_series = DEFAULT_TRAFFIC;
      save();
    }
    let touched = false;
    for (const u of cache.users || []) {
      if (u.role === 'root' && (!u.permissions || !u.permissions.pages)) {
        u.permissions = { pages: ALL_PAGES };
        touched = true;
      } else if (u.role === 'dsa' && (!u.permissions || !u.permissions.pages)) {
        u.permissions = { pages: ['overview', 'cns', 'map_dsa', 'daily_log'] };
        touched = true;
      }
      // Migrate: missing flag → true so seeded accounts are forced after this upgrade
      if (typeof u.must_change_password === 'undefined') {
        u.must_change_password = true;
        touched = true;
      }
    }
    if (touched) save();
  }
  return cache;
}

function save() {
  if (!cache) return;
  fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2));
}

function getDb() {
  return load();
}

module.exports = { getDb, save, load, computeCnsStats, ALL_PAGES, DEFAULT_TRAFFIC };
