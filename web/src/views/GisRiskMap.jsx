import React, { useState } from 'react';
import NerMap, { DistrictZoneMap } from '../components/NerMap.jsx';
import HazardBadge from '../components/HazardBadge.jsx';
import { NER_STATES, DISTRICTS, ZONES, VILLAGES, ROADS, GIS_LAYERS } from '../data/mockData.js';
import { IconMapPin, IconVillage, IconRoad } from '../components/icons.jsx';

const LAYER_GROUPS = [
  { key: 'risk', label: 'Risk' },
  { key: 'geographical', label: 'Geographical' },
  { key: 'environmental', label: 'Environmental' },
  { key: 'disaster', label: 'Disaster' },
  { key: 'infrastructure', label: 'Infrastructure' },
];

export default function GisRiskMap({ selection, selectState, selectDistrict, selectZone, selectedZone, goTo }) {
  const [activeLayers, setActiveLayers] = useState(() => new Set(['Normal', 'Watch', 'Warning', 'Danger', 'State boundaries', 'District boundaries', 'Roads']));

  function toggleLayer(name) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  const districtsInState = selection.stateId ? DISTRICTS[selection.stateId] || [] : [];
  const selectedDistrictObj = districtsInState.find((d) => d.id === selection.districtId);
  const zonesInDistrict = selectedDistrictObj ? selectedDistrictObj.zones.map((zid) => ZONES[zid]).filter(Boolean) : [];

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', alignItems: 'start' }}>
      {/* Layer control */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Map Layers</div>
        {LAYER_GROUPS.map((g) => (
          <div key={g.key} style={{ marginBottom: 14 }}>
            <div className="section-label">{g.label}</div>
            {GIS_LAYERS[g.key].map((item) => (
              <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)', padding: '3px 0', cursor: 'pointer' }}>
                <input type="checkbox" checked={activeLayers.has(item)} onChange={() => toggleLayer(item)} />
                {item}
              </label>
            ))}
          </div>
        ))}
      </div>

      {/* Map canvas: drill down NER -> state -> district zones */}
      <div className="card" style={{ minHeight: 480 }}>
        {!selectedDistrictObj ? (
          <>
            <div className="card-head">
              <div>
                <div className="card-title">North Eastern Region</div>
                <div className="card-subtitle">Select a state, then a district, to reach zone-level detail</div>
              </div>
            </div>
            <NerMap states={NER_STATES} selectedId={selection.stateId} onSelect={selectState} />
            {selection.stateId && districtsInState.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="section-label">Districts in {NER_STATES.find((s) => s.id === selection.stateId)?.name}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {districtsInState.map((d) => (
                    <button key={d.id} className="btn" onClick={() => selectDistrict(d.id)}>
                      {d.name} <HazardBadge level={d.hazard} size="sm" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="card-head">
              <div>
                <div className="card-title">{selectedDistrictObj.name} — Risk Zones</div>
                <div className="card-subtitle">NER → {NER_STATES.find((s) => s.id === selectedDistrictObj.state)?.name} → {selectedDistrictObj.name}</div>
              </div>
              <button className="btn" style={{ fontSize: 11.5 }} onClick={() => selectDistrict(null)}>← Back to region</button>
            </div>
            <DistrictZoneMap
              district={selectedDistrictObj}
              zones={zonesInDistrict}
              selectedZoneId={selection.zoneId}
              onSelectZone={selectZone}
              activeLayers={activeLayers}
            />
          </>
        )}
      </div>

      {/* Zone detail panel */}
      <div className="card">
        {!selectedZone ? (
          <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
            Click a zone on the map to see its risk detail — rainfall, soil moisture, terrain, and what it affects.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconMapPin width={15} height={15} /> {selectedZone.name}
                </div>
              </div>
              <HazardBadge level={selectedZone.hazard} />
            </div>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Rainfall: <b style={{ color: 'var(--text-primary)' }}>{selectedDistrictObj?.environment.rainfall.current}</b>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Soil Moisture: <b style={{ color: 'var(--text-primary)' }}>{selectedDistrictObj?.environment.soilMoisture.level}</b>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
              Terrain: <b style={{ color: 'var(--text-primary)' }}>{selectedDistrictObj?.environment.terrain.slope}</b>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Vegetation: <b style={{ color: 'var(--text-primary)' }}>{selectedDistrictObj?.environment.vegetation.change}</b>
            </div>

            <div className="divider" />

            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconVillage width={13} height={13} /> Affected Villages ({selectedZone.villages.length})
            </div>
            {selectedZone.villages.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>None in this zone.</div>
            ) : (
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 12.5, color: 'var(--text-muted)' }}>
                {selectedZone.villages.map((vid) => <li key={vid}>{VILLAGES[vid]?.name}</li>)}
              </ul>
            )}

            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconRoad width={13} height={13} /> Roads at Risk ({selectedZone.roads.length})
            </div>
            {selectedZone.roads.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>None in this zone.</div>
            ) : (
              <ul style={{ margin: '0 0 12px', paddingLeft: 18, fontSize: 12.5, color: 'var(--text-muted)' }}>
                {selectedZone.roads.map((rid) => (
                  <li key={rid}>{ROADS[rid]?.name} — <span style={{ textTransform: 'capitalize' }}>{ROADS[rid]?.status.replace('-', ' ')}</span></li>
                ))}
              </ul>
            )}

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => goTo('monitoring')}>
              Open Full District Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
