'use client';

import dynamic from 'next/dynamic';

// Client-only wrapper: MapLibre needs `window`, so the map is loaded with
// ssr:false. Next 15 disallows ssr:false inside a Server Component, so the
// dynamic import lives here in a Client Component and the server page renders
// this. Render output is identical to the previous inline dynamic import.
const SubwayMap = dynamic(() => import('@/components/WorkingSubwayMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <div className="text-4xl mb-4 animate-pulse">🗽</div>
        <div className="text-xl font-bold mb-2">Loading NYC Subway Map...</div>
        <div className="text-sm text-gray-400">Initializing real-time data</div>
      </div>
    </div>
  ),
});

export default function WorkingSubwayMapClient() {
  return <SubwayMap />;
}
