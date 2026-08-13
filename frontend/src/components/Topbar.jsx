export default function Topbar({ user, onLogout, loading }) {
  const now = new Date();
  const period = now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const updated = now.toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-logo">✈</div>
        <div className="brand-text">
          <h1>ENNA — Établissement National de la Navigation Aérienne</h1>
          <p>Tableau de bord exécutif · Direction Générale</p>
        </div>
      </div>
      <div className="top-meta">
        <div className="stat">
          <div className="l">Période</div>
          <div className="v">{period} · YTD</div>
        </div>
        <div className="stat">
          <div className="l">Actualisé</div>
          <div className="v">{loading ? '…' : updated}</div>
        </div>
        <div className="role-badge">
          {user.role === 'root' ? 'ACCÈS ROOT' : `COMPTE : ${user.username}`}
        </div>
        <button type="button" className="logout-btn" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
