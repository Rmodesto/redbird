'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Import the station data directly
import stationsData from '@/data/nyc-subway-stations-official.json';
import { orderStationsByRoute } from '@/lib/map/stationRouteOrder';

// MTA Line Colors
const MTA_COLORS: Record<string, string> = {
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
}

// Map Styles
const MAP_STYLES = [
  {
    id: 'dark',
    name: 'Dark Mode',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  {
    id: 'light',
    name: 'Light Mode',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  {
    id: 'osm',
    name: 'Street Map',
    url: 'https://demotiles.maplibre.org/style.json',
  },
];

export default function WorkingSubwayMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLines, setActiveLines] = useState<string[]>([]);
  const [is3D, setIs3D] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0]);
  const [showStations, setShowStations] = useState(true);
  
  // Use the imported station data directly
  const stations: SubwayStation[] = stationsData.stations as SubwayStation[];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🗺️ Initializing map with', stations.length, 'stations');

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-73.9857, 40.7589], // NYC Center
      zoom: 11,
      maxZoom: 18,
      minZoom: 9,
    });

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.current.on('load', () => {
      console.log('✅ Map loaded');
      setMapLoaded(true);
      
      // Add all stations immediately
      addStationsToMap();
    });

    const addStationsToMap = () => {
      if (!map.current) return;
      
      console.log('📍 Adding stations to map');
      
      // Create GeoJSON for all stations
      const stationsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: stations.map(station => ({
          type: 'Feature' as const,
          properties: {
            name: station.name,
            lines: station.lines.join(', '),
          },
          geometry: {
            type: 'Point' as const,
            coordinates: station.coordinates,
          },
        })),
      };

      // Add source
      map.current!.addSource('all-stations', {
        type: 'geojson',
        data: stationsGeoJSON,
      });

      // Add station circles
      map.current!.addLayer({
        id: 'station-circles',
        type: 'circle',
        source: 'all-stations',
        paint: {
          'circle-radius': 4,
          'circle-color': '#ffffff',
          'circle-stroke-color': '#333333',
          'circle-stroke-width': 1,
        },
      });

      console.log('✅ Stations added to map');
    };

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Function to toggle line animation
  const toggleLine = (lineId: string) => {
    if (!map.current || !mapLoaded) {
      console.log('Map not ready');
      return;
    }

    const sourceId = `line-${lineId}`;
    const layerId = `line-layer-${lineId}`;
    const stationsSourceId = `line-stations-${lineId}`;
    const stationsLayerId = `line-stations-layer-${lineId}`;

    if (activeLines.includes(lineId)) {
      // Remove line
      console.log(`Removing line ${lineId}`);
      
      // Remove layers first, then sources
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current.getLayer(stationsLayerId)) {
        map.current.removeLayer(stationsLayerId);
      }
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
      if (map.current.getSource(stationsSourceId)) {
        map.current.removeSource(stationsSourceId);
      }
      
      setActiveLines(prev => prev.filter(id => id !== lineId));
    } else {
      // Add line
      console.log(`Adding line ${lineId}`);
      
      // Get stations for this line
      const lineStations = stations.filter(station => 
        station.lines.includes(lineId)
      );
      
      if (lineStations.length === 0) {
        console.warn(`No stations found for line ${lineId}`);
        return;
      }

      console.log(`Found ${lineStations.length} stations for line ${lineId}`);
      
      // Order stations according to actual subway route
      const orderedStations = orderStationsByRoute(lineStations, lineId);
      console.log(`Ordered ${orderedStations.length} stations for line ${lineId} route`);

      // Create line GeoJSON using ordered stations
      const lineGeoJSON = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: orderedStations.map(s => s.coordinates),
        },
      };

      // Create stations GeoJSON using ordered stations
      const stationsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: orderedStations.map(station => ({
          type: 'Feature' as const,
          properties: {
            name: station.name,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: station.coordinates,
          },
        })),
      };

      // Add line source and layer
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
          'line-color': MTA_COLORS[lineId] || '#808183',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Add station markers for this line
      map.current!.addSource(stationsSourceId, {
        type: 'geojson',
        data: stationsGeoJSON,
      });

      map.current!.addLayer({
        id: stationsLayerId,
        type: 'circle',
        source: stationsSourceId,
        paint: {
          'circle-radius': 6,
          'circle-color': MTA_COLORS[lineId] || '#808183',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      });

      setActiveLines(prev => [...prev, lineId]);
      console.log(`✅ Line ${lineId} added`);
    }
  };

  // Toggle 3D mode
  const toggle3D = () => {
    if (!map.current) return;
    
    const newPitch = is3D ? 0 : 60;
    const newBearing = is3D ? 0 : -17.6;
    
    map.current.easeTo({
      pitch: newPitch,
      bearing: newBearing,
      duration: 1000,
    });
    
    setIs3D(!is3D);
    console.log(`3D mode: ${!is3D ? 'ON' : 'OFF'}`);
  };

  // Toggle all lines
  const toggleAllLines = () => {
    if (activeLines.length > 0) {
      // Clear all
      activeLines.forEach(lineId => {
        const sourceId = `line-${lineId}`;
        const layerId = `line-layer-${lineId}`;
        const stationsSourceId = `line-stations-${lineId}`;
        const stationsLayerId = `line-stations-layer-${lineId}`;
        
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current?.getLayer(stationsLayerId)) {
          map.current.removeLayer(stationsLayerId);
        }
        if (map.current?.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
        if (map.current?.getSource(stationsSourceId)) {
          map.current.removeSource(stationsSourceId);
        }
      });
      setActiveLines([]);
    } else {
      // Show all
      Object.keys(MTA_COLORS).forEach(lineId => {
        if (!activeLines.includes(lineId)) {
          toggleLine(lineId);
        }
      });
    }
  };

  // Quick tour function
  const startQuickTour = () => {
    if (!map.current) return;
    
    const tourStops = [
      { center: [-73.9857, 40.7589], zoom: 12, pitch: 0 }, // Overview
      { center: [-73.9851, 40.7589], zoom: 14, pitch: 45 }, // Midtown
      { center: [-73.9891, 40.7143], zoom: 15, pitch: 60 }, // Downtown
      { center: [-73.9442, 40.6782], zoom: 14, pitch: 45 }, // Brooklyn
      { center: [-73.8603, 40.7489], zoom: 13, pitch: 30 }, // Queens
    ];
    
    let currentStop = 0;
    
    const nextStop = () => {
      if (currentStop < tourStops.length) {
        map.current!.easeTo({
          ...tourStops[currentStop],
          duration: 3000,
        });
        currentStop++;
        setTimeout(nextStop, 3500);
      }
    };
    
    nextStop();
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Main Controls Panel */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="text-lg font-bold mb-3">🗽 Live NYC Subway Map</h3>
        
        {/* Mode Controls */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggle3D}
            className={`px-3 py-1 rounded text-sm font-medium transition ${
              is3D ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {is3D ? '🏙️ 3D Mode' : '🗺️ 2D Mode'}
          </button>
          
          <button
            onClick={startQuickTour}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition"
          >
            ✈️ Quick Tour
          </button>
        </div>
        
        {/* Stats */}
        <div className="text-sm mb-3 flex gap-4">
          <div>📍 {stations.length} stations</div>
          <div>🚇 {activeLines.length} lines active</div>
        </div>
        
        {/* Select All/None Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={toggleAllLines}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
          >
            {activeLines.length > 0 ? 'Clear All' : 'Show All'}
          </button>
          
          <button
            onClick={() => setShowStations(!showStations)}
            className={`px-3 py-1 rounded text-sm transition ${
              showStations ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {showStations ? '👁️ Stations' : '👁️‍🗨️ Stations'}
          </button>
        </div>
        
        {/* Subway Lines Grid */}
        <div className="grid grid-cols-6 gap-2">
          {Object.keys(MTA_COLORS).map(line => (
            <button
              key={line}
              onClick={() => toggleLine(line)}
              className={`w-10 h-10 rounded font-bold text-sm transition-all ${
                activeLines.includes(line)
                  ? 'text-white shadow-lg transform scale-110'
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: activeLines.includes(line) 
                  ? MTA_COLORS[line]
                  : undefined
              }}
            >
              {line}
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-600">
          Click lines to toggle • Drag to pan • Scroll to zoom
        </div>
      </div>
      
      {/* Map Style Selector */}
      <div className="absolute top-4 right-20 bg-white p-2 rounded-lg shadow-lg">
        <select
          value={currentStyle.id}
          onChange={(e) => {
            const style = MAP_STYLES.find(s => s.id === e.target.value);
            if (style && map.current) {
              setCurrentStyle(style);
              map.current.setStyle(style.url);
              // Re-add stations after style change
              setTimeout(() => {
                if (map.current && map.current.isStyleLoaded()) {
                  // Re-add any active lines
                  const linesToRestore = [...activeLines];
                  setActiveLines([]);
                  setTimeout(() => {
                    linesToRestore.forEach(lineId => toggleLine(lineId));
                  }, 100);
                }
              }, 1000);
            }
          }}
          className="text-sm px-2 py-1 rounded border border-gray-300"
        >
          {MAP_STYLES.map(style => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Live Status Indicator */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>Live Updates Active</span>
        </div>
      </div>
    </div>
  );
}