'use client';
import { useState, useEffect, useCallback } from 'react';
import { C, Ico, Badge, PrimaryBtn, GhostBtn, Card } from './shared';
import { getScenes } from '@/lib/api';

// ── Tokens & constants ────────────────────────────────────────────────────────
const SANS  = 'Inter, system-ui, sans-serif';
const MONO  = '"IBM Plex Mono", "Courier New", monospace';

const COVERAGE = {
  'not-reviewed': { label: 'Not reviewed', dot: C.muted2, badge: 'neutral' },
  'covered':      { label: 'Fully covered', dot: C.ok,    badge: 'ok' },
  'partial':      { label: 'Partial coverage', dot: C.warn, badge: 'warn' },
  'needs-pickup': { label: 'Needs pickup', dot: C.red,    badge: 'red' },
};

const SHOT_STATUS = {
  completed: { label: '✓ Completed', color: C.ok,   bg: '#E4EDE4', icon: '✓' },
  partial:   { label: '⚠ Partial',   color: C.warn,  bg: '#F5EBD6', icon: '⚠' },
  missing:   { label: '✗ Missing',   color: C.red,   bg: '#F6DDD5', icon: '✗' },
};

const SHOT_CYCLE = { completed: 'partial', partial: 'missing', missing: 'completed' };

const SAMPLE_SCENES = [
  { id: 's1', scene_number: '1', synopsis: 'Warehouse — Marcus and Sara discuss the plan',  int_ext: 'INT', day_night: 'DAY',        location: 'Warehouse' },
  { id: 's2', scene_number: '2', synopsis: 'Rooftop confrontation in the rain',              int_ext: 'EXT', day_night: 'NIGHT',      location: 'Rooftop' },
  { id: 's3', scene_number: '3', synopsis: 'Car escape — Marcus drives Sara out',            int_ext: 'INT', day_night: 'CONTINUOUS', location: 'Car' },
  { id: 's4', scene_number: '4', synopsis: 'Dawn — the van disappears',                      int_ext: 'EXT', day_night: 'DAWN',       location: 'Warehouse District' },
];

// Seed shot data keyed by scene id
const SEED_SHOTS = {
  s1: [
    { id: 'sh1a', shotId: '1A', desc: 'Wide master — full room', status: 'completed' },
    { id: 'sh1b', shotId: '1B', desc: 'Two-shot Marcus & Sara (frontal)', status: 'completed' },
    { id: 'sh1c', shotId: '1C', desc: 'Close-up Marcus — reaction', status: 'partial' },
    { id: 'sh1d', shotId: '1D', desc: 'Insert — documents on table', status: 'missing' },
  ],
  s2: [
    { id: 'sh2a', shotId: '2A', desc: 'Establishing rooftop (drone)', status: 'completed' },
    { id: 'sh2b', shotId: '2B', desc: 'OTS — antagonist POV', status: 'completed' },
    { id: 'sh2c', shotId: '2C', desc: 'Sara close-up — rain', status: 'missing' },
  ],
  s3: [
    { id: 'sh3a', shotId: '3A', desc: 'Dashboard cam — Marcus driving', status: 'completed' },
    { id: 'sh3b', shotId: '3B', desc: 'Rear seat Sara — tight', status: 'partial' },
    { id: 'sh3c', shotId: '14A', desc: 'Side mirror reflection — city lights', status: 'completed' },
  ],
  s4: [
    { id: 'sh4a', shotId: '4A', desc: 'Dawn establishing — wide lens', status: 'missing' },
    { id: 'sh4b', shotId: '4B', desc: 'Van driving away — long shot', status: 'missing' },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function coverageFromShots(shots) {
  if (!shots.length) return 'not-reviewed';
  const all = shots.every(s => s.status === 'completed');
  const none = shots.every(s => s.status === 'missing');
  if (all) return 'covered';
  if (none) return 'needs-pickup';
  return 'partial';
}

function CoverageDot({ status, size = 9 }) {
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: COVERAGE[status]?.dot || C.muted2, flexShrink: 0,
    }} />
  );
}

