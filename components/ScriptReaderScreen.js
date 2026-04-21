'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { C, Ico, Badge, PrimaryBtn, GhostBtn, Card, Avatar } from './shared';
import { getScenes, getSchedule } from '@/lib/api';

// ─── Sample script data ───────────────────────────────────────────────────────

const SAMPLE_LINES = [
  { type: 'scene', sceneNum: '1', text: 'INT. WAREHOUSE — DAY', id: 's1' },
  { type: 'action', text: 'Dust floats in shafts of light. The camera pans across ROWS of industrial shelving.', sceneId: 's1' },
  { type: 'character', text: 'MARCUS', sceneId: 's1' },
  { type: 'dialogue', text: 'We have maybe three hours before they realize what we took.', sceneId: 's1' },
  { type: 'action', text: 'He checks his watch. SARA moves to the window.', sceneId: 's1' },
  { type: 'character', text: 'SARA', sceneId: 's1' },
  { type: 'dialogue', text: "Three hours. That's enough.", sceneId: 's1' },
  { type: 'scene', sceneNum: '2', text: 'EXT. ROOFTOP — NIGHT', id: 's2' },
  { type: 'action', text: 'Rain begins to fall. City lights blur below.', sceneId: 's2' },
  { type: 'character', text: 'MARCUS', sceneId: 's2' },
  { type: 'dialogue', text: "This is either the smartest or the stupidest plan we've had.", sceneId: 's2' },
  { type: 'scene', sceneNum: '3', text: 'INT. CAR — CONTINUOUS', id: 's3' },
  { type: 'action', text: 'Marcus drives. Sara stares out the rain-streaked window.', sceneId: 's3' },
  { type: 'character', text: 'SARA', sceneId: 's3' },
  { type: 'dialogue', text: 'Tell me this works.', sceneId: 's3' },
  { type: 'character', text: 'MARCUS', sceneId: 's3' },
  { type: 'dialogue', text: '...It works.', sceneId: 's3' },
  { type: 'scene', sceneNum: '4', text: 'EXT. WAREHOUSE DISTRICT — DAWN', id: 's4' },
  { type: 'action', text: 'The van disappears into the grey morning. Only the sound of rain.', sceneId: 's4' },
];

const SAMPLE_SCENE_DETAILS = {
  s1: {
    synopsis: 'Marcus and Sara scramble inside the abandoned warehouse, calculating their window before the heist is discovered.',
    cast: ['Marcus', 'Sara'],
    props: ['Watch', 'Industrial shelving', 'Boxes'],
    wardrobe: ['Tactical jacket', 'Dark cargo pants'],
    sfx: ['Dust motes (practical)'],
    notes: 'Light shafts practical from skylights. Camera on dolly for opening pan.',
    intExt: 'INT',
    dayNight: 'DAY',
  },
  s2: {
    synopsis: 'On the rooftop in the rain, Marcus questions the plan. The city glitters below.',
    cast: ['Marcus'],
    props: ['Rain rig', 'City backdrop'],
    wardrobe: ['Wet jacket'],
    sfx: ['Rain practical', 'Wind'],
    notes: 'Shoot magic hour for city BG plates. Practical rain rig overhead.',
    intExt: 'EXT',
    dayNight: 'NIGHT',
  },
  s3: {
    synopsis: 'Driving in silence — the two leads share a loaded exchange. The rain-streaked windows mirror their tension.',
    cast: ['Marcus', 'Sara'],
    props: ['Vehicle interior', 'Rain-effect on windows'],
    wardrobe: ['Same as Sc.2'],
    sfx: ['Engine ambiance', 'Rain on roof'],
    notes: 'Process trailer for driving plates. Close on hands and eyes.',
    intExt: 'INT',
    dayNight: 'CONTINUOUS',
  },
  s4: {
    synopsis: 'The van vanishes into the dawn. A quiet, melancholy coda.',
    cast: [],
    props: ['Cargo van', 'Empty street'],
    wardrobe: [],
    sfx: ['Rain fading', 'Distant traffic'],
    notes: 'No dialogue. Wide, slow push in. Sunrise timed to wrap.',
    intExt: 'EXT',
    dayNight: 'DAWN',
  },
};

