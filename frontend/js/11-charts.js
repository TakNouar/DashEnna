/* 11-charts.js
 * Chart.js setup and all dashboard chart instances. NOTE: chart data is static/hardcoded, not wired to db/airportsData -- see docs/KNOWN_ISSUES.md.
 */

Chart.defaults.color = '#8CA0BE';
Chart.defaults.font.family = "'Inter',sans-serif";
Chart.defaults.borderColor = 'rgba(32,48,74,0.6)';
const cyan='#4FE0E8', amber='#F2A93B', green='#39D08C', red='#EF5A63', muted='#5D7191';
function grad(ctx,color){
  const g = ctx.createLinearGradient(0,0,0,220);
  g.addColorStop(0, color+'55'); g.addColorStop(1, color+'02');
  return g;
}

const months=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const charts = {};

function initCharts() {
  charts.chOverviewTraffic = new Chart(document.getElementById('chOverviewTraffic'), {
    type:'line',
    data:{labels:months.slice(0,8), datasets:[{data:[24800,23600,26100,27200,28900,30100,29400,27940], borderColor:cyan, backgroundColor:(c)=>grad(c.chart.ctx,cyan), fill:true, tension:.4, pointRadius:0, borderWidth:2}]},
    options:{plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(32,48,74,0.5)'}}}}
  });

  charts.chOverviewRevenue = new Chart(document.getElementById('chOverviewRevenue'), {
    type:'doughnut',
    data:{labels:['Survol','Atterrissage','Balisage','Autres'], datasets:[{data:[52,28,12,8], backgroundColor:[cyan,amber,green,muted], borderColor:'#111A2B', borderWidth:3}]},
    options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10, padding:14, font:{size:11}}}}, cutout:'68%'}
  });

  charts.chOverviewHR = new Chart(document.getElementById('chOverviewHR'), {
    type:'bar',
    data:{labels:['Contrôle','Tech. CNS','Admin','Support'], datasets:[{data:[612,1140,980,1110], backgroundColor:cyan, borderRadius:5, maxBarThickness:28}]},
    options:{indexAxis:'y', plugins:{legend:{display:false}}, scales:{x:{grid:{color:'rgba(32,48,74,0.5)'}}, y:{grid:{display:false}}}}
  });

  charts.chOverviewCNS = new Chart(document.getElementById('chOverviewCNS'), {
    type:'bar',
    data:{labels:['Radar','VOR/DME','ILS','COM VHF'], datasets:[{data:[99.1,98.4,97.6,99.5], backgroundColor:green, borderRadius:5, maxBarThickness:28}]},
    options:{plugins:{legend:{display:false}}, scales:{y:{min:90,max:100, grid:{color:'rgba(32,48,74,0.5)'}}, x:{grid:{display:false}}}}
  });

  charts.chTrafficTrend = new Chart(document.getElementById('chTrafficTrend'), {
    type:'line',
    data:{labels:months, datasets:[
      {label:'Mouvements', data:[24800,23600,26100,27200,28900,30100,29400,27940,29100,30500,31200,32800], borderColor:cyan, backgroundColor:(c)=>grad(c.chart.ctx,cyan), fill:true, tension:.4, pointRadius:0, borderWidth:2},
      {label:'Ponctualité %', data:[89,90,90.5,91,91.5,92,91.8,91.3,92,92.5,93,93.2], borderColor:amber, borderDash:[4,3], pointRadius:0, borderWidth:2, yAxisID:'y1'}
    ]},
    options:{interaction:{mode:'index',intersect:false}, plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}}, scales:{
      x:{grid:{display:false}}, y:{grid:{color:'rgba(32,48,74,0.5)'}}, y1:{position:'right', min:80,max:100, grid:{display:false}}
    }}
  });

  charts.chTrafficBySite = new Chart(document.getElementById('chTrafficBySite'), {
    type:'bar',
    data:{labels:['Alger','Oran','Constantine','Annaba','H.Messaoud','Tamanrasset','Béchar'], datasets:[{data:[9800,4200,3100,2400,3600,1800,1300], backgroundColor:cyan, borderRadius:5, maxBarThickness:30}]},
    options:{plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(32,48,74,0.5)'}}}}
  });

  charts.chFinanceTrend = new Chart(document.getElementById('chFinanceTrend'), {
    type:'bar',
    data:{labels:months, datasets:[
      {label:'Réalisé', data:[1420,1380,1510,1560,1600,1650,1590,1620,null,null,null,null], backgroundColor:cyan, borderRadius:4, maxBarThickness:22},
      {label:'Budget', data:[1400,1400,1450,1500,1550,1580,1580,1600,1620,1650,1700,1750], backgroundColor:'rgba(140,160,190,0.25)', borderRadius:4, maxBarThickness:22}
    ]},
    options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10,font:{size:11}}}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(32,48,74,0.5)'}}}}
  });

  charts.chFinanceMix = new Chart(document.getElementById('chFinanceMix'), {
    type:'pie',
    data:{labels:['Survol','Atterrissage','Balisage','Autres'], datasets:[{data:[52,28,12,8], backgroundColor:[cyan,amber,green,muted], borderColor:'#111A2B', borderWidth:3}]},
    options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}}}}}
  });

  charts.chHRCategory = new Chart(document.getElementById('chHRCategory'), {
    type:'doughnut',
    data:{labels:['Contrôleurs ATC','Techniciens CNS','Administratif','Support'], datasets:[{data:[612,1140,980,1110], backgroundColor:[cyan,amber,green,muted], borderColor:'#111A2B', borderWidth:3}]},
    options:{plugins:{legend:{position:'bottom', labels:{boxWidth:10, padding:14, font:{size:11}}}}, cutout:'62%'}
  });

  charts.chHRAge = new Chart(document.getElementById('chHRAge'), {
    type:'bar',
    data:{labels:['<25','25-34','35-44','45-54','55+'], datasets:[{data:[210,980,1240,980,432], backgroundColor:cyan, borderRadius:5, maxBarThickness:36}]},
    options:{plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}}, y:{grid:{color:'rgba(32,48,74,0.5)'}}}}
  });
}
