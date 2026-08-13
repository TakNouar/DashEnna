import { useI18n } from '../i18n/I18nContext';

export default function Hr() {
  const { t } = useI18n();
  return (
    <div className="panel">
      <h3>{t('hrTitle')}</h3>
      <div className="sub">{t('hrSub')}</div>
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Effectif</div>
          <div className="v">~3 300</div>
          <div className="d flat">enna.dz</div>
        </div>
      </div>
      <p className="empty">{t('comingSoon')}</p>
    </div>
  );
}