const SAMPLE_REFS = [
  { id: 'r1', url: '', category: 'Lighting', caption: 'Warehouse shaft lighting ref' },
  { id: 'r2', url: '', category: 'Color', caption: 'Desaturated green teal grade' },
  { id: 'r3', url: '', category: 'Camera', caption: 'Low angle rooftop composition' },
  { id: 'r4', url: '', category: 'Wardrobe', caption: 'Marcus tactical jacket' },
  { id: 'r5', url: '', category: 'Lighting', caption: 'Rain scene backlighting' },
  { id: 'r6', url: '', category: 'Color', caption: 'Dawn sequence warm palette' },
];

const REF_CATEGORY_TONE = { Lighting: 'accent', Color: 'critical', Camera: 'neutral', Wardrobe: 'ok' };

// ─── Mini helpers ─────────────────────────────────────────────────────────────

function parseIntExt(heading) {
  if (heading.startsWith('INT.')) return 'INT';
  if (heading.startsWith('EXT.')) return 'EXT';
  return '—';
}

function parseDayNight(heading) {
  const upper = heading.toUpperCase();
  if (upper.includes('NIGHT')) return 'NIGHT';
  if (upper.includes('DAWN')) return 'DAWN';
  if (upper.includes('DUSK')) return 'DUSK';
  if (upper.includes('CONTINUOUS')) return 'CONTINUOUS';
  return 'DAY';
}

