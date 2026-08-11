/* 01-state.js
 * Local database (localStorage-backed) and session state. TEMPORARY: this whole file is what gets replaced by real API calls once the backend exists (see backend/ and docs/ROADMAP.md).
 */

// ==========================================
// 1. DATABASE & PERSISTENCE (LocalStorage Mock)
// ==========================================
let db = {
  accounts: JSON.parse(localStorage.getItem('enna_accounts')) || [
    { user: 'root', passHash: btoa('admin123'), role: 'root', lastPwdChange: '2026-01-01' },
    { user: 'DSA_Alger', passHash: btoa('alger123'), role: 'dsa', lastPwdChange: '2026-08-01' },
    { user: 'DSA_Oran', passHash: btoa('oran123'), role: 'dsa', lastPwdChange: '2026-08-01' },
    { user: 'DSA_Constantine', passHash: btoa('const123'), role: 'dsa', lastPwdChange: '2026-08-01' },
    { user: 'DSA_Sud', passHash: btoa('sud123'), role: 'dsa', lastPwdChange: '2026-08-01' }
  ],
  dailyLogs: JSON.parse(localStorage.getItem('enna_dailylogs')) || [
    { id: 1, date: '2026-08-10', time: '08:30', site: 'Alger (DAAG)', equip: 'PSR', status: 'ON', start: '00:00', end: '-', why: 'RAS', author: 'DSA_Alger' },
    { id: 2, date: '2026-08-10', time: '09:15', site: 'Oran (DAOO)', equip: 'ILS', status: 'Degradee', start: '09:00', end: '11:00', why: 'Maintenance balise glissée', author: 'DSA_Oran' }
  ],
  globals: JSON.parse(localStorage.getItem('enna_globals')) || { logo: '', flag: '' }
};

let currentUser = null;

function saveDb() {
  v5EnsurePermissions();
  localStorage.setItem('enna_accounts', JSON.stringify(db.accounts));
  localStorage.setItem('enna_dailylogs', JSON.stringify(db.dailyLogs));
  localStorage.setItem('enna_globals', JSON.stringify(db.globals));
}
