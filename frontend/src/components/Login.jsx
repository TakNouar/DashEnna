import { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || 'Échec de connexion');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <h2>Espace Sécurisé ENNA</h2>
        <p>Connectez-vous pour accéder au tableau de bord</p>
        <form className="login-form" onSubmit={submit}>
          <div>
            <label>Identifiant (DSA / Site ou root)</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: root ou DSA_Alger"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? 'Connexion…' : 'Se Connecter'}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <p style={{ marginTop: 16, fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
          Démo: root / admin123
        </p>
      </div>
    </div>
  );
}
