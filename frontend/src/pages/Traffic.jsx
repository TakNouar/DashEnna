import { useState } from 'react';
import { api } from '../api';

export default function Traffic({ traffic, user, onChange }) {
  const [csv, setCsv] = useState('month,label,movements\n2025-09,Sep,19800\n2025-10,Oct,20100\n');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const series = traffic?.series || [];
  const public2025 = traffic?.public_2025 || { movements: 253340, overflights: 276899 };

  const importCsv = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api('/traffic/import', { method: 'POST', body: JSON.stringify({ csv }) });
      setMsg(`Import OK — ${res.count} mois`);
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <>
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Mouvements aérodromes 2025 (officiel)</div>
          <div className="v">{public2025.movements.toLocaleString('fr-FR')}</div>
          <div className="d flat">Source: enna.dz</div>
        </div>
        <div className="kpi">
          <div className="l">Survols 2025 (officiel)</div>
          <div className="v">{public2025.overflights.toLocaleString('fr-FR')}</div>
          <div className="d flat">Source: enna.dz</div>
        </div>
        <div className="kpi">
          <div className="l">Somme série mensuelle (DB)</div>
          <div className="v">{(traffic?.total || 0).toLocaleString('fr-FR')}</div>
          <div className="d flat">Modifiable via import CSV</div>
        </div>
      </div>

      <div className="panel">
        <h3>Série mensuelle (graphique Vue d'ensemble)</h3>
        <div className="sub">Données serveur — import CSV réservé à root</div>
        <table className="status-table">
          <thead>
            <tr><th>Mois</th><th>Label</th><th>Mouvements</th></tr>
          </thead>
          <tbody>
            {series.map((r) => (
              <tr key={r.month}>
                <td>{r.month}</td>
                <td>{r.label}</td>
                <td>{Number(r.movements).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
            {!series.length && <tr><td colSpan={3} className="empty">Aucune série</td></tr>}
          </tbody>
        </table>
      </div>

      {user?.role === 'root' && (
        <div className="panel">
          <h3>Import CSV (root)</h3>
          <div className="sub">Format: month,label,movements</div>
          <form onSubmit={importCsv}>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={8}
              style={{
                width: '100%', fontFamily: 'var(--mono)', fontSize: '0.8rem',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 12, color: 'var(--text)',
              }}
            />
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button type="submit" className="action-btn">Importer / remplacer la série</button>
            </div>
            {msg && <p style={{ color: 'var(--green)', marginTop: 8 }}>{msg}</p>}
            {err && <p style={{ color: 'var(--red)', marginTop: 8 }}>{err}</p>}
          </form>
        </div>
      )}
    </>
  );
}
