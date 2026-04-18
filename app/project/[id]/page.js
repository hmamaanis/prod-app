'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { C, Ico, Avatar, Kbd } from '@/components/shared';
import { getProject, getInsights } from '@/lib/api';
import DashboardScreen  from '@/components/DashboardScreen';
import ShotListScreen   from '@/components/ShotListScreen';
import CastScreen       from '@/components/CastScreen';
import LightingScreen   from '@/components/LightingScreen';
import LocationScreen   from '@/components/LocationScreen';
import ActivityScreen   from '@/components/ActivityScreen';
import BudgetScreen     from '@/components/BudgetScreen';
import BreakdownScreen  from '@/components/BreakdownScreen';
import AIFeedScreen     from '@/components/AIFeedScreen';
import LiveTrackerScreen from '@/components/LiveTrackerScreen';
import AIToast          from '@/components/AIToast';
import AIPlanPage       from '@/components/AIPlanPage';

const roles = {
  AD:       { name: 'J. Nakamura', role: '1st AD' },
  Producer: { name: 'S. Hartley',  role: 'Line Producer' },
  Director: { name: 'M. Okafor',   role: 'Director' },
  DP:       { name: 'L. Ferrara',  role: 'DP' },
};

const navItems = [
  { id: 'dashboard',  label: 'Today',          icon: Ico.dash },
  { id: 'shotlist',   label: 'Shot list',       icon: Ico.shotlist },
  { id: 'cast',       label: 'Cast & crew',     icon: Ico.users },
  { id: 'lighting',   label: 'Lighting',        icon: Ico.light },
  { id: 'location',   label: 'Location',        icon: Ico.pin },
  { id: 'tracker',    label: 'Live tracker',    icon: Ico.map },
  { id: 'breakdown',  label: 'Script',          icon: Ico.book },
  { id: 'activity',   label: 'Activity',        icon: Ico.bell },
  { id: 'budget',     label: 'Budget',          icon: Ico.dollar },
  { id: 'ai',         label: 'AI feed',         icon: Ico.sparkle, tint: true },
];

