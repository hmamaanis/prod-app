'use client';
import { useState, useEffect } from 'react';
import { C, Ico } from './shared';

function ReasoningStep({ children, show, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (show) { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }
    else setVisible(false);
  }, [show, delay]);
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateX(0)' : 'translateX(-6px)',
      transition: 'all 260ms ease-out',
    }}>{children}</div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>{children}</div>
  );
}

const plans = {
  A: {
    title: "Swap to Cover Set — Nora's Apartment (INT)",
    saves: { time: 'No delay', cost: '$0', risk: 'Low' },
    summary: "Move scene 31 to Day 16. Shoot scenes 35 + 36 (INT, Nora's apartment) tomorrow instead — cast and light rig already on call.",
    impact: [
      'Scene 31 rescheduled to Apr 21 (currently 2nd unit day — swap planned)',
      'Scenes 35 + 36 pulled from Day 16',
      'Cast: Elena Vasquez, Priya Shah stay on call (unchanged)',
      'Aria Chen (child actor) — release for tomorrow, re-call Apr 21',
      'Lighting: reuse setup B from today with minor adjust',
    ],
    actions: [
      { id: 'notify', label: 'Notify 14 team members', detail: 'Call sheet diff auto-generated' },
      { id: 'cast', label: "Update Aria's agent", detail: 'Scheduled email — holds her Apr 21' },
      { id: 'loc', label: 'Cancel rooftop permit', detail: 'Refundable until tonight 22:00' },
      { id: 'light', label: 'Reassign lighting truck', detail: 'Route to base camp' },
      { id: 'cam', label: 'Regenerate shot list', detail: 'Pull 35+36 boards from scene file' },
    ],
  },
  B: {
    title: 'Rearrange: Shoot Rooftop in Morning Block',
    saves: { time: '+2.5h day', cost: '+$1.8K', risk: 'Med' },
    summary: 'Start tomorrow at 05:30 to wrap rooftop by 13:30 before rain. Requires shifting cast calls, catering, and location crew.',
    impact: [
      'Call time moves 06:30 → 05:30 (union OK — 10hr rest met)',
      'Scene 31 compressed: 8 shots → 6 shots (prioritize coverage)',
      'Lunch moves to 13:30',
      'Afternoon cover set for insert work',
      'Forecast confidence 70% — still residual weather risk',
    ],
    actions: [
      { id: 'notify', label: 'Push new call time to team', detail: '14 call sheets to regenerate' },
      { id: 'cast', label: 'Confirm cast availability 05:30', detail: 'DM Elena + Priya' },
      { id: 'cater', label: 'Move catering to 05:00 arrival', detail: 'Vendor confirm needed' },
      { id: 'shots', label: 'Trim shot list by 2', detail: 'AI suggests: drop S31-7, S31-8 (redundant coverage)' },
    ],
  },
};

