'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { C, Ico, Avatar, Kbd } from '@/components/shared';
import { getProject, getInsights, updateProject } from '@/lib/api';
import { useBreakpoint } from '@/lib/useBreakpoint';
import DashboardScreen   from '@/components/DashboardScreen';
import ShotListScreen    from '@/components/ShotListScreen';
import CastScreen        from '@/components/CastScreen';
import LightingScreen    from '@/components/LightingScreen';
import LocationScreen    from '@/components/LocationScreen';
import ActivityScreen    from '@/components/ActivityScreen';
import BudgetScreen      from '@/components/BudgetScreen';
import BreakdownScreen   from '@/components/BreakdownScreen';
import AIFeedScreen      from '@/components/AIFeedScreen';
import LiveTrackerScreen from '@/components/LiveTrackerScreen';
import AIToast           from '@/components/AIToast';
import AIPlanPage        from '@/components/AIPlanPage';
import SearchModal       from '@/components/SearchModal';
import ViewSettingsScreen from '@/components/ViewSettingsScreen';
import ScriptScreen      from '@/components/ScriptScreen';
import StripboardScreen  from '@/components/StripboardScreen';
import CallSheetScreen   from '@/components/CallSheetScreen';

const roles = {
  AD:       { name: 'J. Nakamura', role: '1st AD' },
  Producer: { name: 'S. Hartley',  role: 'Line Producer' },
  Director: { name: 'M. Okafor',   role: 'Director' },
  DP:       { name: 'L. Ferrara',  role: 'DP' },
};

// Production nav (in-production phase)
const PRODUCTION_NAV = [
  { id: 'dashboard',  label: 'Today',       icon: Ico.dash },
  { id: 'shotlist',   label: 'Shot list',   icon: Ico.shotlist },
  { id: 'cast',       label: 'Cast & crew', icon: Ico.users },
  { id: 'lighting',   label: 'Lighting',    icon: Ico.light },
  { id: 'location',   label: 'Location',    icon: Ico.pin },
  { id: 'tracker',    label: 'Live tracker',icon: Ico.map },
  { id: 'breakdown',  label: 'Script',      icon: Ico.book },
  { id: 'activity',   label: 'Activity',    icon: Ico.bell },
  { id: 'budget',     label: 'Budget',      icon: Ico.dollar },
  { id: 'ai',         label: 'AI feed',     icon: Ico.sparkle, tint: true },
  { id: 'settings',   label: 'View access', icon: Ico.edit },
];

// Pre-production nav
const PREPRODUCTION_NAV = [
  { id: 'script',     label: 'Script',      icon: Ico.book },
  { id: 'breakdown',  label: 'Breakdown',   icon: Ico.clap },
  { id: 'stripboard', label: 'Stripboard',  icon: Ico.shotlist },
  { id: 'callsheet',  label: 'Call sheet',  icon: Ico.bell },
  { id: 'cast',       label: 'Cast & crew', icon: Ico.users },
  { id: 'budget',     label: 'Budget',      icon: Ico.dollar },
  { id: 'ai',         label: 'AI feed',     icon: Ico.sparkle, tint: true },
  { id: 'settings',   label: 'View access', icon: Ico.edit },
];

// Post-production nav (placeholder)
const POSTPRODUCTION_NAV = [
  { id: 'breakdown',  label: 'Lined script',icon: Ico.book },
  { id: 'shotlist',   label: 'EDL / Shots', icon: Ico.shotlist },
  { id: 'activity',   label: 'Log',         icon: Ico.bell },
  { id: 'settings',   label: 'View access', icon: Ico.edit },
];

const titles = {
  dashboard: 'Today', shotlist: 'Shot list', cast: 'Cast & crew',
  lighting: 'Lighting', location: 'Location', tracker: 'Live tracker',
  breakdown: 'Script breakdown', activity: 'Activity · Changes',
  budget: 'Budget & time', ai: 'AI insights', settings: 'View access',
  script: 'Script import', stripboard: 'Stripboard', callsheet: 'Call sheet',
};

const PHASE_LABELS = {
  'pre-production': 'Pre-production',
  'in-production': 'In production',
  'post-production': 'Post-production',
};
const PHASE_TONES = {
  'pre-production': C.warn,
  'in-production': C.ok,
  'post-production': C.critical,
};

