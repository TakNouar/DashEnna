export default function Cns({ logs, cnsStats }) {
  const gauges = cnsStats?.gauges || [
    { label: 'Radar', val: null },
    { label: 'VOR/DME', val: null },
    { label: 'ILS', val: null },
    { label: 'VHF', val: null },
  ];

  const color = (val) => {
    if (val == null) return 'var(--muted)';
    if (val >= 99) return 'var(--green)';
    if (val >= 90) return 'var(--cyan)';
    if (val >= 50) return 'var(--amber)';
    return 'var(--red)';
  };

  return (
    <>
      <div className="kpi-row">
        {gauges.map((g) => (
          <div className="kpi" key={g.label}>
            <div className="l">{g.label}</div>
            <div className="v" style={{ color: color(g.val) }}>
              {g.val != null ? `${g.val}%` : '—'}
            </div>
            <div className="d flat">
              {g.sample
                ? `${g.sample} rapport(s) · source: logs DSA`
                : 'Pas encore de log pour cette famille'}
            </div>
          </div>
        ))}
        {cnsStats?.overall != null && (
          <div className="kpi">
            <div className="l">Disponibilité globale CNS</div>
            <div className="v" style={{ color: color(cnsStats.overall) }}>{cnsStats.overall}%</div>
            <div className="d flat">{cnsStats.total_reports} rapports au total</div>
          </div>
        )}
      </div>
      <div className="panel">
        <h3>Derniers rapports équipements (DSA)</h3>
        <div className="sub">
          Les % ci-dessus sont calculés à partir du dernier statut connu par site+équipement
          (ON=100%, Dégradé=50%, OFF=0%).
        </div>
        <table className="status-table">
          <thead>
            <tr>
              <th>Date</th><th>Site</th><th>Équipement</th><th>Statut</th><th>Motif</th><th>Auteur</th>
            </tr>
          </thead>
          <tbody>
            {(logs || []).slice(0, 20).map((l) => (
              <tr key={l.id}>
                <td>{l.date} {l.time}</td>
                <td>{l.site}</td>
                <td>{l.equip}</td>
                <td>
                  <span className={`pill ${l.status === 'ON' ? 'ok' : l.status === 'OFF' ? 'crit' : 'warn'}`}>
                    <span className="dot" />{l.status}
                  </span>
                </td>
                <td>{l.why || '—'}</td>
                <td>{l.author}</td>
              </tr>
            ))}
            {!logs?.length && (
              <tr><td colSpan={6} className="empty">Aucun rapport — saisissez-en dans Rapport Quotidien DSA</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
