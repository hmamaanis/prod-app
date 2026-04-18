'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, Badge, PrimaryBtn, GhostBtn } from './shared';
import { getShots, createShot, updateShot, deleteShot } from '@/lib/api';

const STATUS_COLORS = {
  done:    { bg: '#F0EFEB', fg: C.muted, line: C.line },
  current: { bg: '#FCEFDC', fg: C.accent2 || '#C87A2A', line: C.accent },
  next:    { bg: C.panel, fg: C.ink, line: C.ink2 },
  planned: { bg: C.panel, fg: C.ink2, line: C.line },
};

function ShotCard({ s, onStatusChange, onDelete }) {
  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.planned;
  const statuses = ['planned', 'next', 'current', 'done'];
  return (
    <div style={{
      background: sc.bg, border: `1px solid ${sc.line}`, borderRadius: 8,
      padding: 12, position: 'relative', opacity: s.status === 'done' ? 0.7 : 1,
    }}>
      <div style={{
        aspectRatio: '16/9',
        background: `repeating-linear-gradient(-45deg, ${C.line} 0 2px, ${C.tint} 2px 10px)`,
        borderRadius: 4, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: C.muted2,
      }}>
        {s.status === 'current' ? '● RECORDING' : 'storyboard'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', color: sc.fg }}>{s.shot_id}</div>
        <div style={{ fontSize: 10.5, color: sc.fg, fontFamily: '"IBM Plex Mono", monospace' }}>{s.scheduled_time || ''}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{s.setup}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {s.lens && <Badge tone="neutral">{s.lens}</Badge>}
        {s.status === 'current' && <Badge tone="accent" dot>Current</Badge>}
        {s.status === 'next' && <Badge tone="neutral" dot>Up next</Badge>}
        {s.status === 'done' && <Badge tone="ok" dot>Done</Badge>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <select
          value={s.status}
          onChange={e => onStatusChange(s.id, e.target.value)}
          style={{ fontSize: 11, border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 6px', background: C.panel, cursor: 'pointer', fontFamily: 'Inter', flex: 1 }}
        >
          {statuses.map(st => <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>)}
        </select>
        <button onClick={() => onDelete(s.id)} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 7px', cursor: 'pointer', color: C.muted2 }}>
          <Ico.trash/>
        </button>
      </div>
    </div>
  );
}

function TabBtn({ children, active }) {
  return (
    <button style={{
      background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? C.ink : C.muted,
      borderBottom: active ? `2px solid ${C.ink}` : '2px solid transparent',
      fontFamily: 'Inter, system-ui',
    }}>{children}</button>
  );
}

export default function ShotListScreen({ projectId }) {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    getShots(projectId).then(setShots).finally(() => setLoading(false));
  }, [projectId]);

  const handleAdd = async () => {
    const newShot = await createShot(projectId, {
      shot_id: `NEW-${Date.now().toString().slice(-4)}`,
      scene: '24A',
      setup: 'New shot',
      lens: '35mm',
      status: 'planned',
      sort_order: shots.length,
    });
    setShots(s => [...s, newShot]);
  };

  const handleStatusChange = async (id, status) => {
    await updateShot(projectId, id, { status });
    setShots(s => s.map(sh => sh.id === id ? { ...sh, status } : sh));
  };

  const handleDelete = async (id) => {
    await deleteShot(projectId, id);
    setShots(s => s.filter(sh => sh.id !== id));
  };

  const groups = {};
  shots.forEach(s => { (groups[s.scene] = groups[s.scene] || []).push(s); });

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading shots…</div>;

  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <TabBtn active>Today</TabBtn>
          <TabBtn>Tomorrow</TabBtn>
          <TabBtn>All scenes</TabBtn>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <GhostBtn icon={Ico.sparkle}>Ask AI to reorder</GhostBtn>
          <PrimaryBtn icon={Ico.plus} onClick={handleAdd}>Add shot</PrimaryBtn>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        {Object.keys(groups).length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>No shots yet. Click "Add shot" to get started.</div>
        )}
        {Object.entries(groups).map(([scene, sceneShots]) => (
          <div key={scene} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace' }}>SCENE {scene}</div>
              <Badge tone="neutral" dot>{sceneShots.length} shots</Badge>
              {sceneShots[0]?.lighting && <Badge tone="accent" dot>Light setup {sceneShots[0].lighting}</Badge>}
              <div style={{ flex: 1, height: 1, background: C.line }}/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
              {sceneShots.map(s => (
                <ShotCard key={s.id} s={s} onStatusChange={handleStatusChange} onDelete={handleDelete}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
