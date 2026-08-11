/* 07-global-assets.js
 * Org branding assets (logo, flag) upload and apply.
 */

function handleGlobalAssetUpload(type, event) {
  if(!v5Can('configure','accounts')) return alert('Accès configuration réservé au root.');
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    if (type === 'logo') {
      db.globals.logo = e.target.result;
    } else {
      db.globals.flag = e.target.result;
    }
    v5AfterDataChange('paramètre global');
    applyGlobalAssets();
    alert("Paramètre global mis à jour avec succès !");
  };
  reader.readAsDataURL(file);
}

function applyGlobalAssets() {
  const logoBox = document.getElementById('logoBox');
  if (db.globals.logo) {
    logoBox.innerHTML = `<img src="${db.globals.logo}" alt="ENNA-LOGO">`;
  }
  const flagBox = document.getElementById('flagBox');
  if (db.globals.flag) {
    flagBox.innerHTML = `<img src="${db.globals.flag}" alt="dz-flag">`;
  }
}
