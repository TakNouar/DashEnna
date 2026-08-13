import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import LangSwitch from './LangSwitch';

export default function Login({ onLogin }) {
  const { t } = useI18n();
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
      setError(err.message || t('loginFail'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <LangSwitch />
        </div>
        <h2>{t('loginTitle')}</h2>
        <p>{t('loginSub')}</p>
        <form className="login-form" onSubmit={submit}>
          <div>
            <label>{t('username')}</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="root / DSA_Alger"
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label>{t('password')}</label>
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
            {busy ? t('loggingIn') : t('loginBtn')}
          </button>
          {error && <div className="login-error">{error}</div>}
        </form>
        <p style={{ marginTop: 16, fontSize: '0.72rem', color: 'var(--muted)', textAlign: 'center' }}>
          {t('demoHint')}
        </p>
      </div>
    </div>
  );
}
