'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, Badge, SectionHead, TabBtn, PrimaryBtn, GhostBtn } from '@/components/shared';
import { getScenes, createScene } from '@/lib/api';

// ── Scene extraction logic ─────────────────────────────────────────────────

function parseScript(text) {
  const lines = text.split('\n');
  const sceneHeadingRe = /^\s*(INT\.\/EXT\.|EXT\.\/INT\.|INT\.|EXT\.)\s+(.+?)\s+-\s+(.+?)\s*$/i;
  const scenes = [];
  let i = 0;

  while (i < lines.length) {
    const match = lines[i].match(sceneHeadingRe);
    if (match) {
      const int_ext = match[1].replace(/\.$/, '').replace(/\//g, '/').toUpperCase();
      const location = match[2].trim();
      const day_night = match[3].trim().toUpperCase();
      const sceneNumber = scenes.length + 1;

      // Find first non-empty action line after heading
      let synopsis = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && !lines[j].match(sceneHeadingRe)) {
        synopsis = lines[j].trim().slice(0, 120);
      }

      // Count lines in this scene block for page estimate
      let blockEnd = j + 1;
      while (blockEnd < lines.length && !lines[blockEnd].match(sceneHeadingRe)) blockEnd++;
      const lineCount = blockEnd - i;
      const rawPages = lineCount / 55;
      // Round to nearest 0.125
      const pages = Math.round(rawPages / 0.125) * 0.125;
      const pagesStr = pages > 0 ? pages.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') : '1/8';

      scenes.push({ scene_number: sceneNumber, int_ext, location, day_night, synopsis, pages: parseFloat(pagesStr) || 0.125 });
      i = blockEnd;
    } else {
      i++;
    }
  }

  // Fallback: no screenplay formatting found
  if (scenes.length === 0 && text.trim().length > 0) {
    scenes.push({
      scene_number: 1,
      int_ext: 'INT',
      location: 'UNKNOWN',
      day_night: 'DAY',
      synopsis: text.trim().slice(0, 120),
      pages: Math.max(0.125, Math.round((lines.length / 55) / 0.125) * 0.125),
    });
  }

  return scenes;
}