// ── Reference image placeholder ───────────────────────────────────────────────
function RefPlaceholder({ label }) {
  return (
    <div style={{
      aspectRatio: '16/9',
      background: `repeating-linear-gradient(-45deg, ${C.line} 0 2px, ${C.tint} 2px 10px)`,
      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 10.5, color: C.muted2, fontFamily: MONO,
    }}>
      {label}
    </div>
  );
}

// ── Column 1: Scene list ──────────────────────────────────────────────────────
function SceneList({ scenes, selectedId, onSelect, coverageMap, filter, setFilter }) {
  const filters = ['all', 'needs-pickup', 'covered'];

  const visible = scenes.filter(sc => {
    const cov = coverageMap[sc.id] || 'not-reviewed';
    if (filter === 'needs-pickup') return cov === 'needs-pickup' || cov === 'partial';
    if (filter === 'covered')      return cov === 'covered';
    return true;
  });

  return (
    <div style={{
      width: 280, flexShrink: 0,
      borderRight: `1px solid ${C.line}`,
      display: 'flex', flexDirection: 'column',
      background: C.panel,
    }}>
      {/* Filter bar */}
      <div style={{
        padding: '12px 14px 10px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', gap: 4, flexWrap: 'wrap',
      }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? C.ink : C.tint,
              color: filter === f ? '#fff' : C.ink2,
              border: `1px solid ${filter === f ? C.ink : C.line2}`,
              borderRadius: 5, padding: '4px 9px', fontSize: 11.5,
              cursor: 'pointer', fontFamily: SANS, fontWeight: 500,
              textTransform: f === 'all' ? 'capitalize' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {f === 'all' ? 'All' : f === 'needs-pickup' ? 'Needs pickup' : 'Covered'}
          </button>
        ))}
      </div>

      {/* Scene rows */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {visible.length === 0 && (
          <div style={{ padding: 20, color: C.muted2, fontSize: 12.5, fontFamily: SANS }}>
            No scenes match this filter.
          </div>
        )}
        {visible.map(sc => {
          const cov = coverageMap[sc.id] || 'not-reviewed';
          const active = sc.id === selectedId;
          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc.id)}
              style={{
                width: '100%', textAlign: 'left', background: active ? C.tint : 'transparent',
                border: 'none', borderBottom: `1px solid ${C.line}`,
                padding: '11px 14px', cursor: 'pointer',
                borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                transition: 'background 120ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                <span style={{
                  fontFamily: MONO, fontSize: 11, color: C.muted, minWidth: 22,
                }}>
                  #{sc.scene_number}
                </span>
                <span style={{
                  fontFamily: SANS, fontSize: 11, color: C.muted2, fontWeight: 500,
                }}>
                  {sc.int_ext} · {sc.day_night}
                </span>
                <CoverageDot status={cov} />
              </div>
              <div style={{
                fontFamily: SANS, fontSize: 12.5, color: active ? C.ink : C.ink2,
                fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                maxWidth: 210,
              }}>
                {sc.synopsis}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Shot row ──────────────────────────────────────────────────────────────────
function ShotRow({ shot, onToggle }) {
  const s = SHOT_STATUS[shot.status] || SHOT_STATUS.missing;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 12px', borderRadius: 6,
      background: s.bg, marginBottom: 6,
      border: `1px solid ${s.color}22`,
    }}>
      <span style={{
        fontFamily: MONO, fontSize: 12, color: s.color, fontWeight: 700, minWidth: 32,
      }}>
        {shot.shotId}
      </span>
      <span style={{ fontFamily: SANS, fontSize: 13, color: C.ink, flex: 1 }}>
        {shot.desc}
      </span>
      <button
        onClick={() => onToggle(shot.id)}
        style={{
          background: s.bg, color: s.color, fontWeight: 600,
          border: `1px solid ${s.color}55`, borderRadius: 5,
          padding: '3px 9px', fontSize: 12, cursor: 'pointer',
          fontFamily: SANS, whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'all 120ms',
        }}
      >
        {s.label}
      </button>
    </div>
  );
}