function dayNightTone(dn) {
  if (dn === 'NIGHT') return 'critical';
  if (dn === 'DAWN' || dn === 'DUSK') return 'warn';
  return 'neutral';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke={C.critical} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke={C.critical} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CameraIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={C.muted2} strokeWidth="1.5"/>
      <path d="M16 7l2-4H6l2 4" stroke={C.muted2} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="14" r="3.5" stroke={C.muted2} strokeWidth="1.5"/>
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="9" stroke={C.line2} strokeWidth="2.5"/>
      <path d="M12 3a9 9 0 019 9" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Scene Minimap ────────────────────────────────────────────────────────────

function SceneMinimap({ lines, activeSceneId, onJump }) {
  const scenes = lines.filter(l => l.type === 'scene');
  return (
    <div style={{
      width: 32,
      flexShrink: 0,
      background: C.tint,
      borderRight: `1px solid ${C.line}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 12,
      gap: 2,
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>
      {scenes.map(sc => {
        const active = activeSceneId === sc.id;
        return (
          <button
            key={sc.id}
            title={sc.text}
            onClick={() => onJump(sc.id)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              border: 'none',
              background: active ? C.accent : 'transparent',
              color: active ? '#fff' : C.muted,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: '"IBM Plex Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms, color 150ms',
              lineHeight: 1,
            }}
          >
            {sc.sceneNum}
          </button>
        );
      })}
    </div>
  );
}

// ─── Script Line ──────────────────────────────────────────────────────────────

function ScriptLine({ line, isActive, isActiveScene, onSelect, lineIndex }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isActive]);

  const sceneId = line.type === 'scene' ? line.id : line.sceneId;

  if (line.type === 'scene') {
    return (
      <div
        ref={ref}
        id={`scene-${line.id}`}
        onClick={() => onSelect(line, lineIndex)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 16px',
          background: isActive ? '#EBEFFB' : C.tint,
          borderLeft: isActiveScene ? `3px solid ${C.accent}` : '3px solid transparent',
          cursor: 'pointer',
          marginTop: lineIndex > 0 ? 18 : 0,
          transition: 'background 120ms',
          userSelect: 'none',
        }}
      >
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 9,
          fontWeight: 700,
          color: C.accent2,
          background: C.accent,
          color: '#fff',
          borderRadius: 3,
          padding: '2px 5px',
          letterSpacing: 0.5,
          flexShrink: 0,
        }}>
          {line.sceneNum}
        </span>
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12.5,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {line.text}
        </span>
        {hovered && <LinkIcon />}
      </div>
    );
  }

  if (line.type === 'action') {
    return (
      <div
        ref={ref}
        onClick={() => onSelect(line, lineIndex)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 6,
          padding: '5px 16px 5px 29px',
          background: isActive ? '#EBEFFB' : 'transparent',
          borderLeft: isActiveScene ? `3px solid ${C.line2}` : '3px solid transparent',
          cursor: 'pointer',
          transition: 'background 120ms',
        }}
      >
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12.5,
          color: C.ink2,
          lineHeight: 1.7,
          flex: 1,
        }}>
          {line.text}
        </span>
        <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms', marginTop: 5 }}>
          <LinkIcon />
        </span>
      </div>
    );
  }

  if (line.type === 'character') {
    return (
      <div
        ref={ref}
        onClick={() => onSelect(line, lineIndex)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px 2px 100px',
          background: isActive ? '#EBEFFB' : 'transparent',
          borderLeft: isActiveScene ? `3px solid ${C.line2}` : '3px solid transparent',
          cursor: 'pointer',
          transition: 'background 120ms',
        }}
      >
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11.5,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: 1,
          textTransform: 'uppercase',
          flex: 1,
        }}>
          {line.text}
        </span>
        <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms' }}>
          <LinkIcon />
        </span>
      </div>
    );
  }

  if (line.type === 'dialogue') {
    return (
      <div
        ref={ref}
        onClick={() => onSelect(line, lineIndex)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 6,
          padding: '2px 16px 6px 100px',
          background: isActive ? '#EBEFFB' : 'transparent',
          borderLeft: isActiveScene ? `3px solid ${C.line2}` : '3px solid transparent',
          cursor: 'pointer',
          transition: 'background 120ms',
          maxWidth: '100%',
        }}
      >
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 12.5,
          color: C.ink,
          lineHeight: 1.65,
          flex: 1,
          maxWidth: 380,
        }}>
          {line.text}
        </span>
        <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 120ms', marginTop: 4 }}>
          <LinkIcon />
        </span>
      </div>
    );
  }

  return null;
}

// ─── Reference Image Card ─────────────────────────────────────────────────────

function RefImageCard({ ref: refData, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [urlInput, setUrlInput] = useState(refData.url || '');
  const [caption, setCaption] = useState(refData.caption || '');

  const save = () => {
    onUpdate({ ...refData, url: urlInput, caption });
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div
        onClick={() => setEditing(v => !v)}
        style={{
          aspectRatio: '4/3',
          background: refData.url
            ? `url(${refData.url}) center/cover no-repeat`
            : `repeating-linear-gradient(-45deg, ${C.line} 0 2px, ${C.tint} 2px 12px)`,
          borderRadius: 6,
          border: `1px solid ${C.line2}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 140ms',
        }}
      >
        {!refData.url && (
          <>
            <CameraIcon size={26} />
            <span style={{ fontSize: 10, color: C.muted2, marginTop: 6, fontFamily: 'Inter, system-ui' }}>
              Click to add URL
            </span>
          </>
        )}
        <div style={{
          position: 'absolute',
          top: 6,
          right: 6,
        }}>
          <Badge tone={REF_CATEGORY_TONE[refData.category] || 'neutral'}>{refData.category}</Badge>
        </div>
      </div>

      {editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            autoFocus
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://image-url.com/photo.jpg"
            style={{
              border: `1px solid ${C.line2}`,
              borderRadius: 4,
              padding: '5px 8px',
              fontSize: 11,
              fontFamily: 'Inter, system-ui',
              color: C.ink,
              background: C.bg,
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={save}
              style={{
                background: C.ink,
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '3px 10px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
              }}
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              style={{
                background: 'none',
                border: `1px solid ${C.line2}`,
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 11,
                cursor: 'pointer',
                color: C.muted,
                fontFamily: 'Inter, system-ui',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <input
        value={caption}
        onChange={e => {
          setCaption(e.target.value);
          onUpdate({ ...refData, url: urlInput, caption: e.target.value });
        }}
        placeholder="Caption…"
        style={{
          border: 'none',
          borderBottom: `1px solid ${C.line}`,
          padding: '3px 0',
          fontSize: 11,
          fontFamily: 'Inter, system-ui',
          color: C.ink2,
          background: 'transparent',
          outline: 'none',
          width: '100%',
        }}
      />
    </div>
  );
}

// ─── Scene Detail Panel ───────────────────────────────────────────────────────

function SceneDetailPanel({ scene, sceneDetail, readOnly, onUpdateDetail, shots }) {
  const [genLoading, setGenLoading] = useState(false);
  const [generatedShots, setGeneratedShots] = useState([]);
  const [refs, setRefs] = useState(() =>
    [0, 1, 2].map(i => ({
      id: `ref-${scene?.id}-${i}`,
      url: '',
      category: ['Lighting', 'Color', 'Camera'][i],
      caption: '',
    }))
  );

  // Reset refs when scene changes
  useEffect(() => {
    setGeneratedShots([]);
    setRefs([0, 1, 2].map(i => ({
      id: `ref-${scene?.id}-${i}`,
      url: '',
      category: ['Lighting', 'Color', 'Camera'][i],
      caption: '',
    })));
  }, [scene?.id]);

  const handleGenerateShots = () => {
    setGenLoading(true);
    setTimeout(() => {
      setGenLoading(false);
      setGeneratedShots([
        { id: 'g1', shotId: `${scene.sceneNum}A`, setup: 'Wide establishing — camera slowly pushes in', lens: '24mm' },
        { id: 'g2', shotId: `${scene.sceneNum}B`, setup: 'OTS Marcus — tight on reaction', lens: '85mm' },
        { id: 'g3', shotId: `${scene.sceneNum}C`, setup: 'Insert — hands / object detail', lens: '100mm macro' },
      ]);
    }, 1600);
  };

  const sceneShots = shots.filter(s => s.scene === scene?.sceneNum);
  const allShots = [...sceneShots, ...generatedShots.map(g => ({
    id: g.id,
    shot_id: g.shotId,
    setup: g.setup,
    lens: g.lens,
    status: 'planned',
    isGenerated: true,
  }))];

  if (!scene) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 10,
        color: C.muted2,
        fontFamily: 'Inter, system-ui',
      }}>
        <Ico.book style={{ color: C.line2 }} width={32} height={32} />
        <div style={{ fontSize: 13, color: C.muted }}>Select a scene to view details</div>
        <div style={{ fontSize: 11.5, color: C.muted2 }}>Click any scene heading or line</div>
      </div>
    );
  }

  const detail = sceneDetail || {};
  const intExt = detail.intExt || parseIntExt(scene.text);
  const dayNight = detail.dayNight || parseDayNight(scene.text);
  const castList = detail.cast || [];
  const props = detail.props || [];
  const wardrobe = detail.wardrobe || [];
  const sfx = detail.sfx || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Sticky header */}
      <div style={{
        padding: '14px 20px 12px',
        borderBottom: `1px solid ${C.line}`,
        background: C.panel,
        position: 'sticky',
        top: 0,
        zIndex: 2,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            fontWeight: 700,
            background: C.accent,
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 3,
            letterSpacing: 0.5,
          }}>
            SC. {scene.sceneNum}
          </span>
          <Badge tone={intExt === 'INT' ? 'neutral' : 'ok'}>{intExt}</Badge>
          <Badge tone={dayNightTone(dayNight)}>{dayNight}</Badge>
        </div>
        <div style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 13,
          fontWeight: 700,
          color: C.ink,
          letterSpacing: 0.6,
          lineHeight: 1.3,
        }}>
          {scene.text}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Synopsis */}
        <div>
          <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Synopsis</div>
          {readOnly ? (
            <div style={{ fontSize: 13, color: C.ink2, lineHeight: 1.65, fontFamily: 'Inter, system-ui' }}>
              {detail.synopsis || <span style={{ color: C.muted2 }}>No synopsis added.</span>}
            </div>
          ) : (
            <textarea
              value={detail.synopsis || ''}
              onChange={e => onUpdateDetail({ ...detail, synopsis: e.target.value })}
              placeholder="Write a brief synopsis of this scene…"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: `1px solid ${C.line2}`,
                borderRadius: 5,
                padding: '7px 10px',
                fontSize: 13,
                fontFamily: 'Inter, system-ui',
                color: C.ink,
                background: C.bg,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.65,
              }}
            />
          )}
        </div>

        {/* Cast */}
        {castList.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Cast in this scene
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {castList.map(name => (
                <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <Avatar name={name} size={34} />
                  <span style={{ fontSize: 10.5, color: C.ink2, fontFamily: 'Inter, system-ui', fontWeight: 500 }}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Director references */}
        <div>
          <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Director References
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {refs.map(r => (
              <RefImageCard
                key={r.id}
                ref={r}
                onUpdate={updated => setRefs(prev => prev.map(x => x.id === updated.id ? updated : x))}
              />
            ))}
          </div>
        </div>

        {/* Shot list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase' }}>
              Shot List
            </div>
            {!readOnly && (
              <button
                onClick={handleGenerateShots}
                disabled={genLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'none',
                  border: `1px solid ${C.line2}`,
                  borderRadius: 5,
                  padding: '4px 9px',
                  fontSize: 11,
                  cursor: genLoading ? 'default' : 'pointer',
                  color: C.ink2,
                  fontFamily: 'Inter, system-ui',
                  fontWeight: 500,
                }}
              >
                {genLoading ? <SpinnerIcon /> : <Ico.sparkle />}
                {genLoading ? 'Generating…' : 'Generate shot list'}
              </button>
            )}
          </div>

          {allShots.length === 0 ? (
            <div style={{
              padding: '14px 0',
              fontSize: 12,
              color: C.muted2,
              fontFamily: 'Inter, system-ui',
              textAlign: 'center',
              border: `1px dashed ${C.line2}`,
              borderRadius: 6,
            }}>
              No shots linked yet.{!readOnly && ' Use "Generate shot list" to create suggestions.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allShots.map(s => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 10px',
                    background: s.isGenerated ? '#EBEFFB' : C.tint,
                    borderRadius: 5,
                    border: `1px solid ${s.isGenerated ? '#C5D0F0' : C.line}`,
                  }}
                >
                  <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 700, color: C.accent2, flexShrink: 0 }}>
                    {s.shot_id || s.shotId}
                  </span>
                  <span style={{ fontSize: 12, color: C.ink2, fontFamily: 'Inter, system-ui', flex: 1 }}>{s.setup}</span>
                  {s.lens && <Badge tone="neutral">{s.lens}</Badge>}
                  {s.isGenerated && <Badge tone="critical">AI</Badge>}
                  {s.status === 'done' && <Badge tone="ok">Done</Badge>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Props / Wardrobe / SFX tags */}
        {(props.length > 0 || wardrobe.length > 0 || sfx.length > 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {props.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Props</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {props.map(p => <Badge key={p} tone="neutral">{p}</Badge>)}
                </div>
              </div>
            )}
            {wardrobe.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>Wardrobe</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {wardrobe.map(w => <Badge key={w} tone="accent">{w}</Badge>)}
                </div>
              </div>
            )}
            {sfx.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>SFX</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {sfx.map(s => <Badge key={s} tone="warn">{s}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div>
          <div style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', color: C.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Notes</div>
          {readOnly ? (
            <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.65, fontFamily: 'Inter, system-ui' }}>
              {detail.notes || <span style={{ color: C.muted2 }}>No notes.</span>}
            </div>
          ) : (
            <textarea
              value={detail.notes || ''}
              onChange={e => onUpdateDetail({ ...detail, notes: e.target.value })}
              placeholder="Director / production notes for this scene…"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: `1px solid ${C.line2}`,
                borderRadius: 5,
                padding: '7px 10px',
                fontSize: 12.5,
                fontFamily: 'Inter, system-ui',
                color: C.ink,
                background: C.bg,
                outline: 'none',
                resize: 'vertical',
                lineHeight: 1.65,
              }}
            />
          )}
        </div>

        {/* Bottom spacer */}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─── References Tab (full-project Pinterest view) ─────────────────────────────

function ReferencesTab({ readOnly }) {
  const [refs, setRefs] = useState(SAMPLE_REFS);
  const [addingUrl, setAddingUrl] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Lighting');

  const addRef = () => {
    if (!newUrl.trim()) return;
    setRefs(prev => [...prev, {
      id: `r-${Date.now()}`,
      url: newUrl.trim(),
      category: newCategory,
      caption: '',
    }]);
    setNewUrl('');
    setAddingUrl(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, fontFamily: 'Inter, system-ui' }}>
          Project References
        </div>
        {!readOnly && (
          <GhostBtn icon={Ico.plus} onClick={() => setAddingUrl(v => !v)}>
            Add reference
          </GhostBtn>
        )}
      </div>

      {addingUrl && (
        <div style={{
          display: 'flex',
          gap: 8,
          padding: 12,
          background: C.tint,
          borderRadius: 7,
          border: `1px solid ${C.line2}`,
          marginBottom: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <input
            autoFocus
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRef()}
            placeholder="https://image-url.com/ref.jpg"
            style={{
              flex: 1,
              minWidth: 200,
              border: `1px solid ${C.line2}`,
              borderRadius: 4,
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'Inter, system-ui',
              color: C.ink,
              background: C.panel,
              outline: 'none',
            }}
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            style={{
              border: `1px solid ${C.line2}`,
              borderRadius: 4,
              padding: '6px 10px',
              fontSize: 12,
              fontFamily: 'Inter, system-ui',
              background: C.panel,
              color: C.ink,
              cursor: 'pointer',
            }}
          >
            {['Lighting', 'Color', 'Wardrobe', 'Camera'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <PrimaryBtn onClick={addRef}>Add</PrimaryBtn>
          <GhostBtn onClick={() => setAddingUrl(false)}>Cancel</GhostBtn>
        </div>
      )}

      <div style={{
        columns: 3,
        columnGap: 12,
      }}>
        {refs.map(r => (
          <div key={r.id} style={{ breakInside: 'avoid', marginBottom: 12 }}>
            <div
              style={{
                background: r.url
                  ? `url(${r.url}) center/cover no-repeat`
                  : `repeating-linear-gradient(-45deg, ${C.line} 0 2px, ${C.tint} 2px 12px)`,
                borderRadius: 7,
                border: `1px solid ${C.line}`,
                minHeight: r.url ? 80 : 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {!r.url && (
                <>
                  <CameraIcon size={22} />
                  <span style={{ fontSize: 9, color: C.muted2, marginTop: 4, fontFamily: 'Inter, system-ui' }}>No image</span>
                </>
              )}
              <div style={{ position: 'absolute', top: 6, left: 6 }}>
                <Badge tone={REF_CATEGORY_TONE[r.category] || 'neutral'}>{r.category}</Badge>
              </div>
            </div>
            {r.caption && (
              <div style={{ fontSize: 11, color: C.muted, fontFamily: 'Inter, system-ui', marginTop: 4, paddingLeft: 2 }}>
                {r.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shot List Tab ────────────────────────────────────────────────────────────

function ShotListTab({ shots, loading }) {
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontFamily: 'Inter, system-ui', fontSize: 13 }}>Loading shots…</div>;
  if (!shots.length) return (
    <div style={{ padding: 40, textAlign: 'center', color: C.muted2, fontFamily: 'Inter, system-ui', fontSize: 13 }}>
      No shots added yet. Go to the Shot List screen to add shots.
    </div>
  );

  const groups = {};
  shots.forEach(s => { (groups[s.scene || 'Unassigned'] = groups[s.scene || 'Unassigned'] || []).push(s); });

  return (
    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(groups).map(([scene, sceneShots]) => (
        <div key={scene}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, fontWeight: 700, color: C.muted }}>
              SCENE {scene}
            </span>
            <Badge tone="neutral">{sceneShots.length} shots</Badge>
            <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sceneShots.map(s => (
              <div key={s.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                background: C.tint,
                borderRadius: 5,
                border: `1px solid ${C.line}`,
              }}>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10.5, fontWeight: 700, color: C.accent2, flexShrink: 0 }}>
                  {s.shot_id}
                </span>
                <span style={{ fontSize: 12.5, color: C.ink2, fontFamily: 'Inter, system-ui', flex: 1 }}>{s.setup}</span>
                {s.lens && <Badge tone="neutral">{s.lens}</Badge>}
                {s.status === 'done' && <Badge tone="ok">Done</Badge>}
                {s.status === 'current' && <Badge tone="accent" dot>Current</Badge>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ScriptReaderScreen({ projectId, readOnly = false }) {
  const [activeTab, setActiveTab]       = useState('script');   // 'script' | 'shotlist' | 'references'
  const [scriptLines, setScriptLines]   = useState(SAMPLE_LINES);
  const [sceneDetails, setSceneDetails] = useState(SAMPLE_SCENE_DETAILS);
  const [selectedLine, setSelectedLine] = useState(null);       // the clicked line object
  const [selectedLineIdx, setSelectedLineIdx] = useState(null);
  const [activeSceneId, setActiveSceneId] = useState(null);     // scene id of currently selected scene
  const [activeScene, setActiveScene]   = useState(null);       // the scene line object
  const [search, setSearch]             = useState('');
  const [shareTooltip, setShareTooltip] = useState(false);
  const [shots, setShots]               = useState([]);
  const [shotsLoading, setShotsLoading] = useState(false);

  const scriptRef = useRef(null);

  // Load real scenes and shots from API
  useEffect(() => {
    if (!projectId) return;

    getScenes(projectId).then(scenes => {
      if (!scenes?.length) return;
      // Merge API scenes into script lines — insert real scene lines at the top of SAMPLE_LINES
      const apiSceneLines = scenes.map((s, i) => ({
        type: 'scene',
        sceneNum: s.scene_number ? String(s.scene_number) : String(i + 1),
        text: s.heading || s.title || `Scene ${i + 1}`,
        id: `api-${s.id}`,
        _apiId: s.id,
      }));
      // Build merged details from API data
      const mergedDetails = { ...SAMPLE_SCENE_DETAILS };
      scenes.forEach((s, i) => {
        const lineId = `api-${s.id}`;
        mergedDetails[lineId] = {
          synopsis: s.synopsis || '',
          cast: s.cast || [],
          props: s.props || [],
          wardrobe: s.wardrobe || [],
          sfx: s.sfx || [],
          notes: s.notes || '',
          intExt: s.int_ext || parseIntExt(s.heading || ''),
          dayNight: s.day_night || parseDayNight(s.heading || ''),
        };
      });
      setSceneDetails(mergedDetails);
      // Prepend real scenes to script lines (keeping sample lines as demo content)
      if (apiSceneLines.length > 0) {
        setScriptLines([...apiSceneLines, ...SAMPLE_LINES]);
      }
    }).catch(() => {}); // fall back silently

    setShotsLoading(true);
    import('@/lib/api').then(({ getShots }) =>
      getShots(projectId).then(setShots).catch(() => {}).finally(() => setShotsLoading(false))
    );
  }, [projectId]);

  // Derive current character name for dialogue tooltip
  const currentChar = useCallback((lineIndex) => {
    for (let i = lineIndex - 1; i >= 0; i--) {
      if (scriptLines[i].type === 'character') return scriptLines[i].text;
      if (scriptLines[i].type === 'scene') break;
    }
    return null;
  }, [scriptLines]);

  const handleSelectLine = (line, idx) => {
    setSelectedLine(line);
    setSelectedLineIdx(idx);
    // Find the scene this line belongs to
    const sceneId = line.type === 'scene' ? line.id : line.sceneId;
    setActiveSceneId(sceneId);
    // Find the scene line object
    const sceneLine = scriptLines.find(l => l.type === 'scene' && l.id === sceneId);
    setActiveScene(sceneLine || null);
  };

  const handleJumpToScene = (sceneId) => {
    // Scroll to scene heading
    const el = document.getElementById(`scene-${sceneId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Select the scene
    const sceneLine = scriptLines.find(l => l.type === 'scene' && l.id === sceneId);
    if (sceneLine) {
      const idx = scriptLines.indexOf(sceneLine);
      handleSelectLine(sceneLine, idx);
    }
  };

  const handleUpdateDetail = (updated) => {
    if (!activeSceneId) return;
    setSceneDetails(prev => ({ ...prev, [activeSceneId]: updated }));
  };

  const handleShare = () => {
    setShareTooltip(true);
    setTimeout(() => setShareTooltip(false), 2500);
  };

  // Filtered script lines by search
  const filteredLines = search.trim()
    ? scriptLines.filter(l => {
        const q = search.toLowerCase();
        return (
          l.text?.toLowerCase().includes(q) ||
          (l.type === 'scene' && `scene ${l.sceneNum}`.toLowerCase().includes(q))
        );
      })
    : scriptLines;

  const scenes = scriptLines.filter(l => l.type === 'scene');

  // ── Tab button style helper
  const tabStyle = (tab) => ({
    background: 'none',
    border: 'none',
    padding: '6px 2px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: activeTab === tab ? 600 : 500,
    color: activeTab === tab ? C.ink : C.muted,
    borderBottom: activeTab === tab ? `2px solid ${C.ink}` : '2px solid transparent',
    fontFamily: 'Inter, system-ui',
    letterSpacing: 0.1,
    transition: 'color 120ms',
  });

  return (
    <>
      {/* Spin keyframes injected globally */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        background: C.bg,
        fontFamily: 'Inter, system-ui',
        overflow: 'hidden',
      }}>

        {/* ── Top bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '10px 20px',
          borderBottom: `1px solid ${C.line}`,
          background: C.panel,
          flexShrink: 0,
          flexWrap: 'wrap',
          rowGap: 8,
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <button style={tabStyle('script')} onClick={() => setActiveTab('script')}>Script</button>
            <button style={tabStyle('shotlist')} onClick={() => setActiveTab('shotlist')}>Shot List</button>
            <button style={tabStyle('references')} onClick={() => setActiveTab('references')}>References</button>
          </div>

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 8, pointerEvents: 'none', color: C.muted2 }}>
              <Ico.search />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search scene or character…"
              style={{
                border: `1px solid ${C.line2}`,
                borderRadius: 6,
                padding: '5px 10px 5px 28px',
                fontSize: 12.5,
                fontFamily: 'Inter, system-ui',
                color: C.ink,
                background: C.bg,
                outline: 'none',
                width: 210,
                transition: 'border-color 140ms',
              }}
              onFocus={e => (e.target.style.borderColor = C.accent)}
              onBlur={e => (e.target.style.borderColor = C.line2)}
            />
          </div>

          {/* Share button */}
          <div style={{ position: 'relative' }}>
            <GhostBtn onClick={handleShare}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ marginRight: 2 }}>
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Share
            </GhostBtn>
            {shareTooltip && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: C.ink,
                color: '#fff',
                fontSize: 11.5,
                padding: '5px 10px',
                borderRadius: 5,
                whiteSpace: 'nowrap',
                zIndex: 50,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              }}>
                Shareable link coming soon
              </div>
            )}
          </div>
        </div>

        {/* ── Main content area */}
        {activeTab === 'references' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ReferencesTab readOnly={readOnly} />
          </div>
        ) : activeTab === 'shotlist' ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <ShotListTab shots={shots} loading={shotsLoading} />
          </div>
        ) : (
          /* Script tab — two-panel layout */
          <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

            {/* Minimap strip (32px) */}
            <SceneMinimap
              lines={scriptLines}
              activeSceneId={activeSceneId}
              onJump={handleJumpToScene}
            />

            {/* Left panel: script (60%) */}
            <div
              ref={scriptRef}
              style={{
                flex: '0 0 60%',
                overflowY: 'auto',
                borderRight: `1px solid ${C.line}`,
                background: C.panel,
              }}
            >
              {/* Scene count summary */}
              <div style={{
                padding: '10px 16px 8px',
                borderBottom: `1px solid ${C.line}`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: C.tint,
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, color: C.muted, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {scenes.length} Scenes
                </span>
                {search && (
                  <Badge tone="accent">{filteredLines.length} results</Badge>
                )}
                {selectedLine?.type === 'dialogue' && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.critical, fontFamily: 'Inter, system-ui' }}>
                    <LinkIcon />
                    <span>
                      {currentChar(selectedLineIdx) || 'Character'} — line selected
                    </span>
                  </div>
                )}
                {selectedLine?.type === 'character' && (
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.critical, fontFamily: 'Inter, system-ui' }}>
                    <LinkIcon />
                    <span>Jump to cast: {selectedLine.text}</span>
                  </div>
                )}
              </div>

              {/* Script lines */}
              <div style={{ paddingBottom: 60 }}>
                {filteredLines.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: C.muted2, fontFamily: 'Inter, system-ui', fontSize: 13 }}>
                    No lines match "{search}"
                  </div>
                ) : (
                  filteredLines.map((line, idx) => {
                    const lineSceneId = line.type === 'scene' ? line.id : line.sceneId;
                    const isActive = selectedLineIdx === idx && selectedLine === line;
                    const isActiveScene = lineSceneId === activeSceneId;
                    return (
                      <ScriptLine
                        key={`${line.type}-${idx}`}
                        line={line}
                        lineIndex={idx}
                        isActive={isActive}
                        isActiveScene={isActiveScene}
                        onSelect={handleSelectLine}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Right panel: scene details (40%) */}
            <div style={{
              flex: '0 0 40%',
              background: C.panel,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <SceneDetailPanel
                scene={activeScene}
                sceneDetail={activeSceneId ? sceneDetails[activeSceneId] : null}
                readOnly={readOnly}
                onUpdateDetail={handleUpdateDetail}
                shots={shots}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
