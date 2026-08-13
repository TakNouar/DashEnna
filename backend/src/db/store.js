const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { AIRPORTS } = require('../data/airports');
const { computeCnsStats } = require('./cns');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const ALL_PAGES = [
  'overview', 'traffic', 'cns', 'finance', 'hr', 'map_dsa', 'daily_log',
  'incidents', 'equipment', 'accounts',
];

const DEFAULT_DSA_PAGES = [
  'overview', 'cns', 'map_dsa', 'daily_log', 'incidents', 'equipment',
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
    { id: 1, date: '2026-08-10', time: '08:30', site: 'Alger (DAAG)', equip: 'PSR Alger', equipment_id: 1, status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Alger', created_at: '2026-08-10T08:30:00Z' },
    { id: 2, date: '2026-08-10', time: '09:15', site: 'Oran (DAOO)', equip: 'ILS Oran', equipment_id: 3, status: 'Degradee', start_time: '09:00', end_time: '11:00', why: 'Maintenance', author: 'DSA_Oran', created_at: '2026-08-10T09:15:00Z' },
    { id: 3, date: '2026-08-11', time: '07:00', site: 'Constantine (DABC)', equip: 'VOR Constantine', equipment_id: 4, status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Constantine', created_at: '2026-08-11T07:00:00Z' },
    { id: 4, date: '2026-08-11', time: '14:20', site: 'Annaba (DABB)', equip: 'VHF Annaba', equipment_id: 5, status: 'OFF', start_time: '13:00', end_time: '16:00', why: 'Panne', author: 'DSA_Annaba', created_at: '2026-08-11T14:20:00Z' },
    { id: 5, date: '2026-08-12', time: '08:00', site: 'Hassi Messaoud (DAUH)', equip: 'SSR HMD', equipment_id: 6, status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Sud', created_at: '2026-08-12T08:00:00Z' },
    { id: 6, date: '2026-08-12', time: '10:00', site: 'Alger (DAAG)', equip: 'ILS Alger 09', equipment_id: 2, status: 'ON', start_time: '00:00', end_time: '-', why: 'RAS', author: 'DSA_Alger', created_at: '2026-08-12T10:00:00Z' },
  ];
}

function seedEquipment() {
  const now = new Date().toISOString();
  return [
    { id: 1, site: 'Alger (DAAG)', system_family: 'Radar', name: 'PSR Alger', manufacturer: 'Thales', model: 'STAR 2000', install_date: '2015-06-01', status: 'operational', responsible_service: 'CNS Alger', notes: '', created_at: now, updated_at: now },
    { id: 2, site: 'Alger (DAAG)', system_family: 'ILS', name: 'ILS Alger 09', manufacturer: 'Indra', model: 'NORMARC 7000', install_date: '2018-03-15', status: 'operational', responsible_service: 'CNS Alger', notes: '', created_at: now, updated_at: now },
    { id: 3, site: 'Oran (DAOO)', system_family: 'ILS', name: 'ILS Oran', manufacturer: 'Indra', model: 'NORMARC 7000', install_date: '2017-11-20', status: 'degraded', responsible_service: 'CNS Oran', notes: 'Maintenance en cours', created_at: now, updated_at: now },
    { id: 4, site: 'Constantine (DABC)', system_family: 'VOR-DME', name: 'VOR Constantine', manufacturer: 'Thales', model: 'DVOR 432', install_date: '2014-09-01', status: 'operational', responsible_service: 'CNS Est', notes: '', created_at: now, updated_at: now },
    { id: 5, site: 'Annaba (DABB)', system_family: 'VHF', name: 'VHF Annaba', manufacturer: 'Rohde & Schwarz', model: 'Series 4200', install_date: '2019-01-10', status: 'down', responsible_service: 'CNS Annaba', notes: 'Panne signalée', created_at: now, updated_at: now },
    { id: 6, site: 'Hassi Messaoud (DAUH)', system_family: 'Radar', name: 'SSR HMD', manufacturer: 'Thales', model: 'RSM 970S', install_date: '2016-05-22', status: 'operational', responsible_service: 'CNS Sud', notes: '', created_at: now, updated_at: now },
  ];
}

function defaultDb() {
  const hash = (pwd) => bcrypt.hashSync(pwd, 10);
  const dsaPerms = { pages: DEFAULT_DSA_PAGES };
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
    incidents: [],
    equipment: seedEquipment(),
    nextUserId: 7,
    nextLogId: 7,
    nextIncidentId: 1,
    nextEquipmentId: 7,
  };
}

let cache = null;

function ensureCollections(db) {
  let touched = false;
  if (!Array.isArray(db.incidents)) { db.incidents = []; touched = true; }
  if (!Array.isArray(db.equipment)) { db.equipment = seedEquipment(); touched = true; }
  if (!db.nextIncidentId) { db.nextIncidentId = (db.incidents.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1); touched = true; }
  if (!db.nextEquipmentId) { db.nextEquipmentId = (db.equipment.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1); touched = true; }
  return touched;
}

function load() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    cache = defaultDb();
    save();
    console.log('[db] Created db.json (36 airports, equipment, incidents empty)');
  } else {
    cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!cache.airports || cache.airports.length !== AIRPORTS.length) {
      cache.airports = AIRPORTS;
    }
    if (!cache.traffic_series || !cache.traffic_series.length) {
      cache.traffic_series = DEFAULT_TRAFFIC;
    }
    ensureCollections(cache);
    let touched = false;
    for (const u of cache.users || []) {
      if (u.role === 'root' && (!u.permissions || !u.permissions.pages)) {
        u.permissions = { pages: ALL_PAGES };
        touched = true;
      } else if (u.role === 'dsa') {
        if (!u.permissions || !u.permissions.pages) {
          u.permissions = { pages: DEFAULT_DSA_PAGES };
          touched = true;
        } else {
          const pages = new Set(u.permissions.pages);
          let added = false;
          for (const p of ['incidents', 'equipment']) {
            if (!pages.has(p)) { pages.add(p); added = true; }
          }
          if (added) {
            u.permissions.pages = [...pages];
            touched = true;
          }
        }
      }
      if (typeof u.must_change_password === 'undefined') {
        u.must_change_password = true;
        touched = true;
      }
    }
    save();
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

module.exports = {
  getDb, save, load, computeCnsStats, ALL_PAGES, DEFAULT_TRAFFIC, DEFAULT_DSA_PAGES,
};
