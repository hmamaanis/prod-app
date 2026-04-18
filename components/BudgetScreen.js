'use client';
import { C, Ico, Card, SectionHead } from './shared';

const lines = [
  { cat: 'Cast', budgeted: 420000, actual: 198000 },
  { cat: 'Crew labor', budgeted: 680000, actual: 318000 },
  { cat: 'Locations', budgeted: 145000, actual: 72000 },
  { cat: 'Equipment', budgeted: 210000, actual: 104500 },
  { cat: 'Transport', budgeted: 58000, actual: 26400 },
  { cat: 'Catering', budgeted: 42000, actual: 21200 },
  { cat: 'Post hold', budgeted: 180000, actual: 0 },
];

function fmt(n) { return '$' + n.toLocaleString(); }

function Stat({ label, val, tone }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, marginTop: 4, color: tone === 'ok' ? C.ok : C.ink }}>{val}</div>
    </div>
  );
}

export default function BudgetScreen() {
  const totalB = lines.reduce((a, b) => a + b.budgeted, 0);
  const totalA = lines.reduce((a, b) => a + b.actual, 0);
  const expected = (11 / 24) * 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ padding: 20, borderBottom: `1px solid ${C.line}`, display: 'flex', gap: 32 }}>
          <Stat label="Budget total" val={fmt(totalB)}/>
          <Stat label="Actual to date" val={fmt(totalA)}/>
          <Stat label="Pace" val="On track" tone="ok"/>
          <Stat label="Days complete" val="11 / 24"/>
        </div>
        <div style={{ padding: 20 }}>
          {lines.map((l, i) => {
            const pct = l.budgeted > 0 ? (l.actual / l.budgeted) * 100 : 0;
            return (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l.cat}</span>
                  <span style={{ fontSize: 12, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(l.actual)} / {fmt(l.budgeted)}</span>
                </div>
                <div style={{ height: 6, background: C.tint, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: pct > expected + 5 ? C.red : pct > expected ? C.warn : C.ink }}/>
                  <div style={{ position: 'absolute', top: -2, height: 10, width: 1, background: C.accent, left: `${expected}%` }}/>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <SectionHead>Day 12 est. impact</SectionHead>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase' }}>Time</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: C.ok }}>−42 min</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Ahead of day plan</div>

          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 24 }}>Cost delta</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.5, marginTop: 4, color: C.ok }}>−$4,280</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>vs. day budget</div>

          <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace', letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 24 }}>AI contribution</div>
          <div style={{ padding: 10, background: '#EBEFFB', borderRadius: 6, marginTop: 8, display: 'flex', gap: 8 }}>
            <div style={{ color: C.critical }}><Ico.sparkle/></div>
            <div style={{ fontSize: 12, color: '#2A3C8A', lineHeight: 1.4 }}>Shot reorder saved 40 min · Light grouping saved 2m · Held Tomás's pickup</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
