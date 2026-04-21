'use client';
import { useState, useEffect, useRef } from 'react';
import { C, Ico, Badge, PrimaryBtn, GhostBtn, Avatar, Card } from './shared';
import { getCast, createCast, updateCast } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const CASTING_STATUSES = ['approaching', 'offered', 'confirmed', 'declined', 'consideration'];

const STATUS_META = {
  approaching:   { label: 'Approaching',       tone: 'warn' },
  offered:       { label: 'Offered',            tone: 'critical' },
  confirmed:     { label: 'Confirmed',          tone: 'ok' },
  declined:      { label: 'Declined',           tone: 'red' },
  consideration: { label: 'In consideration',   tone: 'neutral' },
};

const SESSION_TYPES = ['Audition', 'Callback', 'Chemistry read', 'Table read', 'Final decision'];
const SESSION_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

const SAMPLE_CAST = [
  { id: 'c1', name: 'Marcus Chen (Lead)', actor: 'James Rodriguez', agent: 'WME — T. Okafor', rate: 8500, status: 'confirmed',     character: 'MARCUS',  photo: '', shootDays: 32, description: 'The protagonist — a disillusioned investigator.' },
  { id: 'c2', name: 'Sara Volkov (Lead)', actor: 'Amira Hassan',    agent: 'CAA — L. Park',  rate: 7200, status: 'offered',        character: 'SARA',    photo: '', shootDays: 28, description: 'Sara, co-lead — complex moral arc.' },
  { id: 'c3', name: 'Detective Reeves',   actor: 'Thomas Bright',   agent: 'UTA',            rate: 3800, status: 'approaching',    character: 'REEVES',  photo: '', shootDays: 14, description: 'Veteran detective, key supporting role.' },
  { id: 'c4', name: 'The Handler',        actor: 'Open — TBD',      agent: '—',              rate: 4500, status: 'consideration',  character: 'HANDLER', photo: '', shootDays: 18, description: 'Mysterious antagonist. Still casting.' },
];

const SAMPLE_SESSIONS = [
  { id: 's1', castId: 'c2', actor: 'Amira Hassan',   character: 'SARA',    type: 'Callback',   date: '2026-04-28', time: '10:00', location: 'Studio B — 5th Ave',    notes: 'Bring revised sides.', status: 'Scheduled' },
  { id: 's2', castId: 'c3', actor: 'Thomas Bright',  character: 'REEVES',  type: 'Audition',   date: '2026-04-22', time: '14:30', location: 'Virtual — Zoom',         notes: '',                     status: 'Scheduled' },
  { id: 's3', castId: 'c1', actor: 'James Rodriguez', character: 'MARCUS', type: 'Table read', date: '2026-04-10', time: '09:00', location: 'Producers Office — 12F', notes: 'Full cast read-through.', status: 'Completed' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAvailability(castId, day) {
  // Deterministic fake availability for demo
  const seed = (castId.charCodeAt(castId.length - 1) + day) % 5;
  if (seed === 0) return 'unavailable';
  if (seed === 1 || seed === 4) return 'available';
  return 'unknown';
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function isFuture(dateStr) {
  return new Date(dateStr + 'T00:00:00') >= new Date(new Date().toDateString());
}

const inp = {
  border: `1px solid ${C.line2}`, borderRadius: 5, padding: '7px 10px',
  fontSize: 13, fontFamily: 'Inter, system-ui', outline: 'none',
  background: C.bg, color: C.ink, width: '100%', boxSizing: 'border-box',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: C.muted2 }}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 5v14M17 5v14M2 10h3M19 10h3M2 14h3M19 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function PhotoPopover({ onClose, onSave }) {
  const [url, setUrl] = useState('');
  const ref = useRef();
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: 'absolute', top: 8, right: 8, zIndex: 40, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8, padding: 12, width: 220, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 8, letterSpacing: 0.5 }}>PHOTO URL</div>
      <input autoFocus value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" style={{ ...inp, marginBottom: 8, fontSize: 12 }}/>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => { onSave(url); onClose(); }} style={{ flex: 1, background: C.ink, color: '#fff', border: 'none', borderRadius: 5, padding: '6px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, system-ui' }}>Save</button>
        <button onClick={onClose} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter, system-ui' }}>Cancel</button>
      </div>
    </div>
  );
}

