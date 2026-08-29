import React, { useState, useEffect, useRef } from 'react';
import HazardBadge from '../components/HazardBadge.jsx';
import { BACKTEST_EVENTS } from '../data/mockData.js';
import { IconHistory, IconClock, IconCloudRain, IconDroplet } from '../components/icons.jsx';

export default function HistoricalBacktesting() {
  const event = BACKTEST_EVENTS[0];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= event.timeline.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(timerRef.current);
  }, [playing, event.timeline.length]);

  const point = event.timeline[step];
  const maxRainfall = Math.max(...event.timeline.map((t) => t.rainfall));

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-head">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <IconHistory width={16} height={16} /> {event.name}
            </div>
            <div className="card-subtitle">{event.location} · {event.date}</div>
          </div>
          <span className="mvp-flag">REPLAYED FROM ARCHIVED DATA</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{event.summary}</div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Risk Progression — {step === event.timeline.length - 1 ? 'Event Day' : `${Math.abs(point.dayOffset)} Days Before`}</div>
            <button className="btn primary" onClick={() => { if (step >= event.timeline.length - 1) setStep(0); setPlaying((p) => !p); }}>
              {playing ? 'Pause' : step >= event.timeline.length - 1 ? 'Replay' : 'Play'}
            </button>
          </div>

          <input
            type="range" min={0} max={event.timeline.length - 1} step={1} value={step}
            onChange={(e) => { setPlaying(false); setStep(Number(e.target.value)); }}
            style={{ width: '100%', margin: '8px 0 20px' }}
          />

          {/* Timeline stepper */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: 9, left: 10, right: 10, height: 2, background: 'var(--border)' }} />
            {event.timeline.map((t, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, cursor: 'pointer' }} onClick={() => { setPlaying(false); setStep(i); }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: i <= step ? `var(--hazard-${t.level})` : 'var(--surface)',
                  border: `2px solid ${i <= step ? `var(--hazard-${t.level})` : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.actualEvent && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>
                  {t.dayOffset === 0 ? 'EVENT' : `D-${Math.abs(t.dayOffset)}`}
                </div>
              </div>
            ))}
          </div>

          {/* Current point detail */}
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
            <div className="kpi-card" style={{ padding: '10px 12px' }}>
              <div className="kpi-label">Hazard Level</div>
              <div style={{ marginTop: 4 }}><HazardBadge level={point.level} /></div>
            </div>
            <div className="kpi-card" style={{ padding: '10px 12px' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCloudRain width={11} height={11} /> Rainfall</div>
              <div className="kpi-value" style={{ fontSize: 20 }}>{point.rainfall}<span style={{ fontSize: 12 }}>mm</span></div>
              <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, marginTop: 6 }}>
                <div style={{ height: '100%', width: `${(point.rainfall / maxRainfall) * 100}%`, background: 'var(--accent)', borderRadius: 2 }} />
              </div>
            </div>
            <div className="kpi-card" style={{ padding: '10px 12px' }}>
              <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconDroplet width={11} height={11} /> Soil Moisture</div>
              <div className="kpi-value" style={{ fontSize: 18 }}>{point.soilMoisture}</div>
            </div>
          </div>

          {point.actualEvent && (
            <div style={{ marginTop: 16, padding: 12, background: 'var(--hazard-danger-wash)', border: '1px solid var(--hazard-danger)', borderRadius: 'var(--radius-md)', fontSize: 12.5, color: 'var(--hazard-danger)', fontWeight: 600 }}>
              This is the actual recorded event — the landslide occurred on this day.
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <IconClock width={15} height={15} /> Warning Lead Time
          </div>
          <div className="card-subtitle">The whole point of backtesting — not "our system predicts landslides," but "here is how it can be evaluated against a real event."</div>

          {event.leadTimeStatus === 'placeholder' ? (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', border: '1px dashed var(--text-dim)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-dim)', fontWeight: 700 }}>PENDING CALCULATION</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.5 }}>
                This number is only shown once genuinely calculated by running the trained susceptibility + rainfall-trigger model against this window's archived data (docs/FEATURES.md F7.1). Not fabricated for the demo.
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <div className="kpi-value" style={{ fontSize: 32 }}>{event.leadTimeHours}h</div>
              <div className="kpi-sub">before the recorded event</div>
            </div>
          )}

          <div className="divider" />
          <div className="section-label">Why this matters</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            The timeline above shows the hazard level escalating from Normal through Watch and Warning to Danger, using only rainfall and soil-moisture data that existed <i>before</i> 29 June 2022. That is the evidence a geologist can check independently — not a claim taken on trust.
          </div>
        </div>
      </div>
    </div>
  );
}
