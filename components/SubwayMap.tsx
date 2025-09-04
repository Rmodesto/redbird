'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SubwayStation } from '@/app/api/subway-stations/route';
import { SubwayTrain } from '@/app/api/subway-trains/route';
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

const SUBWAY_LINES = Object.keys(MTA_COLORS);

// Map Styles
const MAP_STYLES = [
  {
    id: 'osm-bright',
    name: 'Street Map',
    url: 'https://demotiles.maplibre.org/style.json',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  {
    id: 'positron',
    name: 'Light Mode',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
];

interface SubwayMapProps {
  className?: string;
}

export default function SubwayMap({ className = '' }: SubwayMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [trains, setTrains] = useState<SubwayTrain[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>(SUBWAY_LINES);
  const [is3D, setIs3D] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[1]); // Start with dark
  const [showStations, setShowStations] = useState(true);
  const [showTrains, setShowTrains] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    try {
      console.log('Initializing MapLibre GL map...');
      
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: currentStyle.url,
        center: [-73.9857, 40.7589], // NYC Center
        zoom: 12,
        pitch: 0,
        bearing: 0,
        maxZoom: 18,
        minZoom: 9,
      });

      // Add controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        loadStations();
        loadTrains();
      });
      
      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load stations data
  const loadStations = useCallback(async () => {
    try {
      const response = await fetch('/api/subway-stations');
      const data = await response.json();
      setStations(data.stations);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  }, []);

  // Load trains data
  const loadTrains = useCallback(async () => {
    try {
      const response = await fetch('/api/subway-trains');
      const data = await response.json();
      setTrains(data.trains);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load trains:', error);
    }
  }, []);

  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    map.current.setStyle(currentStyle.url);
    map.current.once('styledata', () => {
      updateMapLayers();
    });
  }, [currentStyle]);

  // Toggle 3D mode
  const toggle3D = useCallback(() => {
    if (!map.current) return;
    
    const newPitch = is3D ? 0 : 45;
    map.current.easeTo({
      pitch: newPitch,
      duration: 1000,
    });
    setIs3D(!is3D);
  }, [is3D]);

  // Update map layers with stations and trains
  const updateMapLayers = useCallback(() => {
    if (!map.current || !mapLoaded) return;

    // Filter stations by selected lines
    const filteredStations = stations.filter(station =>
      station.lines.some(line => selectedLines.includes(line))
    );

    // Filter trains by selected lines
    const filteredTrains = trains.filter(train =>
      selectedLines.includes(train.line)
    );

    // Update stations layer
    if (showStations && filteredStations.length > 0) {
      const stationGeoJSON = {
        type: 'FeatureCollection' as const,
        features: filteredStations.map(station => ({
          type: 'Feature' as const,
          properties: {
            id: station.id,
            name: station.name,
            lines: station.lines,
            borough: station.borough,
            complex: station.complex || false,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: station.coordinates,
          },
        })),
      };

      // Remove existing stations source if it exists
      if (map.current.getSource('stations')) {
        map.current.removeLayer('stations-layer');
        map.current.removeSource('stations');
      }

      map.current.addSource('stations', {
        type: 'geojson',
        data: stationGeoJSON,
      });

      map.current.addLayer({
        id: 'stations-layer',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-color': '#ffffff',
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 4,
            15, 8,
            18, 12
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#333333',
          'circle-opacity': 0.9,
        },
      });

      // Add station labels
      map.current.addLayer({
        id: 'stations-labels',
        type: 'symbol',
        source: 'stations',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Regular'],
          'text-size': 12,
          'text-offset': [0, 2],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': is3D ? '#ffffff' : '#333333',
          'text-halo-color': is3D ? '#000000' : '#ffffff',
          'text-halo-width': 1,
        },
        minzoom: 13,
      });
    } else {
      // Remove stations layers
      if (map.current.getLayer('stations-layer')) {
        map.current.removeLayer('stations-layer');
        map.current.removeLayer('stations-labels');
        map.current.removeSource('stations');
      }
    }

    // Update trains layer
    if (showTrains && filteredTrains.length > 0) {
      const trainGeoJSON = {
        type: 'FeatureCollection' as const,
        features: filteredTrains.map(train => ({
          type: 'Feature' as const,
          properties: {
            id: train.id,
            line: train.line,
            direction: train.direction,
            destination: train.destination,
            nextStop: train.nextStop,
            delay: train.delay || 0,
            speed: train.speed || 0,
            color: MTA_COLORS[train.line as keyof typeof MTA_COLORS] || '#808183',
          },
          geometry: {
            type: 'Point' as const,
            coordinates: train.coordinates,
          },
        })),
      };

      // Remove existing trains source if it exists
      if (map.current.getSource('trains')) {
        map.current.removeLayer('trains-layer');
        map.current.removeLayer('trains-labels');
        map.current.removeSource('trains');
      }

      map.current.addSource('trains', {
        type: 'geojson',
        data: trainGeoJSON,
      });

      map.current.addLayer({
        id: 'trains-layer',
        type: 'circle',
        source: 'trains',
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 6,
            15, 10,
            18, 14
          ],
          'circle-stroke-width': is3D ? 3 : 2,
          'circle-stroke-color': is3D ? '#ffffff' : '#000000',
          'circle-opacity': 0.9,
          ...(is3D && {
            'circle-stroke-opacity': 0.8,
          }),
        },
      });

      // Add train line labels
      map.current.addLayer({
        id: 'trains-labels',
        type: 'symbol',
        source: 'trains',
        layout: {
          'text-field': ['get', 'line'],
          'text-font': ['Open Sans Bold'],
          'text-size': 10,
        },
        paint: {
          'text-color': '#ffffff',
        },
        minzoom: 12,
      });
    } else {
      // Remove trains layers
      if (map.current.getLayer('trains-layer')) {
        map.current.removeLayer('trains-layer');
        map.current.removeLayer('trains-labels');
        map.current.removeSource('trains');
      }
    }

    // Add 3D buildings in 3D mode
    if (is3D && !map.current.getLayer('3d-buildings')) {
      map.current.addLayer({
        id: '3d-buildings',
        source: 'openmaptiles',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'render_height'],
          'fill-extrusion-base': ['get', 'render_min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      });
    } else if (!is3D && map.current.getLayer('3d-buildings')) {
      map.current.removeLayer('3d-buildings');
    }
  }, [stations, trains, selectedLines, showStations, showTrains, is3D, mapLoaded]);

  // Update layers when dependencies change
  useEffect(() => {
    updateMapLayers();
  }, [updateMapLayers]);

  // Add click handlers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Station click handler
    const handleStationClick = (e: any) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['stations-layer'],
      });

      if (features.length > 0) {
        const station = features[0].properties;
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        import('maplibre-gl').then((maplibregl) => {
          new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">${station.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${station.borough}</p>
              <div class="flex flex-wrap gap-1">
                ${station.lines.split(',').map((line: string) => `
                  <span class="px-2 py-1 rounded text-white text-xs font-bold" 
                        style="background-color: ${MTA_COLORS[line.trim() as keyof typeof MTA_COLORS] || '#808183'}">
                    ${line.trim()}
                  </span>
                `).join('')}
              </div>
            </div>
          `)
            .addTo(map.current!);
        });
      }
    };

    // Train click handler
    const handleTrainClick = (e: any) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['trains-layer'],
      });

      if (features.length > 0) {
        const train = features[0].properties;
        const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number];

        import('maplibre-gl').then((maplibregl) => {
          new maplibregl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2 flex items-center gap-2">
                <span class="px-2 py-1 rounded text-white text-sm font-bold" 
                      style="background-color: ${train.color}">
                  ${train.line}
                </span>
                Train
              </h3>
              <p class="text-sm mb-1"><strong>To:</strong> ${train.destination}</p>
              <p class="text-sm mb-1"><strong>Next Stop:</strong> ${train.nextStop || 'Unknown'}</p>
              <p class="text-sm mb-1"><strong>Direction:</strong> ${train.direction}</p>
              <p class="text-sm mb-1"><strong>Speed:</strong> ${train.speed} mph</p>
              ${train.delay > 0 ? `<p class="text-sm text-red-600"><strong>Delay:</strong> ${train.delay} min</p>` : ''}
            </div>
          `)
            .addTo(map.current!);
        });
      }
    };

    map.current.on('click', 'stations-layer', handleStationClick);
    map.current.on('click', 'trains-layer', handleTrainClick);

    // Change cursor on hover
    map.current.on('mouseenter', 'stations-layer', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'stations-layer', () => {
      map.current!.getCanvas().style.cursor = '';
    });
    map.current.on('mouseenter', 'trains-layer', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'trains-layer', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    return () => {
      if (map.current) {
        map.current.off('click', 'stations-layer', handleStationClick);
        map.current.off('click', 'trains-layer', handleTrainClick);
      }
    };
  }, [mapLoaded]);

  // Auto-update trains every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadTrains, 30000);
    return () => clearInterval(interval);
  }, [loadTrains]);

  // Toggle line visibility
  const toggleLine = useCallback((line: string) => {
    setSelectedLines(prev => 
      prev.includes(line) 
        ? prev.filter(l => l !== line)
        : [...prev, line]
    );
  }, []);

  // Toggle all lines
  const toggleAllLines = useCallback(() => {
    setSelectedLines(prev => 
      prev.length === SUBWAY_LINES.length ? [] : [...SUBWAY_LINES]
    );
  }, []);

  // Quick tour function
  const startTour = useCallback(() => {
    if (!map.current) return;
    
    const locations = [
      { name: 'Times Square', coords: [-73.9873, 40.7550], zoom: 15 },
      { name: 'Grand Central', coords: [-73.9766, 40.7527], zoom: 15 },
      { name: 'Brooklyn Bridge', coords: [-73.9969, 40.7061], zoom: 15 },
      { name: 'Coney Island', coords: [-73.9814, 40.5773], zoom: 14 },
    ];
    
    let currentLocation = 0;
    
    const flyToNext = () => {
      if (currentLocation >= locations.length) return;
      
      const location = locations[currentLocation];
      map.current!.flyTo({
        center: location.coords as [number, number],
        zoom: location.zoom,
        duration: 3000,
      });
      
      currentLocation++;
      setTimeout(flyToNext, 4000);
    };
    
    flyToNext();
  }, []);

  const filteredStationCount = stations.filter(station =>
    station.lines.some(line => selectedLines.includes(line))
  ).length;

  const filteredTrainCount = trains.filter(train =>
    selectedLines.includes(train.line)
  ).length;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <h3 className="font-bold text-lg mb-3">Map Controls</h3>
        
        {/* 3D Toggle */}
        <div className="mb-4">
          <button
            onClick={toggle3D}
            className={`w-full px-3 py-2 rounded font-semibold transition ${
              is3D 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {is3D ? '3D Mode ON' : '3D Mode OFF'}
          </button>
        </div>

        {/* Map Style Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Map Style</label>
          <select
            value={currentStyle.id}
            onChange={(e) => setCurrentStyle(MAP_STYLES.find(s => s.id === e.target.value) || MAP_STYLES[0])}
            className="w-full px-2 py-1 border rounded text-sm"
          >
            {MAP_STYLES.map(style => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        {/* Layer Toggles */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowStations(!showStations)}
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
                showStations ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Stations
            </button>
            <button
              onClick={() => setShowTrains(!showTrains)}
              className={`flex-1 px-2 py-1 rounded text-xs font-semibold transition ${
                showTrains ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Trains
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <button
            onClick={startTour}
            className="w-full px-3 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition text-sm"
          >
            🎯 Quick Tour
          </button>
        </div>
      </div>

      {/* Line Filter Panel */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">Subway Lines</h3>
          <button
            onClick={toggleAllLines}
            className="text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition"
          >
            {selectedLines.length === SUBWAY_LINES.length ? 'None' : 'All'}
          </button>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mb-4">
          {SUBWAY_LINES.map(line => (
            <button
              key={line}
              onClick={() => toggleLine(line)}
              className={`w-8 h-8 rounded font-bold text-sm transition-all duration-200 ${
                selectedLines.includes(line)
                  ? 'text-white shadow-lg scale-110'
                  : 'text-gray-400 bg-gray-100 opacity-50 hover:opacity-75'
              }`}
              style={{
                backgroundColor: selectedLines.includes(line) 
                  ? MTA_COLORS[line as keyof typeof MTA_COLORS]
                  : undefined
              }}
              title={`${line} Line`}
            >
              {line}
            </button>
          ))}
        </div>
      </div>

      {/* Status Panel */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[200px]">
        <h3 className="font-bold text-sm mb-2">Live Status</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Stations:</span>
            <span className="font-semibold">{filteredStationCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Trains:</span>
            <span className="font-semibold text-green-600">{filteredTrainCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Update:</span>
            <span className="font-semibold">{lastUpdate.toLocaleTimeString()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Updates every 30s
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h3 className="font-bold text-sm mb-2">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-gray-800 rounded-full"></div>
            <span>Subway Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 border border-black rounded-full"></div>
            <span>Active Train</span>
          </div>
        </div>
      </div>
    </div>
  );
}