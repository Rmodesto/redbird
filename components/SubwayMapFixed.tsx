'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// MTA Line Colors
const MTA_COLORS = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C',
  '7': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183',
};

interface SubwayStation {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
  borough: string;
  complex?: boolean;
}

export default function SubwayMapFixed() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [activeLines, setActiveLines] = useState<string[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🗺️ Initializing MapLibre map...');

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-73.9857, 40.7589], // NYC Center
      zoom: 12,
      maxZoom: 18,
      minZoom: 9,
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.current.on('load', () => {
      console.log('✅ Map loaded successfully');
      setMapLoaded(true);
    });

    map.current.on('error', (e) => {
      console.error('❌ Map error:', e);
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load stations data
  useEffect(() => {
    const loadStations = async () => {
      try {
        console.log('📡 Loading stations data from /api/subway-stations...');
        const response = await fetch('/api/subway-stations', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Data received:', data);
        console.log(`✅ Loaded ${data.stations.length} stations`);
        console.log('First 3 stations:', data.stations.slice(0, 3));
        setStations(data.stations);
      } catch (error) {
        console.error('❌ Failed to load stations:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
        });
      }
    };

    loadStations();
  }, []);

  // Add stations to map when both map and stations are ready
  useEffect(() => {
    if (!map.current || !mapLoaded || stations.length === 0) return;

    console.log('🚉 Adding stations to map...');

    // Create GeoJSON for all stations
    const stationsGeoJSON = {
      type: 'FeatureCollection' as const,
      features: stations.map(station => ({
        type: 'Feature' as const,
        properties: {
          id: station.id,
          name: station.name,
          lines: station.lines,
          borough: station.borough,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: station.coordinates,
        },
      })),
    };

    // Add source for all stations
    if (!map.current!.getSource('stations')) {
      map.current!.addSource('stations', {
        type: 'geojson',
        data: stationsGeoJSON,
      });

      // Add station circles
      map.current!.addLayer({
        id: 'stations-circles',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3,
            15, 5,
            20, 8
          ],
          'circle-color': '#ffffff',
          'circle-stroke-color': '#000000',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8,
        },
      });

      // Add station labels
      map.current!.addLayer({
        id: 'stations-labels',
        type: 'symbol',
        source: 'stations',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 0,
            12, 10,
            15, 12,
            20, 14
          ],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      });

      console.log('✅ Stations added to map');
    }
  }, [mapLoaded, stations]);

  // Toggle line function
  const toggleLine = (lineId: string) => {
    if (!map.current || !mapLoaded || stations.length === 0) {
      console.log('⏳ Map not ready for line toggle');
      return;
    }

    const sourceId = `line-${lineId}`;
    const layerId = `line-${lineId}`;

    if (activeLines.includes(lineId)) {
      // Remove line
      console.log(`🗑️ Removing line ${lineId}`);
      
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      
      setActiveLines(prev => prev.filter(id => id !== lineId));
    } else {
      // Add line
      console.log(`➕ Adding line ${lineId}`);
      
      // Get stations for this line
      const lineStations = stations.filter(station => 
        station.lines.includes(lineId)
      );
      
      if (lineStations.length === 0) {
        console.warn(`⚠️ No stations found for line ${lineId}`);
        return;
      }

      console.log(`📍 Found ${lineStations.length} stations for line ${lineId}`);

      // Create GeoJSON for the line
      const lineGeoJSON = {
        type: 'Feature' as const,
        properties: { line: lineId },
        geometry: {
          type: 'LineString' as const,
          coordinates: lineStations.map(station => station.coordinates),
        },
      };

      // Add source and layer
      try {
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId as keyof typeof MTA_COLORS] || '#808183',
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 3,
              15, 5,
              20, 8
            ],
            'line-opacity': 0.8,
          },
        });

        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Line ${lineId} added successfully`);
      } catch (error) {
        console.error(`❌ Error adding line ${lineId}:`, error);
      }
    }
  };

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg max-w-sm">
        <h3 className="text-lg font-bold mb-3">NYC Subway Lines</h3>
        
        <div className="text-sm mb-3 space-y-1">
          <div>Map: {mapLoaded ? '✅ Ready' : '⏳ Loading...'}</div>
          <div>Stations: {stations.length > 0 ? `✅ ${stations.length} loaded` : '⏳ Loading...'}</div>
          <div>Active Lines: {activeLines.length}</div>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {Object.keys(MTA_COLORS).map(line => (
            <button
              key={line}
              onClick={() => toggleLine(line)}
              disabled={!mapLoaded || stations.length === 0}
              className={`w-10 h-10 rounded font-bold text-sm transition-all duration-200 ${
                activeLines.includes(line)
                  ? 'text-white shadow-lg scale-110'
                  : 'text-gray-400 bg-gray-100 opacity-50 hover:opacity-75'
              } disabled:opacity-25 disabled:cursor-not-allowed`}
              style={{
                backgroundColor: activeLines.includes(line) 
                  ? MTA_COLORS[line as keyof typeof MTA_COLORS]
                  : undefined
              }}
            >
              {line}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}