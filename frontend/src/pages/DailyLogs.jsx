import { useState } from 'react';
import { api } from '../api';

const EQUIP = [
  'PSR', 'SSR', 'ADS-B', 'ILS', 'DME', 'VOR',
  'Energy_Balisage', 'COM_VHF', 'Personnel', 'Exploitation_Flights', 'Projets_SSLI',
];

export default function DailyLogs({ logs, airports, user, onChange }) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);
  const [form, setForm] = useState({
    date: today,
    time: now,
    site: airports[0] ? `${airports[0].name.split('-')[0].trim()} (${airports[0].oaci})` : '',
    equip: 'PSR',
    status: 'ON',
    start_time: '',
    end_time: '',
    why: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api('/logs', { method: 'POST', body: JSON.stringify(form) });
      setMsg('Rapport enregistre');
      setForm((f) => ({ ...f, why: '', start_time: '', end_time: '' }));
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce rapport ?')) return;
    try {
      await api(`/logs/${id}`, { method: 'DELETE' });
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const statusPill = (s) => {
    if (s === 'ON') return <span className="pill ok"><span className="dot" />ON</span>;
    if (s === 'OFF') return <span className="pill crit"><span className="dot" />OFF</span>;
    return <span className="pill warn"><span className="dot" />Degrade</span>;
  };

  return (
    <div className="panel">
      <h3>Rapport Quotidien & Evenements - DSA / Site</h3>
      <div className="sub">Saisie par les responsables DSA. Suppression le jour meme (sauf root).</div>

      <div className="admin-card">
        <h4>Ajouter un rapport</h4>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Heure</label>
              <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Site</label>
              <select value={form.site} onChange={(e) => set('site', e.target.value)} required>
                {airports.map((a) => {
                  const label = `${a.name.split('-')[0].trim()} (${a.oaci})`;
                  return <option key={a.oaci} value={label}>{label}</option>;
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Equipement</label>
              <select value={form.equip} onChange={(e) => set('equip', e.target.value)}>
                {EQUIP.map((eq) => <option key={eq} value={eq}>{eq}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Statut</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="ON">ON (Operationnel)</option>
                <option value="OFF">OFF (Panne/Arret)</option>
                <option value="Degradee">Degrade / Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Debut</label>
              <input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Fin</label>
              <input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Motif</label>
              <input value={form.why} onChange={(e) => set('why', e.target.value)} placeholder="RAS, maintenance..." />
            </div>
          </div>
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <button type="submit" className="action-btn">+ Enregistrer</button>
          </div>
          {msg && <p style={{ color: 'var(--green)', marginTop: 8, fontSize: '0.85rem' }}>{msg}</p>}
          {err && <p style={{ color: 'var(--red)', marginTop: 8, fontSize: '0.85rem' }}>{err}</p>}
        </form>
      </div>

      <div className="admin-card">
        <h4>Historique</h4>
        <table className="status-table">
          <thead>
            <tr>
              <th>Date / Heure</th><th>Site</th><th>Equipement</th><th>Statut</th>
              <th>Horaires</th><th>Motif</th><th>Auteur</th><th />
            </tr>
          </thead>
          <tbody>
            {(logs || []).map((l) => (
              <tr key={l.id}>
                <td>{l.date} {l.time}</td>
                <td>{l.site}</td>
                <td>{l.equip}</td>
                <td>{statusPill(l.status)}</td>
                <td>{l.start_time || '-'} - {l.end_time || '-'}</td>
                <td>{l.why || '-'}</td>
                <td>{l.author}</td>
                <td>
                  {(user.role === 'root' || l.author === user.username) && (
                    <button type="button" className="logout-btn" onClick={() => remove(l.id)}>X</button>
                  )}
                </td>
              </tr>
            ))}
            {!logs?.length && (
              <tr><td colSpan={8} className="empty">Aucun rapport</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
