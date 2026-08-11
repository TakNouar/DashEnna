/* 10-map.js
 * Leaflet map of aerodromes: init, marker rendering, airport table, and airport selection/info panel.
 */

let dsaMapInstance = null;
function initDsaMap(){
  const el = document.getElementById('dsaMap');
  if (!el) return;
  if (dsaMapInstance) { dsaMapInstance.remove(); dsaMapInstance = null; }

  // Centered precisely on Algeria and adjacent countries
  dsaMapInstance = L.map('dsaMap').setView([28.0, 3.0], 5);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }).addTo(dsaMapInstance);

  let filteredAirports = airportsData;
  if(currentUser && currentUser.role !== 'root') {
    filteredAirports = airportsData.filter(apt => apt.dsa.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()) || currentUser.user.includes(apt.oaci));
  }

  filteredAirports.forEach(apt=>{
    const isH24 = apt.horaire === "H24";
    const marker = L.circleMarker([apt.lat, apt.lng], {
      radius: 7, 
      fillColor: isH24 ? "#000000" : "#FFFFFF", 
      color: '#FFFFFF', 
      weight: isH24 ? 2 : 1, 
      fillOpacity: 0.95
    }).addTo(dsaMapInstance);
    
    marker.bindTooltip(`<b>${apt.oaci}</b> - ${apt.name} (${apt.horaire})<br><i style="color:#FF7675;">${apt.dsa}</i>`);
    marker.on('click', ()=> selectAirport(apt.oaci));
  });
}

function renderAirportTable(){
  const tbody = document.getElementById("airportTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  let targetAirports = airportsData;
  if(currentUser && currentUser.role !== 'root') {
    targetAirports = airportsData.filter(apt => apt.dsa.toLowerCase().includes(currentUser.user.replace('DSA_', '').toLowerCase()) || currentUser.user.includes(apt.oaci));
  }

  targetAirports.forEach(apt=>{
    const tr = document.createElement("tr");
    tr.id = `row-${apt.oaci}`;
    tr.onclick = () => selectAirport(apt.oaci);
    const catBadge = apt.cat === "Cat A" ? "badge-cat-a" : (apt.cat === "Cat B" ? "badge-cat-b" : "badge-cat-c");
    const horBadge = apt.horaire === "H24" ? "badge-h24" : "badge-h12";
    tr.innerHTML = `
      <td><strong style="font-family:var(--font-mono); color:var(--cyan);">${apt.oaci}</strong></td>
      <td><strong>${apt.name}</strong></td>
      <td><span class="badge badge-dsa">${apt.dsa.split(' ')[1]}</span></td>
      <td><span class="badge ${catBadge}">${apt.cat}</span></td>
      <td><span class="badge ${horBadge}">${apt.horaire}</span></td>
      <td style="font-family:var(--font-mono);">${apt.traffic} mvmts/mois</td>
    `;
    tbody.appendChild(tr);
  });
}

function selectAirport(oaci){
  const apt = airportsData.find(a => a.oaci === oaci);
  if (!apt) return;
  document.querySelectorAll('.apt-table tr').forEach(r => r.classList.remove('selected'));
  const selectedRow = document.getElementById(`row-${oaci}`);
  if (selectedRow) selectedRow.classList.add('selected');

  document.getElementById("infoName").innerText = apt.name;
  document.getElementById("infoOaci").innerText = `Code OACI : ${apt.oaci}`;
  document.getElementById("infoDsa").innerText = apt.dsa;
  document.getElementById("infoCat").innerText = apt.cat;
  document.getElementById("infoPiste").innerText = apt.piste;
  document.getElementById("infoFreq").innerText = apt.freq;
  document.getElementById("infoNav").innerText = apt.nav;
  document.getElementById("infoFuel").innerText = apt.fuel;
  document.getElementById("infoTraffic").innerText = apt.traffic + " mvmts/mois";

  const badge = document.getElementById("infoBadgeHoraire");
  badge.innerText = apt.horaire;
  badge.className = `badge ${apt.horaire === 'H24' ? 'badge-h24' : 'badge-h12'}`;

  if (dsaMapInstance) dsaMapInstance.panTo([apt.lat, apt.lng]);
}
