/* 09-airports-data.js
 * Aerodrome reference data and the DSA network summary KPIs. NOTE: only 11 of the claimed 36 aerodromes are present -- see docs/KNOWN_ISSUES.md.
 */

let airportsData = [
  { oaci:"DAAG", name:"Alger - Houari Boumediene", dsa:"DSA Alger (Centre)", cat:"Cat A", horaire:"H24", piste:"09/27 — 3 500m", freq:"TWR 118.70", nav:"ILS Cat III", fuel:"JET A-1", traffic:"14 200", lat:36.6910, lng:3.2154 },
  { oaci:"DAOO", name:"Oran - Ahmed Ben Bella", dsa:"DSA Oran (Ouest)", cat:"Cat A", horaire:"H24", piste:"07L/25R — 3 060m", freq:"TWR 118.30", nav:"ILS Cat II", fuel:"JET A-1", traffic:"4 800", lat:35.6238, lng:-0.6211 },
  { oaci:"DABC", name:"Constantine - Mohamed Boudiaf", dsa:"DSA Constantine (Est)", cat:"Cat B", horaire:"H24", piste:"16/34 — 2 400m", freq:"TWR 118.10", nav:"ILS Cat I", fuel:"JET A-1", traffic:"3 100", lat:36.2761, lng:6.6204 },
  { oaci:"DABB", name:"Annaba - Rabah Bitat", dsa:"DSA Constantine (Est)", cat:"Cat B", horaire:"H24", piste:"17/35 — 2 900m", freq:"TWR 118.90", nav:"ILS Cat I", fuel:"JET A-1", traffic:"2 400", lat:36.8223, lng:7.8091 },
  { oaci:"DAUH", name:"Hassi Messaoud - Oued Irara", dsa:"DSA Sud (Ouargla)", cat:"Cat B", horaire:"H24", piste:"03/21 — 3 000m", freq:"TWR 118.50", nav:"ILS Cat I", fuel:"JET A-1", traffic:"3 600", lat:31.6730, lng:6.1404 },
  { oaci:"DAAT", name:"Tamanrasset - Aguenar", dsa:"DSA Sud (Tamanrasset)", cat:"Cat C", horaire:"H12", piste:"03/21 — 3 500m", freq:"TWR 118.10", nav:"VOR/DME", fuel:"JET A-1", traffic:"1 800", lat:22.8115, lng:5.4510 },
  { oaci:"DAOR", name:"Béchar - Boudghene", dsa:"DSA Oran (Béchar)", cat:"Cat C", horaire:"H12", piste:"03/21 — 3 000m", freq:"TWR 119.50", nav:"VOR/DME", fuel:"AVGAS", traffic:"1 300", lat:31.6453, lng:-2.2673 },
  { oaci:"DAAD", name:"Bou Saâda", dsa:"DSA Alger (Centre)", cat:"Cat C", horaire:"H12", piste:"13/31 — 2 200m", freq:"AFIS 122.5", nav:"VOR", fuel:"Sur demande", traffic:"400", lat:35.3330, lng:4.2500 },
  { oaci:"DAAE", name:"El Golea", dsa:"DSA Sud (Ouargla)", cat:"Cat B", horaire:"H24", piste:"09/27 — 3 000m", freq:"AFIS 122.1", nav:"VOR/DME", fuel:"JET A-1", traffic:"600", lat:30.5630, lng:2.8640 },
  { oaci:"DAAF", name:"Tébessa", dsa:"DSA Constantine (Est)", cat:"Cat C", horaire:"H12", piste:"11/29 — 3 000m", freq:"TWR 118.6", nav:"VOR", fuel:"JET A-1", traffic:"750", lat:35.4220, lng:8.1210 },
  { oaci:"DAAG", name:"Ghardaïa - Noumérat", dsa:"DSA Sud (Ouargla)", cat:"Cat B", horaire:"H24", piste:"08/26 — 3 600m", freq:"TWR 118.4", nav:"ILS Cat I", fuel:"JET A-1", traffic:"1 100", lat:32.3930, lng:3.7940 }
];

function renderDsaKpis(){
  const row = document.getElementById('dsaKpiRow');
  if (!row) return;
  const total = airportsData.length;
  const h24 = airportsData.filter(a=>a.horaire==='H24').length;
  const h12 = total - h24;
  row.innerHTML = `
    <div class="kpi"><span class="file-tag">Aerodromes.xlsx</span><div class="l">Aérodromes Total</div><div class="v">${total}</div><div class="d flat">Réseau National</div></div>
    <div class="kpi"><span class="file-tag">Aerodromes.xlsx</span><div class="l">Régime H24 (Noir/Blanc)</div><div class="v" style="color:var(--green);">${h24}</div><div class="d up">Service Continu</div></div>
    <div class="kpi"><span class="file-tag">Aerodromes.xlsx</span><div class="l">Régime H12 (Blanc)</div><div class="v" style="color:var(--amber);">${h12}</div><div class="d down">Service Diurne</div></div>
    <div class="kpi"><span class="file-tag">Aerodromes.xlsx</span><div class="l">CRR &amp; Centres</div><div class="v" style="color:#FF7675;">6</div><div class="d flat">Contrôle Régional</div></div>
  `;
}
