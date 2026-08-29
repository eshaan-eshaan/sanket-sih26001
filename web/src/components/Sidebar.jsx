import React from 'react';
import { NAV_ITEMS, NAV_ROLE_ACCESS, ROLES } from '../data/mockData.js';
import { IconGrid, IconMap, IconMonitor, IconCamera, IconBell, IconList, IconHistory, IconUser, IconLock } from './icons.jsx';

const ICONS = {
  dashboard: IconGrid,
  'gis-map': IconMap,
  monitoring: IconMonitor,
  'field-reports': IconCamera,
  alerts: IconBell,
  priorities: IconList,
  backtesting: IconHistory,
};

export default function Sidebar({ view, onNavigate, role, onFieldView, open, onClose }) {
  const allowed = (navId) => (NAV_ROLE_ACCESS[navId] || []).includes(role);

  // On mobile the sidebar is an overlay drawer (see the @media block in
  // index.css) — picking a destination should also close it, otherwise it
  // stays covering the screen after navigating. onClose is undefined/no-op
  // on desktop where there's nothing to close, so this is safe everywhere.
  function navigate(id) {
    onNavigate(id);
    onClose?.();
  }

  return (
    <nav className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="mark">S</div>
        <div>
          <div className="name">SANKET</div>
          <div className="tag">Landslide Early Warning</div>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">×</button>
      </div>

      <ul className="nav-list">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.id];
          const isAllowed = allowed(item.id);
          return (
            <li key={item.id}>
              <button
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                style={!isAllowed ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                disabled={!isAllowed}
                title={!isAllowed ? `Requires District Officer access` : undefined}
                onClick={() => isAllowed && navigate(item.id)}
              >
                {isAllowed ? <Icon /> : <IconLock />}
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="divider" style={{ margin: '14px 20px' }} />

      <div style={{ padding: '0 10px' }}>
        <button className={`nav-item ${view === 'field-officer' ? 'active' : ''}`} onClick={() => { onFieldView(); onClose?.(); }}>
          <IconUser />
          Field Officer View
        </button>
      </div>

      <div className="sidebar-footer">
        Role: <b style={{ color: 'var(--text-muted)' }}>{ROLES[role]?.label}</b>
        <div style={{ marginTop: 4, fontSize: 10.5, lineHeight: 1.5 }}>
          Can: {ROLES[role]?.can.join(' · ')}
        </div>
        <div style={{ marginTop: 8 }}>Prototype build — hardcoded data</div>
      </div>
    </nav>
  );
}
