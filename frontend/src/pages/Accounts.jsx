import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Accounts({ user, onChange }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'dsa', dsa_region: '' });
  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const rows = await api('/users');
      setUsers(rows);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api('/users', { method: 'POST', body: JSON.stringify(form) });
      setMsg('Compte créé');
      setForm({ username: '', password: '', role: 'dsa', dsa_region: '' });
      load();
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Supprimer ce compte ?')) return;
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      load();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      await api('/auth/change-password', { method: 'POST', body: JSON.stringify(pwd) });
      setMsg('Mot de passe mis à jour');
      setPwd({ oldPassword: '', newPassword: '' });
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div className="panel">
      <h3>Gestionnaire des Comptes</h3>
      <div className="sub">Auth serveur (bcrypt + JWT) — plus de Base64 côté client</div>

      {msg && <p style={{ color: 'var(--green)', marginBottom: 10 }}>{msg}</p>}
      {err && <p style={{ color: 'var(--red)', marginBottom: 10 }}>{err}</p>}

      <div className="admin-card">
        <h4>Créer un compte</h4>
        <form onSubmit={create}>
          <div className="form-row">
            <div className="form-group">
              <label>Identifiant</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="dsa">DSA / Site</option>
                <option value="root">Root</option>
              </select>
            </div>
            <div className="form-group">
              <label>Région DSA</label>
              <input value={form.dsa_region} onChange={(e) => setForm({ ...form, dsa_region: e.target.value })} placeholder="DSA Alger (Centre)" />
            </div>
            <button type="submit" className="action-btn" style={{ alignSelf: 'end' }}>+ Créer</button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h4>Modifier mon mot de passe</h4>
        <form onSubmit={changePwd}>
          <div className="form-row">
            <div className="form-group">
              <label>Ancien</label>
              <input type="password" value={pwd.oldPassword} onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Nouveau</label>
              <input type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required />
            </div>
            <button type="submit" className="action-btn" style={{ alignSelf: 'end' }}>Mettre à jour</button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <h4>Comptes actifs</h4>
        <table className="status-table">
          <thead>
            <tr><th>Identifiant</th><th>Rôle</th><th>DSA</th><th>Dernière modif. MDP</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.role}</td>
                <td>{u.dsa_region || '—'}</td>
                <td>{u.last_pwd_change || '—'}</td>
                <td>
                  {u.username !== 'root' && (
                    <button type="button" className="logout-btn" onClick={() => remove(u.id)}>Supprimer</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
