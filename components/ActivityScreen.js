'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, SectionHead, Avatar } from './shared';
import { getActivity } from '@/lib/api';

const kindMap = {
  schedule: { color: C.ink,      label: 'Schedule' },
  creative: { color: C.accent,   label: 'Creative' },
  person:   { color: C.warn,     label: 'Person' },
  ai:       { color: C.critical, label: 'AI' },
  lighting: { color: C.accent,   label: 'Lighting' },
  script:   { color: C.muted,    label: 'Script' },
};

const TABS = [
  { key: 'all',      label: 'All changes' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'creative', label: 'Creative' },
  { key: 'person',   label: 'People' },
  { key: 'ai',       label: 'AI' },
];

function ImpactRow({ label, val, tone, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: last ? 'none' : `1px solid ${C.line}` }}>
      <span style={{ fontSize: 12, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: tone === 'ok' ? C.ok : C.ink }}>{val}</span>
    </div>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? C.ink : C.muted,
      borderBottom: active ? `2px solid ${C.ink}` : '2px solid transparent',
      fontFamily: 'Inter, system-ui',
    }}>{children}</button>
  );
}

const FALLBACK = [
  { id: 1, created_at: null, user_name: 'J. Nakamura', user_role: '1st AD',          action: 'moved',         object: 'Shot 24B-2',              detail: 'Time 11:45 → 11:15 (AI proposal accepted)', kind: 'schedule' },
  { id: 2, created_at: null, user_name: 'L. Ferrara',  user_role: 'DP',              action: 'changed lens on', object: '24A-3',                  detail: '35mm → 50mm',                               kind: 'creative' },
  { id: 3, created_at: null, user_name: 'M. Reid',     user_role: 'Cast · Det. Kane', action: 'updated ETA to', object: '07:40',                  detail: 'Traffic on Williamsburg Bridge',             kind: 'person' },
  { id: 4, created_at: null, user_name: 'AI',          user_role: 'PROD Assistant',  action: 'flagged',        object: 'Tomorrow — Rooftop scene', detail: 'Rain forecast 70% 14:00–18:00 · 2 plans drafted', kind: 'ai' },
  { id: 5, created_at: null, user_name: 'R. Okoye',    user_role: 'Gaffer',          action: 'marked ready',   object: 'Lighting setup A',         detail: 'Pre-rigged 10 min ahead of call',            kind: 'lighting' },
  { id: 6, created_at: null, user_name: 'K. Reyes',    user_role: 'Script Super',    action: 'locked',         object: 'Pages 14–17',             detail: 'Version 6 · revisions highlighted',          kind: 'script' },
  { id: 7, created_at: null, user_name: 'AI',          user_role: 'PROD Assistant',  action: 'suggested',      object: 'Scene grouping',           detail: 'Group 25 + 27 by light setup B → save ~40min', kind: 'ai' },
  { id: 8, created_at: null, user_name: 'H. Park',     user_role: '2nd AD',          action: 'checked in',     object: '4 crew members',           detail: 'All departments report at base',             kind: 'person' },
];

const FALLBACK_TIMES = ['09:42','09:28','09:15','08:50','08:34','08:12','07:55','07:30'];

export default function ActivityScreen({ projectId }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!projectId) return;
    getActivity(projectId).then(setItems).finally(() => setLoading(false));
  }, [projectId]);

  const formatTime = ts => ts ? new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';

  const allItems = items.length > 0 ? items : FALLBACK;
  const displayed = activeTab === 'all' ? allItems : allItems.filter(it => it.kind === activeTab);

  // Recalculate impact from real data
  const aiCount    = allItems.filter(i => i.kind === 'ai').length;
  const todayCount = allItems.length;

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading activity…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 20 }}>
          {TABS.map(t => (
            <TabBtn key={t.key} active={activeTab === t.key} onClick={() => setActiveTab(t.key)}>
              {t.label}
              {t.key !== 'all' && (
                <span style={{ marginLeft: 5, fontSize: 10.5, color: C.muted2 }}>
                  {allItems.filter(i => i.kind === t.key).length}
                </span>
              )}
            </TabBtn>
          ))}
        </div>
        <div>
          {displayed.length === 0 && (
            <div style={{ padding: '32px 20px', color: C.muted, fontSize: 13, textAlign: 'center' }}>No activity in this category.</div>
          )}
          {displayed.map((it, i) => {
            const km = kindMap[it.kind] || kindMap.schedule;
            return (
              <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 16, padding: '14px 20px', borderBottom: i < displayed.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
                  {it.created_at ? formatTime(it.created_at) : FALLBACK_TIMES[allItems.indexOf(it)] || ''}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {it.kind === 'ai'
                      ? <div style={{ width: 20, height: 20, borderRadius: 4, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ico.sparkle/></div>
                      : <Avatar name={it.user_name} size={20}/>}
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{it.user_name}</span>
                    <span style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{it.user_role}</span>
                    <span style={{ flex: 1 }}/>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: km.color }}/>
                    <span style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{km.label}</span>
                  </div>
                  <div style={{ fontSize: 13.5, color: C.ink2, lineHeight: 1.5 }}>
                    {it.action} <span style={{ fontWeight: 600, color: C.ink }}>{it.object}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{it.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionHead>Impact summary</SectionHead>
        <div style={{ padding: 16 }}>
          <ImpactRow label="Changes today"     val={todayCount}/>
          <ImpactRow label="AI actions"        val={aiCount}/>
          <ImpactRow label="AI proposals open" val="3"/>
          <ImpactRow label="Overtime risk"     val="Low" tone="ok" last/>
        </div>
      </Card>
    </div>
  );
}
