import React, { useMemo } from 'react';
import HazardBadge from '../components/HazardBadge.jsx';
import { DistrictZoneMap } from '../components/NerMap.jsx';
import Sparkline from '../components/Sparkline.jsx';
import {
  ZONES, VILLAGES, ROADS, INFRASTRUCTURE, SATELLITE_DETECTIONS, FIELD_EVIDENCE, mulberry32, seedFromString,
} from '../data/mockData.js';
import {
  IconCloudRain, IconDroplet, IconLeaf, IconMountain, IconSatellite, IconCamera, IconInfo, IconVillage, IconRoad, IconUpload,
} from '../components/icons.jsx';

const RISK_LEVEL_WIDTH = { low: '30%', moderate: '60%', high: '92%' };
const RISK_LEVEL_LABEL = { low: 'LOW', moderate: 'MODERATE', high: 'HIGH' };

// Only h24/h72/d7 rainfall totals and a qualitative soil-moisture level exist
// in the mock data — not a real daily timeseries. Rather than fabricate one
// from nothing, this derives a deterministic 7-point shape that (a) is
// seeded by district id so it's stable across re-renders, not random noise
// on every render, and (b) is anchored so its last point equals the real
// current figure and its overall direction matches the real `trend` field —
// it's an illustration of a real trend, not an invented one.
const SOIL_INDEX = {
  LOW: 22, NORMAL: 30, MODERATE: 45, ELEVATED: 68, HIGH: 80, SATURATED: 92,
};

function buildSeries(seed, trend, endValue, spread) {
  const rand = mulberry32(seedFromString(seed));
  const pts = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    let base = endValue;
    if (trend === 'rising') base = endValue * (0.55 + t * 0.45);
    else if (trend === 'falling') base = endValue * (1.45 - t * 0.45);
    else base = endValue * (0.9 + t * 0.1);
    pts.push(Math.max(0, base + (rand() - 0.5) * spread));
  }
  pts[6] = endValue;
  return pts;
}

// Related News & Bulletins — deliberately NOT fabricated as real journalism.
// This prototype has no live news integration, and inventing headlines
// attributed to real news outlets (or dramatic, specific claims — deaths,
// exact damage) about real Indian districts would misrepresent both the
// prototype's actual capability and, worse, could read as a real report
// about a real place if this were ever screenshotted out of context. So:
// mundane, procedural phrasing only, a generic "sample bulletin" byline
// (never a real outlet name), relative timestamps (never a specific real
// date), and an explicit MVP flag + caption on the card itself — same
// discipline already applied to satellite detection / field evidence
// elsewhere in this file.
const NEWS_TEMPLATES = [
  (ctx) => `District administration issues advisory for hill-cut sections near ${ctx.place}`,
  (ctx) => `${ctx.roadName || 'Local approach roads'} flagged for monitoring after recent rainfall`,
  (ctx) => `Village council requests slope inspection near ${ctx.place}`,
  (ctx) => `State disaster management cell conducts routine survey over ${ctx.districtName}`,
  (ctx) => `Minor debris reported on approach road near ${ctx.place} — under review`,
];

function buildNewsBulletins(seed, district, zone) {
  const rand = mulberry32(seedFromString(seed));
  const villageNames = (zone?.villages || []).map((v) => VILLAGES[v]?.name).filter(Boolean);
  const roadNames = (zone?.roads || []).map((r) => ROADS[r]?.name).filter(Boolean);
  const ctx = { place: villageNames[0] || district.name, roadName: roadNames[0], districtName: district.name };

  const count = 2 + Math.floor(rand() * 2); // 2–3 items
  const usedTemplates = new Set();
  const items = [];
  while (items.length < count && usedTemplates.size < NEWS_TEMPLATES.length) {
    const idx = Math.floor(rand() * NEWS_TEMPLATES.length);
    if (usedTemplates.has(idx)) continue;
    usedTemplates.add(idx);
    const daysAgo = 1 + Math.floor(rand() * 7);
    items.push({ text: NEWS_TEMPLATES[idx](ctx), daysAgo });
  }
  return items.sort((a, b) => a.daysAgo - b.daysAgo);
}

function RiskBar({ label, level }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: level === 'high' ? 'var(--hazard-danger)' : level === 'moderate' ? 'var(--hazard-warning)' : 'var(--hazard-normal)' }}>
          {RISK_LEVEL_LABEL[level]}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: RISK_LEVEL_WIDTH[level],
          background: level === 'high' ? 'var(--hazard-danger)' : level === 'moderate' ? 'var(--hazard-warning)' : 'var(--hazard-normal)',
        }} />
      </div>
    </div>
  );
}

