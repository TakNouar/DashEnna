/* 04-ui-controls.js
 * Small chrome controls: zoom, language switch, and tab activation/switching.
 */

// Zoom & Language handlers
let currentZoom = 1;
function adjustZoom(delta) {
  currentZoom = Math.max(0.8, Math.min(1.3, currentZoom + delta));
  document.body.style.zoom = currentZoom;
}

function changeLanguage(lang) {
  // Simple language switch framework hook
  console.log("Language switched to:", lang);
}

document.querySelector('.tabs').addEventListener('click', (e)=>{
  const t = e.target.closest('.tab');
  if (!t) return;
  activateTab(t.dataset.tab);
});

function activateTab(tabId){
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active', x.dataset.tab===tabId));
  document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active', x.id===tabId));

  if (tabId === 'map_dsa') {
    setTimeout(()=>{
      initDsaMap();
      renderAirportTable();
      renderDsaKpis();
      let targetAirports = airportsData;
      if(currentUser && currentUser.role !== 'root') {
        targetAirports = airportsData.filter(apt => apt.dsa.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()) || currentUser.user.includes(apt.oaci));
      }
      if (targetAirports[0]) selectAirport(targetAirports[0].oaci);
    }, 150);
  }
}
