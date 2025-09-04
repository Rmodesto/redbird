'use client';

import dynamic from 'next/dynamic';

const SimpleMapGL = dynamic(
  () => import('@/components/SimpleMapGL'),
  { 
    ssr: false,
    loading: () => <div className="h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }
);

export default function SimpleGLPage() {
  return (
    <div className="h-screen flex flex-col">
      <header className="bg-black text-white px-4 py-3">
        <a href="/" className="text-yellow-400 hover:text-yellow-300 mr-4">← Back</a>
        <span className="text-xl font-bold">Simple MapGL Test</span>
      </header>
      <main className="flex-1">
        <SimpleMapGL />
      </main>
    </div>
  );
}