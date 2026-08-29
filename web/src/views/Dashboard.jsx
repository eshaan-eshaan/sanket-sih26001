import React, { useState, useMemo, useEffect } from 'react';
import KpiCard from '../components/KpiCard.jsx';
import HazardBadge from '../components/HazardBadge.jsx';
import NerMap from '../components/NerMap.jsx';
import { NER_STATES, NER_SUMMARY, DISTRICTS, HAZARD_LEVELS } from '../data/mockData.js';
import { IconMap, IconBell, IconCloudRain } from '../components/icons.jsx';

// Matches the severity ordering used elsewhere (e.g. PRIORITY_HAZARD_WEIGHT
// in mockData.js) — kept local here since that one isn't exported and this
// table only needs a sort order, not the full scoring weights.
const HAZARD_ORDER = { normal: 1, watch: 2, warning: 3, danger: 4 };

function sortRows(rows, sortKey, sortDir, accessors) {
  if (!sortKey) return rows;
  const get = accessors[sortKey];
  const sorted = [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

function SortHeader({ label, sortKeyName, activeKey, dir, onClick, style }) {
  const active = activeKey === sortKeyName;
  return (
    <th
      style={{ ...style, cursor: 'pointer', userSelect: 'none' }}
      onClick={() => onClick(sortKeyName)}
      title={`Sort by ${label}`}
    >
      {label} <span style={{ opacity: active ? 1 : 0.35 }}>{active ? (dir === 'asc' ? '▲' : '▼') : '↕'}</span>
    </th>
  );
}

function downloadCSV(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Dashboard({ selection, selectState, selectDistrict, goTo, onStartDemo }) {
  const [levelFilter, setLevelFilter] = useState('all');
  const [districtLevelFilter, setDistrictLevelFilter] = useState('all');
  const [compareIds, setCompareIds] = useState(() => new Set());
  const [tableSort, setTableSort] = useState({ key: null, dir: 'asc' });
  const [compareSort, setCompareSort] = useState({ key: null, dir: 'asc' });

  const filteredStates = useMemo(() => {
    if (levelFilter === 'all') return NER_STATES;
    return NER_STATES.filter((s) => s.zones[levelFilter] > 0);
  }, [levelFilter]);

  const selectedStateObj = NER_STATES.find((s) => s.id === selection.stateId);
  const districtsInState = selection.stateId ? DISTRICTS[selection.stateId] || [] : [];

  const districtLevelCounts = useMemo(() => {
    const counts = { all: districtsInState.length, normal: 0, watch: 0, warning: 0, danger: 0 };
    districtsInState.forEach((d) => { counts[d.hazard] = (counts[d.hazard] || 0) + 1; });
    return counts;
  }, [districtsInState]);

  const filteredDistricts = useMemo(() => {
    if (districtLevelFilter === 'all') return districtsInState;
    return districtsInState.filter((d) => d.hazard === districtLevelFilter);
  }, [districtsInState, districtLevelFilter]);

  // Switching states with a level filter still active would otherwise leave
  // the table silently empty (e.g. filtered to "danger" in one state, then
  // click a state with none) with no obvious reason why — reset on state change.
  // Compare selection resets too — a district id selected in one state has no
  // meaning once you've drilled into a different one.
  useEffect(() => { setDistrictLevelFilter('all'); setCompareIds(new Set()); }, [selection.stateId]);

  function toggleCompare(id) {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const allFilteredSelected = filteredDistricts.length > 0 && filteredDistricts.every((d) => compareIds.has(d.id));
  function toggleSelectAllFiltered() {
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        filteredDistricts.forEach((d) => next.delete(d.id));
      } else {
        filteredDistricts.forEach((d) => next.add(d.id));
      }
      return next;
    });
  }

  const compareDistricts = districtsInState.filter((d) => compareIds.has(d.id));

  const sortedDistricts = useMemo(() => sortRows(filteredDistricts, tableSort.key, tableSort.dir, {
    name: (d) => d.name,
    population: (d) => d.population,
    hazard: (d) => HAZARD_ORDER[d.hazard] || 0,
  }), [filteredDistricts, tableSort]);

  const sortedCompareDistricts = useMemo(() => sortRows(compareDistricts, compareSort.key, compareSort.dir, {
    name: (d) => d.name,
    hazard: (d) => HAZARD_ORDER[d.hazard] || 0,
    population: (d) => d.population,
    landslides: (d) => d.historicalLandslideCount,
    reports: (d) => d.activeFieldReports,
    alerts: (d) => d.activeAlerts,
  }), [compareDistricts, compareSort]);

  function handleTableSort(key) {
    setTableSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }
  function handleCompareSort(key) {
    setCompareSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }));
  }

  function exportComparisonCSV() {
    downloadCSV(
      `sanket-district-comparison-${selectedStateObj?.id || 'export'}.csv`,
      ['District', 'State', 'Hazard', 'Population', 'Historical Landslides', 'Field Reports', 'Active Alerts'],
      sortedCompareDistricts.map((d) => [d.name, selectedStateObj?.name || '', d.hazard, d.population, d.historicalLandslideCount, d.activeFieldReports, d.activeAlerts])
    );
  }

  return (
    <div>
      <div className="grid kpi-row" style={{ marginBottom: 16 }}>
        <KpiCard label="Monitored Districts" value={NER_SUMMARY.totalDistricts} />
        <KpiCard label="High-Risk Zones" value={NER_SUMMARY.zones.danger + NER_SUMMARY.zones.warning} tone="danger" />
        <KpiCard label="Active Warnings" value={NER_SUMMARY.activeWarnings} tone="warning" />
        <KpiCard label="Affected Villages" value={NER_SUMMARY.affectedVillages} />
        <KpiCard label="At-Risk Roads" value={NER_SUMMARY.atRiskRoads} />
        <KpiCard label="Critical Infra at Risk" value={NER_SUMMARY.criticalInfraAtRisk} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', marginBottom: 16, alignItems: 'start' }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">NER Status</div>
              <div className="card-subtitle">Click a state to drill in · filter by risk level</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                className={`btn ${levelFilter === 'all' ? 'primary' : ''}`}
                style={{ padding: '4px 9px', fontSize: 11 }}
                onClick={() => setLevelFilter('all')}
              >
                All
              </button>
              {HAZARD_LEVELS.map((lv) => (
                <button
                  key={lv}
                  className="btn"
                  style={{
                    padding: '4px 9px', fontSize: 11,
                    borderColor: levelFilter === lv ? `var(--hazard-${lv})` : undefined,
                    color: levelFilter === lv ? `var(--hazard-${lv})` : undefined,
                  }}
                  onClick={() => setLevelFilter(lv)}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
          <NerMap states={filteredStates} selectedId={selection.stateId} onSelect={selectState} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>Regional Summary</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <HazardBadge level="danger" size="sm" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{String(NER_SUMMARY.zones.danger).padStart(2, '0')}</span>
              <HazardBadge level="warning" size="sm" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{String(NER_SUMMARY.zones.warning).padStart(2, '0')}</span>
              <HazardBadge level="watch" size="sm" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{String(NER_SUMMARY.zones.watch).padStart(2, '0')}</span>
              <HazardBadge level="normal" size="sm" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>{String(NER_SUMMARY.zones.normal).padStart(3, '0')}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <div>Highest Risk: <b style={{ color: 'var(--text-primary)' }}>{NER_SUMMARY.highestRiskState}</b></div>
              <div>Most Affected: <b style={{ color: 'var(--text-primary)' }}>{NER_SUMMARY.mostAffectedDistrict} District</b></div>
              <div>Connectivity Alerts: <b style={{ color: 'var(--hazard-warning)' }}>{NER_SUMMARY.connectivityAlerts}</b></div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCloudRain width={15} height={15} /> Rainfall Summary
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8 }}>
              {NER_SUMMARY.currentRainfallSummary}
            </div>
          </div>

          <button className="btn primary" style={{ justifyContent: 'center' }} onClick={() => goTo('gis-map')}>
            <IconMap width={14} height={14} /> Open Detailed GIS Map
          </button>
          <button className="btn" style={{ justifyContent: 'center' }} onClick={() => goTo('alerts')}>
            <IconBell width={14} height={14} /> View Active Warnings
          </button>
          {onStartDemo && (
            <button className="btn" style={{ justifyContent: 'center', borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }} onClick={onStartDemo}>
              ▶ Play Guided Demo
            </button>
          )}
        </div>
      </div>

      {selectedStateObj && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{selectedStateObj.name} — Districts</div>
              <div className="card-subtitle">
                Click a row to open Risk Monitoring · tick the box to compare districts side by side
                {compareIds.size > 0 && (
                  <>
                    {' · '}
                    <b style={{ color: 'var(--text-primary)' }}>{compareIds.size} selected</b>
                    {' — '}
                    <a href="#" onClick={(e) => { e.preventDefault(); setCompareIds(new Set()); }} style={{ color: 'var(--accent)' }}>clear</a>
                  </>
                )}
              </div>
            </div>
            {districtsInState.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button
                  className={`btn ${districtLevelFilter === 'all' ? 'primary' : ''}`}
                  style={{ padding: '4px 9px', fontSize: 11 }}
                  onClick={() => setDistrictLevelFilter('all')}
                >
                  All <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7, marginLeft: 3 }}>{districtLevelCounts.all}</span>
                </button>
                {HAZARD_LEVELS.map((lv) => (
                  <button
                    key={lv}
                    className="btn"
                    style={{
                      padding: '4px 9px', fontSize: 11,
                      borderColor: districtLevelFilter === lv ? `var(--hazard-${lv})` : undefined,
                      color: districtLevelFilter === lv ? `var(--hazard-${lv})` : undefined,
                    }}
                    onClick={() => setDistrictLevelFilter(lv)}
                  >
                    {lv} <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.7, marginLeft: 3 }}>{districtLevelCounts[lv]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {districtsInState.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>No district-level detail loaded for this state in the prototype yet.</div>
          ) : filteredDistricts.length === 0 ? (
            <div style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>No districts at this risk level in {selectedStateObj.name}.</div>
          ) : (
            // The fixed columns alone (checkbox + District + Population +
            // Hazard + View) already total ~326px — comfortable at a normal
            // card width, but on a real phone (found at 375px) that leaves
            // Summary 0px, squeezing it back into the one-word-per-line
            // wrapping this table-layout:fixed change was originally meant to
            // fix. Same remedy as the district-comparison table below: give
            // it a sane minimum width and let a scroll wrapper handle
            // anything narrower, instead of squeezing Summary to nothing.
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 12.5, tableLayout: 'fixed' }}>
              {/* Fixed layout + explicit column shares, so Summary — by far the
                  longest content — gets a guaranteed proportion of the table
                  width instead of whatever's left after District/Population/
                  Hazard/View claim their (much smaller) natural width. Without
                  this, auto layout starved Summary down to ~80px and wrapped
                  it one word per line. */}
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: '76px' }} />
                {/* 82px, not the 64px first tried: the largest real population
                    in the mock data (825,000 → "8,25,000") needs it — a
                    silently clipped number is worse than a slightly narrower
                    Summary column, since it could read as a smaller real value.
                    Bumped from 78 to 82 when the sortable-column arrow (▼)
                    pushed the header 2px past its own cell. */}
                <col style={{ width: '82px' }} />
                <col style={{ width: '92px' }} />
                {/* Summary gets no fixed width — it's the one column that should
                    absorb whatever's left, since it carries by far the most text. */}
                <col />
                <col style={{ width: '50px' }} />
              </colgroup>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  <th style={{ padding: '6px 8px' }}>
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      aria-label="Select all districts in view for comparison"
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <SortHeader label="District" sortKeyName="name" activeKey={tableSort.key} dir={tableSort.dir} style={{ padding: '6px 8px' }} onClick={handleTableSort} />
                  <SortHeader label="Population" sortKeyName="population" activeKey={tableSort.key} dir={tableSort.dir} style={{ padding: '6px 8px' }} onClick={handleTableSort} />
                  <SortHeader label="Hazard" sortKeyName="hazard" activeKey={tableSort.key} dir={tableSort.dir} style={{ padding: '6px 8px' }} onClick={handleTableSort} />
                  <th style={{ padding: '6px 8px' }}>Summary</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedDistricts.map((d) => (
                  <tr key={d.id} style={{ borderTop: '1px solid var(--border-muted)', cursor: 'pointer' }} onClick={() => { selectDistrict(d.id); goTo('monitoring', { districtId: d.id }); }}>
                    <td style={{ padding: '9px 8px' }} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={compareIds.has(d.id)}
                        onChange={() => toggleCompare(d.id)}
                        aria-label={`Select ${d.name} for comparison`}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '9px 8px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</td>
                    <td style={{ padding: '9px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>{d.population.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 8px', overflow: 'hidden' }}><HazardBadge level={d.hazard} size="sm" /></td>
                    <td style={{ padding: '9px 8px', color: 'var(--text-muted)' }}>{d.summary}</td>
                    <td style={{ padding: '9px 8px', color: 'var(--accent)', fontWeight: 600, whiteSpace: 'nowrap' }}>View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {compareDistricts.length >= 2 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-head">
            <div>
              <div className="card-title">Comparing {compareDistricts.length} Districts</div>
              <div className="card-subtitle">Side by side — hazard, population, and recent activity</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn" style={{ padding: '4px 9px', fontSize: 11 }} onClick={exportComparisonCSV}>
                Export CSV
              </button>
              <button className="btn" style={{ padding: '4px 9px', fontSize: 11 }} onClick={() => setCompareIds(new Set())}>
                Clear all
              </button>
            </div>
          </div>
          {/* This table's column widths are all fixed (unlike the main
              District table above, which has one flexible Summary column) —
              there's no single "let it absorb the rest" column here, so
              instead of squeezing everything to fit the card, give the table
              a fixed natural width (the exact sum of its columns) and let a
              scrolling wrapper handle any card narrower than that. */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: 642, borderCollapse: 'collapse', fontSize: 12.5, tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '30px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '92px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '110px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '50px' }} />
              </colgroup>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                  <th style={{ padding: '6px 8px' }} />
                  <SortHeader label="District" sortKeyName="name" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <SortHeader label="Hazard" sortKeyName="hazard" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <SortHeader label="Population" sortKeyName="population" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <SortHeader label="Landslides" sortKeyName="landslides" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <SortHeader label="Reports" sortKeyName="reports" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <SortHeader label="Alerts" sortKeyName="alerts" activeKey={compareSort.key} dir={compareSort.dir} style={{ padding: '6px 8px' }} onClick={handleCompareSort} />
                  <th />
                </tr>
              </thead>
              <tbody>
                {sortedCompareDistricts.map((d) => (
                  <tr key={d.id} style={{ borderTop: '1px solid var(--border-muted)' }}>
                    <td style={{ padding: '9px 8px' }}>
                      <button
                        onClick={() => toggleCompare(d.id)}
                        aria-label={`Remove ${d.name} from comparison`}
                        title="Remove from comparison"
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-dim)',
                          fontSize: 15, lineHeight: 1, padding: 0,
                        }}
                      >
                        ×
                      </button>
                    </td>
                    <td style={{ padding: '9px 8px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</td>
                    <td style={{ padding: '9px 8px', overflow: 'hidden' }}><HazardBadge level={d.hazard} size="sm" /></td>
                    <td style={{ padding: '9px 8px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>{d.population.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '9px 8px', color: 'var(--text-muted)' }}>{d.historicalLandslideCount}</td>
                    <td style={{ padding: '9px 8px', color: 'var(--text-muted)' }}>{d.activeFieldReports}</td>
                    <td style={{ padding: '9px 8px', color: d.activeAlerts > 0 ? 'var(--hazard-warning)' : 'var(--text-muted)', fontWeight: d.activeAlerts > 0 ? 600 : 400 }}>{d.activeAlerts}</td>
                    <td style={{ padding: '9px 8px', whiteSpace: 'nowrap' }}>
                      <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); selectDistrict(d.id); goTo('monitoring', { districtId: d.id }); }}
                        style={{ color: 'var(--accent)', fontWeight: 600 }}
                      >
                        View →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
