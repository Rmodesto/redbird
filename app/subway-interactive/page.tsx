'use client';

import dynamic from 'next/dynamic';

const SubwayInteractiveMap = dynamic(
  () => import('@/components/SubwayInteractiveMap'),
  {
    loading: () => <p>Loading map...</p>,
    ssr: false
  }
);

export default function SubwayInteractivePage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a 
            href="/" 
            style={{ 
              color: '#fbbf24', 
              textDecoration: 'none',
              fontSize: '14px'
            }}
          >
            ← Back to Home
          </a>
          <h1 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            NYC Subway Interactive Map
          </h1>
        </div>
        <div style={{ color: '#9ca3af', fontSize: '12px' }}>
          Click on stations for details
        </div>
      </div>
      <div style={{ width: '100%', height: '100%', paddingTop: '60px' }}>
        <SubwayInteractiveMap />
      </div>
    </div>
  );
}