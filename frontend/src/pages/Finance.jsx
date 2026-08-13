import { useI18n } from '../i18n/I18nContext';

export default function Finance() {
  const { t } = useI18n();
  return (
    <div className="panel">
      <h3>{t('financeTitle')}</h3>
      <div className="sub">{t('financeSub')}</div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">CA</div>
          <div className="v">—</div>
          <div className="d flat">{t('comingSoon')}</div>
        </div>
        <div className="kpi">
          <div className="l">Résultat</div>
          <div className="v">—</div>
          <div className="d flat">{t('comingSoon')}</div>
        </div>
      </div>
      <p className="empty">{t('illustrativeFinance')}</p>
    </div>
  );
}
