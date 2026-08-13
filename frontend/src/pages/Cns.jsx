import { useI18n } from '../i18n/I18nContext';

export default function Cns({ logs, cnsStats }) {
  const { t } = useI18n();
  const gauges = cnsStats?.gauges || [
    { label: 'Radar', val: null },
    { label: 'VOR/DME', val: null },
    { label: 'ILS', val: null },
    { label: 'VHF', val: null },
  ];

  const color = (val) => {
    if (val == null) return 'var(--muted)';
    if (val >= 99) return 'var(--green)';
    if (val >= 90) return 'var(--cyan)';
    if (val >= 50) return 'var(--amber)';
    return 'var(--red)';
  };

  return (
    <>
      <div className="kpi-row">
        {gauges.map((g) => (
          <div className="kpi" key={g.label}>
            <div className="l">{g.label}</div>
            <div className="v" style={{ color: color(g.val) }}>
              {g.val != null ? `${g.val}%` : '—'}
            </div>
            <div className="d flat">
              {g.sample ? `${g.sample} ${t('reportsCount')}` : t('noLogFamily')}
            </div>
          </div>
        ))}
        {cnsStats?.overall != null && (
          <div className="kpi">
            <div className="l">{t('globalCns')}</div>
            <div className="v" style={{ color: color(cnsStats.overall) }}>{cnsStats.overall}%</div>
            <div className="d flat">{cnsStats.total_reports} {t('totalReports')}</div>
          </div>
        )}
      </div>
      <div className="panel">
        <h3>{t('lastReports')}</h3>
        <div className="sub">{t('cnsExplain')}</div>
        <table className="status-table">
          <thead>
            <tr>
              <th>{t('date')}</th><th>{t('site')}</th><th>{t('equipment')}</th>
              <th>{t('status')}</th><th>{t('reason')}</th><th>{t('author')}</th>
            </tr>
          </thead>
          <tbody>
            {(logs || []).slice(0, 20).map((l) => (
              <tr key={l.id}>
                <td>{l.date} {l.time}</td>
                <td>{l.site}</td>
                <td>{l.equip}</td>
                <td>
                  <span className={`pill ${l.status === 'ON' ? 'ok' : l.status === 'OFF' ? 'crit' : 'warn'}`}>
                    <span className="dot" />{l.status}
                  </span>
                </td>
                <td>{l.why || '—'}</td>
                <td>{l.author}</td>
              </tr>
            ))}
            {!logs?.length && (
              <tr><td colSpan={6} className="empty">{t('noReports')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
