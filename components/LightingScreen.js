'use client';
import { useState, useEffect } from 'react';
import { C, Card, Badge } from './shared';
import { getLighting } from '@/lib/api';

export default function LightingScreen({ projectId }) {
  const [setups, setSetups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    getLighting(projectId).then(setSetups).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading lighting…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {setups.map(l => (
        <Card key={l.id}>
          <div style={{ padding: 16, borderBottom: `1px solid ${C.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 6, background: C.tint,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"IBM Plex Mono", monospace', fontSize: 16, fontWeight: 600,
              }}>{l.label_id}</div>
              <Badge tone="accent" dot>{l.setup_time}</Badge>
            </div>
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 12, lineHeight: 1.35 }}>{l.label}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginTop: 6 }}>Color temp · {l.temp}</div>
          </div>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 8 }}>Units</div>
            {(l.units || []).map((u, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: i < l.units.length - 1 ? `1px solid ${C.line}` : 'none', fontSize: 12.5 }}>
                <span style={{ color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{u}</span>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {setups.length === 0 && (
        <div style={{ padding: 40, color: C.muted, fontSize: 13 }}>No lighting setups yet.</div>
      )}
    </div>
  );
}
