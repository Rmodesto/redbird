'use client';

import dynamic from 'next/dynamic';

// Dynamic import with no SSR
// const NYCSubwayMap = dynamic(
//   () => import('@/components/NYCSubwayMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">🚇</div>
          <p className="text-xl text-white font-semibold">Loading NYC Subway Map...</p>
        </div>
      </div>
    )
  }
);

export default function NYCMapPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-black text-white px-4 py-3 shadow-lg z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-yellow-400 hover:text-yellow-300 transition">
              ← Home
            </a>
            <h1 className="text-xl font-bold">NYC Subway Interactive Map</h1>
          </div>
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live Map
          </div>
        </div>
      </header>
      <main className="flex-1 relative">
        {/* <NYCSubwayMap /> */}
        <div className="p-8 text-white">Component temporarily disabled</div>
      </main>
    </div>
  );
}