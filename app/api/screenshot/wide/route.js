import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// 1280 × 800 — desktop wide screenshot for PWABuilder / Play Store
export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: 1280,
        height: 800,
        background: '#1A1A1A',
        display: 'flex',
        fontFamily: 'serif',
      }}>
        {/* Sidebar */}
        <div style={{
          width: 232,
          height: 800,
          background: '#1E1E1E',
          borderRight: '1px solid #2A2A2A',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 0',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px 24px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#2C2C2C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 22, color: '#E89B4C', fontWeight: 800 }}>P</div>
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#F0F0F0', fontWeight: 700, letterSpacing: 1 }}>PROD</div>
              <div style={{ fontSize: 11, color: '#666' }}>The Last Frame</div>
            </div>
          </div>

          {/* Nav group */}
          <div style={{ padding: '8px 10px 4px', fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>
            PRODUCTION
          </div>
          {[
            { label: 'Today', active: true },
            { label: 'Shot list', active: false },
            { label: 'Cast & crew', active: false },
            { label: 'Lighting', active: false },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: item.active ? '#252525' : 'transparent',
              borderLeft: item.active ? '2px solid #E89B4C' : '2px solid transparent',
              paddingLeft: item.active ? 8 : 10,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: item.active ? '#E89B4C' : '#444' }} />
              <div style={{ fontSize: 13, color: item.active ? '#F0F0F0' : '#888' }}>{item.label}</div>
            </div>
          ))}

          <div style={{ padding: '16px 10px 4px', fontSize: 10, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>
            MANAGEMENT
          </div>
          {['Budget', 'Activity log', 'AI insights'].map((label, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 3, background: '#333' }} />
              <div style={{ fontSize: 13, color: '#777' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 28px',
            borderBottom: '1px solid #2A2A2A',
          }}>
            <div style={{ fontSize: 18, color: '#F0F0F0', fontWeight: 600 }}>Today — Day 3</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#E89B4C', background: '#E89B4C22', padding: '4px 12px', borderRadius: 20 }}>
                In Production
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2C2C2C' }} />
            </div>
          </div>

          {/* Content grid */}
          <div style={{ display: 'flex', gap: 20, padding: 24, flex: 1 }}>
            {/* Left column */}
            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Shot list card */}
              <div style={{ background: '#222', borderRadius: 12, padding: 20, border: '1px solid #2A2A2A' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Today's Shot list
                </div>
                {['1A — Wide master, ext rooftop', '1B — Close Marcus CU', '1C — Sara POV insert'].map((shot, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 0',
                    borderBottom: i < 2 ? '1px solid #2A2A2A' : 'none',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: i === 0 ? '#4CAF50' : '#2A2A2A',
                      border: i === 0 ? 'none' : '1px solid #444',
                    }} />
                    <div style={{ fontSize: 13, color: i === 0 ? '#888' : '#CCC', textDecoration: i === 0 ? 'line-through' : 'none' }}>
                      {shot}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cast card */}
              <div style={{ background: '#222', borderRadius: 12, padding: 20, border: '1px solid #2A2A2A' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
                  On set today
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Marcus', 'Sara', 'Director', 'DP'].map((name, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 22, background: ['#E89B4C', '#6B8CFF', '#4CAF50', '#FF6B6B'][i] + '44', border: `1px solid ${['#E89B4C', '#6B8CFF', '#4CAF50', '#FF6B6B'][i]}` }} />
                      <div style={{ fontSize: 11, color: '#888' }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Progress card */}
              <div style={{ background: '#222', borderRadius: 12, padding: 20, border: '1px solid #2A2A2A' }}>
                <div style={{ fontSize: 13, color: '#888', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>
                  Production progress
                </div>
                <div style={{ fontSize: 32, color: '#E89B4C', fontWeight: 700, marginBottom: 4 }}>25%</div>
                <div style={{ height: 6, background: '#333', borderRadius: 3, marginBottom: 8 }}>
                  <div style={{ width: '25%', height: 6, background: '#E89B4C', borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>3 of 12 shoot days complete</div>
              </div>

              {/* AI insight */}
              <div style={{ background: '#1C2A1C', borderRadius: 12, padding: 20, border: '1px solid #2A3A2A' }}>
                <div style={{ fontSize: 11, color: '#4CAF50', marginBottom: 8, letterSpacing: 1 }}>AI INSIGHT</div>
                <div style={{ fontSize: 13, color: '#AAA', lineHeight: 1.5 }}>
                  Scene 1 coverage on track. Schedule risk: golden hour shots need 15-min buffer.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1280, height: 800 }
  );
}
