import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';

const SEVERITY = [
  { id: 'minor', label: 'Mineur' },
  { id: 'moderate', label: 'Modéré' },
  { id: 'major', label: 'Majeur' },
];
const STATUS = [
  { id: 'open', label: 'Ouvert' },
  { id: 'in_review', label: 'En revue' },
  { id: 'closed', label: 'Clos' },
];

export default function Incidents({ airports, equipment, user, onChange }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ site: '', severity: '', status: '' });
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    site: airports[0] ? `${airports[0].name.split('–')[0].trim()} (${airports[0].oaci})` : '',
    system: '',
    equipment_id: '',
    description: '',
    severity: 'minor',
    status: 'open',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const q = new URLSearchParams();
      if (filters.site) q.set('site', filters.site);
      if (filters.severity) q.set('severity', filters.severity);
      if (filters.status) q.set('status', filters.status);
      const data = await api(`/incidents?${q}`);
      setRows(data);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, [filters.site, filters.severity, filters.status]);

  const siteOptions = useMemo(() => {
    return (airports || []).map((a) => `${a.name.split('–')[0].trim()} (${a.oaci})`);
  }, [airports]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          equipment_id: form.equipment_id ? Number(form.equipment_id) : null,
        }),
      });
      setMsg('Incident enregistré');
      setForm((f) => ({ ...f, description: '', system: '', equipment_id: '' }));
      load();
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api(`/incidents/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cet incident ?')) return;
    try {
      await api(`/incidents/${id}`, { method: 'DELETE' });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const sevPill = (s) => {
    const map = { minor: 'ok', moderate: 'warn', major: 'crit' };
    return <span className={`pill ${map[s] || ''}`}><span className="dot" />{s}</span>;
  };

  return (
    <div className="panel">
      <h3>Incidents opérationnels</h3>
      <div className="sub">Saisie live — aucune donnée démo. Source: API /incidents</div>
      {msg && <p style={{ color: 'var(--green)' }}>{msg}</p>}
      {err && <p style={{ color: 'var(--red)' }}>{err}</p>}

      <div className="admin-card">
        <h4>Nouveau incident</h4>
        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Heure</label>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Site</label>
              <select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} required>
                {siteOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Système</label>
              <input value={form.system} onChange={(e) => setForm({ ...form, system: e.target.value })} placeholder="Radar, ILS…" />
            </div>
            <div className="form-group">
              <label>Équipement</label>
              <select value={form.equipment_id} onChange={(e) => setForm({ ...form, equipment_id: e.target.value })}>
                <option value="">— optionnel —</option>
                {(equipment || []).map((eq) => (
                  <option key={eq.id} value={eq.id}>{eq.name} ({eq.site})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sévérité</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {SEVERITY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 8 }}>
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              rows={3}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 10, color: 'var(--text)' }}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <button type="submit" className="action-btn">+ Enregistrer</button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h4>Filtres</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Site</label>
            <select value={filters.site} onChange={(e) => setFilters({ ...filters, site: e.target.value })}>
              <option value="">Tous</option>
              {siteOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Sévérité</label>
            <select value={filters.severity} onChange={(e) => setFilters({ ...filters, severity: e.target.value })}>
              <option value="">Toutes</option>
              {SEVERITY.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Tous</option>
              {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h4>Journal ({rows.length})</h4>
        <table className="status-table">
          <thead>
            <tr>
              <th>Date</th><th>Site</th><th>Système</th><th>Sévérité</th>
              <th>Statut</th><th>Description</th><th>Auteur</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date} {r.time}</td>
                <td>{r.site}</td>
                <td>{r.system || '—'}</td>
                <td>{sevPill(r.severity)}</td>
                <td>
                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} style={{ fontSize: '0.75rem' }}>
                    {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </td>
                <td style={{ maxWidth: 240 }}>{r.description}</td>
                <td>{r.reported_by}</td>
                <td>
                  {(user.role === 'root' || r.reported_by === user.username) && (
                    <button type="button" className="logout-btn" onClick={() => remove(r.id)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={8} className="empty">Aucun incident — le journal est vide (pas de données démo)</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
