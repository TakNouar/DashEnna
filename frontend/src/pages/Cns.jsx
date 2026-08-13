export default function Cns({ logs }) {
  const gauges = [
    { label: 'Radar de surveillance', val: 99.1 },
    { label: 'VOR / DME', val: 98.4 },
    { label: 'ILS / DME', val: 97.6 },
    { label: 'Communication VHF', val: 99.5 },
  ];

  return (
    <>
      <div className="kpi-row">
        {gauges.map((g) => (
          <div className="kpi" key={g.label}>
            <div className="l">{g.label}</div>
            <div className="v" style={{ color: g.val >= 99 ? 'var(--green)' : 'var(--cyan)' }}>{g.val}%</div>
            <div className="d flat">Illustratif réseau</div>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Derniers rapports équipements (DSA)</h3>
        <div className="sub">Issus de la base serveur (rapports quotidiens)</div>
        <table className="status-table">
          <thead>
            <tr><th>Date</th><th>Site</th><th>Équipement</th><th>Statut</th><th>Motif</th><th>Auteur</th></tr>
          </thead>
          <tbody>
            {(logs || []).slice(0, 15).map((l) => (
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
            {!logs?.length && <tr><td colSpan={6} className="empty">Aucun rapport</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
