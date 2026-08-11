/* 06-accounts.js
 * Root-only account management: create/delete DSA accounts, render the accounts table.
 */

function handleCreateAccount(event) {
  if(!v5Can('configure','accounts')) return alert('Accès configuration réservé au root.');
  event.preventDefault();
  const u = document.getElementById('newAccUser').value.trim();
  const p = document.getElementById('newAccPass').value.trim();
  const r = document.getElementById('newAccRole').value;

  if (db.accounts.some(a => a.user === u)) {
    alert("Cet identifiant existe déjà.");
    return;
  }

  db.accounts.push({ user: u, passHash: btoa(p), role: r, lastPwdChange: new Date().toISOString().split('T')[0] });
  v5AfterDataChange('création compte');
  alert(`Compte ${u} créé avec succès.`);
  document.getElementById('newAccUser').value = '';
  document.getElementById('newAccPass').value = '';
  renderAccountsTable();
}

function handleDeleteAccount(user) {
  if(!v5Can('delete','accounts')) return alert('Vous n’avez pas le droit de supprimer un compte.');
  if (user === 'root') { alert("Impossible de supprimer le compte root."); return; }
  if (!confirm(`Supprimer le compte ${user} ?`)) return;
  db.accounts = db.accounts.filter(a => a.user !== user);
  v5AfterDataChange('suppression compte');
  renderAccountsTable();
}

function renderAccountsTable() {
  const tbody = document.getElementById('accountsTableBody');
  if (!tbody) return;
  tbody.innerHTML = db.accounts.map(a => `
    <tr>
      <td><strong>${a.user}</strong></td>
      <td><span class="badge ${a.role === 'root' ? 'badge-cat-a' : 'badge-dsa'}">${a.role.toUpperCase()}</span></td>
      <td style="font-family:var(--font-mono);">${a.lastPwdChange}</td>
      <td>${a.user !== 'root' && (currentUser.role === 'root') ? `<button class="tbl-btn del" onclick="handleDeleteAccount('${a.user}')">Supprimer</button>` : 'Protégé'}</td>
    </tr>
  `).join('');
}
