const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { AIRPORTS } = require('../data/airports');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function defaultDb() {
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);
  return {
    users: [
      { id: 1, username: 'root', password_hash: hash('admin123'), role: 'root', dsa_region: null, last_pwd_change: '2026-01-01', permissions: null, created_at: '2026-01-01' },
      { id: 2, username: 'DSA_Alger', password_hash: hash('alger123'), role: 'dsa', dsa_region: 'DSA Alger (Centre)', last_pwd_change: '2026-08-01', permissions: null, created_at: '2026-08-01' },
      { id: 3, username: 'DSA_Oran', password_hash: hash('oran123'), role: 'dsa', dsa_region: 'DSA Oran (Ouest)', last_pwd_change: '2026-08-01', permissions: null, created_at: '2026-08-01' },
      { id: 4, username: 'DSA_Constantine', password_hash: hash('const123'), role: 'dsa', dsa_region: 'DSA Constantine (Est)', last_pwd_change: '2026-08-01', permissions: null, created_at: '2026-08-01' },
      { id: 5, username: 'DSA_Sud', password_hash: hash('sud123'), role: 'dsa', dsa_region: 'DSA Sud (Hassi-Messaoud)', last_pwd_change: '2026-08-01', permissions: null, created_at: '2026-08-01' },
      { id: 6, username: 'DSA_Annaba', password_hash: hash('annaba123'), role: 'dsa', dsa_region: 'DSA Annaba (Est)', last_pwd_change: '2026-08-01', permissions: null, created_at: '2026-08-01' },
    ],
    airports: AIRPORTS,
    daily_logs: [
      { id: 1, date: '2026-08-10', time: '08:30', site: 'Alger (DAAG)', equip: 'PSR', status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Alger', created_at: '2026-08-10T08:30:00Z' },
      { id: 2, date: '2026-08-10', time: '09:15', site: 'Oran (DAOO)', equip: 'ILS', status: 'Degradee', start_time: '09:00', end_time: '11:00', why: 'Maintenance balise', author: 'DSA_Oran', created_at: '2026-08-10T09:15:00Z' },
    ],
    nextUserId: 7,
    nextLogId: 3,
  };
}

let cache = null;

function load() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    cache = defaultDb();
    save();
    console.log('[db] Created db.json with 36 airports + seed users');
  } else {
    cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!cache.airports || cache.airports.length !== AIRPORTS.length) {
      cache.airports = AIRPORTS;
      save();
    }
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

module.exports = { getDb, save, load };
