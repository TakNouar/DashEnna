import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';

function FitAlgeria() {
  const map = useMap();
  useEffect(() => {
    map.setView([28.5, 3.5], 5);
  }, [map]);
  return null;
}

export default function MapPage({ airports, stats }) {
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
        <div className="kpi"><div className="l">Aerodromes Total</div><div className="v">{stats?.total ?? '-'}</div><div className="d flat">Reseau National ENNA</div></div>
        <div className="kpi"><div className="l">Internationaux</div><div className="v">{stats?.intl ?? '-'}</div><div className="d flat">INTL</div></div>
        <div className="kpi"><div className="l">Nationaux</div><div className="v">{stats?.ntl ?? '-'}</div><div className="d flat">NTL</div></div>
        <div className="kpi"><div className="l">Regime H24</div><div className="v" style={{ color: 'var(--green)' }}>{stats?.h24 ?? '-'}</div><div className="d up">Service Continu</div></div>
        <div className="kpi"><div className="l">Regime H12</div><div className="v" style={{ color: 'var(--amber)' }}>{stats?.h12 ?? '-'}</div><div className="d flat">Service Diurne</div></div>
      </div>

      <div className="dsa-main-grid">
        <div>
          <div className="panel">
            <h3>Cartographie Aerodromes & Reseau DSA</h3>
            <div className="sub">Vert = H24 - Ambre = H12 - Codes OACI officiels AIS Algeria</div>
            <MapContainer center={[28.5, 3.5]} zoom={5} style={{ height: 420, borderRadius: 10 }} scrollWheelZoom>
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <FitAlgeria />
              {sorted.map((a) => (
                <CircleMarker
                  key={a.oaci}
                  center={[a.lat, a.lng]}
                  radius={a.horaire === 'H24' ? 8 : 6}
                  pathOptions={{
                    color: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillColor: a.horaire === 'H24' ? '#39d08c' : '#f5a623',
                    fillOpacity: 0.7,
                    weight: selected?.oaci === a.oaci ? 3 : 1,
                  }}
                  eventHandlers={{ click: () => setSelected(a) }}
                >
                  <Popup>
                    <strong>{a.name}</strong><br />
                    {a.oaci} - {a.dsa}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <div className="panel">
            <h3>Aerodromes & Rattachement DSA ({sorted.length})</h3>
            <div className="sub">Cliquer sur une ligne pour la fiche - Source: enna.dz + AIP</div>
            <div style={{ maxHeight: 360, overflow: 'auto' }}>
              <table className="apt-table">
                <thead>
                  <tr>
                    <th>OACI</th>
                    <th>Aerodrome</th>
                    <th>Type</th>
                    <th>DSA</th>
                    <th>Horaires</th>
                    <th>Trafic*</th>
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
                      <td>{a.traffic?.toLocaleString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 8 }}>
              * Trafic = moyenne mensuelle illustrative. Codes OACI verifies AIP Algeria.
            </p>
          </div>
        </div>

        <div className="info-card">
          {selected ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h2>{selected.name}</h2>
                  <div className="code-oaci">OACI: {selected.oaci}{selected.iata ? ` - IATA: ${selected.iata}` : ''}</div>
                </div>
                <span className={`badge${selected.horaire === 'H12' ? ' h12' : ''}`}>{selected.horaire}</span>
              </div>
              <div className="info-group" style={{ background: 'rgba(239,90,99,0.08)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(239,90,99,0.2)' }}>
                <div className="info-label" style={{ color: '#FF7675' }}>District DSA</div>
                <div className="info-val" style={{ fontWeight: 700 }}>{selected.dsa}</div>
              </div>
              <div className="info-group"><div className="info-label">Type / Categorie</div><div className="info-val">{selected.type} - {selected.cat}</div></div>
              <div className="info-group"><div className="info-label">Piste</div><div className="info-val">{selected.piste}</div></div>
              <div className="info-group"><div className="info-label">Frequences</div><div className="info-val">{selected.freq}</div></div>
              <div className="info-group"><div className="info-label">Navigation</div><div className="info-val">{selected.nav}</div></div>
              <div className="info-group"><div className="info-label">Carburant</div><div className="info-val">{selected.fuel}</div></div>
              <div className="info-group"><div className="info-label">Trafic mensuel (illustratif)</div><div className="info-val">{selected.traffic?.toLocaleString('fr-FR')}</div></div>
            </>
          ) : (
            <div className="empty">Selectionnez un aerodrome</div>
          )}
        </div>
      </div>
    </>
  );
}
