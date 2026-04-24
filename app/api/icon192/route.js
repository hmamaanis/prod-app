import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 38,
        }}
      >
        {/* Outer ring */}
        <div style={{
          width: 160,
          height: 160,
          borderRadius: 32,
          background: 'linear-gradient(145deg, #2A2A2A, #111)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px solid #333',
        }}>
          {/* P lettermark */}
          <div style={{
            fontSize: 96,
            fontWeight: 800,
            color: '#E89B4C',
            fontFamily: 'serif',
            lineHeight: 1,
            letterSpacing: -4,
          }}>P</div>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
