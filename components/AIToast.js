'use client';
import { C, Ico } from './shared';

export default function AIToast({ open, onClick, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 90,
      width: 380,
      transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.96)',
      opacity: open ? 1 : 0,
      pointerEvents: open ? 'auto' : 'none',
      transition: 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
    }}>
      <div onClick={onClick} style={{
        background: C.panel, border: `1px solid ${C.line}`,
        borderLeft: `3px solid ${C.critical}`,
        borderRadius: 10, cursor: 'pointer',
        boxShadow: '0 12px 40px -12px rgba(26,26,26,0.25), 0 4px 12px -4px rgba(26,26,26,0.1)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '14px 16px', display: 'flex', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ico.sparkle/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.critical, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>AI INSIGHT</span>
              <span style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>· just now</span>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, color: C.ink, marginBottom: 4 }}>
              Tomorrow's rooftop scene is at risk — rain 70% at 14:00.
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>2 plans ready. <span style={{ color: C.critical, fontWeight: 500 }}>Open plan →</span></div>
          </div>
          <button onClick={e => { e.stopPropagation(); onDismiss(); }} style={{
            background: 'none', border: 'none', color: C.muted2, cursor: 'pointer',
            padding: 0, width: 20, height: 20, flexShrink: 0,
          }}><Ico.x/></button>
        </div>
        <div style={{ height: 2, background: C.line, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '40%', background: C.critical, animation: 'shimmer 2.2s ease-in-out infinite' }}/>
        </div>
      </div>
    </div>
  );
}
