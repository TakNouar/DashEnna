import { useI18n } from '../i18n/I18nContext';
import LangSwitch from './LangSwitch';

export default function Topbar({ user, onLogout, loading }) {
  const { t, locale } = useI18n();
  const now = new Date();
  const dateLocale = locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-GB' : 'fr-FR';
  const period = now.toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' });
  const updated = now.toLocaleString(dateLocale, {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-logo">✈</div>
        <div className="brand-text">
          <h1>{t('brandTitle')}</h1>
          <p>{t('brandSub')}</p>
        </div>
      </div>
      <div className="top-meta">
        <LangSwitch />
        <div className="stat">
          <div className="l">{t('period')}</div>
          <div className="v">{period} · YTD</div>
        </div>
        <div className="stat">
          <div className="l">{t('updated')}</div>
          <div className="v">{loading ? '…' : updated}</div>
        </div>
        <div className="role-badge">
          {user.role === 'root' ? t('accessRoot') : `${t('account')} : ${user.username}`}
        </div>
        <button type="button" className="logout-btn" onClick={onLogout}>
          {t('logout')}
        </button>
      </div>
    </header>
  );
}
