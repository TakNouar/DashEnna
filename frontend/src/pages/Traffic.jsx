import { useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n/I18nContext';

export default function Traffic({ traffic, user, onChange }) {
  const { t } = useI18n();
  const [csv, setCsv] = useState('month,label,movements\n2025-09,Sep,19800\n2025-10,Oct,20100\n');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const series = traffic?.series || [];
  const public2025 = traffic?.public_2025 || { movements: 253340, overflights: 276899 };

  const importCsv = async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try {
      const res = await api('/traffic/import', { method: 'POST', body: JSON.stringify({ csv }) });
      setMsg(`${t('importOk')} — ${res.count}`);
      onChange?.();
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <>
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">{t('movOfficial')}</div>
          <div className="v">{public2025.movements.toLocaleString('fr-FR')}</div>
          <div className="d flat">{t('sourceEnna')}</div>
        </div>
        <div className="kpi">
          <div className="l">{t('overOfficial')}</div>
          <div className="v">{public2025.overflights.toLocaleString('fr-FR')}</div>
          <div className="d flat">{t('sourceEnna')}</div>
        </div>
        <div className="kpi">
          <div className="l">{t('seriesSum')}</div>
          <div className="v">{(traffic?.total || 0).toLocaleString('fr-FR')}</div>
          <div className="d flat">{t('csvEditable')}</div>
        </div>
      </div>
      <div className="panel">
        <h3>{t('monthlySeries')}</h3>
        <div className="sub">{t('serverData')}</div>
        <table className="status-table">
          <thead>
            <tr><th>{t('month')}</th><th>{t('label')}</th><th>{t('movements')}</th></tr>
          </thead>
          <tbody>
            {series.map((r) => (
              <tr key={r.month}>
                <td>{r.month}</td>
                <td>{r.label}</td>
                <td>{Number(r.movements).toLocaleString('fr-FR')}</td>
              </tr>
            ))}
            {!series.length && <tr><td colSpan={3} className="empty">{t('noSeriesRow')}</td></tr>}
          </tbody>
        </table>
      </div>
      {user?.role === 'root' && (
        <div className="panel">
          <h3>{t('importCsv')}</h3>
          <div className="sub">{t('csvFormat')}</div>
          <form onSubmit={importCsv}>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={8}
              style={{
                width: '100%', fontFamily: 'var(--mono)', fontSize: '0.8rem',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 12, color: 'var(--text)',
              }}
            />
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button type="submit" className="action-btn">{t('importBtn')}</button>
            </div>
            {msg && <p style={{ color: 'var(--green)', marginTop: 8 }}>{msg}</p>}
            {err && <p style={{ color: 'var(--red)', marginTop: 8 }}>{err}</p>}
          </form>
        </div>
      )}
    </>
  );
}
