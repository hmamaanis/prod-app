'use client';
import { useState } from 'react';
import { C, Ico, Card, Badge, GhostBtn } from './shared';

const ALL_SCENES = [
  { n: '24A', int: 'INT', loc: 'WAREHOUSE — MAIN FLOOR',   d: 'DAY', pages: '2 3/8', cast: ['NORA','KANE'],      props: ['briefcase','keys','flashlight'], wardrobe: ['Nora: gray coat','Kane: badge'],  sfx: ['haze','practical lamp'],  day: 'today' },
  { n: '24B', int: 'INT', loc: 'WAREHOUSE — OFFICE',        d: 'DAY', pages: '1 4/8', cast: ['NORA','ROY'],       props: ['files','phone'],                wardrobe: ['Nora: gray coat','Roy: suit'],    sfx: ['phone ring'],             day: 'today' },
  { n: '25',  int: 'INT', loc: 'WAREHOUSE — INTERROGATION', d: 'DAY', pages: '3 1/8', cast: ['NORA','KANE'],      props: ['table','recorder','coffee'],     wardrobe: ['as prev'],                       sfx: ['hard top light','2× flags'], day: 'week' },
  { n: '27',  int: 'INT', loc: 'WAREHOUSE — HALLWAY',       d: 'DAY', pages: '7/8',   cast: ['MAYA'],             props: ['badge'],                        wardrobe: ['Maya: hoodie'],                  sfx: ['sodium practicals'],      day: 'week' },
  { n: '30',  int: 'EXT', loc: 'ROOFTOP — JEFFERSON ST.',   d: 'NIGHT', pages: '2',   cast: ['NORA','KANE','ROY'],props: ['evidence bag','binoculars'],     wardrobe: ['Nora: black jacket'],            sfx: ['wind','city ambient'],    day: 'full' },
  { n: '31',  int: 'EXT', loc: 'ROOFTOP — JEFFERSON ST.',   d: 'DAY',  pages: '3 2/8',cast: ['NORA'],             props: ['phone','letter'],               wardrobe: ['Nora: gray coat'],               sfx: ['magic hour amber'],       day: 'full' },
];

function TabBtn({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? C.ink : C.muted,
      borderBottom: active ? `2px solid ${C.ink}` : '2px solid transparent',
      fontFamily: 'Inter, system-ui',
    }}>{children}</button>
  );
}

function EditableCell({ value, onChange, mono }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => { onChange(draft); setEditing(false); }}
        onKeyDown={e => { if (e.key === 'Enter') { onChange(draft); setEditing(false); } if (e.key === 'Escape') setEditing(false); }}
        style={{
          border: `1px solid ${C.ink}`, borderRadius: 4, padding: '3px 6px',
          fontSize: 12, fontFamily: mono ? '"IBM Plex Mono", monospace' : 'Inter',
          background: C.bg, color: C.ink, outline: 'none', width: '100%', minWidth: 80,
        }}
      />
    );
  }
  return (
    <span onClick={() => { setDraft(value); setEditing(true); }} title="Click to edit" style={{ cursor: 'text', borderBottom: `1px dashed transparent` }}
      onMouseEnter={e => e.currentTarget.style.borderBottomColor = C.line2}
      onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}>
      {value || <span style={{ color: C.muted2 }}>—</span>}
    </span>
  );
}

export default function BreakdownScreen() {
  const [scenes, setScenes]     = useState(ALL_SCENES);
  const [activeTab, setActiveTab] = useState('today');
  const [aiMsg, setAiMsg]       = useState('');

  const updateScene = (n, field, value) => {
    setScenes(prev => prev.map(s => s.n === n ? { ...s, [field]: value } : s));
  };

  const updateSceneArray = (n, field, value) => {
    const arr = value.split(',').map(v => v.trim()).filter(Boolean);
    setScenes(prev => prev.map(s => s.n === n ? { ...s, [field]: arr } : s));
  };

  const filtered = scenes.filter(s => {
    if (activeTab === 'today') return s.day === 'today';
    if (activeTab === 'week')  return s.day === 'today' || s.day === 'week';
    return true;
  });

  const handleAI = () => {
    setAiMsg('Re-breakdown requested — results will appear in AI feed.');
    setTimeout(() => setAiMsg(''), 4000);
  };

  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <TabBtn active={activeTab === 'today'} onClick={() => setActiveTab('today')}>Today</TabBtn>
          <TabBtn active={activeTab === 'week'}  onClick={() => setActiveTab('week')}>This week</TabBtn>
          <TabBtn active={activeTab === 'full'}  onClick={() => setActiveTab('full')}>Full script</TabBtn>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {aiMsg && <span style={{ fontSize: 11.5, color: C.ok, fontFamily: '"IBM Plex Mono", monospace' }}>{aiMsg}</span>}
          <GhostBtn icon={Ico.sparkle} onClick={handleAI}>AI re-breakdown</GhostBtn>
        </div>
      </div>

      <div style={{ padding: '8px 12px', background: C.tint, borderBottom: `1px solid ${C.line}`, fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>
        Click any cell to edit · press Enter or click away to save
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: C.tint, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textAlign: 'left' }}>
              {['#','Loc','Time','Pages','Cast','Props','Wardrobe','FX / Lighting'].map(h => (
                <th key={h} style={{ padding: '10px 12px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.n} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: '12px', fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace' }}>
                  <EditableCell value={s.n} onChange={v => updateScene(s.n, 'n', v)} mono/>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 500 }}>
                    <EditableCell value={`${s.int} ${s.loc}`} onChange={v => updateScene(s.n, 'loc', v)}/>
                  </div>
                  <div style={{ color: C.muted, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', marginTop: 2 }}>
                    <EditableCell value={s.d} onChange={v => updateScene(s.n, 'd', v)} mono/>
                  </div>
                </td>
                <td style={{ padding: '12px', color: C.muted }}>
                  <EditableCell value={s.d} onChange={v => updateScene(s.n, 'd', v)}/>
                </td>
                <td style={{ padding: '12px', fontFamily: '"IBM Plex Mono", monospace' }}>
                  <EditableCell value={s.pages} onChange={v => updateScene(s.n, 'pages', v)} mono/>
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>comma-sep to edit</div>
                  <EditableCell
                    value={s.cast.join(', ')}
                    onChange={v => updateSceneArray(s.n, 'cast', v)}
                  />
                </td>
                <td style={{ padding: '12px', color: C.ink2 }}>
                  <EditableCell
                    value={s.props.join(', ')}
                    onChange={v => updateSceneArray(s.n, 'props', v)}
                  />
                </td>
                <td style={{ padding: '12px', color: C.ink2 }}>
                  <EditableCell
                    value={s.wardrobe.join(', ')}
                    onChange={v => updateSceneArray(s.n, 'wardrobe', v)}
                  />
                </td>
                <td style={{ padding: '12px', color: C.ink2 }}>
                  <EditableCell
                    value={s.sfx.join(', ')}
                    onChange={v => updateSceneArray(s.n, 'sfx', v)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
