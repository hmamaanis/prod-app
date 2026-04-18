'use client';
import { C, Ico, Card, Badge, GhostBtn } from './shared';

const scenes = [
  { n: '24A', int: 'INT', loc: 'WAREHOUSE — MAIN FLOOR', d: 'DAY', pages: '2 3/8', cast: ['NORA','KANE'], props: ['briefcase','keys','flashlight'], wardrobe: ['Nora: gray coat','Kane: badge'], sfx: ['haze','practical lamp'] },
  { n: '24B', int: 'INT', loc: 'WAREHOUSE — OFFICE', d: 'DAY', pages: '1 4/8', cast: ['NORA','ROY'], props: ['files','phone'], wardrobe: ['Nora: gray coat','Roy: suit'], sfx: ['phone ring'] },
  { n: '25', int: 'INT', loc: 'WAREHOUSE — INTERROGATION', d: 'DAY', pages: '3 1/8', cast: ['NORA','KANE'], props: ['table','recorder','coffee'], wardrobe: ['as prev'], sfx: ['hard top light','2× flags'] },
  { n: '27', int: 'INT', loc: 'WAREHOUSE — HALLWAY', d: 'DAY', pages: '7/8', cast: ['MAYA'], props: ['badge'], wardrobe: ['Maya: hoodie'], sfx: ['sodium practicals'] },
];

function TabBtn({ children, active }) {
  return (
    <button style={{
      background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 500,
      color: active ? C.ink : C.muted,
      borderBottom: active ? `2px solid ${C.ink}` : '2px solid transparent',
      fontFamily: 'Inter, system-ui',
    }}>{children}</button>
  );
}

export default function BreakdownScreen() {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <TabBtn active>Today</TabBtn>
          <TabBtn>This week</TabBtn>
          <TabBtn>Full script</TabBtn>
        </div>
        <GhostBtn icon={Ico.sparkle}>AI re-breakdown</GhostBtn>
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
            {scenes.map(s => (
              <tr key={s.n} style={{ borderBottom: `1px solid ${C.line}` }}>
                <td style={{ padding: '12px', fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace' }}>{s.n}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 500 }}>{s.int} {s.loc}</div>
                  <div style={{ color: C.muted, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace' }}>{s.d}</div>
                </td>
                <td style={{ padding: '12px', color: C.muted }}>{s.d}</td>
                <td style={{ padding: '12px', fontFamily: '"IBM Plex Mono", monospace' }}>{s.pages}</td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {s.cast.map(c => <Badge key={c} tone="accent">{c}</Badge>)}
                  </div>
                </td>
                <td style={{ padding: '12px', color: C.ink2 }}>{s.props.join(' · ')}</td>
                <td style={{ padding: '12px', color: C.ink2 }}>{s.wardrobe.join(' · ')}</td>
                <td style={{ padding: '12px', color: C.ink2 }}>{s.sfx.join(' · ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
