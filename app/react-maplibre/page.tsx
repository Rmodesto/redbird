'use client';

import dynamic from 'next/dynamic';

const MapLibreReact = dynamic(
  () => import('@/components/MapLibreReact'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-pulse mb-4">
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 2 L12 12 L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-xl font-semibold">Loading NYC Subway Map</p>
          <p className="text-sm text-gray-400 mt-2">Initializing MapLibre GL JS...</p>
        </div>
      </div>
    )
  }
);

export default function ReactMapLibrePage() {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-black text-white px-6 py-4 shadow-lg z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="hover:bg-gray-800 px-3 py-1 rounded transition"
            >
              ← Back
            </a>
            <h1 className="text-xl font-bold">NYC Subway Map (React + MapLibre)</h1>
          </div>
          <div className="text-sm text-gray-300">
            Powered by react-map-gl + MapLibre GL JS
          </div>
        </div>
      </header>
      
      <main className="flex-1 relative">
        <MapLibreReact />
      </main>
    </div>
  );
}