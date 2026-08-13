import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useI18n } from '../i18n/I18nContext';

/** North Africa focus (Maghreb + Libya/Egypt strip) */
const NA_BOUNDS = [
  [14.5, -18.0], // SW
  [38.5, 25.0],  // NE
];
const NA_CENTER = [28.0, 5.0];
const NA_ZOOM = 5;

function FitNorthAfrica({ airports }) {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(NA_BOUNDS);
    map.setMinZoom(4);
    map.setMaxZoom(12);
    map.options.maxBoundsViscosity = 0.85;
    if (airports?.length) {
      const lats = airports.map((a) => a.lat).filter((n) => typeof n === 'number');
      const lngs = airports.map((a) => a.lng).filter((n) => typeof n === 'number');
      if (lats.length && lngs.length) {
        const pad = 1.5;
        map.fitBounds(
          [
            [Math.min(...lats) - pad, Math.min(...lngs) - pad],
            [Math.max(...lats) + pad, Math.max(...lngs) + pad],
          ],
          { maxZoom: 5.5, padding: [20, 20] }
        );
        return;
      }
    }
    map.setView(NA_CENTER, NA_ZOOM);
  }, [map, airports]);
  return null;
}

export default function MapPage({ airports, stats }) {
  const { t } = useI18n();
  const [selected, setSelected] = useState(null);

  const sorted = useMemo(
    () => [...(airports || [])].sort((a, b) => a.name.localeCompare(b.name, 'fr')),
    [airports]
  );

  useEffect(() => {
    if (!selected && sorted.length) setSelected(sorted[0]);
  }, [sorted, selected]);

  return (
    <>
      <div className="kpi-row">
        <div className="kpi">
          <div className="l">{t('aptTotal')}</div>
          <div className="v">{stats?.total ?? '—'}</div>
          <div className="d flat">{t('nationalNetwork')}</div>
        </div>
        <div className="kpi">
          <div className="l">{t('internationals')}</div>
          <div className="v">{stats?.intl ?? '—'}</div>
          <div className="d flat">INTL</div>
        </div>
        <div className="kpi">
          <div className="l">{t('nationals')}</div>
          <div className="v">{stats?.ntl ?? '—'}</div>
          <div className="d flat">NTL</div>
        </div>
        <div className="kpi">
          <div className="l">{t('regimeH24')}</div>
          <div className="v" style={{ color: 'var(--green)' }}>{stats?.h24 ?? '—'}</div>
          <div className="d up">{t('continuous')}</div>
        </div>
        <div className="kpi">
          <div className="l">{t('regimeH12')}</div>
          <div className="v" style={{ color: 'var(--amber)' }}>{stats?.h12 ?? '—'}</div>
          <div className="d flat">{t('dayService')}</div>
        </div>
      </div>

      <div className="dsa-main-grid">
        <div>
          <div className="panel">
            <h3>{t('mapTitle')}</h3>
            <div className="sub">{t('mapSub')}</div>
            <MapContainer
              center={NA_CENTER}
              zoom={NA_ZOOM}
              minZoom={4}
              maxZoom={12}
              maxBounds={NA_BOUNDS}
              maxBoundsViscosity={0.85}
              style={{ height: 420, borderRadius: 10 }}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FitNorthAfrica airports={sorted} />
              {sorted.map((a) => (
                <CircleMarker
                  key={a.oaci}
                  center={[a.lat, a.lng]}
                  radius={a.horaire === 'H24' ? 8 : 6}
                  pathOptions={{
                    color: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillColor: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillOpacity: 0.75,
                    weight: selected?.oaci === a.oaci ? 3 : 2,
                  }}
                  eventHandlers={{ click: () => setSelected(a) }}
                >
                  <Popup>
                    <strong>{a.name}</strong>
                    <br />
                    {a.oaci} · {a.dsa}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="panel">
            <h3>
              {t('aptTableTitle')} ({sorted.length})
            </h3>
            <div className="sub">{t('aptTableSub')}</div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              <table className="apt-table">
                <thead>
                  <tr>
                    <th>OACI</th>
                    <th>{t('aerodromesKpi')}</th>
                    <th>{t('type')}</th>
                    <th>DSA</th>
                    <th>{t('schedule')}</th>
                    <th>{t('movements')}*</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((a) => (
                    <tr
                      key={a.oaci}
                      className={selected?.oaci === a.oaci ? 'selected' : ''}
                      onClick={() => setSelected(a)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontFamily: 'var(--mono)', color: 'var(--cyan)' }}>{a.oaci}</td>
                      <td>{a.name}</td>
                      <td>{a.type}</td>
                      <td>{a.dsa}</td>
                      <td>{a.horaire}</td>
                      <td>{a.traffic != null ? Number(a.traffic).toLocaleString('fr-FR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>
              {t('aptTableNote')}
            </p>
          </div>
        </div>

        <div className="info-card">
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                <div>
                  <h2>{selected.name}</h2>
                  <div className="code-oaci">
                    OACI: {selected.oaci}
                    {selected.iata ? ` · IATA: ${selected.iata}` : ''}
                  </div>
                </div>
                <span className={`badge${selected.horaire === 'H12' ? ' h12' : ''}`}>
                  {selected.horaire}
                </span>
              </div>
              <div
                className="info-group"
                style={{
                  background: 'rgba(239,90,99,0.08)',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(239,90,99,0.2)',
                }}
              >
                <div className="info-label" style={{ color: '#FF7675' }}>
                  {t('dsaRegion')}
                </div>
                <div className="info-val" style={{ fontWeight: 700 }}>{selected.dsa || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('type')}</div>
                <div className="info-val">
                  {selected.type}
                  {selected.cat ? ` · ${selected.cat}` : ''}
                </div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('runway')}</div>
                <div className="info-val">{selected.piste || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('frequencies')}</div>
                <div className="info-val">{selected.freq || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('navigation')}</div>
                <div className="info-val">{selected.nav || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('fuel')}</div>
                <div className="info-val">{selected.fuel || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('trafficMonth')}</div>
                <div className="info-val">
                  {selected.traffic != null
                    ? Number(selected.traffic).toLocaleString('fr-FR')
                    : '—'}
                </div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('coordinates')}</div>
                <div className="info-val" style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem' }}>
                  {selected.lat?.toFixed?.(4)}, {selected.lng?.toFixed?.(4)}
                </div>
              </div>
            </>
          ) : (
            <div className="empty">{t('selectApt')}</div>
          )}
        </div>
      </div>
    </>
  );
}
