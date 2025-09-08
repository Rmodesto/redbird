'use client';

import { useEffect, useRef, useState } from 'react';

export default function SimpleMapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    let mounted = true;

    // Dynamically load MapLibre with better error handling
    const loadMap = async () => {
      try {
        console.log('Starting to load MapLibre GL...');
        
        // Dynamically import MapLibre GL JS
        const maplibregl = await import('maplibre-gl');
        
        // CSS is already imported at the component level
        
        if (!mounted || !mapContainer.current) return;

        console.log('MapLibre GL loaded, creating map...');
        
        const map = new maplibregl.Map({
          container: mapContainer.current,
          style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
          center: [-73.9857, 40.7589],
          zoom: 12,
          pitch: 0,
        });

        map.on('load', () => {
          console.log('Map loaded successfully!');
          if (mounted) {
            setMapLoaded(true);
            setMapInstance(map);
            
            // Add a simple test marker for Times Square
            new maplibregl.Marker({ color: '#FF0000' })
              .setLngLat([-73.9873, 40.7550])
              .setPopup(new maplibregl.Popup().setHTML('<h3>Times Square</h3>'))
              .addTo(map);
              
            console.log('Marker added to map');
          }
        });

        map.on('error', (e: any) => {
          console.error('Map error:', e);
          if (mounted) {
            setError('Map error: ' + (e.error?.message || e.message || 'Unknown error'));
          }
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

      } catch (err) {
        console.error('Failed to load map:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load map');
        }
      }
    };

    loadMap();

    return () => {
      mounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-black text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-yellow-400 hover:text-yellow-300">← Home</a>
            <h1 className="text-xl font-bold">NYC Subway Map - Simple Test</h1>
          </div>
          <div className="text-sm">
            {mapLoaded ? (
              <span className="text-green-400">✓ Map Loaded</span>
            ) : error ? (
              <span className="text-red-400">Error</span>
            ) : (
              <span className="text-yellow-400">Loading MapLibre GL...</span>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg z-50">
            Error: {error}
          </div>
        )}
        
        <div ref={mapContainer} className="w-full h-full" />
        
        {mapLoaded && (
          <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2 text-gray-900">Map Controls</h3>
            <p className="text-sm text-gray-600">• Use mouse to pan and zoom</p>
            <p className="text-sm text-gray-600">• Right-click + drag to rotate</p>
            <p className="text-sm text-gray-600">• Ctrl + drag to tilt (3D)</p>
          </div>
        )}
      </main>
    </div>
  );
}