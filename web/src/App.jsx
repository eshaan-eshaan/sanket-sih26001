import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/Topbar.jsx';
import LiveTicker from './components/LiveTicker.jsx';
import DemoOverlay, { DEMO_STEPS } from './components/DemoOverlay.jsx';
import Dashboard from './views/Dashboard.jsx';
import GisRiskMap from './views/GisRiskMap.jsx';
import RiskMonitoring from './views/RiskMonitoring.jsx';
import FieldReports from './views/FieldReports.jsx';
import Alerts from './views/Alerts.jsx';
import ResponsePriorities from './views/ResponsePriorities.jsx';
import HistoricalBacktesting from './views/HistoricalBacktesting.jsx';
import FieldOfficerView from './views/FieldOfficerView.jsx';
import { getState, getDistrict, getZone, ALERT_LANGUAGES } from './data/mockData.js';

const TITLES = {
  dashboard: 'NER Regional Dashboard',
  'gis-map': 'GIS Risk Map',
  monitoring: 'Risk Monitoring',
  'field-reports': 'Field Reports',
  alerts: 'Alerts',
  priorities: 'Response Priorities',
  backtesting: 'Historical Backtesting',
  'field-officer': 'Field Officer — Report Submission',
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [role, setRole] = useState('district_officer');
  const [language, setLanguage] = useState('en');
  const [selection, setSelection] = useState({ stateId: 'MN', districtId: 'noney', zoneId: 'noney-a' });
  // Mobile-only: the sidebar becomes an overlay drawer below the breakpoint
  // in index.css. Harmless state on desktop — nothing reads it there.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persisted explicit choice, not prefers-color-scheme — a district
  // officer's theme pick should stick across sessions on their own machine,
  // not follow the OS. Wrapped in try/catch: localStorage can throw in a
  // locked-down browser context, and a theme toggle isn't worth a crash.
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('sanket-theme') || 'light'; } catch { return 'light'; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('sanket-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  // Guided demo — a scripted walkthrough of the Manipur/Noney "golden path"
  // (DemoOverlay.jsx). Each step is a real {view, selection} navigation, the
  // same shape goTo()/selectDistrict() already produce, so this doesn't
  // introduce a second, fake navigation path to keep in sync with the real one.
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoPaused, setDemoPaused] = useState(false);

  function applyDemoStep(i) {
    const step = DEMO_STEPS[i];
    if (!step) return;
    setSelection((s) => ({ ...s, ...step.selection }));
    setView(step.view);
  }
  function startDemo() {
    setDemoStep(0);
    applyDemoStep(0);
    setDemoPaused(false);
    setDemoActive(true);
  }
  function exitDemo() {
    setDemoActive(false);
  }
  function goToDemoStep(i) {
    const clamped = Math.max(0, Math.min(DEMO_STEPS.length - 1, i));
    applyDemoStep(clamped);
    setDemoStep(clamped);
  }
  function nextDemoStep() {
    if (demoStep >= DEMO_STEPS.length - 1) { setDemoActive(false); return; }
    goToDemoStep(demoStep + 1);
  }

  // Auto-advance timer — paused while the user has explicitly hit Pause, and
  // torn down whenever the active/paused/step state changes so there's never
  // more than one timer in flight (the classic stale-closure timer bug).
  useEffect(() => {
    if (!demoActive || demoPaused) return undefined;
    const step = DEMO_STEPS[demoStep];
    if (!step) return undefined;
    const t = setTimeout(nextDemoStep, step.duration);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive, demoPaused, demoStep]);

  const selectedState = useMemo(() => getState(selection.stateId), [selection.stateId]);
  const selectedDistrict = useMemo(() => (selection.districtId ? getDistrict(selection.districtId) : null), [selection.districtId]);
  const selectedZone = useMemo(() => (selection.zoneId ? getZone(selection.zoneId) : null), [selection.zoneId]);

  function goTo(nextView, partialSelection) {
    if (partialSelection) setSelection((s) => ({ ...s, ...partialSelection }));
    setView(nextView);
  }

  function selectState(stateId) {
    setSelection((s) => ({ ...s, stateId, districtId: null, zoneId: null }));
  }
  function selectDistrict(districtId) {
    const d = getDistrict(districtId);
    setSelection((s) => ({ ...s, districtId, stateId: d ? d.state : s.stateId, zoneId: null }));
  }
  function selectZone(zoneId) {
    const z = getZone(zoneId);
    setSelection((s) => ({ ...s, zoneId, districtId: z ? z.district : s.districtId, stateId: z ? z.state : s.stateId }));
  }

  const crumbs = useMemo(() => {
    const c = ['NER'];
    if (selectedState) c.push(selectedState.name);
    if (selectedDistrict) c.push(selectedDistrict.name);
    if (selectedZone && view !== 'dashboard') c.push(selectedZone.name);
    return c;
  }, [selectedState, selectedDistrict, selectedZone, view]);

  const langLabel = ALERT_LANGUAGES.find((l) => l.code === language)?.label || 'English';

  const commonProps = {
    role, language: langLabel,
    selection, selectedState, selectedDistrict, selectedZone,
    selectState, selectDistrict, selectZone, goTo,
    onStartDemo: startDemo,
  };

  return (
    <div className="app-shell">
      <Sidebar
        view={view}
        onNavigate={setView}
        role={role}
        onFieldView={() => { setRole('field_officer'); setView('field-officer'); }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {/* Always mounted (not conditionally rendered) so the opacity
          transition in index.css can animate both open and close, not just
          open. display:none outside the mobile breakpoint either way. */}
      <div className={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="main-col">
        <TopBar
          title={TITLES[view]}
          crumbs={view === 'field-officer' ? null : crumbs}
          role={role}
          onRoleChange={(r) => { setRole(r); if (r === 'field_officer') setView('field-officer'); else if (view === 'field-officer') setView('dashboard'); }}
          language={language}
          onLanguageChange={setLanguage}
          onSearchSelectDistrict={(id) => { selectDistrict(id); goTo('monitoring', { districtId: id }); }}
          onMenuClick={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />
        <div className={`content scrollbar-thin ${demoActive ? 'content--demo-active' : ''}`}>
          {view === 'dashboard' && <Dashboard {...commonProps} />}
          {view === 'gis-map' && <GisRiskMap {...commonProps} />}
          {view === 'monitoring' && <RiskMonitoring {...commonProps} />}
          {view === 'field-reports' && <FieldReports {...commonProps} />}
          {view === 'alerts' && <Alerts {...commonProps} />}
          {view === 'priorities' && <ResponsePriorities {...commonProps} />}
          {view === 'backtesting' && <HistoricalBacktesting {...commonProps} />}
          {view === 'field-officer' && <FieldOfficerView {...commonProps} />}
        </div>
      </div>
      <LiveTicker
        enabled={role === 'district_officer'}
        onOpenDistrict={(id) => { selectDistrict(id); goTo('monitoring', { districtId: id }); }}
      />
      {demoActive && (
        <DemoOverlay
          stepIndex={demoStep}
          paused={demoPaused}
          onNext={nextDemoStep}
          onPrev={() => goToDemoStep(demoStep - 1)}
          onPauseToggle={() => setDemoPaused((p) => !p)}
          onExit={exitDemo}
        />
      )}
    </div>
  );
}
