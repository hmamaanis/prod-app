'use client';
import { useState, useEffect } from 'react';
import { C, Ico } from './shared';
import { getInsights, dismissInsight } from '@/lib/api';

const sevMap = {
  critical: { c: C.critical, bg: '#EBEFFB', label: 'CRITICAL' },
  warn:     { c: C.warn,     bg: '#F5EBD6', label: 'WATCH' },
  info:     { c: C.accent,   bg: '#FCEFDC', label: 'IDEA' },
};

const FALLBACK = [
  { id: 'f1', severity: 'critical', title: 'Rain tomorrow will block rooftop scene 31', why: '70% precip forecast 14:00–18:00. Scene 31 requires clear skies for continuity with 30.', saves: 'Avoid full day reshoot · ~$38K', actions: ["Swap to cover set (Nora's apartment)", 'Rearrange to morning block', 'Hold as cover decision'], kind: 'plan' },
  { id: 'f2', severity: 'warn', title: 'Schedule conflict: Marcus Reid double-booked Apr 19', why: 'Scene 28 & voice session overlap 10:00–13:00.', saves: 'Prevent 3h stall', actions: ['Move voice session to Apr 20 AM', 'Flip scene order so 28 shoots after 14:00'], kind: 'cast' },
  { id: 'f3', severity: 'info', title: 'Group scenes 25 + 27 by lighting setup B', why: 'Both use hard top-light rig. Back-to-back saves one tear-down.', saves: '~40 min · $2.1K', actions: ['Apply reorder', 'Notify Gaffer team'], kind: 'lighting' },
  { id: 'f4', severity: 'info', title: 'Creative: try tighter lens on 24A-3', why: "Based on your visual references, 85mm compression would match scene 22's framing.", saves: 'Creative continuity', actions: ['Generate reference frame', 'Add to DP notes'], kind: 'creative' },
  { id: 'f5', severity: 'info', title: 'Mood board for scene 31 (rooftop) ready', why: '12 reference images assembled from project aesthetic — amber magic hour.', saves: 'Saves 1h prep', actions: ['Review board', 'Share with DP'], kind: 'creative' },
  { id: 'f6', severity: 'warn', title: 'Overtime risk: day 14 projected 13.2 hrs', why: 'Scene 30 is dense (5 pages, 4 cast). Current plan pushes wrap 20:40.', saves: '~$6.5K OT + avoid meal penalty', actions: ['Split scene 30 across 2 days', 'Trim coverage'], kind: 'schedule' },
];

export default function AIFeedScreen({ projectId, onOpenPlan }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    getInsights(projectId).then(setInsights).finally(() => setLoading(false));
  }, [projectId]);

  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    await dismissInsight(projectId, id);
    setInsights(s => s.filter(i => i.id !== id));
  };

  const displayItems = insights.length > 0 ? insights : FALLBACK;

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading insights…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {displayItems.map(s => {
        const sv = sevMap[s.severity] || sevMap.info;
        const actions = Array.isArray(s.actions)
          ? (typeof s.actions[0] === 'string' ? s.actions : s.actions.map(a => a.label || a))
          : [];
        return (
          <div key={s.id} onClick={() => s.severity === 'critical' && onOpenPlan && onOpenPlan()} style={{
            background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
            display: 'grid', gridTemplateColumns: '4px 1fr auto', overflow: 'hidden',
            cursor: s.severity === 'critical' ? 'pointer' : 'default',
          }}>
            <div style={{ background: sv.c }}/>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: 4, background: sv.bg, color: sv.c, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ico.sparkle/>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: sv.c, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>{sv.label}</span>
                <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>· {s.kind}</span>
                <span style={{ flex: 1 }}/>
                {s.id && !s.id.startsWith('f') && (
                  <button onClick={e => handleDismiss(e, s.id)} style={{ background: 'none', border: 'none', color: C.muted2, cursor: 'pointer', padding: 0 }}>
                    <Ico.x/>
                  </button>
                )}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{s.why}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {actions.map((a, j) => (
                  <span key={j} style={{
                    fontSize: 11.5, padding: '5px 10px', borderRadius: 4,
                    background: j === 0 ? C.ink : C.panel,
                    color: j === 0 ? '#fff' : C.ink2,
                    border: j === 0 ? 'none' : `1px solid ${C.line2}`,
                    fontWeight: 500,
                  }}>{a}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 18px', borderLeft: `1px solid ${C.line}`, minWidth: 160, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>Saves</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: C.ok }}>{s.saves}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