// ── Column 2: Scene detail ────────────────────────────────────────────────────
function SceneDetail({ scene, shots, onShotToggle, postNotes, onNotesChange, onSave, coverageStatus, onCoverageChange }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
      {/* Scene heading */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.muted }}>
            Scene {scene.scene_number}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 4, background: C.tint,
            fontFamily: MONO, fontSize: 11, color: C.muted2,
          }}>
            {scene.int_ext} · {scene.day_night} · {scene.location}
          </span>
        </div>
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 700, color: C.ink,
          fontFamily: SANS, letterSpacing: -0.4, lineHeight: 1.3,
        }}>
          {scene.synopsis}
        </h2>
      </div>

      {/* Coverage status selector */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: 11, fontFamily: MONO, color: C.muted2, marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Coverage status
        </label>
        <select
          value={coverageStatus}
          onChange={e => onCoverageChange(e.target.value)}
          style={{
            border: `1px solid ${C.line2}`, borderRadius: 6,
            padding: '7px 12px', fontFamily: SANS, fontSize: 13,
            background: C.panel, color: C.ink, cursor: 'pointer',
            outline: 'none', appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239A9A95'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
            paddingRight: 28,
          }}
        >
          {Object.entries(COVERAGE).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Shot coverage list */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted2, marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Shot coverage ({shots.length} shots)
        </div>
        {shots.length === 0 ? (
          <div style={{ color: C.muted2, fontFamily: SANS, fontSize: 13 }}>No shots planned for this scene.</div>
        ) : (
          shots.map(sh => (
            <ShotRow key={sh.id} shot={sh} onToggle={onShotToggle} />
          ))
        )}
      </div>

      {/* Editor's notes */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted2, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Editor's notes
        </div>
        <textarea
          value={postNotes}
          onChange={e => onNotesChange(e.target.value)}
          placeholder="e.g. Great coverage on master, close-up B is soft — may need VFX stabilize…"
          rows={4}
          style={{
            width: '100%', border: `1px solid ${C.line2}`, borderRadius: 6,
            padding: '10px 12px', fontFamily: SANS, fontSize: 13.5, color: C.ink,
            background: C.bg, resize: 'vertical', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />
        <div style={{ marginTop: 8 }}>
          <button
            onClick={handleSave}
            style={{
              background: saved ? C.ok : C.ink, color: '#fff',
              border: 'none', borderRadius: 6, padding: '7px 14px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: SANS, transition: 'background 200ms',
            }}
          >
            {saved ? '✓ Saved' : 'Save notes'}
          </button>
        </div>
      </div>

      {/* Reference images grid */}
      <div>
        <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted2, marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Reference — what we got
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <RefPlaceholder label="Master" />
          <RefPlaceholder label="Close-up" />
          <RefPlaceholder label="B-roll" />
        </div>
      </div>
    </div>
  );
}

// ── Column 3: Summary panel ───────────────────────────────────────────────────
function SummaryPanel({ scenes, coverageMap }) {
  const [aiOpen, setAiOpen]       = useState(false);
  const [aiState, setAiState]     = useState('idle');   // idle | loading | done
  const [exportMsg, setExportMsg] = useState('');

  const total    = scenes.length;
  const covered  = scenes.filter(s => coverageMap[s.id] === 'covered').length;
  const partial  = scenes.filter(s => coverageMap[s.id] === 'partial').length;
  const pickup   = scenes.filter(s => coverageMap[s.id] === 'needs-pickup').length;
  const unrev    = scenes.filter(s => !coverageMap[s.id] || coverageMap[s.id] === 'not-reviewed').length;
  const progress = total > 0 ? Math.round((covered / total) * 100) : 0;

  const AI_RESPONSE = `Based on current coverage: ${pickup + partial} scenes may need additional coverage. Scene 2 master shot runs 18s, may not be enough for a 3-min sequence. Recommend shooting Scene 4 close-ups before wrap.`;

  const handleAI = () => {
    setAiOpen(true);
    setAiState('loading');
    setTimeout(() => setAiState('done'), 1200);
  };

  const exportPickup = () => {
    const needPickup = scenes.filter(s => {
      const c = coverageMap[s.id];
      return c === 'needs-pickup' || c === 'partial';
    });
    if (!needPickup.length) {
      navigator.clipboard.writeText('No scenes currently require pickup.');
    } else {
      const lines = needPickup.map(s =>
        `Scene ${s.scene_number} [${COVERAGE[coverageMap[s.id]]?.label}] — ${s.synopsis} (${s.int_ext} · ${s.location})`
      );
      const text = `Pickup List\n${'─'.repeat(40)}\n` + lines.join('\n');
      navigator.clipboard.writeText(text);
    }
    setExportMsg('Copied!');
    setTimeout(() => setExportMsg(''), 2000);
  };

  return (
    <div style={{
      width: 220, flexShrink: 0,
      borderLeft: `1px solid ${C.line}`,
      background: C.panel, padding: '18px 16px',
      display: 'flex', flexDirection: 'column', gap: 20,
      overflowY: 'auto',
    }}>
      {/* Stats */}
      <div>
        <div style={{ fontSize: 11, fontFamily: MONO, color: C.muted2, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Coverage summary
        </div>
        <StatRow label="Total scenes"    value={total}   color={C.ink} />
        <StatRow label="Fully covered"   value={covered} color={C.ok} />
        <StatRow label="Partial"         value={partial} color={C.warn} />
        <StatRow label="Needs pickup"    value={pickup}  color={C.red} />
        <StatRow label="Not reviewed"    value={unrev}   color={C.muted2} />
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, fontFamily: SANS, color: C.muted }}>Coverage</span>
          <span style={{ fontSize: 11.5, fontFamily: MONO, color: C.ink, fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: C.line, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${C.ok}, #7BBF7B)`,
            transition: 'width 400ms ease',
          }} />
        </div>
      </div>

      {/* Export pickup list */}
      <div>
        <button
          onClick={exportPickup}
          style={{
            width: '100%', background: C.tint, color: C.ink2,
            border: `1px solid ${C.line2}`, borderRadius: 6,
            padding: '8px 10px', fontSize: 12.5, cursor: 'pointer',
            fontFamily: SANS, fontWeight: 500, textAlign: 'center',
            transition: 'background 120ms',
          }}
        >
          {exportMsg ? `✓ ${exportMsg}` : 'Export pickup list'}
        </button>
      </div>

      {/* AI Coverage Analysis */}
      <div>
        <button
          onClick={handleAI}
          disabled={aiState === 'loading'}
          style={{
            width: '100%',
            background: aiState === 'loading' ? C.tint : '#EEF2FD',
            color: '#2A3C8A', border: '1px solid #C5D0F5',
            borderRadius: 6, padding: '8px 10px', fontSize: 12.5,
            cursor: aiState === 'loading' ? 'default' : 'pointer',
            fontFamily: SANS, fontWeight: 600, textAlign: 'center',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          {aiState === 'loading' ? (
            <>
              <style>{`@keyframes pp-spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{
                display: 'inline-block', width: 11, height: 11,
                border: '2px solid #C5D0F5', borderTopColor: C.critical,
                borderRadius: '50%', animation: 'pp-spin 0.6s linear infinite',
              }} />
              Analysing…
            </>
          ) : '✦ AI Coverage Analysis'}
        </button>

        {aiOpen && aiState === 'done' && (
          <div style={{
            marginTop: 10, padding: '10px 12px', borderRadius: 6,
            background: '#EEF2FD', border: '1px solid #C5D0F5',
            fontSize: 12.5, fontFamily: SANS, color: '#1A2A6A', lineHeight: 1.55,
          }}>
            {AI_RESPONSE}
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <span style={{ fontSize: 12.5, fontFamily: SANS, color: C.ink2 }}>{label}</span>
      <span style={{ fontSize: 14, fontFamily: MONO, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

// ── Pre/Post comparison strip ─────────────────────────────────────────────────
function PrePostBanner({ scene, shots }) {
  const total     = shots.length;
  const done      = shots.filter(s => s.status === 'completed').length;
  const partial   = shots.filter(s => s.status === 'partial').length;
  const missing   = shots.filter(s => s.status === 'missing').length;
  const pct       = total > 0 ? Math.round((done / total) * 100) : 0;

  const needsAlert = pct < 50 && total > 0;

  return (
    <div style={{ borderBottom: `1px solid ${C.line}`, background: '#F7F8FF', padding: '14px 24px' }}>
      {/* PLANNED vs ACTUAL header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: needsAlert ? 12 : 0 }}>
        {/* Planned column */}
        <div style={{ padding: '10px 14px', background: C.panel, borderRadius: 8, border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: C.muted2, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            📋 Planned (pre-production)
          </div>
          <div style={{ fontSize: 13, color: C.ink, marginBottom: 4 }}>
            <b>{total}</b> shots · Scene {scene.scene_number}
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {scene.int_ext} · {scene.day_night} · {scene.location || '—'}
          </div>
          {scene.pages && (
            <div style={{ fontSize: 11, color: C.muted2, fontFamily: MONO, marginTop: 4 }}>
              {scene.pages} pages planned
            </div>
          )}
        </div>
        {/* Actual column */}
        <div style={{ padding: '10px 14px', background: C.panel, borderRadius: 8, border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: C.muted2, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>
            🎬 Actual (post-production)
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: C.ok, fontWeight: 600 }}>✓ {done} done</span>
            <span style={{ fontSize: 12, color: C.warn, fontWeight: 600 }}>⚠ {partial} partial</span>
            <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>✗ {missing} missing</span>
          </div>
          {/* Coverage bar */}
          <div style={{ height: 5, background: C.line, borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 80 ? C.ok : pct >= 50 ? C.warn : C.red, borderRadius: 3, transition: 'width 300ms' }}/>
          </div>
          <div style={{ fontSize: 11, fontFamily: MONO, color: pct >= 80 ? C.ok : pct >= 50 ? C.warn : C.red, fontWeight: 600 }}>
            {pct}% covered
          </div>
        </div>
      </div>
      {/* Alert if low coverage */}
      {needsAlert && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#FFF5DC', borderRadius: 6, border: `1px solid ${C.warn}40` }}>
          <span style={{ color: C.warn, fontSize: 16 }}>⚠</span>
          <span style={{ fontSize: 12.5, color: '#6E501C', fontFamily: SANS, lineHeight: 1.4 }}>
            Scene {scene.scene_number} is {100 - pct}% unshot — consider scheduling a pickup day.
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PostProductionScreen({ projectId, onViewPrePlan }) {
  const postKey = `prod-post-notes-${projectId}`;

  const [scenes, setScenes]         = useState(SAMPLE_SCENES);
  const [selectedId, setSelectedId] = useState(SAMPLE_SCENES[0].id);
  const [filter, setFilter]         = useState('all');

  // shots: { [sceneId]: shot[] }
  const [shotsMap, setShotsMap]     = useState(SEED_SHOTS);

  // coverage override per scene: { [sceneId]: coverageKey }
  const [coverageMap, setCoverageMap] = useState({});

  // post notes per scene: { [sceneId]: string }
  const [notesMap, setNotesMap]     = useState({});

  // Mobile: which column is active
  const [mobileCol, setMobileCol]   = useState('list'); // list | detail | summary

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    getScenes(projectId)
      .then(data => {
        if (data && data.length) {
          setScenes(data);
          setSelectedId(data[0].id);
        }
      })
      .catch(() => {/* use sample data */});

    try {
      const saved = localStorage.getItem(postKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.notesMap)    setNotesMap(parsed.notesMap);
        if (parsed.coverageMap) setCoverageMap(parsed.coverageMap);
        if (parsed.shotsMap)    setShotsMap(s => ({ ...SEED_SHOTS, ...parsed.shotsMap }));
      }
    } catch {}
  }, [projectId, postKey]);

  // ── Derived coverage (auto from shots, overridden by manual selection) ─────
  const effectiveCoverage = useCallback((sceneId) => {
    if (coverageMap[sceneId]) return coverageMap[sceneId];
    const shots = shotsMap[sceneId] || [];
    return shots.length ? coverageFromShots(shots) : 'not-reviewed';
  }, [coverageMap, shotsMap]);

  const allCoverage = Object.fromEntries(scenes.map(s => [s.id, effectiveCoverage(s.id)]));

  // ── Actions ────────────────────────────────────────────────────────────────
  const toggleShot = (sceneId, shotId) => {
    setShotsMap(prev => {
      const shots = (prev[sceneId] || []).map(sh =>
        sh.id === shotId ? { ...sh, status: SHOT_CYCLE[sh.status] || 'completed' } : sh
      );
      return { ...prev, [sceneId]: shots };
    });
    // Clear manual coverage override so it re-derives from shots
    setCoverageMap(prev => { const n = { ...prev }; delete n[sceneId]; return n; });
  };

  const saveNotes = () => {
    try {
      localStorage.setItem(postKey, JSON.stringify({ notesMap, coverageMap, shotsMap }));
    } catch {}
  };

  const selectedScene = scenes.find(s => s.id === selectedId) || scenes[0];
  const selectedShots = shotsMap[selectedId] || [];
  const selectedCov   = effectiveCoverage(selectedId);

  // ── Responsive: detect mobile ──────────────────────────────────────────────
  // We use a simple check; the component is self-contained
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 700;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: C.bg, fontFamily: SANS }}>

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: C.panel,
        borderBottom: `1px solid ${C.line2}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 17 }}>🎞</span>
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: -0.3 }}>
            Post-Production
          </h1>
          <span style={{
            padding: '2px 8px', borderRadius: 4, background: C.tint,
            fontFamily: MONO, fontSize: 11, color: C.muted2,
          }}>
            Scene coverage
          </span>
        </div>
        {/* Pre-production bridge link */}
        {onViewPrePlan && (
          <button onClick={onViewPrePlan} style={{
            background: 'none', border: `1px solid ${C.line2}`, borderRadius: 6,
            padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: SANS,
            color: C.ink2, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← View pre-production plan
          </button>
        )}

        {/* Mobile tab switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['list', 'detail', 'summary'].map(col => (
            <button
              key={col}
              onClick={() => setMobileCol(col)}
              style={{
                display: 'none', // shown via media query workaround below
                background: mobileCol === col ? C.ink : C.tint,
                color: mobileCol === col ? '#fff' : C.ink2,
                border: `1px solid ${C.line2}`, borderRadius: 5,
                padding: '4px 10px', fontSize: 11.5, cursor: 'pointer',
                fontFamily: SANS, fontWeight: 500, textTransform: 'capitalize',
              }}
              className={`pp-mobtab`}
            >
              {col === 'list' ? 'Scenes' : col === 'detail' ? 'Detail' : 'Summary'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Three-column body ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Column 1 — Scene list */}
        <div style={{ display: 'flex', flexShrink: 0 }} className="pp-col1">
          <SceneList
            scenes={scenes}
            selectedId={selectedId}
            onSelect={(id) => { setSelectedId(id); setMobileCol('detail'); }}
            coverageMap={allCoverage}
            filter={filter}
            setFilter={setFilter}
          />
        </div>

        {/* Column 2 — Scene detail */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {selectedScene && (
            <PrePostBanner scene={selectedScene} shots={selectedShots}/>
          )}
          {selectedScene ? (
            <SceneDetail
              scene={selectedScene}
              shots={selectedShots}
              onShotToggle={(shotId) => toggleShot(selectedId, shotId)}
              postNotes={notesMap[selectedId] || ''}
              onNotesChange={(txt) => setNotesMap(prev => ({ ...prev, [selectedId]: txt }))}
              onSave={saveNotes}
              coverageStatus={selectedCov}
              onCoverageChange={(val) => setCoverageMap(prev => ({ ...prev, [selectedId]: val }))}
            />
          ) : (
            <div style={{ padding: 40, color: C.muted2, fontSize: 14 }}>Select a scene to view details.</div>
          )}
        </div>

        {/* Column 3 — Summary */}
        <div className="pp-col3">
          <SummaryPanel scenes={scenes} coverageMap={allCoverage} />
        </div>
      </div>

      {/* Responsive styles injected as a style tag */}
      <style>{`
        .pp-col1 { display: flex; }
        .pp-col3 { display: flex; }
        .pp-mobtab { display: none !important; }

        @media (max-width: 700px) {
          .pp-col1 { display: none; }
          .pp-col3 { display: none; }
          .pp-mobtab { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
