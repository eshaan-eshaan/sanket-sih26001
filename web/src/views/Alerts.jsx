import React, { useState } from 'react';
import HazardBadge from '../components/HazardBadge.jsx';
import { ALERTS, ALERT_AUDIENCES, ALERT_LANGUAGES, ALERT_TEMPLATES, ZONES, DISTRICTS } from '../data/mockData.js';
import { IconBell, IconInfo } from '../components/icons.jsx';

const ALL_ZONES = Object.values(ZONES);
const STATE_NAMES = { MN: 'Manipur', AS: 'Assam', ML: 'Meghalaya', MZ: 'Mizoram', AR: 'Arunachal Pradesh', NL: 'Nagaland', SK: 'Sikkim', TR: 'Tripura' };

export default function Alerts({ role }) {
  const [alerts, setAlerts] = useState(ALERTS);
  const [zoneId, setZoneId] = useState('noney-a');
  const [severity, setSeverity] = useState('warning');
  const [audience, setAudience] = useState(new Set(['District authority']));
  const [langCode, setLangCode] = useState('en');
  const [generated, setGenerated] = useState(false);

  const canGenerate = role === 'district_officer';
  const zone = ZONES[zoneId];
  const district = zone ? Object.values(DISTRICTS).flat().find((d) => d.id === zone.district) : null;
  const stateName = district ? STATE_NAMES[district.state] : '';
  const langMeta = ALERT_LANGUAGES.find((l) => l.code === langCode);
  const t = ALERT_TEMPLATES[langCode] || ALERT_TEMPLATES.en;
  const severityLabel = t[severity] || severity.toUpperCase();

  function toggleAudience(a) {
    setAudience((prev) => {
      const next = new Set(prev);
      next.has(a) ? next.delete(a) : next.add(a);
      return next;
    });
  }

  function handleGenerate() {
    setAlerts((prev) => [
      {
        id: `alert-${prev.length + 1}`,
        severity,
        zone: zoneId,
        location: `${district?.name}, ${stateName}`,
        title: `${severityLabel} — ${district?.name}, ${stateName}`,
        body: t.body,
        audience: Array.from(audience),
        language: langMeta?.label || 'English',
        issuedAt: new Date().toISOString(),
        recipients: Math.floor(150 + Math.random() * 300),
        status: 'Delivered',
      },
      ...prev,
    ]);
    setGenerated(true);
    setTimeout(() => setGenerated(false), 2500);
  }

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start' }}>
      {/* Generation workflow — District Officer only, per docs/demo_sanket_text.md §14 */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 4 }}>Generate Alert</div>
        <div className="card-subtitle" style={{ marginBottom: 14 }}>Alert generation and preview. SMS dispatch infrastructure is out of scope for this prototype.</div>

        {!canGenerate ? (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', fontSize: 12.5, color: 'var(--text-muted)' }}>
            <IconInfo width={16} height={16} style={{ flex: 'none', marginTop: 1 }} />
            <div>
              <b style={{ color: 'var(--text-primary)' }}>Generating alerts requires District Officer access.</b>
              <div style={{ marginTop: 4 }}>Field Officers can view active alerts (right) but cannot issue them — matching the role split in the feature spec.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="section-label">1 · Zone</div>
            <select className="select-control" style={{ width: '100%', marginBottom: 14 }} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
              {ALL_ZONES.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>

            <div className="section-label">2 · Severity</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['watch', 'warning', 'danger'].map((s) => (
                <button
                  key={s}
                  className="btn"
                  style={{ flex: 1, justifyContent: 'center', borderColor: severity === s ? `var(--hazard-${s})` : undefined, color: severity === s ? `var(--hazard-${s})` : undefined }}
                  onClick={() => setSeverity(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="section-label">3 · Audience</div>
            <div style={{ marginBottom: 14 }}>
              {ALERT_AUDIENCES.map((a) => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-muted)', padding: '3px 0', cursor: 'pointer' }}>
                  <input type="checkbox" checked={audience.has(a)} onChange={() => toggleAudience(a)} />
                  {a}
                </label>
              ))}
            </div>

            <div className="section-label">4 · Language</div>
            <select className="select-control" style={{ width: '100%', marginBottom: 6 }} value={langCode} onChange={(e) => setLangCode(e.target.value)}>
              {ALERT_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} disabled={l.status === 'planned'}>
                  {l.label}{l.status === 'planned' ? ' (planned — not yet translated)' : ''}
                </option>
              ))}
            </select>
            <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginBottom: 16 }}>
              Only English and Hindi have a reviewed fixed-slot translation right now — see docs/HANDOFF.md §7a. Nothing here is machine-translated free text.
            </div>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGenerate}>
              <IconBell width={14} height={14} /> Generate Alert
            </button>
            {generated && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--hazard-normal)', textAlign: 'center' }}>Alert generated and added to the dashboard below.</div>}

            <div className="divider" />
            <div className="section-label">Preview{langCode !== 'en' ? ` — ${langMeta.label}` : ''}</div>
            <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: `var(--hazard-${severity}-wash)`, border: `1px solid var(--hazard-${severity})` }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 4, color: `var(--hazard-${severity})` }}>
                {severityLabel} — {district?.name}, {stateName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{t.body}</div>
            </div>
          </>
        )}
      </div>

      {/* Alert dashboard — visible to both roles */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}>Active Alerts</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>
              <th style={{ padding: '6px 8px' }}>Severity</th>
              <th style={{ padding: '6px 8px' }}>Location</th>
              <th style={{ padding: '6px 8px' }}>Issued</th>
              <th style={{ padding: '6px 8px' }}>Recipients</th>
              <th style={{ padding: '6px 8px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid var(--border-muted)' }}>
                <td style={{ padding: '9px 8px' }}><HazardBadge level={a.severity} size="sm" /></td>
                <td style={{ padding: '9px 8px', fontWeight: 600 }}>{a.location}</td>
                <td style={{ padding: '9px 8px', color: 'var(--text-muted)' }}>{new Date(a.issuedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '9px 8px', color: 'var(--text-muted)' }}>{a.recipients}</td>
                <td style={{ padding: '9px 8px', color: 'var(--hazard-normal)', fontWeight: 600 }}>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
