export default function Finance() {
  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="l">CA réalisé (YTD)</div><div className="v">—</div><div className="d flat">Données internes</div></div>
        <div className="kpi"><div className="l">CA vs budget</div><div className="v">—</div><div className="d flat">À connecter</div></div>
        <div className="kpi"><div className="l">Charges</div><div className="v">—</div><div className="d flat">À connecter</div></div>
        <div className="kpi"><div className="l">Résultat net</div><div className="v">—</div><div className="d flat">À connecter</div></div>
      </div>
      <div className="panel">
        <h3>Finances</h3>
        <p className="empty">
          Les indicateurs financiers opérationnels ne sont pas publics.
          Cette page est prête à recevoir des données via l'API une fois les sources ENNA branchées.
        </p>
      </div>
    </>
  );
}
