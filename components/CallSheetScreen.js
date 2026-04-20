'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, SectionHead, Avatar, Badge, PrimaryBtn, GhostBtn } from './shared';
import { getSchedule, getScenes, getCast, getCrew, getProject, updateDay } from '@/lib/api';

function TimeInput({ value, onChange }) {
  return (
    <input
      type="text" value={value || ''} onChange={e => onChange(e.target.value)}
      placeholder="07:00"
      style={{ border: `1px solid ${C.line2}`, borderRadius: 4, padding: '3px 7px', fontSize: 12, fontFamily: '"IBM Plex Mono", monospace', background: C.bg, color: C.ink, outline: 'none', width: 64 }}
    />
  );
}

export default function CallSheetScreen({ projectId }) {
  const [schedule, setSchedule]   = useState([]);
  const [scenes, setScenes]       = useState([]);
  const [cast, setCast]           = useState([]);
  const [crew, setCrew]           = useState([]);
  const [project, setProject]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [notes, setNotes]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [shareMsg, setShareMsg]   = useState('');

  useEffect(() => {
    if (!projectId) return;
    Promise.all([getSchedule(projectId), getScenes(projectId), getCast(projectId), getCrew(projectId), getProject(projectId)])
      .then(([sch, sc, ca, cr, pr]) => {
        setSchedule(sch);
        setScenes(sc);
        setCast(ca);
        setCrew(cr);
        setProject(pr);
        if (sch.length > 0) { setSelectedDay(sch[0]); setNotes(sch[0].notes || ''); }
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const dayScenes = selectedDay
    ? (selectedDay.scene_ids || []).map(sid => scenes.find(s => s.id === sid)).filter(Boolean)
    : [];

  // Collect all cast_ids referenced by scenes for this day
  const dayCastIds = new Set(dayScenes.flatMap(s => s.cast_ids || []));
  const dayCast = cast.filter(c => dayCastIds.has(c.id));

  const handleDaySelect = (day) => {
    setSelectedDay(day);
    setNotes(day.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!selectedDay) return;
    setSaving(true);
    await updateDay(projectId, selectedDay.id, { notes });
    setSchedule(s => s.map(d => d.id === selectedDay.id ? { ...d, notes } : d));
    setSelectedDay(d => ({ ...d, notes }));
    setSaving(false);
  };

  const handlePrint = () => window.print();

  const handleShare = () => {
    setShareMsg('PDF sharing coming soon — use Print to save as PDF');
    setTimeout(() => setShareMsg(''), 3000);
  };

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading call sheet…</div>;

  if (schedule.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>
        <div style={{ fontSize: 14, marginBottom: 8 }}>No shooting days scheduled yet.</div>
        <div style={{ fontSize: 12 }}>Go to Stripboard to create your shooting schedule first.</div>
      </div>
    );
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div>
      {/* Day selector + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', flexShrink: 0 }}>SHOOTING DAY</div>
        <select
          value={selectedDay?.id || ''}
          onChange={e => { const d = schedule.find(d => d.id === e.target.value); if (d) handleDaySelect(d); }}
          style={{ border: `1px solid ${C.line2}`, borderRadius: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'Inter', background: C.panel, cursor: 'pointer', color: C.ink }}
        >
          {schedule.map(d => (
            <option key={d.id} value={d.id}>Day {d.day_number}{d.shoot_date ? ` — ${new Date(d.shoot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</option>
          ))}
        </select>
        <div style={{ flex: 1 }}/>
        {shareMsg && <span style={{ fontSize: 11.5, color: C.ok, fontFamily: '"IBM Plex Mono", monospace' }}>{shareMsg}</span>}
        <GhostBtn icon={Ico.arrow} onClick={handleShare}>Share link</GhostBtn>
        <PrimaryBtn icon={Ico.book} onClick={handlePrint}>Print / PDF</PrimaryBtn>
      </div>

      {/* Call sheet card */}
      <div id="call-sheet" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: C.ink, color: '#fff', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 2, opacity: 0.6, marginBottom: 4 }}>CALL SHEET</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>{project?.title || 'Production'}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{formatDate(selectedDay?.shoot_date)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', opacity: 0.6, marginBottom: 4 }}>SHOOTING DAY</div>
              <div style={{ fontSize: 36, fontWeight: 700, fontFamily: '"IBM Plex Mono", monospace', lineHeight: 1 }}>{selectedDay?.day_number || '—'}</div>
            </div>
          </div>
        </div>

        {/* General info strip */}
        <div style={{ background: C.tint, borderBottom: `1px solid ${C.line}`, padding: '12px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'GENERAL CALL', value: selectedDay?.call_time || '07:00' },
            { label: 'ESTIMATED WRAP', value: selectedDay?.wrap_time || '19:00' },
            { label: 'LOCATION', value: selectedDay?.location || dayScenes[0]?.location || '—' },
            { label: 'SCENES TODAY', value: dayScenes.length + ` scene${dayScenes.length !== 1 ? 's' : ''}` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 9, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 1.5, color: C.muted, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Scene schedule */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 10 }}>Scene Schedule</div>
            {dayScenes.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13 }}>No scenes assigned to this day.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.tint }}>
                    {['Scene', 'Location', 'Int/Ext', 'D/N', 'Pages', 'Cast'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, letterSpacing: 1, color: C.muted, borderBottom: `1px solid ${C.line}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayScenes.map((s, i) => {
                    const sceneCastIds = new Set(s.cast_ids || []);
                    const sceneCastNames = cast.filter(c => sceneCastIds.has(c.id)).map(c => c.name).join(', ');
                    return (
                      <tr key={s.id} style={{ borderBottom: i < dayScenes.length - 1 ? `1px solid ${C.line}` : 'none', background: i % 2 === 1 ? C.tint : 'transparent' }}>
                        <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600 }}>{s.scene_number}</td>
                        <td style={{ padding: '8px 10px' }}>{s.location || '—'}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <Badge tone={s.int_ext === 'INT' ? 'neutral' : 'accent'}>{s.int_ext || '—'}</Badge>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <Badge tone={s.day_night === 'DAY' ? 'ok' : 'critical'}>{s.day_night || '—'}</Badge>
                        </td>
                        <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace' }}>{s.pages ? s.pages + 'p' : '—'}</td>
                        <td style={{ padding: '8px 10px', fontSize: 11, color: C.muted2 }}>{sceneCastNames || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Cast call times */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 10 }}>Cast Call Times</div>
            {dayCast.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 13 }}>No cast assigned to scenes for this day.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: C.tint }}>
                    {['#', 'Name', 'Character / Role', 'Call Time', 'Status'].map(h => (
                      <th key={h} style={{ padding: '7px 10px', textAlign: 'left', fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, letterSpacing: 1, color: C.muted, borderBottom: `1px solid ${C.line}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayCast.map((c, i) => {
                    // Principal cast get call 30 min before general call, others get general call
                    const general = selectedDay?.call_time || '07:00';
                    const [h, m] = general.split(':').map(Number);
                    const callMin = h * 60 + m - 30;
                    const callH = String(Math.floor(callMin / 60)).padStart(2, '0');
                    const callM = String(callMin % 60).padStart(2, '0');
                    const callTime = i < 3 ? `${callH}:${callM}` : general;
                    return (
                      <tr key={c.id} style={{ borderBottom: i < dayCast.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                        <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', color: C.muted2 }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 500 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Avatar name={c.name} size={24}/>{c.name}</div>
                        </td>
                        <td style={{ padding: '8px 10px', color: C.muted, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>{c.role}</td>
                        <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 600, color: C.accent2 }}>{callTime}</td>
                        <td style={{ padding: '8px 10px' }}><Badge tone={c.status === 'on-set' ? 'ok' : c.status === 'travel' ? 'warn' : 'neutral'} dot>{c.status || 'not-called'}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* HOD Crew */}
          {crew.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 10 }}>Heads of Department</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                {crew.map(c => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: C.tint, borderRadius: 6 }}>
                    <Avatar name={c.name} size={24}/>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{c.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 8 }}>Production Notes</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add notes for this shooting day…"
              style={{ width: '100%', boxSizing: 'border-box', border: `1px solid ${C.line2}`, borderRadius: 6, padding: '10px 12px', fontSize: 13, fontFamily: 'Inter', outline: 'none', background: C.bg, color: C.ink, minHeight: 80, resize: 'vertical' }}
            />
            {saving && <div style={{ fontSize: 11, color: C.ok, fontFamily: '"IBM Plex Mono", monospace', marginTop: 4 }}>Saving…</div>}
          </div>
        </div>
      </div>

      {/* Print styles injected via a style tag */}
      <style>{`
        @media print {
          body > *:not(#call-sheet) { display: none !important; }
          #call-sheet { border: none !important; }
        }
      `}</style>
    </div>
  );
}
