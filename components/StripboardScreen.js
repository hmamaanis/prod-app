'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, Badge, SectionHead, PrimaryBtn, GhostBtn } from '@/components/shared';
import { getScenes, getSchedule, createDay, updateDay } from '@/lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────

function pagesLabel(p) {
  if (!p || p <= 0) return '0';
  const whole = Math.floor(p);
  const frac = p - whole;
  const eighths = Math.round(frac * 8);
  if (eighths === 0) return `${whole}`;
  if (whole === 0) return `${eighths}/8`;
  return `${whole} ${eighths}/8`;
}

function sumPages(scenes, ids) {
  return ids.reduce((acc, id) => {
    const s = scenes.find(sc => sc.id === id);
    return acc + (s?.pages || 0);
  }, 0);
}

// ── Sub-components ─────────────────────────────────────────────────────────

function InlineInput({ value, onChange, style = {} }) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setDraft(value); }, [value]);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); setEditing(false); }}
        onKeyDown={e => {
          if (e.key === 'Enter') { onChange(draft); setEditing(false); }
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        style={{
          border: `1px solid ${C.ink}`, borderRadius: 4, padding: '2px 5px',
          fontSize: 12, fontFamily: '"IBM Plex Mono", monospace',
          background: C.bg, color: C.ink, outline: 'none', ...style,
        }}
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      style={{ cursor: 'text', fontFamily: '"IBM Plex Mono", monospace', ...style }}
      onMouseEnter={e => (e.currentTarget.style.borderBottom = `1px dashed ${C.line2}`)}
      onMouseLeave={e => (e.currentTarget.style.borderBottom = '1px dashed transparent')}
    >
      {draft || <span style={{ color: C.muted2 }}>—</span>}
    </span>
  );
}

