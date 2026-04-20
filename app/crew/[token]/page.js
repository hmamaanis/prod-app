'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { C, Ico, Avatar, StatusDot, statusLabel } from '@/components/shared';
import DashboardScreen   from '@/components/DashboardScreen';
import ShotListScreen    from '@/components/ShotListScreen';
import CastScreen        from '@/components/CastScreen';
import LightingScreen    from '@/components/LightingScreen';
import LocationScreen    from '@/components/LocationScreen';
import LiveTrackerScreen from '@/components/LiveTrackerScreen';
import BreakdownScreen   from '@/components/BreakdownScreen';
import ActivityScreen    from '@/components/ActivityScreen';
import BudgetScreen      from '@/components/BudgetScreen';
import AIFeedScreen      from '@/components/AIFeedScreen';

const TAB_MAP = {
  dashboard: { label: 'Today',   icon: Ico.dash,     Component: DashboardScreen },
  shotlist:  { label: 'Shots',   icon: Ico.shotlist,  Component: ShotListScreen },
  cast:      { label: 'Cast',    icon: Ico.users,     Component: CastScreen },
  lighting:  { label: 'Lights',  icon: Ico.light,     Component: LightingScreen },
  location:  { label: 'Map',     icon: Ico.pin,       Component: LocationScreen },
  tracker:   { label: 'Track',   icon: Ico.map,       Component: LiveTrackerScreen },
  breakdown: { label: 'Script',  icon: Ico.book,      Component: BreakdownScreen },
  activity:  { label: 'Log',     icon: Ico.bell,      Component: ActivityScreen },
  budget:    { label: 'Budget',  icon: Ico.dollar,    Component: BudgetScreen },
  ai:        { label: 'AI',      icon: Ico.sparkle,   Component: AIFeedScreen },
};

export default function CrewViewPage() {
  const { token } = useParams();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab]       = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/crew/${token}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setData(d);
        const tabs = d.visible_tabs || [];
        setTab(tabs[0] || 'dashboard');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 16, margin: '0 auto 12px' }}>P</div>
          <div style={{ fontSize: 13, color: C.muted }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter' }}>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 18, margin: '0 auto 16px' }}>P</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Link not found</div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>This crew access link has expired or is invalid. Ask your AD or Producer to send a new link.</div>
        </div>
      </div>
    );
  }

  const { project, name, role, visible_tabs = [], crew_member_id, crew_type } = data;
  const tabs = (visible_tabs.length > 0 ? visible_tabs : ['dashboard']).filter(t => TAB_MAP[t]);
  const activeTab = tab && TAB_MAP[tab] ? tab : tabs[0];
  const { Component } = TAB_MAP[activeTab] || TAB_MAP['dashboard'];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column' }}>

      {/* Fixed header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        background: C.panel, borderBottom: `1px solid ${C.line}`,
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>P</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project?.title || 'Production'}</div>
          <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>{name}</div>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', marginBottom: 2 }}>{role}</div>
          <div style={{ fontSize: 10.5, color: C.muted2 }}>Day {project?.day_current || '—'}/{project?.day_total || '—'}</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: 64, paddingBottom: 72, padding: '64px 12px 72px' }}>
        <Component
          projectId={project?.id}
          readOnly={true}
          selfId={crew_member_id}
          selfType={crew_type}
        />
      </div>

      {/* Fixed bottom tab bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: C.panel, borderTop: `1px solid ${C.line}`,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {tabs.map(t => {
          const { label, icon: TabIcon } = TAB_MAP[t] || {};
          if (!TabIcon) return null;
          const active = activeTab === t;
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? C.ink : C.muted2,
              borderTop: active ? `2px solid ${C.ink}` : '2px solid transparent',
              transition: 'color 120ms',
            }}>
              <TabIcon width={20} height={20}/>
              <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, fontFamily: 'Inter', letterSpacing: 0.2 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
