import { useState } from 'react';
import { api } from '../api';

/**
 * Blocking screen when user.must_change_password is true.
 * No tab navigation until password is changed.
 */
export default function ForceChangePassword({ user, onDone, onLogout }) {
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (newPassword.length < 8) {
      setErr('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (newPassword !== confirm) {
      setErr('La confirmation ne correspond pas');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      onDone();
    } catch (ex) {
      setErr(ex.message || 'Échec');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Changement de mot de passe obligatoire</h1>
        <p className="sub">
          Compte <strong>{user.username}</strong> — vous devez définir un nouveau mot de passe
          avant d&apos;accéder au tableau de bord.
        </p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOld(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe (min. 8)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Confirmation</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
            />
          </div>
          {err && <p style={{ color: 'var(--red)', fontSize: '0.85rem' }}>{err}</p>}
          <button type="submit" className="action-btn" disabled={busy} style={{ width: '100%', marginTop: 12 }}>
            {busy ? 'Enregistrement…' : 'Enregistrer et continuer'}
          </button>
        </form>
        <button type="button" className="logout-btn" style={{ marginTop: 16 }} onClick={onLogout}>
          Déconnexion
        </button>
      </div>
    </div>
  );
}
