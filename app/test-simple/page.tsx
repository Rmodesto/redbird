'use client';

import { useEffect, useRef } from 'react';

export default function TestSimplePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;

    // Import MapLibre dynamically
    import('maplibre-gl').then((maplibregl) => {
      if (!mapContainer.current || mapRef.current) return;

      // Create map with OpenStreetMap tiles (100% free, no API key)
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm-tiles': {
              type: 'raster',
              tiles: [
                'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
              ],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm-tiles-layer',
              type: 'raster',
              source: 'osm-tiles',
              minzoom: 0,
              maxzoom: 19
            }
          ]
        },
        center: [-73.9857, 40.7589], // NYC
        zoom: 12,
        attributionControl: false
      });

      // Add navigation controls
      mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Add markers for subway stations
      const stations = [
        { name: 'Times Square', coords: [-73.9873, 40.7550] },
        { name: 'Grand Central', coords: [-73.9772, 40.7527] },
        { name: 'Union Square', coords: [-73.9897, 40.7359] },
        { name: 'Penn Station', coords: [-73.9934, 40.7506] },
        { name: 'Herald Square', coords: [-73.9879, 40.7484] }
      ];

      stations.forEach(station => {
        new maplibregl.Marker({ color: '#FF0000' })
          .setLngLat(station.coords as [number, number])
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`<h3>${station.name}</h3><p>NYC Subway Station</p>`)
          )
          .addTo(mapRef.current);
      });
    }).catch(error => {
      console.error('Failed to load MapLibre:', error);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-black text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-yellow-400 hover:text-yellow-300">← Back</a>
          <h1 className="text-xl font-bold">Test Simple Map - OpenStreetMap</h1>
        </div>
      </header>
      <div ref={mapContainer} className="flex-1" />
    </div>
  );
}