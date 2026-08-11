/* 03-data-sync.js
 * Cross-cutting refresh/save/import pipeline: re-renders every view after a data change, plus the Excel/CSV import handler.
 */

function v5RefreshDashboard(reason='auto'){
  if(!currentUser) return;
  v5EnsurePermissions();
  applyGlobalAssets();
  renderAccountsTable();
  renderDailyLogsTable();
  renderCnsConsolidatedTable();
  renderDsaKpis();
  const active=document.querySelector('.page.active')?.id;
  if(active==='map_dsa') renderAirportTable();
  if(typeof updateChartsFromData==='function') updateChartsFromData();
  const now=new Date();
  const stamp=now.toLocaleDateString('fr-FR')+' · '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  const lbl=document.getElementById('lblUpdated');
  const sync=document.getElementById('v5LastSync');
  if(lbl) lbl.innerText=stamp;
  if(sync) sync.innerText=stamp + ' · ' + reason;
  const state=document.getElementById('v5RefreshState');
  if(state) state.innerText='Synchronisé · auto-refresh 4 min';
}

function v5AfterDataChange(reason='entry'){
  saveDb();
  v5RefreshDashboard(reason);
}

function v5ImportExcel(){
  if(!v5Can('import')) return alert('Vous n’avez pas le droit d’importer des données.');
  const file=document.getElementById('v5ExcelFile')?.files?.[0];
  if(!file) return alert('Sélectionnez un fichier Excel ou CSV.');
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const summary=[];
      wb.SheetNames.forEach(sheetName=>{
        const rows=XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{defval:null});
        if(rows.length){
          db.importedData=db.importedData||{};
          db.importedData[sheetName]=rows;
          summary.push(`${sheetName}: ${rows.length} ligne(s)`);
          
          // If sheet corresponds to aerodromes config
          if(sheetName.toLowerCase().includes('aerodrome')) {
            // Map rows if compatible format provided
            rows.forEach(r => {
              const found = airportsData.find(a => a.oaci === r.OACI || a.oaci === r.oaci);
              if(found && r.Horaire) found.horaire = r.Horaire;
            });
          }
        }
      });
      db.lastExcelImport=new Date().toISOString();
      v5AfterDataChange('import Excel');
      alert('Import terminé.\n\n'+summary.join('\n'));
    }catch(err){
      console.error(err);
      alert('Erreur lors de la lecture du fichier : '+err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}
