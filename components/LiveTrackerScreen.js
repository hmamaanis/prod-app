'use client';
import { useState, useEffect } from 'react';
import { C, Ico, Card, Badge, Avatar, StatusDot, statusLabel } from './shared';
import { getCast, getCrew } from '@/lib/api';

function PersonRow({ p }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 6 }}>
      <Avatar name={p.name} size={36}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: C.muted, fontFamily: '"IBM Plex Mono", monospace' }}>{p.role}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: C.ink2 }}>
        <StatusDot status={p.status}/>
        {statusLabel(p)}
      </div>
    </div>
  );
}

function MapArea() {
  return (
    <div style={{ position: 'relative', aspectRatio: '16/10', background: '#F0EFEB', overflow: 'hidden' }}>
      <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <pattern id="gr2" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" stroke="#E2E1DD" strokeWidth="0.5" fill="none"/>
          </pattern>
        </defs>
        <rect width="800" height="500" fill="url(#gr2)"/>
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
    </div>
  );
}

export default function LiveTrackerScreen({ projectId }) {
  const [cast, setCast] = useState([]);
  const [crew, setCrew] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    Promise.all([getCast(projectId), getCrew(projectId)])
      .then(([c, cr]) => { setCast(c); setCrew(cr); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const people = [...cast, ...crew].filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.role.toLowerCase().includes(search.toLowerCase())
  );

  const sharing = people.filter(p => p.status !== 'not-called').length;

  if (loading) return <div style={{ padding: 40, color: C.muted, fontFamily: 'Inter' }}>Loading tracker…</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16 }}>
      <Card>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Team locations · Live</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Updated every 30s · opt-in per member</div>
          </div>
          <Badge tone="ok" dot>{sharing} of {people.length} sharing</Badge>
        </div>
        <MapArea/>
      </Card>
      <Card>
        <div style={{ padding: 12, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: C.muted2 }}><Ico.search/></div>
          <input
            placeholder="Search people..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', background: 'none', fontSize: 13, flex: 1, outline: 'none', fontFamily: 'Inter' }}
          />
        </div>
        <div style={{ maxHeight: 560, overflow: 'auto' }}>
          {people.map((p, i) => <PersonRow key={p.id || i} p={p}/>)}
          {people.length === 0 && <div style={{ padding: 20, color: C.muted, fontSize: 13 }}>No results.</div>}
        </div>
      </Card>
    </div>
  );
}
