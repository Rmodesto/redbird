'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import the map component to avoid SSR issues
const ReactMapGL = dynamic(
  () => import('@/components/ReactMapGL'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="text-4xl mb-4 animate-pulse">🗽</div>
          <div className="text-xl font-bold mb-2">Loading NYC Subway Map...</div>
          <div className="text-sm text-gray-400">Powered by react-map-gl</div>
        </div>
      </div>
    )
  }
);

export default function ReactMapPage() {
  const [mapReady, setMapReady] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between shadow-lg z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            ← Back
          </a>
          <h1 className="text-xl font-bold">
            🗽 NYC Subway Map (React Map GL)
          </h1>
          {mapReady && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Map Ready
            </div>
          )}
        </div>
      </header>

      {/* Map Container */}
      <main className="flex-1 relative overflow-hidden">
        <ReactMapGL />
        
        {/* Map Controls Info */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold mb-2 text-gray-900">Map Controls</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click on stations for details</li>
            <li>• Scroll to zoom in/out</li>
            <li>• Drag to pan around</li>
            <li>• Right-click + drag to rotate</li>
            <li>• Ctrl + drag for 3D tilt</li>
          </ul>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-4 rounded-lg shadow-lg max-w-xs">
          <h3 className="font-bold mb-2 text-gray-900">NYC Subway Lines</h3>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { lines: ['1', '2', '3'], color: '#EE352E' },
              { lines: ['4', '5', '6'], color: '#00933C' },
              { lines: ['7'], color: '#B933AD' },
              { lines: ['A', 'C', 'E'], color: '#0039A6' },
              { lines: ['B', 'D', 'F', 'M'], color: '#FF6319' },
              { lines: ['N', 'Q', 'R', 'W'], color: '#FCCC0A' },
            ].map((group, i) => (
              <div key={i} className="flex gap-1">
                {group.lines.map(line => (
                  <div
                    key={line}
                    className="w-5 h-5 rounded flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: group.color }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}