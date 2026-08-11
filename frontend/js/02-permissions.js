/* 02-permissions.js
 * Role/page/action permission model (V5 layer): defaults, validation, the permission-matrix UI, and saving.
 */

const V5_PAGES = [
  ['overview','Vue d’ensemble'],
  ['traffic','Trafic & Sécurité'],
  ['cns','CNS & Disponibilité'],
  ['finance','Finances'],
  ['hr','RH & Effectifs'],
  ['map_dsa','Cartes DSA & Aérodromes'],
  ['daily_log','Rapport Quotidien DSA'],
  ['accounts','Gestion des Comptes & Configuration']
];
const V5_ACTIONS = [
  ['view','Voir'],
  ['add','Ajouter'],
  ['edit','Modifier'],
  ['delete','Supprimer'],
  ['import','Importer Excel'],
  ['export','Exporter'],
  ['configure','Configurer']
];

function v5DefaultPermissions(role){
  const pages = Object.fromEntries(V5_PAGES.map(([id])=>[id,true]));
  const actions = Object.fromEntries(V5_ACTIONS.map(([id])=>[id, role==='root']));
  if(role !== 'root'){
    actions.view = true; actions.add = true; actions.edit = true;
    actions.delete = false; actions.import = true; actions.export = true; actions.configure = false;
    pages.accounts = false;
  }
  return {pages, actions};
}

function v5EnsurePermissions(){
  db.accounts.forEach(a=>{
    if(!a.permissions) a.permissions = v5DefaultPermissions(a.role);
    if(!a.permissions.pages) a.permissions.pages = {};
    if(!a.permissions.actions) a.permissions.actions = {};
    V5_PAGES.forEach(([id])=>{
      if(typeof a.permissions.pages[id] !== 'boolean') a.permissions.pages[id] = v5DefaultPermissions(a.role).pages[id];
    });
    V5_ACTIONS.forEach(([id])=>{
      if(typeof a.permissions.actions[id] !== 'boolean') a.permissions.actions[id] = v5DefaultPermissions(a.role).actions[id];
    });
    if(a.role==='root'){
      V5_PAGES.forEach(([id])=>a.permissions.pages[id]=true);
      V5_ACTIONS.forEach(([id])=>a.permissions.actions[id]=true);
    }
  });
}

function v5Can(action, page){
  if(!currentUser) return false;
  if(currentUser.role==='root') return true;
  if(page && currentUser.permissions?.pages?.[page]===false) return false;
  return currentUser.permissions?.actions?.[action] === true;
}

function v5ApplyPagePermissions(){
  if(!currentUser) return;
  document.querySelectorAll('.tab[data-tab]').forEach(tab=>{
    const id=tab.dataset.tab;
    const allowed=currentUser.role==='root' || currentUser.permissions?.pages?.[id] !== false;
    tab.style.display=allowed?'':'none';
  });
  document.querySelectorAll('.page[id]').forEach(page=>{
    const allowed=currentUser.role==='root' || currentUser.permissions?.pages?.[page.id] !== false;
    page.dataset.permissionDenied=allowed?'false':'true';
    if(!allowed && page.classList.contains('active')){
      const first=document.querySelector('.tab[data-tab]:not([style*="display: none"])');
      if(first) first.click();
    }
  });
  const configAllowed=currentUser.role==='root';
  const pm=document.getElementById('v5PermissionManager');
  if(pm) pm.style.display=configAllowed?'':'none';
  const dm=document.getElementById('v5DataManager');
  if(dm) dm.style.display=(configAllowed || v5Can('import'))?'':'none';
}

function v5BuildPermissionMatrix(){
  const host=document.getElementById('v5PermissionMatrix');
  if(!host) return;
  const user=document.getElementById('v5PermUser')?.value;
  const acc=db.accounts.find(a=>a.user===user);
  if(!acc){host.innerHTML='';return;}
  const p=acc.permissions || v5DefaultPermissions(acc.role);
  host.innerHTML=`
    <table class="v5-perm-table">
      <thead><tr><th>Page / Fonction</th>${V5_ACTIONS.map(([id,n])=>`<th>${n}</th>`).join('')}</tr></thead>
      <tbody>
        ${V5_PAGES.map(([pid,name])=>`
          <tr>
            <td><strong>${name}</strong></td>
            ${V5_ACTIONS.map(([aid])=>`
              <td><input class="v5-check" type="checkbox" data-page="${pid}" data-action="${aid}"
                ${(p.actions?.[aid] && p.pages?.[pid])?'checked':''}
                ${pid==='accounts' && acc.role!=='root' && aid==='configure'?'disabled':''}></td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function v5RenderPermissionMatrix(){
  v5BuildPermissionMatrix();
}

function v5PopulatePermissionUsers(){
  const sel=document.getElementById('v5PermUser');
  if(!sel) return;
  const nonRoot=db.accounts.filter(a=>a.user!=='root');
  sel.innerHTML=nonRoot.map(a=>`<option value="${a.user}">${a.user} — ${a.role}</option>`).join('');
  if(nonRoot.length) v5BuildPermissionMatrix();
}

function v5SavePermissions(){
  if(!currentUser || currentUser.role!=='root') return alert('Accès root requis.');
  const user=document.getElementById('v5PermUser')?.value;
  const acc=db.accounts.find(a=>a.user===user);
  if(!acc) return;
  const permissions=v5DefaultPermissions(acc.role);
  document.querySelectorAll('#v5PermissionMatrix input[data-page]').forEach(ch=>{
    const page=ch.dataset.page, action=ch.dataset.action;
    if(!permissions.pages[page]) permissions.pages[page]=false;
    permissions.pages[page] = permissions.pages[page] || ch.checked;
    permissions.actions[action] = permissions.actions[action] || ch.checked;
  });
  V5_PAGES.forEach(([pid])=>{
    const viewBox=document.querySelector(`#v5PermissionMatrix input[data-page="${pid}"][data-action="view"]`);
    if(viewBox) permissions.pages[pid]=viewBox.checked;
  });
  permissions.pages.accounts = false;
  acc.permissions=permissions;
  saveDb();
  v5EnsurePermissions();
  v5PopulatePermissionUsers();
  alert(`Droits de ${acc.user} enregistrés.`);
  if(currentUser.user===acc.user) v5ApplyPagePermissions();
  v5RefreshDashboard('permissions');
}

// Run once on load so every existing account has a valid permissions object
v5EnsurePermissions();