export default function RiskMonitoring({ selectedDistrict, selectedZone, selectZone }) {
  const zonesInDistrict = useMemo(
    () => (selectedDistrict ? selectedDistrict.zones.map((zid) => ZONES[zid]).filter(Boolean) : []),
    [selectedDistrict]
  );

  // Hooks must run unconditionally (before the early return below), so these
  // guard internally rather than being skipped when no district is selected.
  const rainfallSeries = useMemo(() => {
    if (!selectedDistrict) return [];
    const rf = selectedDistrict.environment.rainfall;
    return buildSeries(`${selectedDistrict.id}:rainfall`, rf.trend, rf.h24, Math.max(rf.h24 * 0.35, 5));
  }, [selectedDistrict]);

  const soilSeries = useMemo(() => {
    if (!selectedDistrict) return [];
    const sm = selectedDistrict.environment.soilMoisture;
    return buildSeries(`${selectedDistrict.id}:soil`, sm.trend, SOIL_INDEX[sm.level] ?? 50, 8);
  }, [selectedDistrict]);

  if (!selectedDistrict) {
    return (
      <div className="card">
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
          No district selected. Choose one from the Dashboard or GIS Risk Map.
        </div>
      </div>
    );
  }

  const zone = selectedZone && zonesInDistrict.some((z) => z.id === selectedZone.id) ? selectedZone : zonesInDistrict[0];
  const env = selectedDistrict.environment;
  const satDetection = SATELLITE_DETECTIONS.find((s) => s.zone === zone?.id);
  const evidence = FIELD_EVIDENCE.filter((e) => e.zone === zone?.id);
  const newsBulletins = zone ? buildNewsBulletins(`${zone.id}:news`, selectedDistrict, zone) : [];

  return (
    <div>
      {/* Shown only when printing (window.print(), triggered by the Export
          button below) — stands in for the sidebar/topbar, which are hidden
          on paper. See the @media print rules in index.css. */}
      <div className="print-only" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>SANKET — Situation Report</div>
        <div style={{ fontSize: 12, color: '#555' }}>
          {selectedDistrict.name} District · Generated {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · Prototype build, mock data
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="card-title" style={{ fontSize: 16 }}>{selectedDistrict.name} District</div>
            <div className="card-subtitle">Population {selectedDistrict.population.toLocaleString('en-IN')} · {selectedDistrict.historicalLandslideCount} historical landslides on record</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button className="btn" onClick={() => window.print()} title="Opens your browser's print dialog — choose 'Save as PDF' for a file">
              <IconUpload width={13} height={13} /> Export Situation Report
            </button>
            <HazardBadge level={selectedDistrict.hazard} />
          </div>
        </div>
        <div className="divider" style={{ margin: '12px 0' }} />
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedDistrict.summary}</div>
      </div>

      {zonesInDistrict.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {zonesInDistrict.map((z) => (
            <button
              key={z.id}
              className="btn"
              style={{ borderColor: zone?.id === z.id ? 'var(--accent)' : undefined, color: zone?.id === z.id ? 'var(--accent)' : undefined }}
              onClick={() => selectZone(z.id)}
            >
              {z.name.replace(selectedDistrict.name, '').trim()} <HazardBadge level={z.hazard} size="sm" />
            </button>
          ))}
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Environmental monitoring */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>Environmental Monitoring</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
              <div className="kpi-card" style={{ padding: '10px 12px' }}>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCloudRain width={11} height={11} /> Rainfall</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{env.rainfall.current}</div>
                <div className="kpi-sub">24h {env.rainfall.h24}{env.rainfall.unit} · 72h {env.rainfall.h72}{env.rainfall.unit} · 7d {env.rainfall.d7}{env.rainfall.unit}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkline values={rainfallSeries} color="var(--accent-2)" />
                  <span style={{ fontSize: 9.5, color: 'var(--text-dim)' }}>7d shape</span>
                </div>
              </div>
              <div className="kpi-card" style={{ padding: '10px 12px' }}>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconDroplet width={11} height={11} /> Soil Moisture</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{env.soilMoisture.level}</div>
                <div className="kpi-sub">{env.soilMoisture.note}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkline values={soilSeries} color="var(--accent-2)" />
                  <span style={{ fontSize: 9.5, color: 'var(--text-dim)' }}>7d shape</span>
                </div>
              </div>
              <div className="kpi-card" style={{ padding: '10px 12px' }}>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconLeaf width={11} height={11} /> Vegetation</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{env.vegetation.density}</div>
                <div className="kpi-sub">NDVI {env.vegetation.ndvi} · {env.vegetation.change}</div>
              </div>
              <div className="kpi-card" style={{ padding: '10px 12px' }}>
                <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconMountain width={11} height={11} /> Terrain</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{env.terrain.slope}</div>
                <div className="kpi-sub">{env.terrain.elevation} · {env.terrain.drainage}</div>
              </div>
            </div>
          </div>

          {/* AI Risk Assessment Interface */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">AI Risk Assessment</div>
                <div className="card-subtitle">This interface represents the final AI-driven risk assessment module.</div>
              </div>
              <span className="mvp-flag">PREDEFINED RULES — MVP</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  <th style={{ padding: '5px 8px' }}>Factor</th>
                  <th style={{ padding: '5px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {zone?.aiAssessment.map((row) => (
                  <tr key={row.factor} style={{ borderTop: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '7px 8px' }}>{row.factor}</td>
                    <td style={{ padding: '7px 8px', fontWeight: 600, color: row.status === 'High' ? 'var(--hazard-danger)' : row.status === 'Elevated' || row.status === 'Reduced' || row.status === 'Moderate' ? 'var(--hazard-warning)' : 'var(--text-primary)' }}>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', background: `var(--hazard-${zone?.finalOutput.level}-wash)` }}>
              <HazardBadge level={zone?.finalOutput.level} />
              <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{zone?.finalOutput.note}</span>
            </div>
          </div>

          {/* Landslide & change detection */}
          <div className="card">
            <div className="card-head">
              <div className="card-title">Landslide &amp; Change Detection</div>
              <span className="mvp-flag">SAMPLE DATA — MVP</span>
            </div>

            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconSatellite width={13} height={13} /> Satellite Detection
            </div>
            {satDetection ? (
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: 14, fontSize: 11.5, color: 'var(--text-dim)', textAlign: 'center', minHeight: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>BEFORE</div>
                  {satDetection.beforeLabel}
                </div>
                <div style={{ background: 'var(--hazard-danger-wash)', border: '1px dashed var(--hazard-danger)', borderRadius: 'var(--radius-md)', padding: 14, fontSize: 11.5, color: 'var(--hazard-danger)', textAlign: 'center', minHeight: 90, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>AFTER — SCAR DETECTED</div>
                  {satDetection.afterLabel}
                  <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)' }}>{satDetection.detectedArea} · {(satDetection.confidence * 100).toFixed(0)}% confidence</div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14 }}>No satellite detection loaded for this zone.</div>
            )}

            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <IconCamera width={13} height={13} /> Field Evidence
            </div>
            {evidence.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No field reports for this zone yet.</div>
            ) : (
              evidence.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', marginBottom: 6, fontSize: 12 }}>
                  <div>
                    <b>{e.reportId}</b> — {e.reportType}
                    <div style={{ color: 'var(--text-dim)', fontSize: 10.5 }}>{e.cvLabelsPreview.map((l) => `${l.label} ${(l.confidence * 100).toFixed(0)}%`).join(' · ')}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{e.status}</span>
                </div>
              ))
            )}
          </div>

          {/* Related News & Bulletins */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">Related News &amp; Bulletins</div>
                <div className="card-subtitle">Local advisories and road-status mentions for {zone?.name}</div>
              </div>
              <span className="mvp-flag">SAMPLE DATA — MVP</span>
            </div>
            {newsBulletins.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No bulletins for this zone.</div>
            ) : (
              newsBulletins.map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0',
                    borderTop: i > 0 ? '1px solid var(--border-muted)' : 'none', fontSize: 12.5,
                  }}
                >
                  <span style={{ color: 'var(--text-primary)' }}>{n.text}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{n.daysAgo === 1 ? '1 day ago' : `${n.daysAgo} days ago`}</span>
                </div>
              ))
            )}
            <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 10 }}>
              Illustrative only — no live news feed is wired into this prototype. In production this would pull from a news/GDELT API filtered by district name + landslide/road-closure keywords.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Risk explanation */}
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <IconInfo width={15} height={15} /> Why Is This Area at Risk?
            </div>
            <div className="card-subtitle">Ranked contributing factors for {zone?.name}</div>
            <div style={{ marginTop: 12 }}>
              {zone?.riskFactors.map((f) => <RiskBar key={f.factor} label={f.factor} level={f.level} />)}
            </div>
          </div>

          {/* Risk-zone map */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Risk-Zone Map</div>
            <DistrictZoneMap district={selectedDistrict} zones={zonesInDistrict} selectedZoneId={zone?.id} onSelectZone={selectZone} />
          </div>

          {/* Exposure summary */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 10 }}>Exposure — {zone?.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconVillage width={13} height={13} />
                {zone?.villages.length} villages: {zone?.villages.map((v) => VILLAGES[v]?.name).join(', ') || '—'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconRoad width={13} height={13} />
                {zone?.roads.length} {zone?.roads.length === 1 ? 'road' : 'roads'}: {zone?.roads.map((r) => ROADS[r]?.name).join(', ') || '—'}
              </div>
              {zone?.infrastructure.length > 0 && (
                <div>Critical infra: {zone.infrastructure.map((i) => INFRASTRUCTURE[i]?.name).join(', ')}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
