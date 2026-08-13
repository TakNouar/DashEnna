import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useI18n } from '../i18n/I18nContext';

/** Algeria geographic bounds (slight padding) */
const ALGERIA_BOUNDS = [
  [18.8, -8.9], // SW
  [37.2, 12.2], // NE
];
const ALGERIA_CENTER = [28.0, 2.5];
const ALGERIA_ZOOM = 5.4;

function FitAlgeria({ airports }) {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(ALGERIA_BOUNDS);
    map.setMinZoom(5);
    map.setMaxZoom(12);
    map.options.maxBoundsViscosity = 1.0;
    if (airports?.length) {
      const lats = airports.map((a) => a.lat).filter((n) => typeof n === 'number');
      const lngs = airports.map((a) => a.lng).filter((n) => typeof n === 'number');
      if (lats.length && lngs.length) {
        const pad = 0.8;
        map.fitBounds(
          [
            [Math.min(...lats) - pad, Math.min(...lngs) - pad],
            [Math.max(...lats) + pad, Math.max(...lngs) + pad],
          ],
          { maxZoom: 6, padding: [24, 24] }
        );
        return;
      }
    }
    map.setView(ALGERIA_CENTER, ALGERIA_ZOOM);
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
              center={ALGERIA_CENTER}
              zoom={ALGERIA_ZOOM}
              minZoom={5}
              maxZoom={12}
              maxBounds={ALGERIA_BOUNDS}
              maxBoundsViscosity={1.0}
              style={{ height: 420, borderRadius: 10 }}
              scrollWheelZoom
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FitAlgeria airports={sorted} />
              {sorted.map((a) => (
                <CircleMarker
                  key={a.oaci}
                  center={[a.lat, a.lng]}
                  radius={a.horaire === 'H24' ? 8 : 6}
                  pathOptions={{
                    color: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillColor: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillOpacity: 0.75,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelected(a),
                  }}
                >
                  <Popup>
                    <strong>{a.name}</strong>
                    <br />
                    {a.oaci} · {a.horaire} · {a.type}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="info-card">
          {selected ? (
            <>
              <h2>{selected.name}</h2>
              <div className="code-oaci">{selected.oaci}</div>
              <div className="info-group">
                <div className="info-label">{t('type')}</div>
                <div className="info-val">{selected.type}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('schedule')}</div>
                <div className="info-val">
                  <span className={`badge ${selected.horaire === 'H12' ? 'h12' : ''}`}>
                    {selected.horaire}
                  </span>
                </div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('runway')}</div>
                <div className="info-val">{selected.piste || '—'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">{t('dsaRegion')}</div>
                <div className="info-val">{selected.dsa || '—'}</div>
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
            <p className="empty">{t('selectApt')}</p>
          )}
        </div>
      </div>
    </>
  );
}
