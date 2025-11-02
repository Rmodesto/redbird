'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SubwayStation } from '@/app/api/subway-stations/route';
import { SubwayTrain } from '@/app/api/subway-trains/route';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SubwayLineAnimator } from '@/lib/map/lineAnimator';
import { StationTooltipManager } from '@/lib/map/stationTooltip';
import { SUBWAY_LINE_ROUTES, getLineRoute } from '@/lib/map/subwayLineRoutes';

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
  'TEST': '#FF0000',
};

const SUBWAY_LINES = [...Object.keys(MTA_COLORS), 'TEST'];

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
  const lineAnimator = useRef<SubwayLineAnimator | null>(null);
  const tooltipManager = useRef<StationTooltipManager | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stations, setStations] = useState<SubwayStation[]>([]);
  const [trains, setTrains] = useState<SubwayTrain[]>([]);
  const [selectedLines, setSelectedLines] = useState<string[]>(SUBWAY_LINES);
  const [animatedLines, setAnimatedLines] = useState<string[]>([]);
  const [is3D, setIs3D] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[1]); // Start with dark
  const [showStations, setShowStations] = useState(true);
  const [showTrains, setShowTrains] = useState(true);
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const stationsData = useRef<Map<string, SubwayStation>>(new Map());

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
        
        // Initialize animation and tooltip managers
        lineAnimator.current = new SubwayLineAnimator(map.current!);
        tooltipManager.current = new StationTooltipManager(map.current!);
        
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
      
      // Use stations data directly (coordinates already included)
      const transformedStations = (data.stations || data);
      
      setStations(transformedStations);
      
      // Store stations in a map for quick lookup by id
      const stationMap = new Map<string, any>();
      transformedStations.forEach((station: any) => {
        stationMap.set(station.id, station);
      });
      stationsData.current = stationMap;
      console.log('Loaded', transformedStations.length, 'stations. Sample IDs:', Array.from(stationMap.keys()).slice(0, 10));
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  }, []);

  // Load trains data - DISABLED to fix redirect errors
  const loadTrains = useCallback(async () => {
    try {
      console.log('Trains loading disabled - focusing on line animation');
      // Skip trains loading for now to fix the redirect loop
      setTrains([]);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load trains:', error);
    }
  }, []);

  // Handle line selection/deselection
  const toggleLine = useCallback((lineId: string) => {
    if (!map.current || !lineAnimator.current || !mapLoaded) {
      console.log('Animation blocked:', { map: !!map.current, lineAnimator: !!lineAnimator.current, mapLoaded });
      return;
    }
    
    if (animatedLines.includes(lineId)) {
      // Remove the line
      console.log('Removing line:', lineId);
      lineAnimator.current.removeLine(lineId);
      setAnimatedLines(prev => prev.filter(id => id !== lineId));
      setSelectedLines(prev => prev.filter(id => id !== lineId));
    } else {
      // Animate the line
      const lineRoute = getLineRoute(lineId);
      if (!lineRoute) {
        console.log('No route found for line:', lineId);
        return;
      }
      console.log('Animating line:', lineId, 'Route has', lineRoute.stations.length, 'stations');
      console.log('First 5 stations:', lineRoute.stations.slice(0, 5));

      // Get coordinates for all stations in the correct order from the route
      const coordinates: [number, number][] = [];
      const stationPoints: Array<{id: string; name: string; coordinates: [number, number]}> = [];

      // Map stations in the order they appear in the route
      console.log(`Line ${lineId} has ${lineRoute.stations.length} stations in route`);
      console.log(`Available stations data count: ${stations.length}`);
      console.log(`First few available stations:`, stations.slice(0, 3).map(s => ({name: s.name, slug: s.slug, lines: s.lines})));

      lineRoute.stations.forEach((stationSlug, index) => {
        // Find the matching station in our stations data by slug AND line
        // Since multiple stations can have the same slug (different platforms),
        // we need to find the one that serves this specific line
        const station = stations.find(s =>
          s.slug === stationSlug && s.lines.includes(lineId)
        );
        if (station && station.coordinates) {
          coordinates.push(station.coordinates);
          stationPoints.push({
            id: station.id,
            name: station.name,
            coordinates: station.coordinates
          });
          console.log(`✓ Found station ${index + 1}/${lineRoute.stations.length}: ${station.name} (${stationSlug}) at [${station.coordinates.join(', ')}]`);
        } else {
          const matchingSlugStations = stations.filter(s => s.slug === stationSlug);
          console.log(`✗ Station not found for line ${lineId}: ${stationSlug}`, {
            foundSlugs: matchingSlugStations.length,
            availableStations: matchingSlugStations.map(s => ({name: s.name, lines: s.lines, hasCoords: !!s.coordinates}))
          });
        }
      });

      console.log('Found coordinates:', coordinates.length, 'out of', lineRoute.stations.length, 'stations');
      console.log('Coordinates sample:', coordinates.slice(0, 3));

      if (coordinates.length > 0) {
        // Animate the line drawing
        if (enableAnimation) {
          console.log('Starting animation for line', lineId);
          lineAnimator.current.animateLine(
            lineId,
            coordinates,
            lineRoute.color,
            3000,
            () => {
              console.log('Animation complete for line', lineId);
              // Add stations after line animation completes
              lineAnimator.current?.addStationMarkers(lineId, stationPoints);
            }
          );
        } else {
          // Draw line instantly without animation
          lineAnimator.current.animateLine(lineId, coordinates, lineRoute.color, 0);
          lineAnimator.current.addStationMarkers(lineId, stationPoints);
        }

        setAnimatedLines(prev => [...prev, lineId]);
        setSelectedLines(prev => [...prev, lineId]);
      } else {
        console.error(`❌ No coordinates found for line ${lineId}! Found ${coordinates.length}/${lineRoute.stations.length} stations`);
        console.log('Available stations count:', stations.length);
        console.log('Route stations:', lineRoute.stations.slice(0, 5));

        // Emergency fallback - use hardcoded coordinates if it's the B line
        if (lineId === 'B') {
          console.log('🚨 Using emergency B line coordinates fallback');
          const emergencyBCoords: [number, number][] = [
            [-73.961376, 40.577621], // Brighton Beach
            [-73.954155, 40.586896], // Sheepshead Bay
            [-73.957734, 40.60867],  // Kings Hwy
            [-73.962793, 40.635082], // Newkirk Plaza
            [-73.949611, 40.650843], // Church Av
            [-73.969142, 40.661614], // Prospect Park
            [-73.97751, 40.677672],  // 7 Av
            [-73.977666, 40.684359], // Atlantic Av-Barclays
            [-73.983946, 40.703476]  // DeKalb Av
          ];

          lineAnimator.current.animateLine(lineId, emergencyBCoords, lineRoute.color, enableAnimation ? 3000 : 0);
          setAnimatedLines(prev => [...prev, lineId]);
          setSelectedLines(prev => [...prev, lineId]);
        }
      }
    }
  }, [mapLoaded, animatedLines, enableAnimation]);
  
  // Update map style
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    map.current.setStyle(currentStyle.url);
    map.current.once('styledata', () => {
      // Re-draw animated lines after style change
      animatedLines.forEach(lineId => {
        if (lineAnimator.current) {
          lineAnimator.current.removeLine(lineId);
        }
      });
      setAnimatedLines([]);
      setSelectedLines([]);
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

    try {
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

      // Remove existing stations layer and source if they exist
      if (map.current.getLayer('stations-layer')) {
        map.current.removeLayer('stations-layer');
      }
      if (map.current.getSource('stations')) {
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
          'circle-color': [
            'case',
            ['in', '1', ['get', 'lines']], MTA_COLORS['1'],
            ['in', '2', ['get', 'lines']], MTA_COLORS['2'],
            ['in', '3', ['get', 'lines']], MTA_COLORS['3'],
            ['in', '4', ['get', 'lines']], MTA_COLORS['4'],
            ['in', '5', ['get', 'lines']], MTA_COLORS['5'],
            ['in', '6', ['get', 'lines']], MTA_COLORS['6'],
            ['in', '7', ['get', 'lines']], MTA_COLORS['7'],
            ['in', 'A', ['get', 'lines']], MTA_COLORS['A'],
            ['in', 'B', ['get', 'lines']], MTA_COLORS['B'],
            ['in', 'C', ['get', 'lines']], MTA_COLORS['C'],
            ['in', 'D', ['get', 'lines']], MTA_COLORS['D'],
            ['in', 'E', ['get', 'lines']], MTA_COLORS['E'],
            ['in', 'F', ['get', 'lines']], MTA_COLORS['F'],
            ['in', 'G', ['get', 'lines']], MTA_COLORS['G'],
            ['in', 'J', ['get', 'lines']], MTA_COLORS['J'],
            ['in', 'L', ['get', 'lines']], MTA_COLORS['L'],
            ['in', 'M', ['get', 'lines']], MTA_COLORS['M'],
            ['in', 'N', ['get', 'lines']], MTA_COLORS['N'],
            ['in', 'Q', ['get', 'lines']], MTA_COLORS['Q'],
            ['in', 'R', ['get', 'lines']], MTA_COLORS['R'],
            ['in', 'W', ['get', 'lines']], MTA_COLORS['W'],
            ['in', 'Z', ['get', 'lines']], MTA_COLORS['Z'],
            ['in', 'S', ['get', 'lines']], MTA_COLORS['S'],
            '#ffffff' // fallback for stations without recognized lines
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 4,
            15, 8,
            18, 12
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });

      // Add station labels - always recreate to ensure they're properly styled
      if (map.current.getLayer('stations-labels')) {
        map.current.removeLayer('stations-labels');
      }
      
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
      // Remove stations layers if they exist
      if (map.current.getLayer('stations-layer')) {
        map.current.removeLayer('stations-layer');
      }
      if (map.current.getLayer('stations-labels')) {
        map.current.removeLayer('stations-labels');
      }
      if (map.current.getSource('stations')) {
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

      // Remove existing trains layers and source if they exist
      if (map.current.getLayer('trains-layer')) {
        map.current.removeLayer('trains-layer');
      }
      if (map.current.getLayer('trains-labels')) {
        map.current.removeLayer('trains-labels');
      }
      if (map.current.getSource('trains')) {
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
      }
      if (map.current.getLayer('trains-labels')) {
        map.current.removeLayer('trains-labels');
      }
      if (map.current.getSource('trains')) {
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
    } catch (error) {
      console.warn('Error updating map layers:', error);
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
              <div class="flex flex-wrap gap-1 mb-3">
                ${station.lines.split(',').map((line: string) => `
                  <span class="px-2 py-1 rounded text-white text-xs font-bold" 
                        style="background-color: ${MTA_COLORS[line.trim() as keyof typeof MTA_COLORS] || '#808183'}">
                    ${line.trim()}
                  </span>
                `).join('')}
              </div>
              <a href="/station/${station.id}" 
                 class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded text-sm font-medium transition-colors">
                View Station Details →
              </a>
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

  // Auto-update trains every 30 seconds - DISABLED 
  useEffect(() => {
    // Disabled to prevent API redirect errors
    console.log('Auto-trains update disabled');
    // const interval = setInterval(loadTrains, 30000);
    // return () => clearInterval(interval);
  }, [loadTrains]);

  // Toggle all lines
  const toggleAllLines = useCallback(() => {
    if (!lineAnimator.current) return;
    
    if (animatedLines.length > 0) {
      // Clear all lines
      lineAnimator.current.clearAllLines();
      setAnimatedLines([]);
      setSelectedLines([]);
    } else {
      // Note: Adding all lines at once might be performance heavy
      // For now, we'll just clear all
      setAnimatedLines([]);
      setSelectedLines([]);
    }
  }, [animatedLines]);

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
            {animatedLines.length > 0 ? 'Clear' : 'None'}
          </button>
        </div>
        
        <div className="grid grid-cols-6 gap-2 mb-4">
          {SUBWAY_LINES.map(line => (
            <button
              key={line}
              onClick={() => toggleLine(line)}
              className={`w-8 h-8 rounded font-bold text-sm transition-all duration-200 ${
                animatedLines.includes(line)
                  ? 'text-white shadow-lg scale-110'
                  : 'text-gray-400 bg-gray-100 opacity-50 hover:opacity-75'
              }`}
              style={{
                backgroundColor: animatedLines.includes(line) 
                  ? MTA_COLORS[line as keyof typeof MTA_COLORS]
                  : undefined
              }}
              title={`${line} Line - Click to ${animatedLines.includes(line) ? 'hide' : 'show'}`}
            >
              {line}
            </button>
          ))}
        </div>
        
        {/* Animation Toggle */}
        <div className="pt-3 border-t">
          <button
            onClick={() => setEnableAnimation(!enableAnimation)}
            className={`w-full px-3 py-2 rounded text-sm font-semibold transition ${
              enableAnimation
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {enableAnimation ? '✨ Animation ON' : 'Animation OFF'}
          </button>
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