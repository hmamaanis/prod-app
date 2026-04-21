'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { C, Ico, Avatar, Kbd } from '@/components/shared';
import { getProject, getInsights, updateProject } from '@/lib/api';
import { useBreakpoint } from '@/lib/useBreakpoint';
import { useLang } from '@/lib/LangContext';
import { t, LANGUAGES } from '@/lib/i18n';
import DashboardScreen    from '@/components/DashboardScreen';
import ShotListScreen     from '@/components/ShotListScreen';
import CastScreen         from '@/components/CastScreen';
import CastingScreen      from '@/components/CastingScreen';
import LightingScreen     from '@/components/LightingScreen';
import LocationScreen     from '@/components/LocationScreen';
import ActivityScreen     from '@/components/ActivityScreen';
import BudgetScreen       from '@/components/BudgetScreen';
import BreakdownScreen    from '@/components/BreakdownScreen';
import AIFeedScreen       from '@/components/AIFeedScreen';
import LiveTrackerScreen  from '@/components/LiveTrackerScreen';
import AIToast            from '@/components/AIToast';
import AIPlanPage         from '@/components/AIPlanPage';
import SearchModal        from '@/components/SearchModal';
import ViewSettingsScreen from '@/components/ViewSettingsScreen';
import ScriptScreen       from '@/components/ScriptScreen';
import ScriptReaderScreen from '@/components/ScriptReaderScreen';
import StripboardScreen   from '@/components/StripboardScreen';
import CallSheetScreen    from '@/components/CallSheetScreen';
import NotepadScreen      from '@/components/NotepadScreen';
import PostProductionScreen from '@/components/PostProductionScreen';

const ROLES = {
  AD:       { name: 'J. Nakamura', role: '1st AD' },
  Producer: { name: 'S. Hartley',  role: 'Line Producer' },
  Director: { name: 'M. Okafor',   role: 'Director' },
  DP:       { name: 'L. Ferrara',  role: 'DP' },
};

const PHASE_TONES = {
  'pre-production':  C.warn,
  'in-production':   C.ok,
  'post-production': C.critical,
};

// ─── Nav definitions (per phase) ───────────────────────────────────────────
// Each item: { id, labelKey, icon, group }
// group drives the Notion-style sidebar sections

const PRODUCTION_ITEMS = [
  // group: production
  { id: 'dashboard',   labelKey: 'today',       icon: Ico.dash,     group: 'production' },
  { id: 'shotlist',    labelKey: 'shotList',     icon: Ico.shotlist, group: 'production' },
  { id: 'cast',        labelKey: 'castCrew',     icon: Ico.users,    group: 'production' },
  { id: 'lighting',    labelKey: 'lighting',     icon: Ico.light,    group: 'production' },
  { id: 'tracker',     labelKey: 'liveTracker',  icon: Ico.map,      group: 'production' },
  { id: 'location',    labelKey: 'location',     icon: Ico.pin,      group: 'production' },
  // group: script
  { id: 'scriptreader',labelKey: 'scriptReader', icon: Ico.book,     group: 'script' },
  { id: 'breakdown',   labelKey: 'breakdown',    icon: Ico.clap,     group: 'script' },
  // group: management
  { id: 'budget',      labelKey: 'budget',       icon: Ico.dollar,   group: 'management' },
  { id: 'activity',    labelKey: 'activity',     icon: Ico.bell,     group: 'management' },
  { id: 'ai',          labelKey: 'aiFeed',       icon: Ico.sparkle,  group: 'management', tint: true },
  // group: settings
  { id: 'settings',    labelKey: 'viewAccess',   icon: Ico.edit,     group: 'settings' },
  { id: 'notepad',     labelKey: 'notepad',      icon: Ico.pencil,   group: 'settings' },
];

