'use client';
import { useState, useEffect } from 'react';
import { C, Card, SectionHead, Avatar, StatusDot, statusLabel } from './shared';
import { getCast, getCrew, updateCast, updateCrew } from '@/lib/api';

const STATUS_OPTIONS = ['on-set', 'travel', 'holding', 'wrapped', 'not-called', 'at-base'];

function PersonRow({ p, isCast, onStatusChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6 }}>
      <Avatar name={p.name} size={36}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
          {p.role}{isCast && p.scenes && Array.isArray(p.scenes) && p.scenes.length > 0 && ` · Scenes ${p.scenes.join(', ')}`}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusDot status={p.status}/>
        <select
          value={p.status}
          onChange={e => onStatusChange(p.id, e.target.value)}
          style={{ fontSize: 11, border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 6px', background: C.panel, cursor: 'pointer', fontFamily: 'Inter', color: C.ink2 }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{statusLabel({ status: s })}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function CastScreen({ projectId }) {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      getCast(projectId),
      getCrew(projectId),
    ]).then(([c, cr]) => {
      setCast(c);
      setCrew(cr);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const handleCastStatus = async (id, status) => {
    await updateCast(projectId, id, { status });
    setCast(s => s.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleCrewStatus = async (id, status) => {
    await updateCrew(projectId, id, { status });
    setCrew(s => s.map(p => p.id === id ? { ...p, status } : p));
  };

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading cast & crew…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <Card>
        <SectionHead>Cast</SectionHead>
        <div style={{ padding: '4px 8px' }}>
          {cast.map(p => <PersonRow key={p.id} p={p} isCast onStatusChange={handleCastStatus}/>)}
          {cast.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>No cast members yet.</div>}
        </div>
      </Card>
      <Card>
        <SectionHead>Crew — heads of department</SectionHead>
        <div style={{ padding: '4px 8px' }}>
          {crew.map(p => <PersonRow key={p.id} p={p} onStatusChange={handleCrewStatus}/>)}
          {crew.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>No crew members yet.</div>}
        </div>
      </Card>
    </div>
  );
}
