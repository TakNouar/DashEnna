/* 08-daily-logs.js
 * DSA daily equipment/status log entries: form submit, delete, render, and the per-site CNS availability calculation.
 */

function populateSiteDropdowns() {
  const sel = document.getElementById('logSite');
  if (!sel) return;
  let filteredAirports = airportsData;
  if(currentUser && currentUser.role !== 'root') {
    // Filter airports corresponding to user DSA if applicable
    filteredAirports = airportsData.filter(a => a.dsa.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()) || currentUser.user.includes(a.oaci));
    if(filteredAirports.length === 0) filteredAirports = airportsData; // fallback
  }
  sel.innerHTML = filteredAirports.map(a => `<option value="${a.name} (${a.oaci})">${a.name} (${a.oaci})</option>`).join('');
}

function handleDailyLogSubmit(event) {
  event.preventDefault();
  const date = document.getElementById('logDate').value;
  const time = document.getElementById('logTime').value;
  const site = document.getElementById('logSite').value;
  const equip = document.getElementById('logEquip').value;
  const status = document.getElementById('logStatus').value;
  const start = document.getElementById('logStart').value || '-';
  const end = document.getElementById('logEnd').value || '-';
  const why = document.getElementById('logWhy').value || 'RAS';

  const newLog = {
    id: Date.now(),
    date, time, site, equip, status, start, end, why,
    author: currentUser.user
  };

  db.dailyLogs.unshift(newLog);
  v5AfterDataChange('nouvelle entrée');
  renderDailyLogsTable();
  renderCnsConsolidatedTable();
  alert("Rapport journalier enregistré dans database/ avec succès !");
  document.getElementById('logWhy').value = '';
}

function handleDeleteLog(id) {
  const log = db.dailyLogs.find(l => l.id === id);
  if (!log) return;
  const todayStr = new Date().toISOString().split('T')[0];
  
  if (currentUser.role !== 'root' && log.date !== todayStr) {
    alert("Modification/Suppression refusée : Vous ne pouvez modifier ou supprimer des rapports qu'uniquement sur le jour même.");
    return;
  }
  if (!confirm("Voulez-vous supprimer ce rapport ?")) return;

  db.dailyLogs = db.dailyLogs.filter(l => l.id !== id);
  saveDb();
  renderDailyLogsTable();
  renderCnsConsolidatedTable();
}

function renderDailyLogsTable() {
  const tbody = document.getElementById('dailyLogsTableBody');
  if (!tbody) return;
  let logs = db.dailyLogs;
  if(currentUser && currentUser.role !== 'root') {
    logs = logs.filter(l => l.author === currentUser.user || l.site.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()));
  }
  tbody.innerHTML = logs.map(l => {
    const statusClass = l.status === 'ON' ? 'status-on' : (l.status === 'OFF' ? 'status-off' : 'status-deg');
    return `
      <tr>
        <td style="font-family:var(--font-mono);">${l.date} · ${l.time}</td>
        <td><strong>${l.site}</strong></td>
        <td><span class="badge badge-dsa">${l.equip}</span></td>
        <td><span class="${statusClass}">${l.status}</span></td>
        <td style="font-family:var(--font-mono);">${l.start} → ${l.end}</td>
        <td>${l.why}</td>
        <td style="font-size:11px; color:var(--muted);">${l.author}</td>
        <td><button class="tbl-btn del" onclick="handleDeleteLog(${l.id})">Supprimer</button></td>
      </tr>
    `;
  }).join('');
}

function calculateSiteAvailability(siteOaci, totalEquips = 5) {
  const equipTypes = ['PSR', 'SSR', 'ADS-B', 'ILS', 'COM_VHF'];
  let failedCount = 0;

  equipTypes.forEach(eq => {
    const log = db.dailyLogs.find(l => l.site.includes(siteOaci) && l.equip === eq);
    if (log && log.status === 'OFF') {
      failedCount++;
    }
  });

  const availability = ((totalEquips - failedCount) / totalEquips) * 100;
  return availability.toFixed(1) + '%';
}

function renderCnsConsolidatedTable() {
  const tbody = document.getElementById('tbDsaSitesDynamic');
  if (!tbody) return;
  
  let targetAirports = airportsData;
  if(currentUser && currentUser.role !== 'root') {
    targetAirports = airportsData.filter(apt => apt.dsa.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()) || currentUser.user.includes(apt.oaci));
  }
  
  tbody.innerHTML = targetAirports.map(apt => {
    const getStatusBadge = (equipName) => {
      const log = db.dailyLogs.find(l => l.site.includes(apt.oaci) && l.equip === equipName);
      if (!log || log.status === 'ON') return '<span class="pill ok"><span class="dot"></span>Opérationnel</span>';
      if (log.status === 'OFF') return '<span class="pill crit"><span class="dot"></span>Panne</span>';
      return '<span class="pill warn"><span class="dot"></span>Dégradé</span>';
    };

    const computedAvail = calculateSiteAvailability(apt.oaci);
    const isLow = parseFloat(computedAvail) < 90;

    return `
      <tr>
        <td><strong>${apt.name} (${apt.oaci})</strong></td>
        <td>${getStatusBadge('PSR')}</td>
        <td>${getStatusBadge('SSR')}</td>
        <td>${getStatusBadge('ADS-B')}</td>
        <td>${getStatusBadge('ILS')}</td>
        <td>${getStatusBadge('COM_VHF')}</td>
        <td style="font-family:var(--font-mono); color:${isLow ? 'var(--red)' : 'var(--cyan)'};">${computedAvail}</td>
      </tr>
    `;
  }).join('');
}
