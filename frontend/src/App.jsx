import { useState, useEffect, useCallback } from 'react';
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

const TABS = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'traffic', label: 'Trafic & Securite' },
  { id: 'cns', label: 'CNS & Disponibilite' },
  { id: 'finance', label: 'Finances' },
  { id: 'hr', label: 'RH & Effectifs' },
  { id: 'map_dsa', label: 'Cartes DSA & Aerodromes' },
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
  const [user, setUser] = useState(getStoredUser());
  const [tab, setTab] = useState('overview');
  const [airports, setAirports] = useState([]);
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [traffic, setTraffic] = useState(null);
  const [cnsStats, setCnsStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) return;
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
        apiLogout();
        setUser(null);
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    if (!user) return undefined;
    const id = setInterval(refresh, 120000);
    return () => clearInterval(id);
  }, [user, refresh]);

  const handleLogin = async (username, password) => {
    const data = await apiLogin(username, password);
    setUser(data.user);
    const first = TABS.find((t) => canAccess(data.user, t.id));
    setTab(first?.id || 'overview');
  };

  const handleLogout = () => {
    apiLogout();
    setUser(null);
    setAirports([]);
    setLogs([]);
    setTraffic(null);
    setCnsStats(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const visibleTabs = TABS.filter((t) => canAccess(user, t.id));

  useEffect(() => {
    if (user && !canAccess(user, tab) && visibleTabs.length) {
      setTab(visibleTabs[0].id);
    }
  }, [user, tab, visibleTabs.length]);

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
        {tab === 'overview' && <Overview stats={stats} traffic={traffic} cnsStats={cnsStats} />}
        {tab === 'traffic' && <Traffic traffic={traffic} user={user} onChange={refresh} />}
        {tab === 'cns' && <Cns logs={logs} cnsStats={cnsStats} />}
        {tab === 'finance' && <Finance />}
        {tab === 'hr' && <Hr />}
        {tab === 'map_dsa' && <MapPage airports={airports} stats={stats} />}
        {tab === 'daily_log' && (
          <DailyLogs logs={logs} airports={airports} user={user} onChange={refresh} />
        )}
        {tab === 'accounts' && user.role === 'root' && (
          <Accounts user={user} onChange={refresh} />
        )}
      </main>
      <footer>
        <span>ENNA — Tableau de bord executif · v2.1 · React + Express</span>
        <span>
          {stats ? `${stats.total} aerodromes · ${stats.intl} internationaux · ${stats.ntl} nationaux` : '...'}
          {' · '}CNS: {cnsStats?.overall != null ? `${cnsStats.overall}%` : '—'}
        </span>
      </footer>
    </div>
  );
}
