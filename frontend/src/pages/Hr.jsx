export default function Hr() {
  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="l">Effectif permanent (publié)</div><div className="v">~3 309</div><div className="d flat">Source: enna.dz (historique)</div></div>
        <div className="kpi"><div className="l">Contrôleurs aériens</div><div className="v">~497</div><div className="d flat">Publié ENNA</div></div>
        <div className="kpi"><div className="l">SSLI</div><div className="v">~568</div><div className="d flat">Publié ENNA</div></div>
        <div className="kpi"><div className="l">Technique CNS/ATM</div><div className="v">~216</div><div className="d flat">Publié ENNA</div></div>
      </div>
      <div className="panel">
        <h3>Ressources humaines</h3>
        <p className="empty">
          Chiffres issus des pages publiques ENNA (effectif global et catégories techniques).
          Les indicateurs temps réel (absentéisme, licences) restent à brancher sur des sources internes.
        </p>
      </div>
    </>
  );
}
