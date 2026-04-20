'use client';
import { useState, useEffect, useRef } from 'react';
import { C, Ico, Avatar } from './shared';
import { getShots, getCast, getCrew, getActivity } from '@/lib/api';

function ResultGroup({ title, items, onSelect }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ padding: '6px 16px', fontSize: 10, fontWeight: 600, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</div>
      {items.map((item, i) => (
        <button key={i} onClick={() => onSelect(item)} style={{
          width: '100%', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
          borderRadius: 0,
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.tint}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: C.tint, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: C.muted }}>
            {item._type === 'shot'     && <Ico.shotlist/>}
            {item._type === 'person'   && <Ico.users/>}
            {item._type === 'activity' && <Ico.bell/>}
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink }}>{item._title}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{item._sub}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 10.5, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>{item._tab}</div>
        </button>
      ))}
    </div>
  );
}

export default function SearchModal({ projectId, open, onClose, onNavigate }) {
  const [query, setQuery]   = useState('');
  const [data, setData]     = useState({ shots: [], cast: [], crew: [], activity: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    Promise.all([getShots(projectId), getCast(projectId), getCrew(projectId), getActivity(projectId)])
      .then(([shots, cast, crew, activity]) => setData({ shots, cast, crew, activity }))
      .finally(() => setLoading(false));
  }, [open, projectId]);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(''); }
  }, [open]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  const q = query.toLowerCase().trim();

  const shots = q ? data.shots.filter(s =>
    s.shot_id?.toLowerCase().includes(q) || s.setup?.toLowerCase().includes(q) || s.scene?.toLowerCase().includes(q)
  ).map(s => ({ ...s, _type: 'shot', _title: `${s.shot_id} · ${s.setup}`, _sub: `Scene ${s.scene} · ${s.status}`, _tab: 'shotlist' })) : [];

  const people = q ? [...data.cast, ...data.crew].filter(p =>
    p.name?.toLowerCase().includes(q) || p.role?.toLowerCase().includes(q)
  ).map(p => ({ ...p, _type: 'person', _title: p.name, _sub: p.role, _tab: 'cast' })) : [];

  const activity = q ? data.activity.filter(a =>
    a.object?.toLowerCase().includes(q) || a.detail?.toLowerCase().includes(q) || a.user_name?.toLowerCase().includes(q)
  ).map(a => ({ ...a, _type: 'activity', _title: `${a.action} ${a.object}`, _sub: a.detail, _tab: 'activity' })) : [];

  const total = shots.length + people.length + activity.length;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.panel, borderRadius: 12, width: 560, maxHeight: 480,
        boxShadow: '0 24px 60px -12px rgba(0,0,0,0.3)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', border: `1px solid ${C.line}`,
      }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${C.line}` }}>
          <div style={{ color: C.muted }}><Ico.search/></div>
          <input
            ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search scenes, shots, people, notes..."
            style={{ flex: 1, border: 'none', background: 'none', fontSize: 15, outline: 'none', fontFamily: 'Inter', color: C.ink }}
          />
          {query && <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 0 }}><Ico.x/></button>}
          <span style={{ fontSize: 10.5, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', background: C.tint, padding: '2px 6px', borderRadius: 3 }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ overflow: 'auto', flex: 1 }}>
          {loading && <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>Loading data…</div>}
          {!loading && !q && (
            <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>
              Start typing to search shots, people, and activity.
            </div>
          )}
          {!loading && q && total === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: C.muted, fontSize: 13 }}>No results for "<strong>{query}</strong>"</div>
          )}
          {!loading && q && total > 0 && (
            <>
              <ResultGroup title="Shots" items={shots} onSelect={r => { onNavigate(r._tab); onClose(); }}/>
              <ResultGroup title="People" items={people} onSelect={r => { onNavigate(r._tab); onClose(); }}/>
              <ResultGroup title="Activity" items={activity} onSelect={r => { onNavigate(r._tab); onClose(); }}/>
            </>
          )}
        </div>

        {q && total > 0 && (
          <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.line}`, fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
            {total} result{total !== 1 ? 's' : ''} · click to navigate
          </div>
        )}
      </div>
    </div>
  );
}
