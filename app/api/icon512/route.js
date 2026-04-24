import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: '#1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 100,
        }}
      >
        <div style={{
          width: 432,
          height: 432,
          borderRadius: 88,
          background: 'linear-gradient(145deg, #2C2C2C, #111)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #333',
        }}>
          <div style={{
            fontSize: 260,
            fontWeight: 800,
            color: '#E89B4C',
            fontFamily: 'serif',
            lineHeight: 1,
            letterSpacing: -10,
          }}>P</div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