const titles = {
  dashboard: 'Today', shotlist: 'Shot list', cast: 'Cast & crew',
  lighting: 'Lighting', location: 'Location', tracker: 'Live tracker',
  breakdown: 'Script breakdown', activity: 'Activity · Changes',
  budget: 'Budget & time', ai: 'AI insights',
};

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [role, setRole] = useState('AD');
  const [roleOpen, setRoleOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [insightCount, setInsightCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    getProject(id).then(setProject).catch(() => {});
    getInsights(id).then(ins => setInsightCount(ins.length)).catch(() => {});
    const t = setTimeout(() => setToastOpen(true), 1600);
    return () => clearTimeout(t);
  }, [id]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh' }}>

        {/* Sidebar */}
        <div style={{
          borderRight: `1px solid ${C.line}`, background: C.panel,
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        }}>
          <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.line}` }}>
            <button onClick={() => router.push('/')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted,
              fontFamily: '"IBM Plex Mono", monospace', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, marginBottom: 8, letterSpacing: 0.5,
            }}>← All projects</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12 }}>P</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3 }}>PROD</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5 }}>{project?.title || '…'}</div>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, padding: 10, overflow: 'auto' }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', padding: '8px 10px 4px' }}>Workspace</div>
            {navItems.map(n => (
              <button key={n.id} onClick={() => setTab(n.id)} style={{
                width: '100%', background: tab === n.id ? C.tint : 'none',
                border: 'none', padding: '7px 10px', borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                color: tab === n.id ? C.ink : C.ink2,
                fontSize: 13, fontWeight: tab === n.id ? 500 : 400, fontFamily: 'Inter',
                marginBottom: 1, textAlign: 'left',
              }}>
                <span style={{ color: n.tint ? C.accent : tab === n.id ? C.ink : C.muted, display: 'flex' }}><n.icon/></span>
                {n.label}
                {n.id === 'ai' && insightCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: C.accent, color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>{insightCount}</span>
                )}
                {n.id === 'activity' && (
                  <span style={{ marginLeft: 'auto', background: C.line2, color: C.muted, fontSize: 10, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>8</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: 14, borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Key team</div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              {['M. Okafor', 'L. Ferrara', 'J. Nakamura', 'S. Hartley'].map((n, i) => (
                <div key={n} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                  <Avatar name={n} size={24} ring={C.panel}/>
                </div>
              ))}
              <div style={{ width: 24, height: 24, borderRadius: 99, background: C.tint, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, marginLeft: -6, border: `2px solid ${C.panel}` }}>+10</div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{project?.title || '…'} · {project?.kind || 'Feature'}</div>
            <div style={{ fontSize: 10.5, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', marginTop: 2 }}>
              Day {project?.day_current || '–'} / {project?.day_total || '–'}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ minWidth: 0 }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '14px 24px', borderBottom: `1px solid ${C.line}`,
            background: C.bg, position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{today} · Day {project?.day_current || '–'}</div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, marginTop: 1 }}>{titles[tab]}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, width: 240 }}>
              <div style={{ color: C.muted2 }}><Ico.search/></div>
              <span style={{ flex: 1, fontSize: 12.5, color: C.muted2 }}>Search scenes, people, notes...</span>
              <Kbd>⌘ K</Kbd>
            </div>

            {/* Role switcher */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setRoleOpen(o => !o)} style={{
                background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 6,
                padding: '5px 10px 5px 5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Avatar name={roles[role].name} size={22}/>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{roles[role].name}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{roles[role].role}</div>
                </div>
                <Ico.chevD/>
              </button>
              {roleOpen && (
                <>
                  <div onClick={() => setRoleOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 41,
                    background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8,
                    boxShadow: '0 12px 30px -10px rgba(0,0,0,0.15)', width: 240, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px solid ${C.line}` }}>View as</div>
                    {Object.entries(roles).map(([k, r]) => (
                      <button key={k} onClick={() => { setRole(k); setRoleOpen(false); }} style={{
                        width: '100%', background: role === k ? C.tint : 'none', border: 'none',
                        padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                      }}>
                        <Avatar name={r.name} size={26}/>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{r.role}</div>
                        </div>
                        {role === k && <span style={{ color: C.ok }}><Ico.check/></span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Screen canvas */}
          <div style={{ padding: 24 }}>
            {tab === 'dashboard'  && <DashboardScreen  projectId={id} onAlertClick={() => setPlanOpen(true)}/>}
            {tab === 'shotlist'   && <ShotListScreen   projectId={id}/>}
            {tab === 'cast'       && <CastScreen       projectId={id}/>}
            {tab === 'lighting'   && <LightingScreen   projectId={id}/>}
            {tab === 'location'   && <LocationScreen/>}
            {tab === 'tracker'    && <LiveTrackerScreen projectId={id}/>}
            {tab === 'breakdown'  && <BreakdownScreen/>}
            {tab === 'activity'   && <ActivityScreen   projectId={id}/>}
            {tab === 'budget'     && <BudgetScreen/>}
            {tab === 'ai'         && <AIFeedScreen     projectId={id} onOpenPlan={() => setPlanOpen(true)}/>}
          </div>
        </div>
      </div>

      {/* AI Toast + Plan overlay */}
      <AIToast open={toastOpen && !planOpen} onClick={() => setPlanOpen(true)} onDismiss={() => setToastOpen(false)}/>
      <AIPlanPage open={planOpen} onClose={() => setPlanOpen(false)}/>

      {/* Replay button */}
      {!toastOpen && !planOpen && (
        <button onClick={() => setToastOpen(true)} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          background: C.ink, color: '#fff', border: 'none', borderRadius: 999,
          padding: '10px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.25)',
        }}><Ico.sparkle/>Replay AI alert</button>
      )}
    </div>
  );
}