// Mobile: primary tabs shown in bottom bar (max 5)
const MOBILE_PRIMARY = {
  'pre-production':  ['script','breakdown','cast','ai','settings'],
  'in-production':   ['dashboard','shotlist','cast','lighting','ai'],
  'post-production': ['breakdown','shotlist','activity','settings'],
};

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { mobile } = useBreakpoint();

  const [project, setProject]     = useState(null);
  const [tab, setTab]             = useState('dashboard');
  const [role, setRole]           = useState('AD');
  const [roleOpen, setRoleOpen]   = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [planOpen, setPlanOpen]   = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen]   = useState(false);
  const [phaseOpen, setPhaseOpen] = useState(false);

  const phase = project?.status || 'in-production';

  const navItems = phase === 'pre-production' ? PREPRODUCTION_NAV
    : phase === 'post-production' ? POSTPRODUCTION_NAV
    : PRODUCTION_NAV;

  useEffect(() => {
    if (!id) return;
    getProject(id).then(p => {
      setProject(p);
      // Set default tab per phase
      if (p?.status === 'pre-production') setTab('script');
      else if (p?.status === 'post-production') setTab('breakdown');
      else setTab('dashboard');
    }).catch(() => {});
    getInsights(id).then(ins => setInsightCount(ins.length)).catch(() => {});
    const t = setTimeout(() => setToastOpen(true), 1600);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handlePhaseChange = async (newPhase) => {
    setPhaseOpen(false);
    setProject(p => ({ ...p, status: newPhase }));
    if (newPhase === 'pre-production') setTab('script');
    else if (newPhase === 'post-production') setTab('breakdown');
    else setTab('dashboard');
    await updateProject(id, { status: newPhase });
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Mobile: which tabs are in bottom bar vs "more" drawer
  const mobilePrimary = MOBILE_PRIMARY[phase] || MOBILE_PRIMARY['in-production'];
  const mobileMore = navItems.filter(n => !mobilePrimary.includes(n.id));

  const renderScreen = () => {
    const props = { projectId: id };
    switch (tab) {
      case 'dashboard':  return <DashboardScreen  {...props} onAlertClick={() => setPlanOpen(true)}/>;
      case 'shotlist':   return <ShotListScreen   {...props}/>;
      case 'cast':       return <CastScreen       {...props}/>;
      case 'lighting':   return <LightingScreen   {...props}/>;
      case 'location':   return <LocationScreen/>;
      case 'tracker':    return <LiveTrackerScreen {...props}/>;
      case 'breakdown':  return <BreakdownScreen  {...props}/>;
      case 'activity':   return <ActivityScreen   {...props}/>;
      case 'budget':     return <BudgetScreen/>;
      case 'ai':         return <AIFeedScreen     {...props} onOpenPlan={() => setPlanOpen(true)}/>;
      case 'settings':   return <ViewSettingsScreen {...props}/>;
      case 'script':     return <ScriptScreen     {...props}/>;
      case 'stripboard': return <StripboardScreen {...props}/>;
      case 'callsheet':  return <CallSheetScreen  {...props}/>;
      default:           return <DashboardScreen  {...props} onAlertClick={() => setPlanOpen(true)}/>;
    }
  };

  /* ── MOBILE LAYOUT ─────────────────────────────────────────────────── */
  if (mobile) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: 'Inter, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column' }}>

        {/* Mobile header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, background: C.panel, borderBottom: `1px solid ${C.line}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 13 }}>P</div>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', letterSpacing: 0.5, textTransform: 'uppercase' }}>{project?.title || '…'}</div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titles[tab] || tab}</div>
          </div>
          {/* Phase pill */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setPhaseOpen(o => !o)} style={{
              background: 'none', border: `1px solid ${PHASE_TONES[phase]}`, borderRadius: 99,
              padding: '3px 9px', cursor: 'pointer', fontSize: 10, fontFamily: '"IBM Plex Mono"',
              color: PHASE_TONES[phase], fontWeight: 600, letterSpacing: 0.5,
            }}>{PHASE_LABELS[phase]}</button>
            {phaseOpen && (
              <>
                <div onClick={() => setPhaseOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }}/>
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 31, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)', overflow: 'hidden', width: 190 }}>
                  {Object.entries(PHASE_LABELS).map(([k, l]) => (
                    <button key={k} onClick={() => handlePhaseChange(k)} style={{ width: '100%', background: phase === k ? C.tint : 'none', border: 'none', padding: '9px 14px', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'Inter', color: C.ink }}>
                      <span style={{ color: PHASE_TONES[k], marginRight: 8 }}>●</span>{l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: C.muted }}>
            <Ico.search/>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, paddingTop: 58, paddingBottom: 68, overflowY: 'auto' }}>
          <div style={{ padding: 12 }}>
            {renderScreen()}
          </div>
        </div>

        {/* Mobile bottom tab bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
          background: C.panel, borderTop: `1px solid ${C.line}`,
          display: 'flex',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
          {mobilePrimary.map(tid => {
            const n = navItems.find(x => x.id === tid);
            if (!n) return null;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 4px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                color: active ? C.ink : C.muted2,
                borderTop: active ? `2px solid ${C.ink}` : '2px solid transparent',
              }}>
                <n.icon width={20} height={20}/>
                <span style={{ fontSize: 9, fontWeight: active ? 600 : 400, letterSpacing: 0.2 }}>{n.label.split(' ')[0]}</span>
              </button>
            );
          })}
          {/* More button */}
          {mobileMore.length > 0 && (
            <button onClick={() => setMoreOpen(o => !o)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: moreOpen ? C.ink : C.muted2,
              borderTop: moreOpen ? `2px solid ${C.ink}` : '2px solid transparent',
            }}>
              <Ico.chevD width={20} height={20}/>
              <span style={{ fontSize: 9, fontWeight: 400, letterSpacing: 0.2 }}>More</span>
            </button>
          )}
        </div>

        {/* More drawer */}
        {moreOpen && (
          <>
            <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,0.3)' }}/>
            <div style={{
              position: 'fixed', bottom: 64, left: 0, right: 0, zIndex: 26,
              background: C.panel, borderTop: `1px solid ${C.line}`,
              borderRadius: '16px 16px 0 0',
              padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8,
            }}>
              {mobileMore.map(n => {
                const active = tab === n.id;
                return (
                  <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }} style={{
                    background: active ? C.tint : 'none', border: `1px solid ${active ? C.line2 : C.line}`,
                    borderRadius: 10, cursor: 'pointer', padding: '12px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    color: active ? C.ink : C.muted,
                  }}>
                    <n.icon width={18} height={18}/>
                    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: 'Inter', textAlign: 'center', lineHeight: 1.2 }}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <SearchModal projectId={id} open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={t => { setTab(t); setMoreOpen(false); }}/>
        <AIToast open={toastOpen && !planOpen} onClick={() => setPlanOpen(true)} onDismiss={() => setToastOpen(false)}/>
        <AIPlanPage open={planOpen} onClose={() => setPlanOpen(false)}/>
      </div>
    );
  }

  /* ── DESKTOP LAYOUT ─────────────────────────────────────────────────── */
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

          {/* Phase switcher in sidebar */}
          <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.line}`, position: 'relative' }}>
            <button onClick={() => setPhaseOpen(o => !o)} style={{
              width: '100%', background: C.tint, border: `1px solid ${PHASE_TONES[phase]}20`,
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: PHASE_TONES[phase], flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: C.ink }}>{PHASE_LABELS[phase]}</span>
              <Ico.chevD/>
            </button>
            {phaseOpen && (
              <>
                <div onClick={() => setPhaseOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 10, right: 10, zIndex: 41, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  {Object.entries(PHASE_LABELS).map(([k, l]) => (
                    <button key={k} onClick={() => handlePhaseChange(k)} style={{ width: '100%', background: phase === k ? C.tint : 'none', border: 'none', padding: '9px 12px', cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'Inter', color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: PHASE_TONES[k], flexShrink: 0 }}/>
                      {l}
                      {phase === k && <span style={{ marginLeft: 'auto', color: C.ok }}><Ico.check/></span>}
                    </button>
                  ))}
                </div>
              </>
            )}
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
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, marginTop: 1 }}>{titles[tab] || tab}</div>
            </div>

            <div onClick={() => setSearchOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, width: 240, cursor: 'pointer' }}>
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
            {renderScreen()}
          </div>
        </div>
      </div>

      {/* Overlays */}
      <AIToast open={toastOpen && !planOpen} onClick={() => setPlanOpen(true)} onDismiss={() => setToastOpen(false)}/>
      <AIPlanPage open={planOpen} onClose={() => setPlanOpen(false)}/>
      <SearchModal projectId={id} open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={setTab}/>

      {/* Replay button (desktop only) */}
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
