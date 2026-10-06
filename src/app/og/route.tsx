import { siteConfig } from '@/config/site';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage:
              'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            position: 'relative',
            padding: '40px',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                'radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            }}
          />

          {/* Profile Picture Circle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '4px solid #3b82f6',
              backgroundColor: '#1e293b',
              marginBottom: '30px',
              position: 'relative',
              zIndex: 10,
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: 56, color: '#d1d5db' }}>
              {siteConfig.name.slice(0, 1)}
            </span>
          </div>

          {/* Text Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                margin: '0 0 12px 0',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              {siteConfig.name}
            </h1>
            <p
              style={{
                fontSize: '24px',
                margin: '0 0 24px 0',
                color: '#e2e8f0',
                fontWeight: '500',
              }}
            >
              {siteConfig.title}
            </p>
            <div
              style={{
                fontSize: '20px',
                color: '#94a3b8',
                fontWeight: '400',
                padding: '16px 32px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {`Learn more about ${siteConfig.name}`}
            </div>
          </div>

          {/* Decorative Elements */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              opacity: 0.3,
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              opacity: 0.4,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    if (e instanceof Error) {
      console.log(e.message);
    } else {
      console.log(String(e));
    }
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
