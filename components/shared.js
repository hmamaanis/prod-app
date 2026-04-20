'use client';

export const C = {
  bg: '#FAFAF8', panel: '#FFFFFF', ink: '#1A1A1A', ink2: '#424242',
  muted: '#6B6B6B', muted2: '#9A9A95', line: '#EAEAE6', line2: '#D8D8D2',
  tint: '#F4F3EF', accent: '#E89B4C', accent2: '#C87A2A',
  critical: '#4A6FE8', critical2: '#2E4BC0', ok: '#5A8F5A', warn: '#B8893B', red: '#C8543A',
};

export const Ico = {
  dash:     (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 12h7V3H3zM14 12h7V3h-7zM3 21h7v-6H3zM14 21h7v-6h-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users:    (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M16 11a3 3 0 100-6M21 20c0-2-1.5-4-4-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  light:    (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M8 4h8l2 6a6 6 0 01-12 0zM10 16v4M14 16v4M8 20h8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  pin:      (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  map:      (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M9 3l-6 2v16l6-2 6 2 6-2V3l-6 2zM9 3v16M15 5v16" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  shotlist: (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.6"/><path d="M17 8l4-2v10l-4-2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  sparkle:  (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM5 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  bell:     (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M18 16H6l2-3V9a4 4 0 118 0v4zM10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dollar:   (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  book:     (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 5v15a2 2 0 012-2h14V3H6a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8 8h8M8 12h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  clap:     (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 10l1-4 18 3-1 4zM3 10v10h18V10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>,
  clock:    (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  rain:     (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M7 15h11a4 4 0 00.8-7.9A6 6 0 007 6a4.5 4.5 0 000 9zM9 18v3M13 18v3M17 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  search:   (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/><path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  chevD:    (p={}) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x:        (p={}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  plus:     (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check:    (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12l5 5 9-11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrow:    (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash:    (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  edit:     (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  pencil:   (p={}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" {...p}><path d="M15.232 5.232l3.536 3.536M3 21l4-1L20.5 7a2.121 2.121 0 00-3-3L4 17.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

export function Avatar({ name = '?', size = 28, ring }) {
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0,2).join('');
  const hues = [22, 42, 200, 160, 280, 340, 100, 240];
  const h = hues[(name.charCodeAt(0) || 0) % hues.length];
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: `oklch(0.88 0.04 ${h})`, color: `oklch(0.35 0.08 ${h})`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 600, letterSpacing: 0.2, border: ring ? `2px solid ${ring}` : 'none', fontFamily: 'Inter, system-ui', flexShrink: 0 }}>{initials}</div>
  );
}

export function Badge({ children, tone = 'neutral', dot }) {
  const tones = {
    neutral: { bg: '#F0EFEB', fg: '#424242', dot: '#9A9A95' },
    accent:  { bg: '#FCEFDC', fg: '#8B5418', dot: '#E89B4C' },
    critical:{ bg: '#E7EBFB', fg: '#2A3C8A', dot: '#4A6FE8' },
    ok:      { bg: '#E4EDE4', fg: '#345734', dot: '#5A8F5A' },
    warn:    { bg: '#F5EBD6', fg: '#6E501C', dot: '#B8893B' },
    red:     { bg: '#F6DDD5', fg: '#7A2E1C', dot: '#C8543A' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.bg, color: t.fg, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, fontFamily: 'Inter, system-ui', letterSpacing: 0.1, whiteSpace: 'nowrap' }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 99, background: t.dot }}/>}
      {children}
    </span>
  );
}

export function Kbd({ children }) {
  return <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, background: '#EFEEEA', color: '#6B6B6B', border: '1px solid #E2E1DD', borderRadius: 3, padding: '1px 5px' }}>{children}</span>;
}

export function Card({ children, interactive, onClick, style = {} }) {
  return (
    <div onClick={onClick} style={{ background: C.panel, borderRadius: 10, border: `1px solid ${C.line}`, cursor: interactive ? 'pointer' : 'default', transition: 'border-color 160ms', ...style }}
      onMouseEnter={e => interactive && (e.currentTarget.style.borderColor = C.line2)}
      onMouseLeave={e => interactive && (e.currentTarget.style.borderColor = C.line)}>
      {children}
    </div>
  );
}

export function SectionHead({ children, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px 10px', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', fontWeight: 500 }}>{children}</div>
      {action}
    </div>
  );
}

export function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', fontSize: 13, fontWeight: active ? 600 : 500, color: active ? C.ink : C.muted, borderBottom: active ? `2px solid ${C.ink}` : '2px solid transparent', fontFamily: 'Inter, system-ui' }}>{children}</button>
  );
}

export function PrimaryBtn({ children, icon: I, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.line2 : C.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', fontSize: 12.5, fontWeight: 500, cursor: disabled ? 'default' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, system-ui' }}>{I && <I/>}{children}</button>
  );
}

export function GhostBtn({ children, icon: I, onClick }) {
  return (
    <button onClick={onClick} style={{ background: C.panel, color: C.ink2, border: `1px solid ${C.line2}`, borderRadius: 6, padding: '7px 12px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter, system-ui' }}>{I && <I/>}{children}</button>
  );
}

export function StatusDot({ status }) {
  const map = { 'on-set': C.ok, 'travel': C.warn, 'holding': C.muted2, 'wrapped': C.muted2, 'not-called': C.line2, 'at-base': C.muted2 };
  return <span style={{ width: 6, height: 6, borderRadius: 99, background: map[status] || C.muted2, display: 'inline-block' }}/>;
}

export function statusLabel(p) {
  const map = { 'on-set': 'On set', 'travel': `ETA ${p.eta || ''}`.trim(), 'holding': 'Holding', 'wrapped': 'Wrapped', 'not-called': 'Not called', 'at-base': 'Base camp' };
  return map[p.status] || p.status;
}
