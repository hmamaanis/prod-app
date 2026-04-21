'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { C, Ico, PrimaryBtn, GhostBtn } from './shared';

// ── Colour tokens (local shorthand) ───────────────────────────────────────────
const MONO = '"IBM Plex Mono", "Courier New", monospace';
const SANS = 'Inter, system-ui, sans-serif';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTag(text) {
  const t = text.toLowerCase();
  if (/\b(shot|scene|take)\b/.test(t)) return '🎬';
  if (/\b(light|lens|camera|exposure|aperture|iso|nd filter)\b/.test(t)) return '💡';
  if (/\b[A-Z][a-z]{2,}\b/.test(text)) return '👤';
  return '📝';
}

function formatTs(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const dd = `${d.getDate()}/${d.getMonth() + 1}`;
  return `${dd} ${hh}:${mm}`;
}

const SAMPLE_NOTES = [
  { id: 'sample-1', text: 'Scene 4 — pickup take needed, Sara\'s eyeline was off', ts: Date.now() - 1000 * 60 * 72 },
  { id: 'sample-2', text: 'Ask props dept about the watch — needs to be pre-1990s', ts: Date.now() - 1000 * 60 * 45 },
  { id: 'sample-3', text: 'Beautiful golden hour window 5:30–6pm, mark for Scene 7', ts: Date.now() - 1000 * 60 * 12 },
];

