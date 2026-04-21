'use client';
import { useState, useEffect, useRef } from 'react';
import { C, Ico, Card, SectionHead, PrimaryBtn, GhostBtn } from './shared';
import { getProject } from '@/lib/api';

const DEFAULT_LINES = [
  { id: 'cast',      cat: 'Cast',        budgeted: 420000, actual: 198000, color: '#E89B4C' },
  { id: 'crew',      cat: 'Crew labor',  budgeted: 680000, actual: 318000, color: '#4A6FE8' },
  { id: 'locations', cat: 'Locations',   budgeted: 145000, actual: 72000,  color: '#5A8F5A' },
  { id: 'equipment', cat: 'Equipment',   budgeted: 210000, actual: 104500, color: '#B8893B' },
  { id: 'transport', cat: 'Transport',   budgeted: 58000,  actual: 26400,  color: '#C8543A' },
  { id: 'catering',  cat: 'Catering',    budgeted: 42000,  actual: 21200,  color: '#7B5EA7' },
  { id: 'post',      cat: 'Post hold',   budgeted: 180000, actual: 0,      color: '#3A8FA0' },
];

function fmt(n) { return '$' + Number(n).toLocaleString(); }

// SVG donut chart — pure, no library
function DonutChart({ lines, totalB }) {
  const R = 70, CX = 90, CY = 90, STROKE = 22;
  const circumference = 2 * Math.PI * R;
  let offset = 0;
  const segments = lines.map(l => {
    const pct = totalB > 0 ? l.budgeted / totalB : 0;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const seg  = { ...l, dash, gap, offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <svg width={180} height={180} viewBox="0 0 180 180">
        {/* Background ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke={C.line} strokeWidth={STROKE}/>
        {segments.map(s => (
          <circle
            key={s.id} cx={CX} cy={CY} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={STROKE}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px`, transition: 'stroke-dasharray 400ms ease' }}
          />
        ))}
        {/* Center label */}
        <text x={CX} y={CY - 6} textAnchor="middle" fontFamily='"IBM Plex Mono", monospace' fontSize={11} fill={C.muted}>BUDGET</text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontFamily='"IBM Plex Mono", monospace' fontSize={13} fontWeight="700" fill={C.ink}>{fmt(totalB)}</text>
      </svg>
      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', width: '100%', maxWidth: 240 }}>
        {lines.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline-editable number cell
function EditableNum({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');
  const ref = useRef(null);

  const start = () => { setDraft(String(value)); setEditing(true); setTimeout(() => ref.current?.select(), 0); };
  const commit = () => { const v = parseInt(draft.replace(/[^0-9]/g, ''), 10); if (!isNaN(v)) onSave(v); setEditing(false); };

  if (editing) return (
    <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      style={{ width: 90, border: `1px solid ${C.accent}`, borderRadius: 4, padding: '2px 6px', fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', background: C.bg, color: C.ink, outline: 'none' }}
    />
  );
  return (
    <span onClick={start} title="Click to edit" style={{ cursor: 'text', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: C.ink2, borderBottom: `1px dashed ${C.line2}`, paddingBottom: 1 }}>
      {fmt(value)}
    </span>
  );
}

// Inline-editable text cell
function EditableText({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState('');
  const ref = useRef(null);

  const start = () => { setDraft(value); setEditing(true); setTimeout(() => ref.current?.select(), 0); };
  const commit = () => { if (draft.trim()) onSave(draft.trim()); setEditing(false); };

  if (editing) return (
    <input ref={ref} value={draft} onChange={e => setDraft(e.target.value)}
      onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
      style={{ width: 120, border: `1px solid ${C.accent}`, borderRadius: 4, padding: '2px 6px', fontSize: 13, fontFamily: 'Inter', background: C.bg, color: C.ink, outline: 'none', fontWeight: 500 }}
    />
  );
  return (
    <span onClick={start} title="Click to edit" style={{ cursor: 'text', fontSize: 13, fontWeight: 500, borderBottom: `1px dashed ${C.line2}`, paddingBottom: 1 }}>
      {value}
    </span>
  );
}

const PALETTE = ['#E89B4C','#4A6FE8','#5A8F5A','#B8893B','#C8543A','#7B5EA7','#3A8FA0','#D46B6B','#4A9E8F'];

export default function BudgetScreen({ projectId }) {
  const STORAGE_KEY = `prod-budget-${projectId || 'default'}`;

  const [lines, setLines]   = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_LINES;
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : DEFAULT_LINES; }
    catch { return DEFAULT_LINES; }
  });
  const [project, setProject] = useState(null);
  const [copied, setCopied]   = useState(false);
  const [addingLine, setAddingLine] = useState(false);
  const [newCat, setNewCat]   = useState('');
  const [newBud, setNewBud]   = useState('');
  const [hoverRow, setHoverRow] = useState(null);

  useEffect(() => {
    if (projectId) getProject(projectId).then(setProject).catch(() => {});
  }, [projectId]);

  // Persist to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); }
    catch {}
  }, [lines, STORAGE_KEY]);

  const totalB = lines.reduce((a, l) => a + (l.budgeted || 0), 0);
  const totalA = lines.reduce((a, l) => a + (l.actual || 0), 0);
  const dayC   = project?.day_current || 11;
  const dayT   = project?.day_total   || 24;
  const expected = dayT > 0 ? (dayC / dayT) * 100 : 46;
  const pace   = totalA / totalB * 100;
  const onTrack = pace <= expected + 3;

  const updateLine = (id, field, value) => {
    setLines(ls => ls.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const deleteLine = (id) => setLines(ls => ls.filter(l => l.id !== id));

  const addLine = () => {
    if (!newCat.trim()) return;
    const id = `line-${Date.now()}`;
    const color = PALETTE[lines.length % PALETTE.length];
    setLines(ls => [...ls, { id, cat: newCat.trim(), budgeted: parseInt(newBud) || 0, actual: 0, color }]);
    setNewCat(''); setNewBud(''); setAddingLine(false);
  };

  const exportCsv = () => {
    const rows = ['Category,Budgeted,Actual,Delta', ...lines.map(l => `${l.cat},${l.budgeted},${l.actual},${l.actual - l.budgeted}`)].join('\n');
    navigator.clipboard.writeText(rows).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

      {/* Left: table */}
      <Card>
        {/* Stats strip */}
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { label: 'Budget total',   val: fmt(totalB) },
            { label: 'Actual to date', val: fmt(totalA) },
            { label: 'Pace',           val: onTrack ? 'On track' : 'Over pace', tone: onTrack ? 'ok' : 'red' },
            { label: 'Days complete',  val: `${dayC} / ${dayT}` },
          ].map(({ label, val, tone }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: tone === 'ok' ? C.ok : tone === 'red' ? C.red : C.ink }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Line items */}
        <div style={{ padding: '4px 0' }}>
          {lines.map((l) => {
            const pct = l.budgeted > 0 ? (l.actual / l.budgeted) * 100 : 0;
            const over = pct > expected + 5;
            const warn = pct > expected && !over;
            return (
              <div key={l.id}
                onMouseEnter={() => setHoverRow(l.id)}
                onMouseLeave={() => setHoverRow(null)}
                style={{ padding: '12px 20px', borderBottom: `1px solid ${C.line}`, background: hoverRow === l.id ? C.tint : 'transparent', transition: 'background 100ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: l.color, flexShrink: 0 }}/>
                    <EditableText value={l.cat} onSave={v => updateLine(l.id, 'cat', v)}/>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <EditableNum value={l.actual} onSave={v => updateLine(l.id, 'actual', v)}/>
                    <span style={{ color: C.muted2, fontSize: 11 }}>/</span>
                    <EditableNum value={l.budgeted} onSave={v => updateLine(l.id, 'budgeted', v)}/>
                    {hoverRow === l.id && (
                      <button onClick={() => deleteLine(l.id)} title="Delete line" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: 2, display: 'flex' }}>
                        <Ico.x/>
                      </button>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: C.tint, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: over ? C.red : warn ? C.warn : l.color, borderRadius: 3, transition: 'width 300ms ease' }}/>
                  {/* Expected marker */}
                  <div style={{ position: 'absolute', top: -1, height: 7, width: 2, background: C.ink, left: `${expected}%`, borderRadius: 1 }}/>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 10, color: over ? C.red : warn ? C.warn : C.muted2, fontFamily: '"IBM Plex Mono"' }}>
                    {pct.toFixed(0)}% used {over ? '⚠ over pace' : warn ? '! watch' : ''}
                  </span>
                  <span style={{ fontSize: 10, color: C.muted2, fontFamily: '"IBM Plex Mono"' }}>
                    {fmt(l.budgeted - l.actual)} remaining
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add line form */}
          {addingLine ? (
            <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                value={newCat} onChange={e => setNewCat(e.target.value)}
                placeholder="Category name"
                autoFocus
                style={{ flex: 1, border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 10px', fontSize: 13, fontFamily: 'Inter', background: C.bg, color: C.ink, outline: 'none' }}
              />
              <input
                value={newBud} onChange={e => setNewBud(e.target.value)}
                placeholder="$0"
                style={{ width: 90, border: `1px solid ${C.line2}`, borderRadius: 5, padding: '6px 10px', fontSize: 12, fontFamily: '"IBM Plex Mono"', background: C.bg, color: C.ink, outline: 'none' }}
              />
              <button onClick={addLine} style={{ background: C.ink, color: '#fff', border: 'none', borderRadius: 5, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter' }}>Add</button>
              <button onClick={() => setAddingLine(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted }}><Ico.x/></button>
            </div>
          ) : null}

          {/* Footer actions */}
          <div style={{ padding: '12px 20px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setAddingLine(true)} style={{ background: 'none', border: `1px dashed ${C.line2}`, borderRadius: 5, padding: '6px 12px', fontSize: 12, color: C.muted, cursor: 'pointer', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Ico.plus/> Add line
            </button>
            <button onClick={exportCsv} style={{ background: 'none', border: `1px solid ${C.line}`, borderRadius: 5, padding: '6px 12px', fontSize: 12, color: copied ? C.ok : C.ink2, cursor: 'pointer', fontFamily: 'Inter' }}>
              {copied ? '✓ Copied!' : 'Export CSV'}
            </button>
          </div>
        </div>
      </Card>

      {/* Right: donut + summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Donut chart card */}
        <Card>
          <SectionHead>Budget breakdown</SectionHead>
          <div style={{ padding: 20 }}>
            <DonutChart lines={lines} totalB={totalB}/>
          </div>
        </Card>

        {/* Day impact card */}
        <Card>
          <SectionHead>Day {dayC} est. impact</SectionHead>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>Time</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: C.ok }}>−42 min</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Ahead of day plan</div>

            <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20 }}>Cost delta</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: C.ok }}>−$4,280</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>vs. day budget</div>

            <div style={{ marginTop: 20, padding: 10, background: '#EBEFFB', borderRadius: 6, display: 'flex', gap: 8 }}>
              <div style={{ color: C.critical, flexShrink: 0 }}><Ico.sparkle/></div>
              <div style={{ fontSize: 12, color: '#2A3C8A', lineHeight: 1.5 }}>Shot reorder saved 40 min · Light grouping saved 2m · Held Tomás pickup</div>
            </div>

            {/* Burn rate progress */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono"', textTransform: 'uppercase', letterSpacing: 0.5 }}>Burn rate</span>
                <span style={{ fontSize: 11, color: onTrack ? C.ok : C.red, fontFamily: '"IBM Plex Mono"', fontWeight: 600 }}>{pace.toFixed(0)}% of budget</span>
              </div>
              <div style={{ height: 6, background: C.tint, borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${Math.min(pace, 100)}%`, height: '100%', background: onTrack ? C.ok : C.red, borderRadius: 3 }}/>
                <div style={{ position: 'absolute', top: -1, height: 8, width: 2, background: C.ink, left: `${expected}%` }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9.5, color: C.muted2, fontFamily: '"IBM Plex Mono"' }}>0%</span>
                <span style={{ fontSize: 9.5, color: C.muted2, fontFamily: '"IBM Plex Mono"' }}>▲ expected {expected.toFixed(0)}%</span>
                <span style={{ fontSize: 9.5, color: C.muted2, fontFamily: '"IBM Plex Mono"' }}>100%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
