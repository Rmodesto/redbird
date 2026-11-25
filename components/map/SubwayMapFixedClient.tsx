'use client';

import dynamic from 'next/dynamic';

// Client-only wrapper for SubwayMapFixed (MapLibre needs `window`). See
// WorkingSubwayMapClient for why this indirection exists under Next 15.
const SubwayMap = dynamic(() => import('@/components/SubwayMapFixed'), {
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

export default function SubwayMapFixedClient() {
  return <SubwayMap />;
}
