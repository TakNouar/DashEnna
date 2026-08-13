import { useState, useEffect, useCallback, useMemo } from 'react';
import { login as apiLogin, logout as apiLogout, getStoredUser, api } from './api';
import Login from './components/Login';
import Topbar from './components/Topbar';
import Tabs from './components/Tabs';
import Overview from './pages/Overview';
import MapPage from './pages/MapPage';
import DailyLogs from './pages/DailyLogs';
import Accounts from './pages/Accounts';
import Traffic from './pages/Traffic';
import Cns from './pages/Cns';
import Finance from './pages/Finance';
import Hr from './pages/Hr';
import { useI18n } from './i18n/I18nContext';

const TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'traffic', label: 'Trafic & Sécurité' },
  { id: 'cns', label: 'CNS & Disponibilité' },
  { id: 'finance', label: 'Finances' },
  { id: 'hr', label: 'RH & Effectifs' },
  { id: 'map_dsa', label: 'Cartes DSA & Aérodromes' },
  { id: 'daily_log', label: 'Rapport Quotidien DSA' },
  { id: 'accounts', label: 'Gestion des Comptes', rootOnly: true },
];

function canAccess(user, pageId) {
  if (!user) return false;
  if (user.role === 'root') return true;
  if (pageId === 'accounts') return false;
  const pages = user.permissions?.pages;
  if (!pages || !pages.length) {
    return ['overview', 'cns', 'map_dsa', 'daily_log'].includes(pageId);
  }
  return pages.includes(pageId);
}

export default function App() {
  const { t } = useI18n();
  const [user, setUser] = useState(() => getStoredUser());
  const [tab, setTab] = useState('overview');
  const [airports, setAirports] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [traffic, setTraffic] = useState(null);
  const [cnsStats, setCnsStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clearSession = useCallback(() => {
    apiLogout();
    setUser(null);
    setAirports([]);
    setStats(null);
    setLogs([]);
    setTraffic(null);
    setCnsStats(null);
    setError('');
    setTab('overview');
  }, []);

  const refresh = useCallback(async () => {
    if (!getStoredUser() && !user) return;
    setLoading(true);
    try {
      const [apts, st, lg, tr, cns] = await Promise.all([
        api('/airports'),
        api('/airports/stats'),
        api('/logs'),
        api('/traffic'),
        api('/logs/cns-stats'),
      ]);
      setAirports(apts);
      setStats(st);
      setLogs(lg);
      setTraffic(tr);
      setCnsStats(cns);
      setError('');
    } catch (e) {
      if (e.status === 401) {
        clearSession();
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, clearSession]);

  useEffect(() => {
    if (!user) return undefined;
    refresh();
    const id = setInterval(refresh, 120000);
    return () => clearInterval(id);
  }, [user, refresh]);

  const visibleTabs = useMemo(
    () =>
      TABS.filter((tab) => canAccess(user, tab.id)).map((tab) => ({
        ...tab,
        label: t(`tab_${tab.id}`) || tab.label,
      })),
    [user, t]
  );

  useEffect(() => {
    if (!user) return;
    if (!canAccess(user, tab) && visibleTabs.length) {
      setTab(visibleTabs[0].id);
    }
  }, [user, tab, visibleTabs]);

  const handleLogin = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
    const first = TABS.find((t) => canAccess(data.user, t.id));
    setTab(first?.id || 'overview');
    setError('');
  };

  const handleLogout = () => {
    clearSession();
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Topbar user={user} onLogout={handleLogout} loading={loading} />
      <Tabs tabs={visibleTabs} active={tab} onChange={setTab} />
      {error && (
        <div style={{ padding: '8px 20px', background: 'rgba(255,118,117,0.15)', color: 'var(--red)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}
      <main className="page">
        {tab === 'overview' && canAccess(user, 'overview') && (
          <Overview stats={stats} traffic={traffic} cnsStats={cnsStats} />
        )}
        {tab === 'traffic' && canAccess(user, 'traffic') && (
          <Traffic traffic={traffic} user={user} onChange={refresh} />
        )}
        {tab === 'cns' && canAccess(user, 'cns') && (
          <Cns logs={logs} cnsStats={cnsStats} />
        )}
        {tab === 'finance' && canAccess(user, 'finance') && <Finance />}
        {tab === 'hr' && canAccess(user, 'hr') && <Hr />}
        {tab === 'map_dsa' && canAccess(user, 'map_dsa') && (
          <MapPage airports={airports} stats={stats} />
        )}
        {tab === 'daily_log' && canAccess(user, 'daily_log') && (
          <DailyLogs logs={logs} airports={airports} user={user} onChange={refresh} />
        )}
        {tab === 'accounts' && canAccess(user, 'accounts') && (
          <Accounts user={user} onChange={refresh} />
        )}
      </main>
      <footer>
        <span>{t('footer')}</span>
        <span>
          {stats
            ? `${stats.total} ${t('aerodromes')} · ${stats.intl} ${t('intl')} · ${stats.ntl} ${t('ntl')}`
            : '…'}
          {' · '}{t('cnsLabel')}: {cnsStats?.overall != null ? `${cnsStats.overall}%` : '—'}
        </span>
      </footer>
    </div>
  );
}