function SceneStrip({ scene, onAssign, days, compact }) {
  const [open, setOpen] = useState(false);
  const isInt = scene.int_ext === 'INT';

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: compact ? '8px 10px' : '10px 12px',
        borderRadius: 6, marginBottom: 6,
        background: isInt ? '#FDF6EE' : '#EEF3FD',
        border: `1px solid ${isInt ? '#F0DFC0' : '#C8D8F4'}`,
      }}>
        {/* Scene number badge */}
        <div style={{
          minWidth: 28, height: 28, borderRadius: 4,
          background: isInt ? C.accent : C.critical,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 11, flexShrink: 0,
        }}>
          {scene.scene_number}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {scene.location}
          </div>
          <div style={{ fontSize: 10.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', marginTop: 1 }}>
            {scene.int_ext} · {scene.day_night} · {pagesLabel(scene.pages)}p
          </div>
        </div>

        {/* Assign button */}
        {onAssign && days.length > 0 && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setOpen(o => !o)}
              style={{
                background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 5,
                padding: '4px 8px', fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, color: C.ink2,
                fontFamily: 'Inter',
              }}
            >
              Assign to day <Ico.chevD />
            </button>
            {open && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 100,
                background: C.panel, border: `1px solid ${C.line2}`, borderRadius: 8,
                padding: 4, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 140, marginTop: 4,
              }}>
                {days.map(day => (
                  <button
                    key={day.id}
                    onClick={() => { onAssign(scene.id, day.id); setOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      background: 'none', border: 'none', borderRadius: 5,
                      padding: '7px 10px', cursor: 'pointer', fontSize: 12,
                      fontFamily: 'Inter', color: C.ink,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.tint)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    Day {day.day_number}
                    {day.date ? ` · ${day.date}` : ''}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {onAssign && days.length === 0 && (
          <span style={{ fontSize: 11, color: C.muted2, fontFamily: '"IBM Plex Mono", monospace' }}>
            No days yet
          </span>
        )}
      </div>
    </div>
  );
}

function DayCard({ day, scenes, allScenes, onRemoveScene, onReorderScene, onUpdateDay }) {
  const dayScenes = day.scene_ids
    .map(id => allScenes.find(s => s.id === id))
    .filter(Boolean);
  const total = sumPages(allScenes, day.scene_ids);
  const heavy = total > 8;

  return (
    <Card style={{ marginBottom: 12 }}>
      {/* Day header */}
      <div style={{
        padding: '10px 14px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: 13,
          color: C.ink, minWidth: 50,
        }}>
          Day {day.day_number}
        </div>

        <InlineInput
          value={day.date || ''}
          onChange={v => onUpdateDay(day.id, { date: v })}
          style={{ fontSize: 12, color: C.muted, minWidth: 80 }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4, fontSize: 12, color: C.muted2 }}>
          <Ico.clock />
          <InlineInput
            value={day.call_time || '07:00'}
            onChange={v => onUpdateDay(day.id, { call_time: v })}
            style={{ width: 44 }}
          />
          <span>—</span>
          <InlineInput
            value={day.wrap_time || '19:00'}
            onChange={v => onUpdateDay(day.id, { wrap_time: v })}
            style={{ width: 44 }}
          />
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {heavy && (
            <Badge tone="warn">⚠ Heavy day</Badge>
          )}
          <Badge tone={heavy ? 'warn' : 'neutral'}>
            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{pagesLabel(total)}p</span>
          </Badge>
        </div>
      </div>

      {/* Scene strips */}
      <div style={{ padding: '10px 12px', minHeight: 40 }}>
        {dayScenes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '16px 0', color: C.muted2, fontSize: 12 }}>
            No scenes — assign scenes from the left panel
          </div>
        )}
        {dayScenes.map((scene, idx) => (
          <div key={scene.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {/* Reorder arrows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
              <button
                onClick={() => onReorderScene(day.id, idx, 'up')}
                disabled={idx === 0}
                style={{
                  background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
                  color: idx === 0 ? C.muted2 : C.muted, padding: '1px 3px', fontSize: 9, lineHeight: 1,
                }}
              >▲</button>
              <button
                onClick={() => onReorderScene(day.id, idx, 'down')}
                disabled={idx === dayScenes.length - 1}
                style={{
                  background: 'none', border: 'none', cursor: idx === dayScenes.length - 1 ? 'default' : 'pointer',
                  color: idx === dayScenes.length - 1 ? C.muted2 : C.muted, padding: '1px 3px', fontSize: 9, lineHeight: 1,
                }}
              >▼</button>
            </div>

            {/* Strip */}
            <div style={{ flex: 1 }}>
              <SceneStrip scene={scene} compact days={[]} />
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemoveScene(day.id, scene.id)}
              style={{
                background: 'none', border: `1px solid ${C.line2}`, borderRadius: 4,
                padding: '4px 6px', cursor: 'pointer', color: C.muted, flexShrink: 0,
              }}
              title="Remove from day"
            >
              <Ico.x />
            </button>
          </div>
        ))}
      </div>

      {/* Footer totals */}
      <div style={{
        padding: '8px 14px', borderTop: `1px solid ${C.line}`,
        background: C.tint, borderRadius: '0 0 9px 9px',
        display: 'flex', gap: 16, fontSize: 11.5, color: C.muted,
        fontFamily: '"IBM Plex Mono", monospace',
      }}>
        <span>{dayScenes.length} scene{dayScenes.length !== 1 ? 's' : ''}</span>
        <span>{pagesLabel(total)} pages</span>
        {heavy && <span style={{ color: C.warn }}>⚠ Over 8p</span>}
      </div>
    </Card>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function StripboardScreen({ projectId }) {
  const [scenes, setScenes]     = useState([]);
  const [days, setDays]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([
      getScenes(projectId).catch(() => []),
      getSchedule(projectId).catch(() => []),
    ]).then(([sc, dy]) => {
      setScenes(sc);
      setDays(dy);
    }).finally(() => setLoading(false));
  }, [projectId]);

  // Scenes not assigned to any day
  const scheduledIds = new Set(days.flatMap(d => d.scene_ids || []));
  const unscheduled  = scenes.filter(s => !scheduledIds.has(s.id));

  const handleAddDay = async () => {
    setAdding(true);
    try {
      const newDay = await createDay(projectId, {
        day_number: days.length + 1,
        scene_ids: [],
        call_time: '07:00',
        wrap_time: '19:00',
      });
      setDays(d => [...d, newDay]);
    } catch (err) {
      console.error('Failed to create day:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleAssign = async (sceneId, dayId) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    const newIds = [...(day.scene_ids || []), sceneId];
    try {
      await updateDay(projectId, dayId, { scene_ids: newIds });
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, scene_ids: newIds } : d));
    } catch (err) {
      console.error('Failed to assign scene:', err);
    }
  };

  const handleRemove = async (dayId, sceneId) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    const newIds = (day.scene_ids || []).filter(id => id !== sceneId);
    try {
      await updateDay(projectId, dayId, { scene_ids: newIds });
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, scene_ids: newIds } : d));
    } catch (err) {
      console.error('Failed to remove scene:', err);
    }
  };

  const handleReorder = async (dayId, idx, dir) => {
    const day = days.find(d => d.id === dayId);
    if (!day) return;
    const ids = [...(day.scene_ids || [])];
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= ids.length) return;
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    try {
      await updateDay(projectId, dayId, { scene_ids: ids });
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, scene_ids: ids } : d));
    } catch (err) {
      console.error('Failed to reorder scene:', err);
    }
  };

  const handleUpdateDay = async (dayId, patch) => {
    try {
      await updateDay(projectId, dayId, patch);
      setDays(prev => prev.map(d => d.id === dayId ? { ...d, ...patch } : d));
    } catch (err) {
      console.error('Failed to update day:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter', textAlign: 'center' }}>
        Loading stripboard…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui', color: C.ink }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left panel — Unscheduled scenes */}
        <div>
          <Card>
            <SectionHead>
              Unscheduled scenes
              {unscheduled.length > 0 && (
                <Badge tone="warn">{unscheduled.length}</Badge>
              )}
            </SectionHead>
            <div style={{ padding: '10px 12px' }}>
              {unscheduled.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: C.muted2, fontSize: 12.5 }}>
                  All scenes are scheduled
                </div>
              )}
              {unscheduled.map(scene => (
                <SceneStrip
                  key={scene.id}
                  scene={scene}
                  onAssign={handleAssign}
                  days={days}
                />
              ))}
            </div>
          </Card>

          {scenes.length === 0 && (
            <div style={{ marginTop: 12, padding: 14, background: C.tint, borderRadius: 8, fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
              No scenes in breakdown yet. Use the Script screen to import and extract scenes.
            </div>
          )}
        </div>

        {/* Right panel — Shooting days */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
              Shooting days
              <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 500, color: C.muted }}>
                {days.length} day{days.length !== 1 ? 's' : ''}
              </span>
            </div>
            <PrimaryBtn icon={Ico.plus} onClick={handleAddDay} disabled={adding}>
              {adding ? 'Adding…' : 'Add day'}
            </PrimaryBtn>
          </div>

          {days.length === 0 && (
            <div style={{
              padding: 32, textAlign: 'center', color: C.muted, fontSize: 13,
              border: `2px dashed ${C.line2}`, borderRadius: 10,
            }}>
              <div style={{ marginBottom: 8, fontSize: 20 }}>📅</div>
              No shooting days yet. Click "Add day" to start scheduling.
            </div>
          )}

          {days.map(day => (
            <DayCard
              key={day.id}
              day={day}
              allScenes={scenes}
              onRemoveScene={handleRemove}
              onReorderScene={handleReorder}
              onUpdateDay={handleUpdateDay}
            />
          ))}

          {/* Summary footer */}
          {days.length > 0 && (
            <div style={{
              marginTop: 8, padding: '10px 14px', background: C.tint,
              borderRadius: 8, fontSize: 12, color: C.muted,
              fontFamily: '"IBM Plex Mono", monospace',
              display: 'flex', gap: 20,
            }}>
              <span>Total: {days.length} shoot days</span>
              <span>{scenes.length - unscheduled.length} / {scenes.length} scenes scheduled</span>
              <span>
                {pagesLabel(days.reduce((acc, d) => acc + sumPages(scenes, d.scene_ids || []), 0))}p total
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
