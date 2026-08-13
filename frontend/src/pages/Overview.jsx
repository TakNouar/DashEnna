import { useEffect, useRef } from 'react';
import {
  Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement, Legend, Tooltip,
} from 'chart.js';

Chart.register(
  LineController, LineElement, PointElement, LinearScale, CategoryScale,
  DoughnutController, ArcElement, BarController, BarElement, Legend, Tooltip
);

const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout'];
const trafficData = [19800, 20100, 21500, 22000, 23200, 24100, 24800, 25500, 26200, 26800, 27400, 27940];

export default function Overview({ stats }) {
  const trafficRef = useRef(null);
  const revenueRef = useRef(null);
  const hrRef = useRef(null);
  const cnsRef = useRef(null);
  const charts = useRef([]);

  useEffect(() => {
    charts.current.forEach((c) => c.destroy());
    charts.current = [];

    const common = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#8b9bb4', boxWidth: 12, font: { size: 11 } } } },
    };

    if (trafficRef.current) {
      charts.current.push(new Chart(trafficRef.current, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Mouvements',
            data: trafficData,
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

    if (cnsRef.current) {
      charts.current.push(new Chart(cnsRef.current, {
        type: 'bar',
        data: {
          labels: ['Radar', 'VOR/DME', 'ILS', 'VHF'],
          datasets: [{
            label: '%',
            data: [99.1, 98.4, 97.6, 99.5],
            backgroundColor: ['#39d08c', '#4fe0e8', '#f5a623', '#39d08c'],
            borderRadius: 4,
          }],
        },
        options: {
          ...common,
          indexAxis: 'y',
          plugins: { legend: { display: false } },
          scales: {
            x: { min: 90, max: 100, ticks: { color: '#8b9bb4' }, grid: { color: 'rgba(255,255,255,0.04)' } },
            y: { ticks: { color: '#8b9bb4' }, grid: { display: false } },
          },
        },
      }));
    }

    return () => {
      charts.current.forEach((c) => c.destroy());
      charts.current = [];
    };
  }, []);

  return (
    <>
      <div className="hero">
        <div className="radar-center">
          <div>
            <div className="num">94.2</div>
            <div className="lbl">Indice global reseau</div>
          </div>
        </div>
        <div className="hero-text">
          <h2>Performance globale du reseau ENNA</h2>
          <p>
            Indice composite (illustratif) - securite trafic, disponibilite CNS, finances, RH.
            Reseau officiel: {stats?.total ?? '36'} aerodromes ({stats?.intl ?? 12} internationaux).
          </p>
          <div>
            <div className="hb-row"><span className="name">Securite / Trafic</span><div className="hb-track"><div className="hb-fill" style={{ width: '96%' }} /></div><span className="hb-val">96%</span></div>
            <div className="hb-row"><span className="name">Disponibilite CNS</span><div className="hb-track"><div className="hb-fill" style={{ width: '98%' }} /></div><span className="hb-val">98%</span></div>
            <div className="hb-row"><span className="name">Finances</span><div className="hb-track"><div className="hb-fill" style={{ width: '89%' }} /></div><span className="hb-val">89%</span></div>
            <div className="hb-row"><span className="name">RH</span><div className="hb-track"><div className="hb-fill" style={{ width: '93%' }} /></div><span className="hb-val">93%</span></div>
          </div>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi"><div className="l">Aerodromes (reseau ENNA)</div><div className="v">{stats?.total ?? '-'}</div><div className="d flat">{stats ? `${stats.intl} INTL - ${stats.ntl} NTL` : ''}</div></div>
        <div className="kpi"><div className="l">Regime H24</div><div className="v" style={{ color: 'var(--green)' }}>{stats?.h24 ?? '-'}</div><div className="d up">Service continu</div></div>
        <div className="kpi"><div className="l">Regime H12</div><div className="v" style={{ color: 'var(--amber)' }}>{stats?.h12 ?? '-'}</div><div className="d flat">Service diurne</div></div>
        <div className="kpi"><div className="l">Mouvements aerodromes 2025</div><div className="v">253 340</div><div className="d flat">Source: enna.dz</div></div>
        <div className="kpi"><div className="l">Survols 2025</div><div className="v">276 899</div><div className="d flat">Source: enna.dz</div></div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <h3>Trafic mensuel - mouvements reseau</h3>
          <div className="sub">Tendance illustrative (totaux 2025 officiels)</div>
          <div className="chart-wrap"><canvas ref={trafficRef} /></div>
        </div>
        <div className="panel">
          <h3>Repartition CA par redevance</h3>
          <div className="sub">Donnees illustratives - annee en cours</div>
          <div className="chart-wrap"><canvas ref={revenueRef} /></div>
        </div>
      </div>

      <div className="grid-3">
        <div className="panel">
          <h3>Alertes prioritaires</h3>
          <div className="sub">Points d'attention DG (demo)</div>
          <table className="status-table">
            <tbody>
              <tr><td>Radar Alger - cycle maintenance</td><td><span className="pill warn"><span className="dot" />A surveiller</span></td></tr>
              <tr><td>Absenteisme controleurs - Oran</td><td><span className="pill warn"><span className="dot" />A surveiller</span></td></tr>
              <tr><td>Resultat net vs budget</td><td><span className="pill ok"><span className="dot" />Conforme</span></td></tr>
              <tr><td>Incidents securite (mois)</td><td><span className="pill ok"><span className="dot" />0 majeur</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Effectif par pole</h3>
          <div className="sub">Repartition illustrative (~3 300 agents publies ENNA)</div>
          <div className="chart-wrap"><canvas ref={hrRef} /></div>
        </div>
        <div className="panel">
          <h3>Disponibilite par systeme CNS</h3>
          <div className="sub">Moyenne reseau (illustrative)</div>
          <div className="chart-wrap"><canvas ref={cnsRef} /></div>
        </div>
      </div>
    </>
  );
}
