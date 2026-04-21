'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { C, Ico, Avatar, StatusDot, statusLabel } from '@/components/shared';
import { useLang } from '@/lib/LangContext';
import { t, LANGUAGES } from '@/lib/i18n';
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
  dashboard: { icon: Ico.dash,     Component: DashboardScreen },
  shotlist:  { icon: Ico.shotlist,  Component: ShotListScreen },
  cast:      { icon: Ico.users,     Component: CastScreen },
  lighting:  { icon: Ico.light,     Component: LightingScreen },
  location:  { icon: Ico.pin,       Component: LocationScreen },
  tracker:   { icon: Ico.map,       Component: LiveTrackerScreen },
  breakdown: { icon: Ico.book,      Component: BreakdownScreen },
  activity:  { icon: Ico.bell,      Component: ActivityScreen },
  budget:    { icon: Ico.dollar,    Component: BudgetScreen },
  ai:        { icon: Ico.sparkle,   Component: AIFeedScreen },
};

// Short label keys for each tab
const SHORT_KEYS = {
  dashboard: 'short.dashboard',
  shotlist:  'short.shotlist',
  cast:      'short.cast',
  lighting:  'short.lighting',
  location:  'short.location',
  tracker:   'short.tracker',
  breakdown: 'short.breakdown',
  activity:  'short.activity',
  budget:    'short.budget',
  ai:        'short.ai',
};

export default function CrewViewPage() {
  const { token } = useParams();
  const { lang, setLang } = useLang();
  const isAr = lang === 'ar';
  const font = LANGUAGES[lang]?.font || 'Inter, system-ui, sans-serif';

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab]       = useState(null);
  const [langOpen, setLangOpen] = useState(false);

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

  const LoadingLogo = () => (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 16, margin: '0 auto 12px' }}>P</div>
        <div style={{ fontSize: 13, color: C.muted }}>{t(lang, 'loading')}</div>
      </div>
    </div>
  );

  if (loading) return <LoadingLogo/>;

  if (notFound || !data) {
    return (
      <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono"', fontWeight: 700, fontSize: 18, margin: '0 auto 16px' }}>P</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            {isAr ? 'الرابط غير موجود' : 'Link not found'}
          </div>
          <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
            {isAr
              ? 'هذا الرابط انتهت صلاحيته أو غير صالح. اطلب من المخرج أو المساعد إرسال رابط جديد.'
              : 'This crew access link has expired or is invalid. Ask your AD or Producer to send a new link.'}
          </div>
          {/* Lang switcher */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Object.entries(LANGUAGES).map(([code, cfg]) => (
              <button key={code} onClick={() => setLang(code)} style={{
                background: lang === code ? C.ink : C.tint,
                color: lang === code ? '#fff' : C.muted,
                border: `1px solid ${C.line}`, borderRadius: 6, cursor: 'pointer',
                padding: '6px 12px', fontSize: 12,
                fontFamily: code === 'ar' ? '"Cairo", sans-serif' : 'Inter, sans-serif',
              }}>{cfg.label}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { project, name, role, visible_tabs = [], crew_member_id, crew_type } = data;
  const tabs = (visible_tabs.length > 0 ? visible_tabs : ['dashboard']).filter(t => TAB_MAP[t]);
  const activeTab = tab && TAB_MAP[tab] ? tab : tabs[0];
  const { Component } = TAB_MAP[activeTab] || TAB_MAP['dashboard'];

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: font, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column' }}>

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

        {/* Lang toggle */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setLangOpen(o => !o)} style={{
            background: C.tint, border: `1px solid ${C.line2}`, borderRadius: 6,
            padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: font, color: C.muted,
          }}>
            {LANGUAGES[lang]?.label}
          </button>
          {langOpen && (
            <>
              <div onClick={() => setLangOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }}/>
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: isAr ? 'auto' : 0, left: isAr ? 0 : 'auto', zIndex: 31, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, overflow: 'hidden', minWidth: 120 }}>
                {Object.entries(LANGUAGES).map(([code, cfg]) => (
                  <button key={code} onClick={() => { setLang(code); setLangOpen(false); }} style={{
                    width: '100%', background: lang === code ? C.tint : 'none', border: 'none',
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13, textAlign: isAr ? 'right' : 'left',
                    fontFamily: code === 'ar' ? '"Cairo", sans-serif' : 'Inter, sans-serif', color: C.ink,
                  }}>{cfg.label}</button>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, textAlign: isAr ? 'left' : 'right' }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', marginBottom: 2 }}>{role}</div>
          <div style={{ fontSize: 10.5, color: C.muted2 }}>
            {t(lang, 'dayOf', project?.day_current || '—', project?.day_total || '—')}
          </div>
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
        {tabs.map(tid => {
          const entry = TAB_MAP[tid];
          if (!entry) return null;
          const TabIcon = entry.icon;
          const active = activeTab === tid;
          const label = t(lang, SHORT_KEYS[tid] || `short.${tid}`) || tid;
          return (
            <button key={tid} onClick={() => setTab(tid)} style={{
              flex: 1, background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 4px 6px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? C.ink : C.muted2,
              borderTop: active ? `2px solid ${C.ink}` : '2px solid transparent',
              transition: 'color 120ms',
            }}>
              <TabIcon width={20} height={20}/>
              <span style={{ fontSize: isAr ? 8 : 9, fontWeight: active ? 600 : 400, fontFamily: font, letterSpacing: 0.2 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
