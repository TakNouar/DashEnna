import { useI18n } from '../i18n/I18nContext';

export default function LangSwitch() {
  const { locale, setLocale, locales, t } = useI18n();
  return (
    <div className="lang-switch" title={t('lang')}>
      {locales.map((l) => (
        <button
          key={l.id}
          type="button"
          className={locale === l.id ? 'active' : ''}
          onClick={() => setLocale(l.id)}
          aria-label={l.name}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
