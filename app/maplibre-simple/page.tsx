'use client';

import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const SimpleMapLibre = dynamic(
  () => import('@/components/SimpleMapLibre'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4">🗺️</div>
          <div className="text-xl font-bold">Loading Map...</div>
        </div>
      </div>
    )
  }
);

export default function MapLibreSimplePage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-black text-white px-4 py-3 flex items-center gap-4">
        <a href="/" className="text-yellow-400 hover:text-yellow-300">
          ← Back
        </a>
        <h1 className="text-xl font-bold">Simple MapLibre Test</h1>
      </header>
      <main className="flex-1">
        <SimpleMapLibre />
      </main>
    </div>
  );
}