export default function AIPlanPage({ open, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('A');
  const [appliedActions, setAppliedActions] = useState({});
  const [reasoning, setReasoning] = useState(false);

  useEffect(() => {
    if (open) setTimeout(() => setReasoning(true), 300);
    else { setReasoning(false); setAppliedActions({}); setSelectedPlan('A'); }
  }, [open]);

  const p = plans[selectedPlan];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(26,26,26,0.3)', backdropFilter: 'blur(4px)',
      opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
      transition: 'opacity 260ms',
      display: 'flex', justifyContent: 'flex-end',
    }}>
      <div style={{
        width: '90%', maxWidth: 980, height: '100%',
        background: C.bg,
        transform: open ? 'translateX(0)' : 'translateX(40px)',
        transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-20px 0 60px -10px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 32px 20px', borderBottom: `1px solid ${C.line}`, background: C.panel }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico.sparkle/></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.critical, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>AI PLAN · CRITICAL</span>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>triggered 09:43 · confidence 82%</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, lineHeight: 1.2 }}>
                Tomorrow's rooftop scene is at risk.
              </div>
              <div style={{ fontSize: 14, color: C.muted, marginTop: 6, lineHeight: 1.5, maxWidth: 680 }}>
                Forecast shifted at 09:41 — rain probability jumped 28% → 70% for 14:00–18:00. I've drafted two plans based on your schedule, cast availability, and cover-set options.
              </div>
            </div>
            <button onClick={onClose} style={{
              background: 'none', border: `1px solid ${C.line2}`, borderRadius: 6,
              width: 32, height: 32, cursor: 'pointer', color: C.muted,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Ico.x/></button>
          </div>
          <div style={{ marginTop: 16, padding: '12px 14px', background: C.bg, borderRadius: 8, border: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Reasoning</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: C.ink2, fontFamily: '"IBM Plex Mono", monospace' }}>
              <ReasoningStep delay={400} show={reasoning}>→ pulled forecast · NOAA Brooklyn station 14:00–18:00 pr=0.70</ReasoningStep>
              <ReasoningStep delay={900} show={reasoning}>→ matched scene 31 requires: clear sky, continuity w/ scene 30 (shot day 6, clear)</ReasoningStep>
              <ReasoningStep delay={1400} show={reasoning}>→ searched cover sets from script breakdown · 3 candidates</ReasoningStep>
              <ReasoningStep delay={1900} show={reasoning}>→ cross-checked cast availability · Elena & Priya on call; Aria not called tomorrow</ReasoningStep>
              <ReasoningStep delay={2400} show={reasoning}>→ modeled 2 plans · ranked by cost, time, creative continuity</ReasoningStep>
            </div>
          </div>
        </div>

        {/* Plan tabs */}
        <div style={{ padding: '16px 32px', background: C.panel, borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 10 }}>
          {Object.entries(plans).map(([k, pl]) => (
            <button key={k} onClick={() => { setSelectedPlan(k); setAppliedActions({}); }} style={{
              flex: 1, textAlign: 'left', cursor: 'pointer',
              background: selectedPlan === k ? C.ink : C.bg,
              color: selectedPlan === k ? '#fff' : C.ink,
              border: selectedPlan === k ? 'none' : `1px solid ${C.line2}`,
              borderRadius: 8, padding: '14px 16px',
              transition: 'all 160ms',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 4,
                  background: selectedPlan === k ? 'rgba(255,255,255,0.15)' : C.tint,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace',
                }}>{k}</span>
                <span style={{ fontSize: 11, opacity: 0.7, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Plan {k} · {pl.actions.length} actions
                </span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3, marginBottom: 8 }}>{pl.title}</div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11, opacity: 0.85, fontFamily: '"IBM Plex Mono", monospace' }}>
                <span>⏱ {pl.saves.time}</span><span>$ {pl.saves.cost}</span><span>△ risk {pl.saves.risk}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <SectionTitle>Summary</SectionTitle>
              <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.6, marginBottom: 24 }}>{p.summary}</div>
              <SectionTitle>Impact — what changes</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.impact.map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>
                    <span style={{ color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>{String(i+1).padStart(2,'0')}</span>
                    <span style={{ flex: 1 }}>{it}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionTitle>
                <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Actions — apply individually or all</span>
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'none', letterSpacing: 0 }}>
                    {Object.values(appliedActions).filter(Boolean).length} / {p.actions.length} applied
                  </span>
                </span>
              </SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {p.actions.map(a => {
                  const applied = appliedActions[a.id];
                  return (
                    <div key={a.id} style={{
                      background: applied ? '#F2F6F2' : C.panel,
                      border: `1px solid ${applied ? '#C8DCC8' : C.line}`,
                      borderRadius: 8, padding: '12px 14px',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      transition: 'all 200ms',
                    }}>
                      <button onClick={() => setAppliedActions(s => ({ ...s, [a.id]: !s[a.id] }))} style={{
                        width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                        border: applied ? 'none' : `1.5px solid ${C.line2}`,
                        background: applied ? C.ok : C.panel,
                        color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>{applied && <Ico.check/>}</button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 500, color: applied ? '#345734' : C.ink, textDecoration: applied ? 'line-through' : 'none', textDecorationColor: '#5A8F5A' }}>{a.label}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.4 }}>{a.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button onClick={() => {
                  const all = {}; p.actions.forEach(a => all[a.id] = true); setAppliedActions(all);
                }} style={{
                  flex: 1, background: C.ink, color: '#fff', border: 'none', borderRadius: 6,
                  padding: '11px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}><Ico.sparkle/>Apply plan {selectedPlan} — all actions</button>
                <button style={{
                  background: C.panel, color: C.ink, border: `1px solid ${C.line2}`, borderRadius: 6,
                  padding: '11px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>Save as draft</button>
              </div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 10, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
                Nothing is sent until you confirm · changes logged in Activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
