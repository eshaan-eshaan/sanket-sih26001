import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DISTRICTS, NER_STATES } from '../data/mockData.js';
import HazardBadge from './HazardBadge.jsx';

// Computed once at module load, not per-render — DISTRICTS is static mock
// data, so there's no reason to re-flatten all 118 districts on every keystroke.
const ALL_DISTRICTS = Object.values(DISTRICTS).flat();

function stateName(code) {
  return NER_STATES.find((s) => s.id === code)?.name || code;
}

// Jump-to-district search, mounted once in the topbar so it's reachable from
// every view — finding one of 118 districts previously meant state → click →
// scroll a table. Only rendered for district_officer (see TopBar.jsx): it
// navigates to Risk Monitoring, which field_officer doesn't have access to
// (NAV_ROLE_ACCESS in mockData.js) — the search shouldn't offer a shortcut
// around a restriction the rest of the UI enforces.
export default function GlobalSearch({ onSelectDistrict }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_DISTRICTS.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function pick(d) {
    onSelectDistrict(d.id);
    setQuery('');
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && results.length > 0) {
      pick(results[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      e.currentTarget.blur();
    }
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Jump to district…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="select-control"
        style={{ width: 130 }}
        aria-label="Search for a district"
      />
      {open && query.trim() && (
        <div className="global-search-results">
          {results.length > 0 ? (
            results.map((d) => (
              <div key={d.id} className="global-search-result" onClick={() => pick(d)}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 12.5 }}>{d.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>{stateName(d.state)}</div>
                </div>
                <HazardBadge level={d.hazard} size="sm" />
              </div>
            ))
          ) : (
            <div style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-dim)' }}>No districts match "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
}