const PREPRODUCTION_ITEMS = [
  // group: pre
  { id: 'casting',     labelKey: 'casting',      icon: Ico.users,    group: 'production' },
  { id: 'script',      labelKey: 'scriptImport', icon: Ico.book,     group: 'production' },
  { id: 'scriptreader',labelKey: 'scriptReader', icon: Ico.book,     group: 'production' },
  { id: 'breakdown',   labelKey: 'breakdown',    icon: Ico.clap,     group: 'script' },
  { id: 'stripboard',  labelKey: 'stripboard',   icon: Ico.shotlist, group: 'script' },
  { id: 'callsheet',   labelKey: 'callSheet',    icon: Ico.bell,     group: 'script' },
  // group: management
  { id: 'cast',        labelKey: 'castCrew',     icon: Ico.users,    group: 'management' },
  { id: 'budget',      labelKey: 'budget',       icon: Ico.dollar,   group: 'management' },
  { id: 'ai',          labelKey: 'aiFeed',       icon: Ico.sparkle,  group: 'management', tint: true },
  // group: settings
  { id: 'settings',    labelKey: 'viewAccess',   icon: Ico.edit,     group: 'settings' },
  { id: 'notepad',     labelKey: 'notepad',      icon: Ico.pencil,   group: 'settings' },
];

const POSTPRODUCTION_ITEMS = [
  { id: 'postprod',    labelKey: 'postProd',     icon: Ico.clap,     group: 'production' },
  { id: 'shotlist',    labelKey: 'shotList',     icon: Ico.shotlist, group: 'production' },
  { id: 'breakdown',   labelKey: 'breakdown',    icon: Ico.book,     group: 'script' },
  { id: 'scriptreader',labelKey: 'scriptReader', icon: Ico.book,     group: 'script' },
  { id: 'budget',      labelKey: 'budget',       icon: Ico.dollar,   group: 'management' },
  { id: 'activity',    labelKey: 'activity',     icon: Ico.bell,     group: 'management' },
  { id: 'ai',          labelKey: 'aiFeed',       icon: Ico.sparkle,  group: 'management', tint: true },
  { id: 'settings',    labelKey: 'viewAccess',   icon: Ico.edit,     group: 'settings' },
  { id: 'notepad',     labelKey: 'notepad',      icon: Ico.pencil,   group: 'settings' },
];

const GROUP_LABEL_KEYS = {
  production:  'navGroupProduction',
  script:      'navGroupScript',
  management:  'navGroupManagement',
  settings:    'navGroupSettings',
};