function pagesLabel(p) {
  if (!p || p <= 0) return '1/8';
  const whole = Math.floor(p);
  const frac = p - whole;
  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}`;
  if (whole === 0) return `${eighths}/8`;
  return `${whole} ${eighths}/8`;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const steps = [
      { t: 200,  v: 15 },
      { t: 600,  v: 35 },
      { t: 1000, v: 55 },
      { t: 1400, v: 75 },
      { t: 1800, v: 90 },
      { t: 2100, v: 100 },
    ];
    const timers = steps.map(s => setTimeout(() => setPct(s.v), s.t));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 26, height: 26, borderRadius: 6, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ico.sparkle />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.critical, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1 }}>
          ANALYSING SCRIPT…
        </div>
      </div>
      <div style={{ height: 4, background: C.line, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: C.critical,
          borderRadius: 99,
          transition: 'width 300ms ease-out',
          backgroundImage: `linear-gradient(90deg, ${C.critical} 0%, ${C.critical2} 40%, ${C.critical} 80%)`,
          backgroundSize: '200% 100%',
          animation: pct < 100 ? 'shimmer 1.4s infinite linear' : 'none',
        }} />
      </div>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
      <div style={{ fontSize: 12, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
        {pct < 30 && 'Reading script headings…'}
        {pct >= 30 && pct < 60 && 'Identifying scene structures…'}
        {pct >= 60 && pct < 90 && 'Estimating page counts…'}
        {pct >= 90 && 'Finalising breakdown…'}
      </div>
    </div>
  );
}

function SceneRow({ scene, onSave, saved }) {
  const toneMap = { INT: 'accent', EXT: 'critical', 'INT/EXT': 'warn', 'EXT/INT': 'warn' };
  const tone = toneMap[scene.int_ext] || 'neutral';

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 16px', borderBottom: `1px solid ${C.line}`,
      background: saved ? '#F6FBF6' : C.panel,
      transition: 'background 300ms',
    }}>
      {/* Scene number */}
      <div style={{
        minWidth: 32, height: 32, borderRadius: 6,
        background: C.tint, color: C.ink2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 12, flexShrink: 0,
      }}>
        {scene.scene_number}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <Badge tone={tone}>{scene.int_ext}</Badge>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{scene.location}</span>
          <Badge tone="neutral">{scene.day_night}</Badge>
          <Badge tone="neutral">
            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{pagesLabel(scene.pages)}p</span>
          </Badge>
        </div>
        {scene.synopsis && (
          <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scene.synopsis}
          </div>
        )}
      </div>

      {/* Save button / checkmark */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        {saved ? (
          <span style={{ color: C.ok, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: '"IBM Plex Mono", monospace' }}>
            <Ico.check /> Saved
          </span>
        ) : (
          <button
            onClick={() => onSave(scene)}
            style={{
              background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 6,
              padding: '5px 10px', fontSize: 11.5, cursor: 'pointer',
              color: C.ink2, fontFamily: 'Inter', whiteSpace: 'nowrap',
            }}
          >
            Save to breakdown
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function ScriptScreen({ projectId }) {
  const [activeTab, setActiveTab]       = useState('paste');
  const [scriptText, setScriptText]     = useState('');
  const [phase, setPhase]               = useState('idle');   // idle | analysing | done
  const [extracted, setExtracted]       = useState([]);
  const [savedIds, setSavedIds]         = useState(new Set());
  const [existingScenes, setExisting]   = useState([]);
  const [loadingExisting, setLoadingEx] = useState(true);
  const [savingAll, setSavingAll]       = useState(false);

  // Load existing scenes in breakdown
  useEffect(() => {
    if (!projectId) return;
    getScenes(projectId)
      .then(setExisting)
      .catch(() => setExisting([]))
      .finally(() => setLoadingEx(false));
  }, [projectId]);

  const handleExtract = () => {
    if (!scriptText.trim()) return;
    setPhase('analysing');
    setExtracted([]);
    setSavedIds(new Set());
    setTimeout(() => {
      const scenes = parseScript(scriptText);
      setExtracted(scenes);
      setPhase('done');
    }, 2200);
  };

  const handleSaveScene = async (scene) => {
    try {
      await createScene(projectId, {
        scene_number: scene.scene_number,
        int_ext: scene.int_ext,
        location: scene.location,
        day_night: scene.day_night,
        synopsis: scene.synopsis,
        pages: scene.pages,
      });
      setSavedIds(prev => new Set([...prev, scene.scene_number]));
      // Refresh existing scenes count
      getScenes(projectId).then(setExisting).catch(() => {});
    } catch (err) {
      console.error('Failed to save scene:', err);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    for (const scene of extracted) {
      if (!savedIds.has(scene.scene_number)) {
        await handleSaveScene(scene);
      }
    }
    setSavingAll(false);
  };

  const unsavedCount = extracted.filter(s => !savedIds.has(s.scene_number)).length;

  return (
    <div style={{ fontFamily: 'Inter, system-ui', color: C.ink }}>

      {/* Existing scenes summary */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Ico.book style={{ color: C.muted }} />
        {loadingExisting ? (
          <span style={{ fontSize: 13, color: C.muted }}>Loading breakdown…</span>
        ) : (
          <span style={{ fontSize: 13, color: C.ink2 }}>
            <strong>{existingScenes.length}</strong>{' '}
            {existingScenes.length === 1 ? 'scene' : 'scenes'} in breakdown
          </span>
        )}
        {existingScenes.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {existingScenes.slice(0, 5).map(s => (
              <Badge key={s.id} tone="neutral">
                <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>#{s.scene_number}</span>
              </Badge>
            ))}
            {existingScenes.length > 5 && (
              <Badge tone="neutral">+{existingScenes.length - 5} more</Badge>
            )}
          </div>
        )}
      </div>

      {/* Import card */}
      <Card style={{ marginBottom: 20 }}>
        {/* Tab header */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 20 }}>
          <TabBtn active={activeTab === 'paste'} onClick={() => setActiveTab('paste')}>Paste script</TabBtn>
          <TabBtn active={activeTab === 'file'}  onClick={() => setActiveTab('file')}>Import file</TabBtn>
        </div>

        <div style={{ padding: 16 }}>
          {activeTab === 'file' && (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              border: `2px dashed ${C.line2}`, borderRadius: 10,
              color: C.muted, fontSize: 13,
            }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📄</div>
              <div style={{ fontWeight: 500 }}>File import coming soon</div>
              <div style={{ fontSize: 12, marginTop: 6, color: C.muted2 }}>Will support PDF, Fountain (.fountain), Final Draft (.fdx), and DOCX</div>
            </div>
          )}

          {activeTab === 'paste' && (
            <>
              <textarea
                value={scriptText}
                onChange={e => { setScriptText(e.target.value); setPhase('idle'); setExtracted([]); setSavedIds(new Set()); }}
                placeholder={`Paste your screenplay text here.\n\nExample format:\n\nINT. WAREHOUSE - DAY\n\nNora enters cautiously, hand on her holster.\n\nEXT. ROOFTOP - NIGHT\n\nThe city sprawls below. Kane lights a cigarette.`}
                style={{
                  width: '100%', border: `1px solid ${C.line2}`, background: C.bg,
                  borderRadius: 8, padding: 14, fontSize: 12.5, height: 300,
                  fontFamily: '"IBM Plex Mono", monospace', color: C.ink,
                  outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
                onFocus={e => (e.target.style.borderColor = C.ink)}
                onBlur={e => (e.target.style.borderColor = C.line2)}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <span style={{ fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>
                  {scriptText.length.toLocaleString()} chars · {scriptText.split('\n').length} lines
                </span>
                <PrimaryBtn
                  icon={Ico.sparkle}
                  onClick={handleExtract}
                  disabled={phase === 'analysing' || scriptText.trim().length < 20}
                >
                  Extract scenes
                </PrimaryBtn>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Analysing state */}
      {phase === 'analysing' && <div style={{ marginBottom: 20 }}><ProgressBar /></div>}

      {/* Extracted scenes */}
      {phase === 'done' && extracted.length > 0 && (
        <Card>
          <SectionHead action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>
                {savedIds.size} / {extracted.length} saved
              </span>
              {unsavedCount > 0 && (
                <PrimaryBtn
                  icon={savingAll ? undefined : Ico.check}
                  onClick={handleSaveAll}
                  disabled={savingAll}
                >
                  {savingAll ? 'Saving…' : `Save all ${unsavedCount} scenes`}
                </PrimaryBtn>
              )}
            </div>
          }>
            {extracted.length} scene{extracted.length !== 1 ? 's' : ''} extracted
          </SectionHead>

          <div>
            {extracted.map(scene => (
              <SceneRow
                key={scene.scene_number}
                scene={scene}
                onSave={handleSaveScene}
                saved={savedIds.has(scene.scene_number)}
              />
            ))}
          </div>

          {extracted.length === 1 && extracted[0].location === 'UNKNOWN' && (
            <div style={{ padding: '12px 16px', background: '#F5EBD6', borderTop: `1px solid ${C.line}`, fontSize: 12, color: '#6E501C', display: 'flex', gap: 8 }}>
              <span>⚠</span>
              <span>No standard screenplay headings (INT./EXT.) found. Created one scene from the full text. Check the location and day/night fields before saving.</span>
            </div>
          )}
        </Card>
      )}

      {phase === 'done' && extracted.length === 0 && (
        <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>
          No scenes could be extracted. Make sure your text includes scene headings like <code style={{ fontFamily: '"IBM Plex Mono", monospace', background: C.tint, padding: '2px 5px', borderRadius: 3 }}>INT. LOCATION - DAY</code>.
        </div>
      )}
    </div>
  );
}