function AvailabilityBar({ castId }) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = addDays(today, i);
    const avail = getAvailability(castId, i);
    return { date: fmtDate(d), avail };
  });
  const colors = { available: C.ok, unavailable: C.red, unknown: C.line2 };
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'nowrap', overflow: 'hidden' }}>
      {days.map((d, i) => (
        <div key={i} title={`${d.date}: ${d.avail}`} style={{ width: 12, height: 12, borderRadius: 2, background: colors[d.avail], flexShrink: 0, cursor: 'default', transition: 'opacity 120ms' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        />
      ))}
    </div>
  );
}

function CastingCard({ member, onUpdate }) {
  const [showPhotoPopover, setShowPhotoPopover] = useState(false);
  const [editingActor, setEditingActor] = useState(false);
  const [actorDraft, setActorDraft] = useState(member.actor);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const statusRef = useRef();

  const meta = STATUS_META[member.status] || STATUS_META.consideration;

  useEffect(() => {
    function handler(e) { if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusMenu(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveActor = () => {
    onUpdate(member.id, { actor: actorDraft });
    setEditingActor(false);
  };

  const savePhoto = (url) => onUpdate(member.id, { photo: url });
  const setStatus = (s) => { onUpdate(member.id, { status: s }); setShowStatusMenu(false); };

  return (
    <div style={{ background: C.panel, borderRadius: 10, border: `1px solid ${C.line}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Photo area */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: C.tint, cursor: 'pointer', flexShrink: 0 }}
        onClick={() => !showPhotoPopover && setShowPhotoPopover(true)}>
        {member.photo ? (
          <img src={member.photo} alt={member.actor} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <FilmIcon />
            <span style={{ fontSize: 11, color: C.muted2, fontFamily: 'Inter, system-ui' }}>Add photo</span>
          </div>
        )}
        {/* Status ribbon */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <Badge tone={meta.tone} dot>{meta.label}</Badge>
        </div>
        {/* Photo popover */}
        {showPhotoPopover && (
          <PhotoPopover onClose={() => setShowPhotoPopover(false)} onSave={savePhoto}/>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {/* Character name */}
        <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, fontFamily: 'Inter, system-ui', lineHeight: 1.2 }}>{member.name}</div>

        {/* Actor name — inline editable */}
        {editingActor ? (
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <input autoFocus value={actorDraft} onChange={e => setActorDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveActor(); if (e.key === 'Escape') { setActorDraft(member.actor); setEditingActor(false); } }}
              style={{ ...inp, fontSize: 13, padding: '4px 7px', flex: 1 }}/>
            <button onClick={saveActor} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>✓</button>
            <button onClick={() => { setActorDraft(member.actor); setEditingActor(false); }} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '4px 7px', fontSize: 11, cursor: 'pointer', color: C.muted2 }}>✕</button>
          </div>
        ) : (
          <div onClick={() => setEditingActor(true)} title="Click to edit actor name"
            style={{ fontSize: 14, color: C.muted, fontFamily: 'Inter, system-ui', cursor: 'text', padding: '2px 4px', borderRadius: 4, marginLeft: -4, display: 'flex', alignItems: 'center', gap: 6, transition: 'background 100ms' }}
            onMouseEnter={e => e.currentTarget.style.background = C.tint}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {member.actor}
            <span style={{ color: C.line2, fontSize: 11 }}><Ico.pencil style={{ width: 11, height: 11 }}/></span>
          </div>
        )}

        {/* Agent */}
        <div style={{ fontSize: 12, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.agent}</div>

        {/* Rate */}
        <div style={{ fontSize: 12, color: C.ink2, fontFamily: 'Inter, system-ui' }}>
          <span style={{ fontWeight: 600 }}>${member.rate.toLocaleString()}</span>
          <span style={{ color: C.muted }}> / day</span>
          {member.shootDays && <span style={{ color: C.muted }}> · {member.shootDays} days</span>}
        </div>

        {/* Availability bar */}
        <div>
          <div style={{ fontSize: 10, color: C.muted2, marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.3 }}>AVAIL — NEXT 14 DAYS</div>
          <AvailabilityBar castId={member.id}/>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <button style={{ flex: 1, background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', color: C.ink2, fontFamily: 'Inter, system-ui', whiteSpace: 'nowrap' }}>
            Message
          </button>
          <button style={{ flex: 1, background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', color: C.ink2, fontFamily: 'Inter, system-ui', whiteSpace: 'nowrap' }}>
            Schedule
          </button>
          {/* Status dropdown */}
          <div ref={statusRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowStatusMenu(v => !v)}
              style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', color: C.ink2, fontFamily: 'Inter, system-ui', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              Status <Ico.chevD/>
            </button>
            {showStatusMenu && (
              <div style={{ position: 'absolute', bottom: '110%', right: 0, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 30, minWidth: 160, overflow: 'hidden' }}>
                {CASTING_STATUSES.map(s => {
                  const m = STATUS_META[s];
                  return (
                    <button key={s} onClick={() => setStatus(s)}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: s === member.status ? C.tint : 'none', border: 'none', padding: '8px 12px', fontSize: 12.5, cursor: 'pointer', color: C.ink, fontFamily: 'Inter, system-ui', textAlign: 'left' }}>
                      <Badge tone={m.tone} dot>{m.label}</Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCharacterModal({ onClose, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', shootDays: '', rate: '', status: 'consideration' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const valid = form.name.trim().length > 0;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim(),
        shootDays: parseInt(form.shootDays) || 0,
        rate: parseInt(form.rate) || 0,
        status: form.status,
        actor: 'Open — TBD',
        agent: '—',
        photo: '',
        character: form.name.trim().toUpperCase().split(' ')[0],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(26,26,26,0.4)', backdropFilter: 'blur(2px)' }}/>
      {/* Modal */}
      <div style={{ position: 'relative', background: C.panel, borderRadius: 12, border: `1px solid ${C.line}`, width: '100%', maxWidth: 440, padding: 28, boxShadow: '0 16px 48px rgba(0,0,0,0.18)', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, system-ui' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>Add Character</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted2, padding: 4 }}><Ico.x/></button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 5, fontFamily: '"IBM Plex Mono", monospace' }}>CHARACTER NAME *</label>
            <input autoFocus value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Detective Reeves" style={inp}/>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 5, fontFamily: '"IBM Plex Mono", monospace' }}>DESCRIPTION</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief role description…" rows={3}
              style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 5, fontFamily: '"IBM Plex Mono", monospace' }}>SHOOT DAYS</label>
              <input type="number" min={0} value={form.shootDays} onChange={e => set('shootDays', e.target.value)} placeholder="0" style={inp}/>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 5, fontFamily: '"IBM Plex Mono", monospace' }}>DAY RATE ($)</label>
              <input type="number" min={0} value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="0" style={inp}/>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 5, fontFamily: '"IBM Plex Mono", monospace' }}>STATUS</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
              {CASTING_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4, borderTop: `1px solid ${C.line}` }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn onClick={handleSave} disabled={!valid || saving}>
            {saving ? 'Saving…' : 'Add Character'}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 1: Casting Sheet ─────────────────────────────────────────────────────

function CastingSheet({ cast, onUpdate, onAdd }) {
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState('status');
  const [filter, setFilter] = useState('all');

  const sorted = [...cast].filter(m => {
    if (filter === 'confirmed') return m.status === 'confirmed';
    if (filter === 'unconfirmed') return m.status !== 'confirmed';
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name')   return a.name.localeCompare(b.name);
    if (sortBy === 'days')   return (b.shootDays || 0) - (a.shootDays || 0);
    // status: confirmed first, then offered, approaching, consideration, declined
    const order = ['confirmed', 'offered', 'approaching', 'consideration', 'declined'];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  const handleSave = async (data) => {
    await onAdd(data);
    setShowModal(false);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <PrimaryBtn icon={Ico.plus} onClick={() => setShowModal(true)}>Add character</PrimaryBtn>
        <div style={{ flex: 1 }}/>
        {/* Filter */}
        <div style={{ display: 'flex', gap: 4, background: C.tint, borderRadius: 7, padding: 3 }}>
          {[['all', 'All'], ['confirmed', 'Confirmed'], ['unconfirmed', 'Unconfirmed']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ background: filter === v ? C.panel : 'none', border: filter === v ? `1px solid ${C.line2}` : '1px solid transparent', borderRadius: 5, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: filter === v ? C.ink : C.muted, fontFamily: 'Inter, system-ui', fontWeight: filter === v ? 500 : 400 }}>
              {l}
            </button>
          ))}
        </div>
        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: 'Inter, system-ui' }}>Sort:</span>
          {[['status', 'Status'], ['name', 'Name'], ['days', 'Days']].map(([v, l]) => (
            <button key={v} onClick={() => setSortBy(v)}
              style={{ background: sortBy === v ? C.ink : 'none', color: sortBy === v ? '#fff' : C.muted2, border: `1px solid ${sortBy === v ? C.ink : C.line2}`, borderRadius: 4, padding: '3px 8px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'Inter, system-ui' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid — responsive via column-count trick with inline media fallback */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {sorted.map(m => (
          <CastingCard key={m.id} member={m} onUpdate={onUpdate}/>
        ))}
        {sorted.length === 0 && (
          <div style={{ gridColumn: '1/-1', padding: 48, textAlign: 'center', color: C.muted, fontSize: 14, fontFamily: 'Inter, system-ui' }}>
            No characters match the current filter.
          </div>
        )}
      </div>

      {showModal && <AddCharacterModal onClose={() => setShowModal(false)} onSave={handleSave}/>}
    </div>
  );
}

// ─── Tab 2: Availability Calendar ────────────────────────────────────────────

function AvailabilityCalendar({ cast }) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i));
  // Override map: castId -> dayIndex -> 'available'|'unavailable'|'session'
  const [overrides, setOverrides] = useState({});
  const actors = cast.slice(0, 8);

  const getState = (castId, dayIdx) => {
    const key = `${castId}-${dayIdx}`;
    if (overrides[key]) return overrides[key];
    return getAvailability(castId, dayIdx);
  };

  const toggle = (castId, dayIdx) => {
    const key = `${castId}-${dayIdx}`;
    const cur = getState(castId, dayIdx);
    const next = cur === 'available' ? 'unavailable' : cur === 'unavailable' ? 'session' : 'available';
    setOverrides(o => ({ ...o, [key]: next }));
  };

  const cellColor = { available: C.ok, unavailable: C.red, session: C.critical, unknown: C.line2 };

  const exportTable = () => {
    const header = ['Actor'.padEnd(20), ...days.map((d, i) => fmtDate(d).slice(0, 5).padStart(6))].join('|');
    const rows = actors.map(m => {
      const cells = days.map((_, i) => {
        const s = getState(m.id, i);
        return (s === 'available' ? 'OK' : s === 'unavailable' ? 'NO' : s === 'session' ? 'SES' : '?').padStart(6);
      });
      return [m.actor.slice(0, 20).padEnd(20), ...cells].join('|');
    });
    const text = [header, ...rows].join('\n');
    navigator.clipboard.writeText(text).then(() => alert('Copied as text table to clipboard.'));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: C.muted, fontFamily: 'Inter, system-ui' }}>Click a cell to toggle: <span style={{ color: C.ok }}>■</span> available · <span style={{ color: C.red }}>■</span> hold · <span style={{ color: C.critical }}>■</span> session · <span style={{ color: C.muted2 }}>■</span> unknown</div>
        <GhostBtn onClick={exportTable}>Export as text</GhostBtn>
      </div>

      <div style={{ overflowX: 'auto', borderRadius: 10, border: `1px solid ${C.line}` }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '100%', fontFamily: 'Inter, system-ui', fontSize: 11 }}>
          <thead>
            <tr style={{ background: C.tint }}>
              <th style={{ textAlign: 'left', padding: '8px 14px', color: C.muted, fontWeight: 600, borderRight: `2px solid ${C.line2}`, position: 'sticky', left: 0, background: C.tint, zIndex: 2, minWidth: 160, fontSize: 11, letterSpacing: 0.5 }}>ACTOR / CHARACTER</th>
              {days.map((d, i) => (
                <th key={i} style={{ padding: '6px 2px', color: C.muted, fontWeight: 500, minWidth: 36, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div>{fmtDate(d).split(' ')[0]}</div>
                  <div style={{ fontWeight: 700, color: C.ink }}>{fmtDate(d).split(' ')[1]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actors.map((m, ri) => (
              <tr key={m.id} style={{ borderTop: `1px solid ${C.line}`, background: ri % 2 === 0 ? C.panel : C.bg }}>
                <td style={{ padding: '8px 14px', position: 'sticky', left: 0, background: ri % 2 === 0 ? C.panel : C.bg, borderRight: `2px solid ${C.line2}`, zIndex: 1, whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: C.ink }}>{m.actor}</div>
                  <div style={{ fontSize: 10, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>{m.character}</div>
                </td>
                {days.map((_, di) => {
                  const state = getState(m.id, di);
                  return (
                    <td key={di} style={{ textAlign: 'center', padding: '4px 2px' }}>
                      <div onClick={() => toggle(m.id, di)}
                        title={`${m.actor} · ${fmtDate(days[di])} · ${state}`}
                        style={{ width: 28, height: 28, margin: '0 auto', borderRadius: 5, background: cellColor[state] || C.line2, cursor: 'pointer', transition: 'opacity 100ms', opacity: 0.85 }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '0.85'}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {actors.length === 0 && (
              <tr><td colSpan={31} style={{ padding: 32, textAlign: 'center', color: C.muted }}>No cast members yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab 3: Sessions ─────────────────────────────────────────────────────────

function SessionCard({ session, onUpdate, onDelete }) {
  const [editNotes, setEditNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(session.notes);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setShowStatusMenu(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusColor = { Scheduled: C.critical, Completed: C.ok, Cancelled: C.muted2 };
  const typeTone = { Audition: 'neutral', Callback: 'accent', 'Chemistry read': 'critical', 'Table read': 'warn', 'Final decision': 'ok' };

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Inter, system-ui' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div style={{ fontSize: 14, color: C.muted, marginTop: 2 }}>{session.time}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge tone={typeTone[session.type] || 'neutral'}>{session.type}</Badge>
          {/* Status badge + dropdown */}
          <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setShowStatusMenu(v => !v)}
              style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '3px 8px', fontSize: 11.5, cursor: 'pointer', color: statusColor[session.status] || C.muted2, fontFamily: 'Inter, system-ui', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {session.status} <Ico.chevD/>
            </button>
            {showStatusMenu && (
              <div style={{ position: 'absolute', top: '110%', right: 0, background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 30, overflow: 'hidden', minWidth: 140 }}>
                {SESSION_STATUSES.map(s => (
                  <button key={s} onClick={() => { onUpdate(session.id, { status: s }); setShowStatusMenu(false); }}
                    style={{ display: 'block', width: '100%', background: s === session.status ? C.tint : 'none', border: 'none', padding: '8px 14px', fontSize: 12.5, cursor: 'pointer', color: statusColor[s] || C.ink, fontFamily: 'Inter, system-ui', textAlign: 'left', fontWeight: 500 }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => onDelete(session.id)} style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 5, padding: '3px 7px', cursor: 'pointer', color: C.muted2 }}>
            <Ico.trash/>
          </button>
        </div>
      </div>

      {/* Actor + character */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={session.actor} size={30}/>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{session.actor}</div>
          <div style={{ fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>{session.character}</div>
        </div>
      </div>

      {/* Location */}
      <div style={{ fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Ico.pin style={{ width: 13, height: 13, flexShrink: 0 }}/>
        {session.location}
      </div>

      {/* Notes */}
      <div>
        {editNotes ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <textarea value={notesDraft} onChange={e => setNotesDraft(e.target.value)} rows={2}
              style={{ ...inp, fontSize: 12.5, resize: 'vertical', lineHeight: 1.5 }}/>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => { onUpdate(session.id, { notes: notesDraft }); setEditNotes(false); }}
                style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 4, padding: '5px 10px', fontSize: 11.5, cursor: 'pointer', fontFamily: 'Inter, system-ui' }}>Save</button>
              <button onClick={() => { setNotesDraft(session.notes); setEditNotes(false); }}
                style={{ background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4, padding: '5px 8px', fontSize: 11.5, cursor: 'pointer', color: C.muted2, fontFamily: 'Inter, system-ui' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <div onClick={() => setEditNotes(true)} title="Click to edit notes"
            style={{ fontSize: 12.5, color: session.notes ? C.ink2 : C.muted2, fontStyle: session.notes ? 'normal' : 'italic', cursor: 'text', padding: '5px 7px', borderRadius: 5, background: C.tint, minHeight: 32, lineHeight: 1.5 }}>
            {session.notes || 'Add notes…'}
          </div>
        )}
      </div>
    </div>
  );
}

function AddSessionForm({ cast, onSave, onCancel }) {
  const [form, setForm] = useState({
    actor: cast[0]?.actor || '',
    castId: cast[0]?.id || '',
    character: cast[0]?.character || '',
    type: 'Audition',
    date: fmtDateISO(new Date()),
    time: '10:00',
    location: '',
    notes: '',
    status: 'Scheduled',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCastChange = (id) => {
    const m = cast.find(c => c.id === id);
    if (m) set('castId', id); set('actor', m?.actor || ''); set('character', m?.character || '');
  };

  return (
    <div style={{ background: C.tint, border: `1px solid ${C.line}`, borderRadius: 10, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'Inter, system-ui' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>New Session</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>ACTOR</label>
          <select value={form.castId} onChange={e => handleCastChange(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {cast.map(m => <option key={m.id} value={m.id}>{m.actor} ({m.character})</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>TYPE</label>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {SESSION_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>DATE</label>
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inp}/>
        </div>
        <div>
          <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>TIME</label>
          <input type="time" value={form.time} onChange={e => set('time', e.target.value)} style={inp}/>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={{ fontSize: 11, color: C.muted, letterSpacing: 0.5, display: 'block', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>LOCATION</label>
          <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Studio B or Virtual — Zoom" style={inp}/>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <PrimaryBtn onClick={() => onSave({ ...form, id: `s${Date.now()}` })}>Add Session</PrimaryBtn>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
      </div>
    </div>
  );
}

function SessionsTab({ cast, sessions, onAddSession, onUpdateSession, onDeleteSession }) {
  const [showForm, setShowForm] = useState(false);
  const now = new Date();

  const upcoming = sessions.filter(s => isFuture(s.date) && s.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date));
  const past = sessions.filter(s => !isFuture(s.date) || s.status === 'Cancelled').sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = (data) => {
    onAddSession(data);
    setShowForm(false);
  };

  const GroupHead = ({ label, count }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: 1, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 11, color: C.muted2, background: C.tint, border: `1px solid ${C.line}`, borderRadius: 4, padding: '1px 6px', fontFamily: '"IBM Plex Mono", monospace' }}>{count}</div>
      <div style={{ flex: 1, height: 1, background: C.line }}/>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <PrimaryBtn icon={Ico.plus} onClick={() => setShowForm(v => !v)}>Add session</PrimaryBtn>
      </div>

      {showForm && (
        <AddSessionForm cast={cast} onSave={handleAdd} onCancel={() => setShowForm(false)}/>
      )}

      {/* Upcoming */}
      <div>
        <GroupHead label="Upcoming" count={upcoming.length}/>
        {upcoming.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: C.muted, fontSize: 13, fontFamily: 'Inter, system-ui', fontStyle: 'italic' }}>No upcoming sessions scheduled.</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
          {upcoming.map(s => (
            <SessionCard key={s.id} session={s} onUpdate={onUpdateSession} onDelete={onDeleteSession}/>
          ))}
        </div>
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <GroupHead label="Past" count={past.length}/>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12, opacity: 0.7 }}>
            {past.map(s => (
              <SessionCard key={s.id} session={s} onUpdate={onUpdateSession} onDelete={onDeleteSession}/>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CastingScreen({ projectId }) {
  const [activeTab, setActiveTab]   = useState('sheet');
  const [cast, setCast]             = useState([]);
  const [sessions, setSessions]     = useState(SAMPLE_SESSIONS);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!projectId) { setCast(SAMPLE_CAST); setLoading(false); return; }
    getCast(projectId)
      .then(data => setCast(data && data.length > 0 ? data : SAMPLE_CAST))
      .catch(() => setCast(SAMPLE_CAST))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Cast handlers
  const handleUpdate = async (id, patch) => {
    setCast(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
    if (projectId) {
      try { await updateCast(projectId, id, patch); } catch (_) {}
    }
  };

  const handleAdd = async (data) => {
    const newMember = { ...data, id: `c${Date.now()}` };
    setCast(prev => [...prev, newMember]);
    if (projectId) {
      try {
        const created = await createCast(projectId, { name: data.name, role: data.description, status: 'not-called' });
        setCast(prev => prev.map(m => m.id === newMember.id ? { ...m, id: created.id } : m));
      } catch (_) {}
    }
  };

  // Session handlers
  const handleAddSession    = (s) => setSessions(prev => [s, ...prev]);
  const handleUpdateSession = (id, patch) => setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  const handleDeleteSession = (id) => setSessions(prev => prev.filter(s => s.id !== id));

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: C.muted, fontFamily: 'Inter, system-ui', fontSize: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <FilmIcon />
          Loading casting…
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'sheet',    label: 'Casting Sheet' },
    { key: 'calendar', label: 'Availability Calendar' },
    { key: 'sessions', label: 'Sessions' },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui', color: C.ink, minHeight: '100%' }}>
      {/* Screen header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>Casting</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Pre-production · {cast.length} character{cast.length !== 1 ? 's' : ''}</div>
        </div>
        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {['confirmed', 'offered', 'approaching'].map(s => {
            const count = cast.filter(m => m.status === s).length;
            if (count === 0) return null;
            return (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s === 'confirmed' ? C.ok : s === 'offered' ? C.critical : C.warn }}>{count}</div>
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: '"IBM Plex Mono", monospace' }}>{STATUS_META[s].label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${C.line}`, marginBottom: 24, paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ background: 'none', border: 'none', padding: '0 0 10px', cursor: 'pointer', fontSize: 13.5, fontWeight: activeTab === t.key ? 600 : 500, color: activeTab === t.key ? C.ink : C.muted, borderBottom: activeTab === t.key ? `2px solid ${C.ink}` : '2px solid transparent', fontFamily: 'Inter, system-ui', letterSpacing: -0.1, transition: 'color 120ms, border-color 120ms' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'sheet'    && <CastingSheet    cast={cast} onUpdate={handleUpdate} onAdd={handleAdd}/>}
      {activeTab === 'calendar' && <AvailabilityCalendar cast={cast}/>}
      {activeTab === 'sessions' && <SessionsTab cast={cast} sessions={sessions} onAddSession={handleAddSession} onUpdateSession={handleUpdateSession} onDeleteSession={handleDeleteSession}/>}
    </div>
  );
}
