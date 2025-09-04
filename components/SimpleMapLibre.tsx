'use client';

import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function SimpleMapLibre() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [lng] = useState(-73.9857);
  const [lat] = useState(40.7589);
  const [zoom] = useState(12);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Using MapLibre demo tiles
      center: [lng, lat],
      zoom: zoom
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add fullscreen control
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    // Set map loaded state
    map.current.on('load', () => {
      setMapLoaded(true);
      console.log('Map loaded successfully');
      
      // Add some test markers for NYC subway stations
      const stations = [
        { name: 'Times Square', coords: [-73.9873, 40.7550] },
        { name: 'Grand Central', coords: [-73.9772, 40.7527] },
        { name: 'Union Square', coords: [-73.9897, 40.7359] },
        { name: 'Penn Station', coords: [-73.9934, 40.7506] },
      ];
      
      stations.forEach(station => {
        // Create a marker
        const marker = new maplibregl.Marker({ color: '#FF0000' })
          .setLngLat(station.coords as [number, number])
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`<h3>${station.name}</h3><p>NYC Subway Station</p>`)
          )
          .addTo(map.current!);
      });
    });

    // Clean up on unmount
    return () => {
      map.current?.remove();
    };
  }, [lng, lat, zoom]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {mapLoaded && (
        <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg shadow">
          <p className="text-sm font-semibold text-green-600">✓ Map Loaded</p>
          <p className="text-xs text-gray-600">NYC Center: {lat.toFixed(4)}, {lng.toFixed(4)}</p>
        </div>
      )}
    </div>
  );
}