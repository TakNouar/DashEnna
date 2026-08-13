import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement, Legend, Tooltip,
} from 'chart.js';

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement, Legend, Tooltip
);

export default function Overview({ stats, traffic, cnsStats }) {
  const trafficRef = useRef(null);
  const revenueRef = useRef(null);
  const hrRef = useRef(null);
  const cnsRef = useRef(null);
  const charts = useRef([]);

  const series = traffic?.series || [];
  const labels = series.map((r) => r.label || r.month);
  const movements = series.map((r) => Number(r.movements) || 0);
  const cnsLabels = (cnsStats?.gauges || []).map((g) => g.label);
  const cnsVals = (cnsStats?.gauges || []).map((g) => (g.val != null ? g.val : 0));

  useEffect(() => {
    charts.current.forEach((c) => c.destroy());
    charts.current = [];
    const common = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8b9bb4', boxWidth: 12, font: { size: 11 } } } },
    };

    if (trafficRef.current && labels.length) {
      charts.current.push(new Chart(trafficRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Mouvements',
            data: movements,
            borderColor: '#4fe0e8',
            backgroundColor: 'rgba(79,224,232,0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
          }],
        },
        options: {
          ...common,
          scales: {
            x: { ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          },
        },
      }));
    }

    if (revenueRef.current) {
      charts.current.push(new Chart(revenueRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Survol', 'Atterrissage', 'Balisage', 'Autres'],
          datasets: [{
            data: [48, 28, 14, 10],
            backgroundColor: ['#4fe0e8', '#39d08c', '#f5a623', '#7c8db5'],
            borderWidth: 0,
          }],
        },
        options: common,
      }));
    }

    if (hrRef.current) {
      charts.current.push(new Chart(hrRef.current, {
        type: 'bar',
        data: {
          labels: ['Controle', 'Technique', 'SSLI', 'Admin', 'Autres'],
          datasets: [{
            label: 'Effectif',
            data: [612, 584, 568, 420, 1148],
            backgroundColor: '#4fe0e8',
            borderRadius: 4,
          }],
        },
        options: {
          ...common,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#8b9bb4', font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          },
        },
      }));
    }

    if (cnsRef.current && cnsLabels.length) {
      charts.current.push(new Chart(cnsRef.current, {
        type: 'bar',
        data: {
          labels: cnsLabels,
          datasets: [{
            label: '%',
            data: cnsVals,
            backgroundColor: cnsVals.map((v) => (v >= 90 ? '#39d08c' : v >= 50 ? '#f5a623' : '#ff7675')),
            borderRadius: 4,
          }],
        },
        options: {
          ...common,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { min: 0, max: 100, ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#8b9bb4' }, grid: { display: false } },
          },
        },
      }));
    }

    return () => {
      charts.current.forEach((c) => c.destroy());
      charts.current = [];
    };
  }, [labels.join(','), movements.join(','), cnsLabels.join(','), cnsVals.join(',')]);

  const overall = cnsStats?.overall;

  return (
    <>
      <div className="hero">
        <div className="radar-center">
          <div>
            <div className="num">{overall != null ? overall : '—'}</div>
            <div className="lbl">CNS (logs DSA)</div>
          </div>
        </div>
        <div className="hero-text">
          <h2>Performance globale du reseau ENNA</h2>
          <p>
            Indice CNS derive des rapports quotidiens DSA.
            Reseau: {stats?.total ?? '36'} aerodromes ({stats?.intl ?? 12} internationaux).
          </p>
          <div>
            <div className="hb-row">
              <span className="name">CNS (logs)</span>
              <div className="hb-track">
                <div className="hb-fill" style={{ width: `${overall != null ? overall : 0}%` }} />
              </div>
              <span className="hb-val">{overall != null ? `${overall}%` : '—'}</span>
            </div>
            <div className="hb-row">
              <span className="name">H24 / total</span>
              <div className="hb-track">
                <div className="hb-fill" style={{ width: stats?.total ? `${(stats.h24 / stats.total) * 100}%` : '0%' }} />
              </div>
              <span className="hb-val">{stats ? `${stats.h24}/${stats.total}` : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi">
          <div className="l">Aerodromes</div>
          <div className="v">{stats?.total ?? '—'}</div>
          <div className="d flat">{stats ? `${stats.intl} INTL · ${stats.ntl} NTL` : ''}</div>
        </div>
        <div className="kpi">
          <div className="l">Regime H24</div>
          <div className="v" style={{ color: 'var(--green)' }}>{stats?.h24 ?? '—'}</div>
          <div className="d up">Service continu</div>
        </div>
        <div className="kpi">
          <div className="l">Mouvements 2025 (officiel)</div>
          <div className="v">253 340</div>
          <div className="d flat">enna.dz</div>
        </div>
        <div className="kpi">
          <div className="l">Survols 2025</div>
          <div className="v">276 899</div>
          <div className="d flat">enna.dz</div>
        </div>
        <div className="kpi">
          <div className="l">Rapports DSA</div>
          <div className="v">{cnsStats?.total_reports ?? '—'}</div>
          <div className="d flat">alimentent le CNS</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>Trafic mensuel — mouvements reseau</h3>
          <div className="sub">
            Serie serveur (modifiable via Trafic → import CSV)
            {series.length ? ` · ${series.length} mois` : ' · aucune serie'}
          </div>
          <div className="chart-wrap"><canvas ref={trafficRef} /></div>
        </div>
        <div className="panel">
          <h3>Repartition CA par redevance</h3>
          <div className="sub">Illustratif — en attente de flux finance ENNA</div>
          <div className="chart-wrap"><canvas ref={revenueRef} /></div>
        </div>
      </div>

      <div className="grid-3">
        <div className="panel">
          <h3>Alertes prioritaires</h3>
          <div className="sub">Demo / points d&apos;attention</div>
          <table className="status-table">
            <tbody>
              <tr>
                <td>CNS global (logs)</td>
                <td>
                  <span className={`pill ${overall == null ? 'warn' : overall >= 90 ? 'ok' : overall >= 50 ? 'warn' : 'crit'}`}>
                    <span className="dot" />{overall != null ? `${overall}%` : 'N/A'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>Finance (interne)</td>
                <td><span className="pill warn"><span className="dot" />Non branche</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Effectif par pole</h3>
          <div className="sub">Illustratif (~3 300 agents publies ENNA)</div>
          <div className="chart-wrap"><canvas ref={hrRef} /></div>
        </div>
        <div className="panel">
          <h3>Disponibilite CNS (logs)</h3>
          <div className="sub">Calculee depuis les rapports quotidiens</div>
          <div className="chart-wrap"><canvas ref={cnsRef} /></div>
        </div>
      </div>
    </>
  );
}
