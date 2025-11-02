'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const SubwayMapComponent = dynamic(
  () => import('@/components/SubwayMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🗽</div>
          <div className="text-xl font-bold mb-2">Loading NYC Subway Map...</div>
          <div className="text-sm text-gray-400">Initializing real-time data</div>
        </div>
      </div>
    )
  }
);

export default function RealTimeMapPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🚇</div>
          <div className="text-xl">Preparing map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-yellow-400 hover:text-yellow-300 transition"
            title="Back to Home"
          >
            ← Back
          </a>
          <h1 className="text-xl font-bold">
            🗽 NYC Subway Real-Time 3D Map
          </h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-300">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live updates every 30s
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="/subway-map"
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition"
          >
            📖 About
          </a>
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 relative overflow-hidden">
        <SubwayMapComponent className="w-full h-full" />
      </main>
    </div>
  );
}