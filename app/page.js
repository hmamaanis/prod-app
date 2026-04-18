'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, createProject } from '@/lib/api';
import { C, Ico, Avatar } from '@/components/shared';

export default function HubPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getProjects().then(setProjects).finally(() => setLoading(false));
  }, []);

  const handleNew = async () => {
    const p = await createProject({
      title: 'New Project', kind: 'feature', status: 'pre-production',
      day_current: 1, day_total: 1, accent: '#E89B4C', cover_color: '#C26B4A',
    });
    router.push(`/project/${p.id}`);
  };

  if (loading) return <div style={{ padding: 48, fontFamily: 'Inter', color: C.muted }}>Loading…</div>;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, padding: '48px 64px', fontFamily: 'Inter, system-ui' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
          {projects.map(p => (
            <div key={p.id} onClick={() => router.push(`/project/${p.id}`)}
              style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, cursor: 'pointer', overflow: 'hidden', transition: 'all 160ms' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.line2}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.line}>
              <div style={{ aspectRatio: '16/6', background: `linear-gradient(135deg, ${p.accent} 0%, ${p.cover_color} 100%)`, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 14px)' }}/>
                <div style={{ position: 'absolute', top: 14, left: 16, fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.95)', fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>{p.kind.toUpperCase()}</div>
                {p.status === 'in-production' && (
                  <div style={{ position: 'absolute', top: 12, right: 14, background: 'rgba(255,255,255,0.95)', color: C.critical, fontSize: 10.5, padding: '4px 8px', borderRadius: 4, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>LIVE</div>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.3 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2, textTransform: 'capitalize' }}>{p.status.replace('-', ' ')} · Day {p.day_current} / {p.day_total}</div>
                <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.ink2, fontWeight: 500 }}>
                  Open project <Ico.arrow/>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>No projects yet</div>
            <div style={{ fontSize: 13 }}>Click "New project" to get started.</div>
          </div>
        )}

        <div style={{ marginTop: 32, fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'center' }}>
          PROD v1.0 · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