// Mobile primary tabs per phase (max 5)
const MOBILE_PRIMARY = {
  'pre-production':  ['casting', 'script', 'breakdown', 'ai', 'settings'],
  'in-production':   ['dashboard', 'shotlist', 'cast', 'lighting', 'ai'],
  'post-production': ['postprod', 'shotlist', 'breakdown', 'activity', 'settings'],
};

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { mobile } = useBreakpoint();
  const { lang, setLang } = useLang();
  const isAr = lang === 'ar';
  const font = LANGUAGES[lang]?.font || 'Inter, system-ui, sans-serif';

  const [project, setProject]       = useState(null);
  const [tab, setTab]               = useState('dashboard');
  const [role, setRole]             = useState('AD');
  const [roleOpen, setRoleOpen]     = useState(false);
  const [toastOpen, setToastOpen]   = useState(false);
  const [planOpen, setPlanOpen]     = useState(false);
  const [insightCount, setInsightCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen]     = useState(false);
  const [phaseOpen, setPhaseOpen]   = useState(false);
  const [langOpen, setLangOpen]     = useState(false);

  const phase = project?.status || 'in-production';

  const PHASE_LABELS = {
    'pre-production':  t(lang, 'preProduction'),
    'in-production':   t(lang, 'inProduction'),
    'post-production': t(lang, 'postProduction'),
  };

  const navItems = (phase === 'pre-production' ? PREPRODUCTION_ITEMS
    : phase === 'post-production' ? POSTPRODUCTION_ITEMS
    : PRODUCTION_ITEMS).map(n => ({ ...n, label: t(lang, n.labelKey) }));

  // Build grouped nav for Notion-style sidebar
  const navGroups = (() => {
    const seen = new Set();
    const groups = [];
    for (const n of navItems) {
      if (!seen.has(n.group)) { seen.add(n.group); groups.push(n.group); }
    }
    return groups;
  })();

  const titles = Object.fromEntries(navItems.map(n => [n.id, n.label]));

  useEffect(() => {
    if (!id) return;
    getProject(id).then(p => {
      setProject(p);
      if (p?.status === 'pre-production') setTab('casting');
      else if (p?.status === 'post-production') setTab('postprod');
      else setTab('dashboard');
    }).catch(() => {});
    getInsights(id).then(ins => setInsightCount(ins.length)).catch(() => {});
    const timer = setTimeout(() => setToastOpen(true), 1600);
    return () => clearTimeout(timer);
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
    if (newPhase === 'pre-production') setTab('casting');
    else if (newPhase === 'post-production') setTab('postprod');
    else setTab('dashboard');
    await updateProject(id, { status: newPhase });
  };

  const today = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const mobilePrimary = MOBILE_PRIMARY[phase] || MOBILE_PRIMARY['in-production'];
  const mobileMore = navItems.filter(n => !mobilePrimary.includes(n.id));

  // ── Language switcher ────────────────────────────────────────────────────
  const LangSwitcher = ({ style = {} }) => (
    <div style={{ position: 'relative', ...style }}>
      <button onClick={() => setLangOpen(o => !o)} style={{
        background: C.tint, border: `1px solid ${C.line2}`, borderRadius: 6,
        padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: font,
        color: C.ink2, display: 'flex', alignItems: 'center', gap: 4,
      }}>
        {LANGUAGES[lang]?.label} <Ico.chevD/>
      </button>
      {langOpen && (
        <>
          <div onClick={() => setLangOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)',
            right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto',
            zIndex: 51, background: C.panel, border: `1px solid ${C.line}`,
            borderRadius: 8, overflow: 'hidden', minWidth: 130,
            boxShadow: '0 8px 20px -8px rgba(0,0,0,0.2)',
          }}>
            {Object.entries(LANGUAGES).map(([code, cfg]) => (
              <button key={code} onClick={() => { setLang(code); setLangOpen(false); }} style={{
                width: '100%', background: lang === code ? C.tint : 'none', border: 'none',
                padding: '9px 14px', cursor: 'pointer',
                textAlign: isAr ? 'right' : 'left',
                fontSize: 13,
                fontFamily: code === 'ar' ? '"Cairo", sans-serif' : 'Inter, sans-serif',
                color: C.ink, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {lang === code && <span style={{ color: C.ok }}><Ico.check/></span>}
                {cfg.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ── Screen renderer ──────────────────────────────────────────────────────
  const renderScreen = () => {
    const props = { projectId: id };
    switch (tab) {
      case 'dashboard':    return <DashboardScreen   {...props} onAlertClick={() => setPlanOpen(true)}/>;
      case 'shotlist':     return <ShotListScreen    {...props}/>;
      case 'cast':         return <CastScreen        {...props}/>;
      case 'casting':      return <CastingScreen     {...props}/>;
      case 'lighting':     return <LightingScreen    {...props}/>;
      case 'location':     return <LocationScreen/>;
      case 'tracker':      return <LiveTrackerScreen {...props}/>;
      case 'breakdown':    return <BreakdownScreen   {...props}/>;
      case 'activity':     return <ActivityScreen    {...props}/>;
      case 'budget':       return <BudgetScreen      {...props}/>;
      case 'ai':           return <AIFeedScreen      {...props} onOpenPlan={() => setPlanOpen(true)}/>;
      case 'settings':     return <ViewSettingsScreen {...props}/>;
      case 'script':       return <ScriptScreen      {...props}/>;
      case 'scriptreader': return <ScriptReaderScreen {...props}/>;
      case 'stripboard':   return <StripboardScreen  {...props}/>;
      case 'callsheet':    return <CallSheetScreen   {...props}/>;
      case 'notepad':      return <NotepadScreen     {...props}/>;
      case 'postprod':     return <PostProductionScreen {...props} onViewPrePlan={() => handlePhaseChange('pre-production')}/>;
      default:             return <DashboardScreen   {...props} onAlertClick={() => setPlanOpen(true)}/>;
    }
  };

  /* ═══ MOBILE LAYOUT ═════════════════════════════════════════════════════ */
  if (mobile) {
    return (
      <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: font, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column' }}>

        {/* Mobile header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, background: C.panel, borderBottom: `1px solid ${C.line}`, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 13 }}>P</div>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project?.title || '…'}</div>
            <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font }}>{titles[tab] || tab}</div>
          </div>
          {/* Phase pill */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setPhaseOpen(o => !o)} style={{
              background: 'none', border: `1px solid ${PHASE_TONES[phase]}`, borderRadius: 99,
              padding: '3px 8px', cursor: 'pointer', fontSize: 9.5, fontFamily: '"IBM Plex Mono"',
              color: PHASE_TONES[phase], fontWeight: 600,
            }}>{PHASE_LABELS[phase]}</button>
            {phaseOpen && (
              <>
                <div onClick={() => setPhaseOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }}/>
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto', zIndex: 31, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', width: 180, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)' }}>
                  {Object.entries(PHASE_LABELS).map(([k, l]) => (
                    <button key={k} onClick={() => handlePhaseChange(k)} style={{ width: '100%', background: phase === k ? C.tint : 'none', border: 'none', padding: '9px 14px', cursor: 'pointer', textAlign: isAr ? 'right' : 'left', fontSize: 13, fontFamily: font, color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: PHASE_TONES[k], flexShrink: 0 }}/>
                      {l}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <LangSwitcher/>
          <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: C.muted, flexShrink: 0 }}>
            <Ico.search/>
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, paddingTop: 56, paddingBottom: 64, overflowY: 'auto' }}>
          <div style={{ padding: 12 }}>{renderScreen()}</div>
        </div>

        {/* Bottom tab bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: C.panel, borderTop: `1px solid ${C.line}`, display: 'flex', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          {mobilePrimary.map(tid => {
            const n = navItems.find(x => x.id === tid);
            if (!n) return null;
            const active = tab === n.id;
            const shortLabel = t(lang, `short.${tid}`) || n.label.split(' ')[0];
            return (
              <button key={n.id} onClick={() => { setTab(n.id); setMoreOpen(false); }} style={{
                flex: 1, background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 4px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                color: active ? C.ink : C.muted2,
                borderTop: active ? `2px solid ${C.ink}` : '2px solid transparent',
              }}>
                <n.icon width={20} height={20}/>
                <span style={{ fontSize: isAr ? 8 : 9, fontWeight: active ? 600 : 400, fontFamily: font, letterSpacing: 0.2 }}>{shortLabel}</span>
              </button>
            );
          })}
          {mobileMore.length > 0 && (
            <button onClick={() => setMoreOpen(o => !o)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: moreOpen ? C.ink : C.muted2,
              borderTop: moreOpen ? `2px solid ${C.ink}` : '2px solid transparent',
            }}>
              <Ico.chevD width={20} height={20}/>
              <span style={{ fontSize: 9, fontWeight: 400, fontFamily: font }}>{t(lang, 'more')}</span>
            </button>
          )}
        </div>

        {/* More drawer */}
        {moreOpen && (
          <>
            <div onClick={() => setMoreOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 25, background: 'rgba(0,0,0,0.3)' }}/>
            <div style={{ position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 26, background: C.panel, borderTop: `1px solid ${C.line}`, borderRadius: '16px 16px 0 0', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
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
                    <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, fontFamily: font, textAlign: 'center', lineHeight: 1.3 }}>{n.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <SearchModal projectId={id} open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={tid => { setTab(tid); setMoreOpen(false); }}/>
        <AIToast open={toastOpen && !planOpen} onClick={() => setPlanOpen(true)} onDismiss={() => setToastOpen(false)}/>
        <AIPlanPage open={planOpen} onClose={() => setPlanOpen(false)}/>
      </div>
    );
  }

  /* ═══ DESKTOP LAYOUT ════════════════════════════════════════════════════ */
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: font, WebkitFontSmoothing: 'antialiased' }}>
      <div style={{ display: 'grid', gridTemplateColumns: isAr ? '1fr 240px' : '240px 1fr', minHeight: '100vh' }}>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div style={{
          borderInlineEnd: `1px solid ${C.line}`, background: C.panel,
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          gridColumn: isAr ? 2 : 1,
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${C.line}` }}>
            <button onClick={() => router.push('/')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: C.muted2,
              fontFamily: '"IBM Plex Mono", monospace', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, marginBottom: 10, letterSpacing: 0.3,
            }}>{t(lang, 'allProjects')}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>P</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3, fontFamily: font }}>PROD</div>
                <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project?.title || '…'}</div>
              </div>
            </div>
          </div>

          {/* Phase switcher */}
          <div style={{ padding: '6px 8px', borderBottom: `1px solid ${C.line}`, position: 'relative' }}>
            <button onClick={() => setPhaseOpen(o => !o)} style={{
              width: '100%', background: `${PHASE_TONES[phase]}12`, border: `1px solid ${PHASE_TONES[phase]}30`,
              borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8, textAlign: isAr ? 'right' : 'left',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: PHASE_TONES[phase], flexShrink: 0 }}/>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: PHASE_TONES[phase], fontFamily: font, letterSpacing: 0.2 }}>{PHASE_LABELS[phase]}</span>
              <Ico.chevD/>
            </button>
            {phaseOpen && (
              <>
                <div onClick={() => setPhaseOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
                <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 8, right: 8, zIndex: 41, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                  {Object.entries(PHASE_LABELS).map(([k, l]) => (
                    <button key={k} onClick={() => handlePhaseChange(k)} style={{ width: '100%', background: phase === k ? C.tint : 'none', border: 'none', padding: '9px 12px', cursor: 'pointer', textAlign: isAr ? 'right' : 'left', fontSize: 13, fontFamily: font, color: C.ink, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: PHASE_TONES[k], flexShrink: 0 }}/>
                      <span style={{ flex: 1 }}>{l}</span>
                      {phase === k && <span style={{ color: C.ok }}><Ico.check/></span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notion-style grouped nav */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 8px' }}>
            {navGroups.map((grp, gi) => {
              const items = navItems.filter(n => n.group === grp);
              return (
                <div key={grp} style={{ marginBottom: 4 }}>
                  {/* Group header */}
                  <div style={{
                    padding: gi === 0 ? '8px 16px 3px' : '12px 16px 3px',
                    fontSize: 10.5, fontFamily: '"IBM Plex Mono", monospace',
                    color: C.muted2, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ flex: 1 }}>{t(lang, GROUP_LABEL_KEYS[grp])}</span>
                  </div>
                  {/* Nav items */}
                  {items.map(n => {
                    const active = tab === n.id;
                    return (
                      <button key={n.id} onClick={() => setTab(n.id)} style={{
                        width: '100%', background: active ? C.tint : 'none',
                        border: 'none',
                        borderInlineStart: active ? `2px solid ${C.ink}` : '2px solid transparent',
                        padding: active ? '7px 10px 7px 14px' : '7px 10px 7px 16px',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 9,
                        color: active ? C.ink : C.ink2,
                        fontSize: 13, fontWeight: active ? 500 : 400,
                        fontFamily: font, textAlign: isAr ? 'right' : 'left',
                        transition: 'background 100ms',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.tint; }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ color: n.tint ? C.accent : active ? C.ink : C.muted, display: 'flex', flexShrink: 0 }}><n.icon/></span>
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</span>
                        {n.id === 'ai' && insightCount > 0 && (
                          <span style={{ background: C.accent, color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, flexShrink: 0 }}>{insightCount}</span>
                        )}
                        {n.id === 'activity' && (
                          <span style={{ background: C.line2, color: C.muted, fontSize: 10, padding: '1px 5px', borderRadius: 3, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, flexShrink: 0 }}>8</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Sidebar footer */}
          <div style={{ padding: '12px 14px', borderTop: `1px solid ${C.line}` }}>
            {/* Key team avatars */}
            <div style={{ fontSize: 10, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>{t(lang, 'keyTeam')}</div>
            <div style={{ display: 'flex', marginBottom: 8 }}>
              {['M. Okafor', 'L. Ferrara', 'J. Nakamura', 'S. Hartley'].map((n, i) => (
                <div key={n} style={{ marginInlineStart: i === 0 ? 0 : -6 }}>
                  <Avatar name={n} size={24} ring={C.panel}/>
                </div>
              ))}
              <div style={{ width: 24, height: 24, borderRadius: 99, background: C.tint, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, marginInlineStart: -6, border: `2px solid ${C.panel}`, flexShrink: 0 }}>+10</div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: font }}>
              {project?.title || '…'} · {t(lang, 'dayOf', project?.day_current || '–', project?.day_total || '–')}
            </div>
            <div style={{ marginTop: 8 }}>
              <LangSwitcher/>
            </div>
          </div>
        </div>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div style={{ minWidth: 0, gridColumn: isAr ? 1 : 2 }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 22px', borderBottom: `1px solid ${C.line}`,
            background: C.bg, position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{today} · {t(lang, 'day')} {project?.day_current || '–'}</div>
              <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.3, marginTop: 1, fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{titles[tab] || tab}</div>
            </div>

            {/* Search */}
            <div onClick={() => setSearchOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, width: 220, cursor: 'pointer', flexShrink: 0 }}>
              <div style={{ color: C.muted2 }}><Ico.search/></div>
              <span style={{ flex: 1, fontSize: 12, color: C.muted2, fontFamily: font }}>{t(lang, 'searchPlaceholder')}</span>
              <Kbd>⌘K</Kbd>
            </div>

            {/* Role switcher */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setRoleOpen(o => !o)} style={{
                background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 6,
                padding: '5px 10px 5px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <Avatar name={ROLES[role].name} size={22}/>
                <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 500, fontFamily: font }}>{ROLES[role].name}</div>
                  <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{ROLES[role].role}</div>
                </div>
                <Ico.chevD/>
              </button>
              {roleOpen && (
                <>
                  <div onClick={() => setRoleOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }}/>
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)',
                    right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto',
                    zIndex: 41, background: C.panel, border: `1px solid ${C.line}`,
                    borderRadius: 8, boxShadow: '0 12px 30px -10px rgba(0,0,0,0.15)', width: 230, overflow: 'hidden',
                  }}>
                    <div style={{ padding: '7px 12px', fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1.2, textTransform: 'uppercase', borderBottom: `1px solid ${C.line}` }}>{t(lang, 'viewAs')}</div>
                    {Object.entries(ROLES).map(([k, r]) => (
                      <button key={k} onClick={() => { setRole(k); setRoleOpen(false); }} style={{
                        width: '100%', background: role === k ? C.tint : 'none', border: 'none',
                        padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: isAr ? 'right' : 'left',
                      }}>
                        <Avatar name={r.name} size={26}/>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, fontFamily: font }}>{r.name}</div>
                          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{r.role}</div>
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
          <div style={{ padding: 24 }}>{renderScreen()}</div>
        </div>
      </div>

      {/* Overlays */}
      <AIToast open={toastOpen && !planOpen} onClick={() => setPlanOpen(true)} onDismiss={() => setToastOpen(false)}/>
      <AIPlanPage open={planOpen} onClose={() => setPlanOpen(false)}/>
      <SearchModal projectId={id} open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={setTab}/>

      {/* Replay button */}
      {!toastOpen && !planOpen && (
        <button onClick={() => setToastOpen(true)} style={{
          position: 'fixed', bottom: 24, insetInlineEnd: 24, zIndex: 50,
          background: C.ink, color: '#fff', border: 'none', borderRadius: 999,
          padding: '10px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          fontFamily: font, display: 'flex', alignItems: 'center', gap: 8,
          boxShadow: '0 8px 24px -8px rgba(0,0,0,0.25)',
        }}><Ico.sparkle/>{t(lang, 'replayAI')}</button>
      )}
    </div>
  );
}
