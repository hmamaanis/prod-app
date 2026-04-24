import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 390 × 844 — mobile portrait screenshot for PWABuilder / Play Store
export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: 390,
        height: 844,
        background: '#1A1A1A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'serif',
      }}>
        {/* Header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '48px 20px 16px',
          borderBottom: '1px solid #2A2A2A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#2C2C2C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 18, color: '#E89B4C', fontWeight: 800 }}>P</div>
            </div>
            <div style={{ fontSize: 16, color: '#F0F0F0', fontWeight: 600, letterSpacing: 1 }}>PROD</div>
          </div>
          <div style={{ fontSize: 12, color: '#888', background: '#2A2A2A', padding: '4px 10px', borderRadius: 20 }}>
            Day 3 / 12
          </div>
        </div>

        {/* Project cards */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { title: 'The Last Frame', phase: 'In Production', day: 3, total: 12, color: '#E89B4C' },
            { title: 'Desert Wind', phase: 'Pre-production', day: 0, total: 20, color: '#6B8CFF' },
            { title: 'City Lights', phase: 'Post-production', day: 14, total: 14, color: '#4CAF50' },
          ].map((p, i) => (
            <div key={i} style={{
              background: '#222',
              borderRadius: 12,
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              border: '1px solid #2A2A2A',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 15, color: '#F0F0F0', fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 10, color: p.color, background: p.color + '22', padding: '3px 8px', borderRadius: 20 }}>
                  {p.phase}
                </div>
              </div>
              <div style={{ height: 4, background: '#333', borderRadius: 2, display: 'flex' }}>
                <div style={{ width: `${(p.day / p.total) * 100}%`, height: 4, background: p.color, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 11, color: '#666' }}>Day {p.day} of {p.total}</div>
            </div>
          ))}
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: '#1E1E1E',
          borderTop: '1px solid #2A2A2A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 16,
        }}>
          {['Today', 'Shot list', 'Cast', 'AI', 'More'].map((tab, i) => (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 4,
                background: i === 0 ? '#E89B4C' : '#444',
              }} />
              <div style={{ fontSize: 10, color: i === 0 ? '#E89B4C' : '#666' }}>{tab}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 390, height: 844 }
  );
}
