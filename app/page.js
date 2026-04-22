'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, createProject } from '@/lib/api';
import { C, Ico, Avatar } from '@/components/shared';
import OnboardingWizard from '@/components/OnboardingWizard';
import { useLang } from '@/lib/LangContext';
import { t, LANGUAGES } from '@/lib/i18n';

const SORT_OPTIONS_KEYS = ['recent', 'az', 'status'];

// Globe SVG icon
function GlobeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3c-2.5 3-4 5.5-4 9s1.5 6 4 9M12 3c2.5 3 4 5.5 4 9s-1.5 6-4 9M3 12h18"/>
    </svg>
  );
}

// Phone icon
function PhoneIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="18" r="1" fill="currentColor"/>
    </svg>
  );
}

// Copy icon
function CopyIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}

// Floating language switcher — a globe button with a dropdown
function LangFAB({ lang, setLang, isAr, font }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'fixed', bottom: 24, left: isAr ? 'auto' : 24, right: isAr ? 24 : 'auto', zIndex: 100 }}>
      {/* Dropdown — appears above */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }}/>
          <div style={{
            position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
            zIndex: 100, background: C.panel,
            border: `1px solid ${C.line}`,
            borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 -8px 30px -8px rgba(0,0,0,0.18)',
            minWidth: 160,
          }}>
            <div style={{ padding: '8px 12px 6px', fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted2, letterSpacing: 1.2, textTransform: 'uppercase', borderBottom: `1px solid ${C.line}` }}>
              Language
            </div>
            {Object.entries(LANGUAGES).map(([code, cfg]) => {
              const active = lang === code;
              return (
                <button key={code} onClick={() => { setLang(code); setOpen(false); }} style={{
                  width: '100%', background: active ? C.tint : 'none',
                  border: 'none', padding: '11px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  textAlign: 'left',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{code === 'ar' ? '🇸🇦' : '🇺🇸'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: code === 'ar' ? '"Cairo", sans-serif' : 'Inter, sans-serif', color: C.ink }}>{cfg.label}</div>
                    <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginTop: 1 }}>{code === 'ar' ? 'Arabic' : 'English'}</div>
                  </div>
                  {active && <span style={{ color: C.ok, fontSize: 16 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
      {/* FAB button */}
      <button onClick={() => setOpen(o => !o)} style={{
        width: 48, height: 48, borderRadius: '50%',
        background: open ? C.ink : C.panel,
        color: open ? '#fff' : C.ink2,
        border: `1px solid ${C.line}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px -4px rgba(0,0,0,0.2)',
        transition: 'all 150ms',
        flexShrink: 0,
      }}>
        <GlobeIcon size={20}/>
      </button>
    </div>
  );
}

// Mobile access card — shows the URL + copy button + per-project links
function MobileAccessCard({ projects, lang, font, isAr }) {
  const [copied, setCopied] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    setAppUrl(window.location.origin);
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div style={{
      marginTop: 28,
      background: C.panel,
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header row */}
      <button onClick={() => setExpanded(o => !o)} style={{
        width: '100%', background: 'none', border: 'none', cursor: 'pointer',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        textAlign: isAr ? 'right' : 'left',
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.critical}15`, color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PhoneIcon size={18}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, fontFamily: font }}>
            {isAr ? 'الوصول عبر الهاتف' : 'Phone & mobile access'}
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2, fontFamily: font }}>
            {isAr ? 'افتح الرابط على هاتفك للوصول الكامل' : 'Open on any device — fully responsive'}
          </div>
        </div>
        <span style={{ color: C.muted, fontSize: 16, transition: 'transform 200ms', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${C.line}`, padding: '16px 20px' }}>

          {/* App URL */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {isAr ? 'رابط التطبيق' : 'App URL'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '9px 12px', background: C.tint, borderRadius: 7, border: `1px solid ${C.line}`, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {appUrl || 'https://prod-app-lemon.vercel.app'}
              </div>
              <button onClick={() => copy(appUrl || 'https://prod-app-lemon.vercel.app', 'app')} style={{
                background: copied === 'app' ? C.ok : C.ink,
                color: '#fff', border: 'none', borderRadius: 7,
                padding: '9px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontFamily: font, fontWeight: 500, flexShrink: 0,
                transition: 'background 200ms',
              }}>
                {copied === 'app' ? '✓ Copied' : <><CopyIcon/> Copy</>}
              </button>
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6, fontFamily: font }}>
              {isAr ? 'شارك هذا الرابط مع أعضاء الفريق — يعمل على أي هاتف أو جهاز لوحي' : 'Share this with your crew — works on any phone or tablet, no app install needed'}
            </div>
          </div>

          {/* Project-level links */}
          {projects.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                {isAr ? 'روابط المشاريع المباشرة' : 'Direct project links'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {projects.slice(0, 4).map(p => {
                  const url = `${appUrl}/project/${p.id}`;
                  const key = `proj-${p.id}`;
                  return (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: C.tint, borderRadius: 7, border: `1px solid ${C.line}` }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'in-production' ? C.ok : p.status === 'post-production' ? C.critical : C.warn, flexShrink: 0 }}/>
                      <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, fontFamily: font, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</span>
                      <span style={{ fontSize: 10.5, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', flexShrink: 0 }}>/{p.id.slice(0, 8)}…</span>
                      <button onClick={() => copy(url, key)} style={{
                        background: copied === key ? C.ok : 'none',
                        color: copied === key ? '#fff' : C.muted2,
                        border: `1px solid ${copied === key ? C.ok : C.line2}`,
                        borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
                        fontSize: 11, fontFamily: font, flexShrink: 0,
                        transition: 'all 150ms',
                      }}>
                        {copied === key ? '✓' : isAr ? 'نسخ' : 'Copy'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Crew access hint */}
          <div style={{ marginTop: 14, padding: '10px 14px', background: `${C.accent}12`, borderRadius: 8, border: `1px solid ${C.accent}30` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <div style={{ fontSize: 12, color: C.ink2, fontFamily: font, lineHeight: 1.55 }}>
                {isAr
                  ? 'لمنح الطاقم وصولاً مخصصاً (مشاهد محددة فقط)، اذهب إلى مشروع ← إعدادات ← إدارة الوصول وولّد رابطاً خاصاً لكل شخص.'
                  : 'To give each crew member their own restricted view (only their tabs), go to Project → Settings → View Access and generate a personal link per person.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HubPage() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const isAr = lang === 'ar';
  const font = LANGUAGES[lang]?.font || 'Inter, system-ui, sans-serif';

  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('recent');

  useEffect(() => {
    getProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const handleNew = () => setOnboarding(true);

  const handleOnboardingComplete = async (answers) => {
    const kindMap = { feature: 'feature', short: 'short', tv: 'tv', doc: 'documentary', commercial: 'commercial', music: 'music' };
    const p = await createProject({
      title: answers.title || t(lang, 'newProject'),
      kind: kindMap[answers.kind] || answers.kind || 'feature',
      status: 'pre-production',
      day_current: 1,
      day_total: answers.shootDays || 1,
      accent: '#E89B4C',
      cover_color: '#C26B4A',
    });
    setProjects(prev => [...prev, p]);
    setOnboarding(false);
    router.push(`/project/${p.id}`);
  };

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.kind?.toLowerCase().includes(q) || p.status?.toLowerCase().includes(q));
    }
    if (sort === 'az')     list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    if (sort === 'status') list.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return list;
  }, [projects, search, sort]);

  const sortLabels = { recent: t(lang, 'sortRecent'), az: t(lang, 'sortAZ'), status: t(lang, 'sortStatus') };

  const statusLabel = (s) => {
    if (s === 'pre-production')  return t(lang, 'preProduction');
    if (s === 'in-production')   return t(lang, 'inProduction');
    if (s === 'post-production') return t(lang, 'postProduction');
    return s;
  };

  const phaseColor = (s) => s === 'in-production' ? C.ok : s === 'post-production' ? C.critical : C.warn;

  if (onboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={() => setOnboarding(false)} />;
  }

  if (loading) return <div style={{ padding: 48, fontFamily: font, color: C.muted }}>{t(lang, 'loading')}</div>;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: C.bg, padding: '48px 64px', fontFamily: font }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12 }}>P</div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3 }}>PROD</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>{t(lang, 'workspace')}</div>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.6, marginTop: 6 }}>{t(lang, 'yourProjects')}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
              {t(lang, 'productions', projects.length)}
            </div>
          </div>

          {/* New project button — lang switcher is now the floating FAB */}
          <button onClick={handleNew} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: font, marginTop: 4 }}>
            <Ico.plus/> {t(lang, 'newProject')}
          </button>
        </div>

        {/* Search + sort bar */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 360, padding: '8px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 7 }}>
              <div style={{ color: C.muted2 }}><Ico.search/></div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t(lang, 'searchProjects')}
                style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, outline: 'none', fontFamily: font, color: C.ink, textAlign: isAr ? 'right' : 'left' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 0 }}><Ico.x/></button>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              border: `1px solid ${C.line}`, background: C.panel, borderRadius: 7, padding: '8px 12px',
              fontSize: 13, fontFamily: font, color: C.ink2, cursor: 'pointer', outline: 'none',
            }}>
              {SORT_OPTIONS_KEYS.map(k => <option key={k} value={k}>{sortLabels[k]}</option>)}
            </select>
          </div>
        )}

        {/* Project grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => router.push(`/project/${p.id}`)}
              style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer', overflow: 'hidden', transition: 'border-color 160ms' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.line2}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.line}>
              {/* Cover image */}
              <div style={{ aspectRatio: '16/6', background: `linear-gradient(135deg, ${p.accent || C.accent} 0%, ${p.cover_color || C.accent} 100%)`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 14px)' }}/>
                <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>{(p.kind || 'feature').toUpperCase()}</div>
                {p.status === 'in-production' && (
                  <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.95)', color: C.critical, fontSize: 10.5, padding: '4px 8px', borderRadius: 4, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>LIVE</div>
                )}
              </div>
              {/* Card body */}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>{p.title}</div>
                  {/* Phase badge */}
                  <span style={{ flexShrink: 0, padding: '3px 8px', borderRadius: 99, background: `${phaseColor(p.status)}15`, color: phaseColor(p.status), fontSize: 10.5, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace', border: `1px solid ${phaseColor(p.status)}30`, marginTop: 3 }}>
                    {statusLabel(p.status).split(' ').map(w => w[0]).join('')}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {statusLabel(p.status)} · {t(lang, 'dayOf', p.day_current, p.day_total)}
                </div>
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.ink2, fontWeight: 500 }}>
                  {t(lang, 'openProject')} <Ico.arrow/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {projects.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{t(lang, 'noResultsFor', search)}</div>
            <button onClick={() => setSearch('')} style={{ fontSize: 13, color: C.ink2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: font }}>{t(lang, 'clearSearch')}</button>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{t(lang, 'noProjects')}</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>{t(lang, 'noProjectsHint')}</div>
            <button onClick={handleNew} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: font }}>
              <Ico.plus /> {t(lang, 'newProject')}
            </button>
          </div>
        )}

        {/* Mobile access card */}
        <MobileAccessCard projects={projects} lang={lang} font={font} isAr={isAr}/>

        <div style={{ marginTop: 24, fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
          PROD v1.0 · {new Date().getFullYear()}
        </div>
      </div>

      {/* Floating language switcher FAB — always visible, bottom-left corner */}
      <LangFAB lang={lang} setLang={setLang} isAr={isAr} font={font}/>
    </div>
  );
}
