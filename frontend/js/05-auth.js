/* 05-auth.js
 * Login, logout, dashboard bootstrap on login, and password change. NOTE: auth here is Base64 obfuscation, not real security -- see docs/KNOWN_ISSUES.md.
 */

function handleLogin(event) {
  event.preventDefault();
  const u = document.getElementById('loginUser').value.trim();
  const p = document.getElementById('loginPass').value.trim();
  const err = document.getElementById('loginError');

  const found = db.accounts.find(acc => acc.user === u && atob(acc.passHash) === p);
  if (found) {
    currentUser = found;
    initDashboard();
    v5RefreshDashboard('connexion');
  } else {
    err.style.display = 'block';
  }
}

function handleLogout() {
  currentUser = null;
  document.getElementById('appMain').style.display = 'none';
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginError').style.display = 'none';
}

function initDashboard() {
  document.getElementById('loginOverlay').style.display = 'none';
  document.getElementById('appMain').style.display = 'block';

  const isRoot = currentUser.role === 'root';
  document.getElementById('lblRoleBadge').innerText = isRoot ? 'ACCÈS ROOT' : `COMPTE : ${currentUser.user}`;
  document.getElementById('rootAccountManager').style.display = isRoot ? 'block' : 'none';

  v5EnsurePermissions();
  applyGlobalAssets();
  renderAccountsTable();
  renderDailyLogsTable();
  renderCnsConsolidatedTable();
  populateSiteDropdowns();
  v5PopulatePermissionUsers();
  v5ApplyPagePermissions();
  
  // Set default date & time on daily log form
  const today = new Date();
  document.getElementById('logDate').value = today.toISOString().split('T')[0];
  document.getElementById('logTime').value = today.toTimeString().split(' ')[0].substring(0,5);

  initCharts();
  initDsaMap();
  renderAirportTable();
  renderDsaKpis();
}

// Password Change with 1-month rule for users, anytime for root
function handleChangePassword(event) {
  event.preventDefault();
  const oldP = document.getElementById('pwdOld').value;
  const newP = document.getElementById('pwdNew').value;

  if (atob(currentUser.passHash) !== oldP) {
    alert("Ancien mot de passe incorrect.");
    return;
  }

  if (currentUser.role !== 'root') {
    const lastChange = new Date(currentUser.lastPwdChange || '2026-01-01');
    const now = new Date();
    const diffTime = Math.abs(now - lastChange);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      alert(`Modification refusée : Vous ne pouvez modifier votre mot de passe qu'une fois par mois (${30 - diffDays} jours restants).`);
      return;
    }
  }

  currentUser.passHash = btoa(newP);
  currentUser.lastPwdChange = new Date().toISOString().split('T')[0];
  
  const idx = db.accounts.findIndex(a => a.user === currentUser.user);
  if (idx !== -1) db.accounts[idx] = currentUser;
  v5AfterDataChange('mot de passe');

  alert("Mot de passe mis à jour et enregistré dans user/accounts avec succès !");
  document.getElementById('pwdOld').value = '';
  document.getElementById('pwdNew').value = '';
  renderAccountsTable();
}
