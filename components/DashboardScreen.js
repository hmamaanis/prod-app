'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, SectionHead, Avatar, StatusDot, statusLabel } from './shared';
import { getProject, getCast, getActivity, getInsights } from '@/lib/api';

function MiniCard({ title, value, sub, icon: I, tone }) {
  return (
    <div style={{ background: C.panel, borderRadius: 10, border: `1px solid ${C.line}`, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, letterSpacing: 0.5, color: C.muted, textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>{title}</div>
        <div style={{ color: C.muted2 }}><I/></div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, marginTop: 8, color: tone === 'ok' ? C.ok : C.ink }}>{value}</div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Timeline({ project }) {
  const dayTotal = project?.day_total || 24;
  const dayCurrent = project?.day_current || 12;
  const blocks = [
    { label: 'Call', color: C.ink, width: 4 },
    { label: 'Rehearsal', color: C.tint, width: 6 },
    { label: '24A', color: C.ink, width: 14 },
    { label: '24A cont.', color: C.ink, width: 10, active: true },
    { label: '24B', color: C.ink2, width: 10 },
    { label: 'Lunch', color: C.tint, width: 6 },
    { label: 'Reset B', color: C.line2, width: 6 },
    { label: '25', color: C.ink2, width: 14 },
    { label: 'Reset C', color: C.line2, width: 4 },
    { label: '27', color: C.ink2, width: 18 },
    { label: 'Wrap', color: C.tint, width: 4 },
  ];
  return (
    <div>
      <div style={{ display: 'flex', height: 36, borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.line}` }}>
        {blocks.map((b, i) => (
          <div key={i} style={{
            flex: b.width, background: b.color,
            color: b.color === C.tint || b.color === C.line2 ? C.muted : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontFamily: '"IBM Plex Mono", monospace', fontWeight: 500,
            letterSpacing: 0.3, position: 'relative',
            borderRight: i < blocks.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
            overflow: 'hidden',
          }}>
            {b.label}
            {b.active && <div style={{ position: 'absolute', bottom: -1, left: '50%', width: 2, height: 6, background: C.accent }}/>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
        <span>{project?.call_time || '06:30'}</span>
        <span style={{ color: C.accent, fontWeight: 600 }}>NOW · 09:45</span>
        <span>{project?.wrap_time || '19:00'}</span>
      </div>
    </div>
  );
}

function DayProgress({ project }) {
  const dayTotal = project?.day_total || 24;
  const dayCurrent = project?.day_current || 12;
  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
      {Array.from({ length: dayTotal }, (_, i) => (
        <div key={i} style={{
          width: 6, height: 16, borderRadius: 1,
          background: i < dayCurrent - 1 ? C.ink : i === dayCurrent - 1 ? C.accent : C.line2,
        }}/>
      ))}
    </div>
  );
}

export default function DashboardScreen({ projectId, onAlertClick }) {
  const [project, setProject] = useState(null);
  const [cast, setCast] = useState([]);
  const [activity, setActivity] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    getProject(projectId).then(setProject).catch(() => {});
    getCast(projectId).then(setCast).catch(() => {});
    getActivity(projectId).then(setActivity).catch(() => {});
    getInsights(projectId).then(setInsights).catch(() => {});
  }, [projectId]);

  const onSet = cast.filter(p => p.status === 'on-set').length;
  const recentActivity = activity.slice(0, 4);
  const criticalInsight = insights.find(i => i.severity === 'critical');

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, borderBottom: `1px solid ${C.line}` }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase' }}>Shooting today</div>
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.4, marginTop: 4 }}>{project?.location || 'Warehouse 4, Brooklyn'}</div>
              <div style={{ color: C.muted, marginTop: 4, fontSize: 13 }}>
                Call {project?.call_time || '06:30'} · Wrap {project?.wrap_time || '19:00'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
                DAY {project?.day_current || '–'}/{project?.day_total || '–'}
              </div>
              <DayProgress project={project}/>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 11, letterSpacing: 1, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', marginBottom: 12 }}>Today's timeline</div>
            <Timeline project={project}/>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <MiniCard title="Scenes" value="4" sub="24A · 24B · 25 · 27" icon={Ico.clap}/>
          <MiniCard title="Shots planned" value="18" sub="2 done · 1 current · 15 to go" icon={Ico.shotlist}/>
          <MiniCard title="Cast on set" value={`${onSet} / ${cast.length}`} sub={cast.find(p => p.status === 'travel') ? `${cast.find(p => p.status === 'travel').name} arriving ${cast.find(p => p.status === 'travel').eta || ''}` : 'All present'} icon={Ico.users}/>
          <MiniCard title="Day est." value="+12m" sub="Ahead of schedule" icon={Ico.clock} tone="ok"/>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* AI Alert card */}
        <Card interactive onClick={onAlertClick}>
          <div style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBEFFB', color: C.critical, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ico.sparkle/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 1, color: C.critical, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', fontWeight: 600 }}>
                AI INSIGHT · {criticalInsight ? '2 min ago' : 'active'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4, lineHeight: 1.4 }}>
                {criticalInsight?.title || "Tomorrow's rooftop scene is at risk. Rain forecast 70% from 14:00."}
              </div>
              <div style={{ color: C.muted, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
                {criticalInsight?.why || "I've found 2 alternate plans. Tap to review."}
              </div>
              <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.critical, fontWeight: 500 }}>
                Open plan <Ico.arrow/>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHead>Live locations</SectionHead>
          <div style={{ padding: 20, paddingTop: 8 }}>
            {cast.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < Math.min(cast.length, 4) - 1 ? `1px solid ${C.line}` : 'none' }}>
                <Avatar name={p.name} size={28}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{p.role}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.muted }}>
                  <StatusDot status={p.status}/>
                  {statusLabel(p)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionHead>Activity</SectionHead>
          <div style={{ padding: 20, paddingTop: 8 }}>
            {recentActivity.length > 0 ? recentActivity.map((it, i) => (
              <div key={it.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < recentActivity.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', width: 42, flexShrink: 0 }}>
                  {formatTime(it.created_at)}
                </div>
                <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>
                  {it.user_name} {it.action} {it.object}
                </div>
              </div>
            )) : (
              [
                { time: '09:42', text: 'J. Nakamura moved shot 24B-2 forward' },
                { time: '09:28', text: 'L. Ferrara changed lens on 24A-3 → 50mm' },
                { time: '09:15', text: 'Marcus Reid ETA updated 07:40' },
                { time: '08:50', text: 'Lighting A pre-rigged · 10m ahead' },
              ].map((row, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.line}` : 'none' }}>
                  <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', width: 42, flexShrink: 0 }}>{row.time}</div>
                  <div style={{ fontSize: 12.5, color: C.ink2, lineHeight: 1.5 }}>{row.text}</div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
