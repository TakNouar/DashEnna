export default function Traffic() {
  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="l">Mouvements aérodromes 2025</div><div className="v">253 340</div><div className="d flat">Source: enna.dz</div></div>
        <div className="kpi"><div className="l">Survols 2025</div><div className="v">276 899</div><div className="d flat">Source: enna.dz</div></div>
        <div className="kpi"><div className="l">Incidents (démo mois)</div><div className="v">6</div><div className="d flat">0 majeur</div></div>
        <div className="kpi"><div className="l">Part survols</div><div className="v">~52%</div><div className="d flat">estim. 2025</div></div>
      </div>
      <div className="panel">
        <h3>Journal des incidents de sécurité</h3>
        <div className="sub">Exemples illustratifs — non issus de données opérationnelles réelles</div>
        <table className="status-table">
          <thead>
            <tr><th>Date</th><th>Site</th><th>Type</th><th>Gravité</th><th>Statut</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>04/08/2026</td><td>Alger (DAAG)</td><td>Perte de séparation</td>
              <td><span className="pill warn"><span className="dot" />Modéré</span></td><td>Clôturé</td>
            </tr>
            <tr>
              <td>29/07/2026</td><td>Hassi Messaoud (DAUH)</td><td>Incursion piste</td>
              <td><span className="pill crit"><span className="dot" />Majeur</span></td><td>En analyse</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="empty">Les graphiques de tendance détaillés restent illustratifs en attendant des flux opérationnels ENNA.</p>
    </>
  );
}
