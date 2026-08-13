import { useState, useEffect, useMemo } from 'react';
import { api } from '../api';

const FAMILIES = ['Radar', 'VOR-DME', 'ILS', 'VHF', 'SSR', 'ADS-B', 'DME', 'Other'];
const STATUSES = [
  { id: 'operational', label: 'Opérationnel' },
  { id: 'degraded', label: 'Dégradé' },
  { id: 'down', label: 'Hors service' },
];

export default function Equipment({ airports, user, onChange }) {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ site: '', system_family: '', status: '' });
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    site: '', system_family: 'Radar', name: '', manufacturer: '', model: '',
    install_date: '', status: 'operational', responsible_service: '', notes: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const siteOptions = useMemo(
    () => (airports || []).map((a) => `${a.name.split('–')[0].trim()} (${a.oaci})`),
    [airports]
  );

  const load = async () => {
    try {
      const q = new URLSearchParams();
      if (filters.site) q.set('site', filters.site);
      if (filters.system_family) q.set('system_family', filters.system_family);
      if (filters.status) q.set('status', filters.status);
      setRows(await api(`/equipment?${q}`));
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, [filters.site, filters.system_family, filters.status]);

  const create = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api('/equipment', { method: 'POST', body: JSON.stringify(form) });
      setMsg('Équipement créé');
      setForm((f) => ({ ...f, name: '', manufacturer: '', model: '', notes: '' }));
      load();
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
      load();
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer cet équipement ?')) return;
    try {
      await api(`/equipment/${id}`, { method: 'DELETE' });
      if (selected?.id === id) setSelected(null);
      load();
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const statusPill = (s) => {
    const map = { operational: 'ok', degraded: 'warn', down: 'crit' };
    return <span className={`pill ${map[s] || ''}`}><span className="dot" />{s}</span>;
  };

  return (
    <>
      <div className="kpi-row">
        <div className="kpi"><div className="l">Parc total</div><div className="v">{rows.length}</div><div className="d flat">filtrés</div></div>
        <div className="kpi"><div className="l">Opérationnels</div><div className="v" style={{ color: 'var(--green)' }}>{rows.filter((r) => r.status === 'operational').length}</div></div>
        <div className="kpi"><div className="l">Dégradés</div><div className="v" style={{ color: 'var(--amber)' }}>{rows.filter((r) => r.status === 'degraded').length}</div></div>
        <div className="kpi"><div className="l">Hors service</div><div className="v" style={{ color: 'var(--red)' }}>{rows.filter((r) => r.status === 'down').length}</div></div>
      </div>

      <div className="panel">
        <h3>Inventaire équipements CNS</h3>
        <div className="sub">Source API /equipment</div>
        {msg && <p style={{ color: 'var(--green)' }}>{msg}</p>}
        {err && <p style={{ color: 'var(--red)' }}>{err}</p>}

        <div className="form-row" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label>Site</label>
            <select value={filters.site} onChange={(e) => setFilters({ ...filters, site: e.target.value })}>
              <option value="">Tous</option>
              {siteOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Famille</label>
            <select value={filters.system_family} onChange={(e) => setFilters({ ...filters, system_family: e.target.value })}>
              <option value="">Toutes</option>
              {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Statut</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Tous</option>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="dsa-main-grid">
          <div>
            <table className="status-table">
              <thead>
                <tr><th>Nom</th><th>Site</th><th>Famille</th><th>Statut</th><th /></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={selected?.id === r.id ? 'selected' : ''} onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                    <td>{r.name}</td>
                    <td>{r.site}</td>
                    <td>{r.system_family}</td>
                    <td>{statusPill(r.status)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {user.role === 'root' && (
                        <button type="button" className="logout-btn" onClick={() => remove(r.id)}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={5} className="empty">Aucun équipement</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="info-card">
            {selected ? (
              <>
                <h2>{selected.name}</h2>
                <div className="code-oaci">{selected.system_family}</div>
                <div className="info-group"><div className="info-label">Site</div><div className="info-val">{selected.site}</div></div>
                <div className="info-group"><div className="info-label">Constructeur</div><div className="info-val">{selected.manufacturer || '—'}</div></div>
                <div className="info-group"><div className="info-label">Modèle</div><div className="info-val">{selected.model || '—'}</div></div>
                <div className="info-group"><div className="info-label">Installation</div><div className="info-val">{selected.install_date || '—'}</div></div>
                <div className="info-group"><div className="info-label">Service</div><div className="info-val">{selected.responsible_service || '—'}</div></div>
                <div className="info-group">
                  <div className="info-label">Statut</div>
                  <div className="info-val">
                    <select
                      value={selected.status}
                      onChange={(e) => {
                        setStatus(selected.id, e.target.value);
                        setSelected({ ...selected, status: e.target.value });
                      }}
                    >
                      {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="info-group"><div className="info-label">Notes</div><div className="info-val">{selected.notes || '—'}</div></div>
              </>
            ) : (
              <p className="empty">Sélectionnez un équipement</p>
            )}
          </div>
        </div>
      </div>

      {user.role === 'root' && (
        <div className="panel">
          <h3>Ajouter un équipement (root)</h3>
          <form onSubmit={create}>
            <div className="form-row">
              <div className="form-group">
                <label>Site</label>
                <select value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} required>
                  <option value="">—</option>
                  {siteOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Famille</label>
                <select value={form.system_family} onChange={(e) => setForm({ ...form, system_family: e.target.value })}>
                  {FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Constructeur</label>
                <input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Modèle</label>
                <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Installation</label>
                <input type="date" value={form.install_date} onChange={(e) => setForm({ ...form, install_date: e.target.value })} />
              </div>
              <button type="submit" className="action-btn" style={{ alignSelf: 'end' }}>+ Créer</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