// ── AI Link Panel ─────────────────────────────────────────────────────────────
function AiLinkPanel({ noteId, onLink, onClose }) {
  const [state, setState] = useState('loading'); // loading | ready
  const suggestion = 'This note relates to Scene 3 (INT. CAR — NIGHT) · Shot 14A';

  useEffect(() => {
    const t = setTimeout(() => setState('ready'), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      marginTop: 8, padding: '10px 12px', borderRadius: 6,
      background: '#EEF2FD', border: `1px solid #C5D0F5`,
      fontFamily: SANS, fontSize: 12.5,
    }}>
      {state === 'loading' ? (
        <div style={{ color: C.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Spinner /> Analysing note…
        </div>
      ) : (
        <>
          <div style={{ color: '#2A3C8A', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>AI suggestion:</span> {suggestion}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => { onLink(noteId, suggestion); onClose(); }}
              style={{ background: C.critical, color: '#fff', border: 'none', borderRadius: 5, padding: '5px 10px', fontSize: 12, cursor: 'pointer', fontFamily: SANS, fontWeight: 500 }}
            >
              Link it
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: `1px solid #C5D0F5`, borderRadius: 5, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: C.muted, fontFamily: SANS }}
            >
              Dismiss
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 12, height: 12,
      border: `2px solid ${C.line2}`, borderTopColor: C.critical,
      borderRadius: '50%', animation: 'notepad-spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// ── Single Note Row ───────────────────────────────────────────────────────────
function NoteRow({ note, onDelete, onLink, linkedScene }) {
  const [hover, setHover] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(note.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '14px 0',
        borderBottom: `1px solid ${C.line}`,
        position: 'relative',
      }}
    >
      {/* Top row: icon + timestamp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 15 }}>{getTag(note.text)}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted2 }}>{formatTs(note.ts)}</span>
        {linkedScene && (
          <span style={{
            marginLeft: 4, padding: '1px 7px', borderRadius: 3,
            background: '#EEF2FD', color: '#2A3C8A',
            fontSize: 11, fontFamily: SANS, fontWeight: 500,
            border: '1px solid #C5D0F5',
          }}>
            {linkedScene}
          </span>
        )}
      </div>

      {/* Note text */}
      <p style={{
        margin: 0, fontFamily: MONO, fontSize: 14, color: C.ink,
        lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {note.text}
      </p>

      {/* Actions row — visible on hover */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
        opacity: hover ? 1 : 0, transition: 'opacity 140ms',
        pointerEvents: hover ? 'auto' : 'none',
      }}>
        <ActionBtn onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</ActionBtn>
        <ActionBtn onClick={() => setAiOpen(o => !o)}>
          {aiOpen ? 'Close AI' : 'Link →'}
        </ActionBtn>
        <ActionBtn onClick={() => onDelete(note.id)} danger>Delete</ActionBtn>
      </div>

      {/* AI link panel */}
      {aiOpen && (
        <AiLinkPanel
          noteId={note.id}
          onLink={onLink}
          onClose={() => setAiOpen(false)}
        />
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? (danger ? '#F6DDD5' : C.tint) : 'transparent',
        color: danger ? C.red : C.muted,
        border: `1px solid ${hov ? (danger ? '#E8BFB2' : C.line2) : C.line}`,
        borderRadius: 4, padding: '3px 9px', fontSize: 11.5,
        cursor: 'pointer', fontFamily: SANS, transition: 'all 120ms',
      }}
    >
      {children}
    </button>
  );
}

// ── Mic Button ────────────────────────────────────────────────────────────────
function MicButton({ onTranscript }) {
  const [recording, setRecording] = useState(false);
  const [tooltip, setTooltip] = useState('');
  const recRef = useRef(null);

  const hasSupport = typeof window !== 'undefined' &&
    (typeof window.SpeechRecognition !== 'undefined' || typeof window.webkitSpeechRecognition !== 'undefined');

  const toggle = () => {
    if (!hasSupport) {
      setTooltip('Voice input not supported in this browser — try Chrome on Android');
      setTimeout(() => setTooltip(''), 4000);
      return;
    }

    if (recording) {
      recRef.current?.stop();
      setRecording(false);
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    rec.onresult = (e) => {
      const txt = Array.from(e.results).map(r => r[0].transcript).join(' ');
      onTranscript(txt);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={toggle}
        title={hasSupport ? 'Voice input' : 'Voice not supported'}
        style={{
          background: recording ? '#FDECEC' : C.tint,
          border: `1px solid ${recording ? '#F0BFBF' : C.line2}`,
          borderRadius: 8, width: 36, height: 36,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: recording ? C.red : C.muted, transition: 'all 150ms',
        }}
      >
        <MicIcon recording={recording} />
      </button>
      {tooltip && (
        <div style={{
          position: 'absolute', top: 42, right: 0, zIndex: 200,
          background: C.ink, color: '#fff', padding: '6px 10px',
          borderRadius: 6, fontSize: 12, fontFamily: SANS,
          whiteSpace: 'nowrap', maxWidth: 260, lineHeight: 1.4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

function MicIcon({ recording }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M5 11a7 7 0 0014 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M12 19v3M9 22h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      {recording && <circle cx="18" cy="5" r="3" fill="#C8543A"/>}
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function NotepadScreen({ projectId }) {
  const storageKey = `prod-notes-${projectId}`;
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');
  const [linkedScenes, setLinkedScenes] = useState({});   // noteId → scene string
  const [exportMsg, setExportMsg] = useState('');
  const textareaRef = useRef(null);

  // Load from localStorage or seed sample notes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        setNotes([...SAMPLE_NOTES].reverse()); // most recent first
      }
    } catch {
      setNotes([...SAMPLE_NOTES].reverse());
    }
  }, [storageKey]);

  const persist = useCallback((updated) => {
    setNotes(updated);
    try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {}
  }, [storageKey]);

  const addNote = () => {
    if (!draft.trim()) return;
    const note = { id: `n-${Date.now()}`, text: draft.trim(), ts: Date.now() };
    const updated = [note, ...notes];
    persist(updated);
    setDraft('');
    textareaRef.current?.focus();
  };

  const deleteNote = (id) => persist(notes.filter(n => n.id !== id));

  const linkNote = (id, suggestion) => {
    setLinkedScenes(prev => ({ ...prev, [id]: suggestion }));
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addNote();
  };

  const exportNotes = () => {
    const header = `Quick Notes — Project ${projectId}\nExported ${new Date().toLocaleString()}\n${'─'.repeat(48)}\n\n`;
    const body = [...notes].map(n =>
      `[${formatTs(n.ts)}] ${getTag(n.text)}  ${n.text}`
    ).join('\n\n');
    navigator.clipboard.writeText(header + body).then(() => {
      setExportMsg('Copied to clipboard!');
      setTimeout(() => setExportMsg(''), 2500);
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: SANS,
    }}>
      {/* Keyframe injection for spinner */}
      <style>{`@keyframes notepad-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Top Bar ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px 12px',
        borderBottom: `1px solid ${C.line2}`,
        background: C.panel,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>📋</span>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>
            Quick Notes
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MicButton onTranscript={(txt) => setDraft(d => d ? d + ' ' + txt : txt)} />
          <button
            onClick={exportNotes}
            style={{
              background: C.tint, border: `1px solid ${C.line2}`, borderRadius: 8,
              padding: '7px 12px', fontSize: 12, cursor: 'pointer', color: C.ink2,
              fontFamily: SANS, display: 'flex', alignItems: 'center', gap: 5,
              fontWeight: 500,
            }}
          >
            <ExportIcon /> Export notes
            {exportMsg && <span style={{ color: C.ok, marginLeft: 4 }}>{exportMsg}</span>}
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '20px 16px 60px' }}>

        {/* ── Composer ───────────────────────────────────────────────── */}
        <div style={{
          background: '#FDFCF8',
          border: `1px solid ${C.line2}`,
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 24,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}>
          {/* Notepad lines decoration */}
          <div style={{
            background: `repeating-linear-gradient(transparent, transparent 27px, ${C.line} 27px, ${C.line} 28px)`,
            paddingBottom: 2,
          }}>
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a note… (Cmd+Enter to add)"
              style={{
                width: '100%', minHeight: 120, resize: 'vertical',
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: MONO, fontSize: 14, color: C.ink,
                lineHeight: '28px', padding: '0 0 0 2px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted2 }}>
              {draft.length} chars · {draft.trim() ? getTag(draft) : '—'}
            </span>
            <button
              onClick={addNote}
              disabled={!draft.trim()}
              style={{
                background: draft.trim() ? C.ink : C.line2,
                color: draft.trim() ? '#fff' : C.muted2,
                border: 'none', borderRadius: 6, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'default',
                fontFamily: SANS, transition: 'background 150ms',
              }}
            >
              Add note
            </button>
          </div>
        </div>

        {/* ── Notes list ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{
              fontFamily: MONO, fontSize: 10.5, color: C.muted2,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} — most recent first
            </span>
          </div>
        </div>

        {notes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: C.muted2, fontFamily: MONO, fontSize: 13 }}>
            No notes yet — type something above
          </div>
        ) : (
          <div>
            {notes.map(note => (
              <NoteRow
                key={note.id}
                note={note}
                onDelete={deleteNote}
                onLink={linkNote}
                linkedScene={linkedScenes[note.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExportIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M9 12h6M12 9l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 8H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2v-9a2 2 0 00-2-2h-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
