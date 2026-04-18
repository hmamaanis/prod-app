'use client';
import { C, Ico, Card, SectionHead } from './shared';

function LogRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${C.line}`, fontSize: 12.5 }}>
      <span style={{ color: C.muted, fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function MapArea() {
  return (
    <div style={{ position: 'relative', aspectRatio: '16/10', background: '#F0EFEB', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" stroke="#E2E1DD" strokeWidth="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#gr)"/>
        <path d="M0,100 Q200,80 400,120 T800,140 L800,0 L0,0 Z" fill="#E5ECEF"/>
        {[[100,200,180,90],[300,200,120,140],[440,200,180,120],[640,200,120,100],[100,340,180,100],[300,360,120,80],[440,340,180,110],[640,320,120,120]].map((b,i) => (
          <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} fill="#EAEAE6" stroke="#D8D8D2" strokeWidth="1"/>
        ))}
        <g stroke="#fff" strokeWidth="8">
          <line x1="0" y1="300" x2="800" y2="300"/>
          <line x1="410" y1="140" x2="410" y2="500"/>
        </g>
        <g transform="translate(490, 260)">
          <circle r="40" fill="#E89B4C" opacity="0.12"/>
          <circle r="20" fill="#E89B4C" opacity="0.25"/>
          <circle r="10" fill="#E89B4C" stroke="#fff" strokeWidth="3"/>
        </g>
        <text x="510" y="250" fontFamily="Inter" fontSize="11" fontWeight="600" fill="#1A1A1A">SET · Warehouse 4</text>
        {[[200,380,'L.F'],[340,240,'J.N'],[560,380,'R.O'],[250,180,'E.V']].map((p,i) => (
          <g key={i} transform={`translate(${p[0]},${p[1]})`}>
            <circle r="12" fill="#fff" stroke="#1A1A1A" strokeWidth="1.5"/>
            <text textAnchor="middle" y="4" fontSize="9" fontWeight="600" fontFamily="Inter">{p[2]}</text>
          </g>
        ))}
        <g transform="translate(130, 430)">
          <circle r="20" fill="#B8893B" opacity="0.15"/>
          <circle r="12" fill="#fff" stroke="#B8893B" strokeWidth="1.5"/>
          <text textAnchor="middle" y="4" fontSize="9" fontWeight="600" fill="#6E501C" fontFamily="Inter">M.R</text>
        </g>
        <text x="150" y="460" fontFamily="IBM Plex Mono, monospace" fontSize="9.5" fill="#6B6B6B">M. Reid · ETA 07:40 · Williamsburg Br.</text>
        <path d="M 140 430 Q 280 400 490 280" stroke="#B8893B" strokeWidth="1.5" fill="none" strokeDasharray="4 4" opacity="0.7"/>
      </svg>
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(255,255,255,0.9)', padding: 10, borderRadius: 6, fontSize: 11, fontFamily: '"IBM Plex Mono", monospace' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.accent }}/>Set location</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: C.warn }}/>In transit</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: '#fff', border: '1px solid #1A1A1A' }}/>Team on-set</div>
      </div>
    </div>
  );
}

export default function LocationScreen() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
      <Card>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Warehouse 4 — Brooklyn Navy Yard</div>
            <div style={{ fontSize: 12, color: C.muted }}>63 Flushing Ave, Brooklyn NY · Holding on 2nd floor</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E4EDE4', color: '#345734', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
            <span style={{ width: 5, height: 5, borderRadius: 99, background: '#5A8F5A' }}/>Active
          </span>
        </div>
        <MapArea/>
      </Card>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card>
          <SectionHead>Logistics</SectionHead>
          <div style={{ padding: 16 }}>
            <LogRow label="Base camp" value="Lot C · 4 trailers"/>
            <LogRow label="Parking" value="22 spaces · permit 4482"/>
            <LogRow label="Catering" value="Truck K&R · arr 06:00"/>
            <LogRow label="Power" value="House + 1× generator"/>
            <LogRow label="Permit" value="Valid 06:00–22:00" last/>
          </div>
        </Card>
        <Card>
          <SectionHead>Tomorrow</SectionHead>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Rooftop — Jefferson St.</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontFamily: '"IBM Plex Mono", monospace' }}>Scenes 31 · 32 · 33A</div>
            <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: '#E7EBFB', display: 'flex', gap: 8 }}>
              <div style={{ color: C.critical, marginTop: 1 }}><Ico.rain/></div>
              <div style={{ fontSize: 12, color: '#2A3C8A' }}>
                <strong>Rain 70%</strong> between 14:00–18:00. AI has 2 contingency plans ready.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
