'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, createProject } from '@/lib/api';
import { C, Ico, Avatar } from '@/components/shared';
import OnboardingWizard from '@/components/OnboardingWizard';

const SORT_OPTIONS = [
  { value: 'recent',  label: 'Recent' },
  { value: 'az',      label: 'A – Z' },
  { value: 'status',  label: 'Status' },
];

export default function HubPage() {
  const router = useRouter();
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
      title: answers.title || 'New Project',
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

  if (onboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} onCancel={() => setOnboarding(false)} />;
  }

  if (loading) return <div style={{ padding: 48, fontFamily: 'Inter', color: C.muted }}>Loading…</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '48px 64px', fontFamily: 'Inter, system-ui' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, background: C.ink, color: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12 }}>P</div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.3 }}>PROD</span>
            </div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1, textTransform: 'uppercase' }}>Workspace</div>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -0.6, marginTop: 6 }}>Your projects</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>{projects.length} production{projects.length !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={handleNew} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter' }}>
            <Ico.plus/> New project
          </button>
        </div>

        {/* Search + sort bar */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 360, padding: '8px 12px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 7 }}>
              <div style={{ color: C.muted2 }}><Ico.search/></div>
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search projects..."
                style={{ flex: 1, border: 'none', background: 'none', fontSize: 13, outline: 'none', fontFamily: 'Inter', color: C.ink }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 0 }}><Ico.x/></button>}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              border: `1px solid ${C.line}`, background: C.panel, borderRadius: 7, padding: '8px 12px',
              fontSize: 13, fontFamily: 'Inter', color: C.ink2, cursor: 'pointer', outline: 'none',
            }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => router.push(`/project/${p.id}`)}
              style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer', overflow: 'hidden', transition: 'all 160ms' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.line2}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.line}>
              <div style={{ aspectRatio: '16/6', background: `linear-gradient(135deg, ${p.accent || C.accent} 0%, ${p.cover_color || C.accent} 100%)`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 14px)' }}/>
                <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>{(p.kind || 'feature').toUpperCase()}</div>
                {p.status === 'in-production' && (
                  <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.95)', color: C.critical, fontSize: 10.5, padding: '4px 8px', borderRadius: 4, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>LIVE</div>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, textTransform: 'capitalize' }}>{(p.status || '').replace(/-/g, ' ')} · Day {p.day_current} / {p.day_total}</div>
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.ink2, fontWeight: 500 }}>
                  Open project <Ico.arrow/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results from search */}
        {projects.length > 0 && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>No projects match "{search}"</div>
            <button onClick={() => setSearch('')} style={{ fontSize: 13, color: C.ink2, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Inter' }}>Clear search</button>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>Set up your first production in under 2 minutes.</div>
            <button onClick={handleNew} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Inter' }}>
              <Ico.plus /> New project
            </button>
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
          PROD v1.0 · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
