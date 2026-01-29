'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Import the station data directly
import stationsData from '@/data/stations-normalized.json';
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
  'S-GC': '#808183', 'S-FR': '#808183', 'S-RK': '#808183',
};

// Hardcoded line configurations
const HARDCODED_LINES: Record<string, { stationCount: number }> = {
  'E': { stationCount: 22 },
  '1': { stationCount: 38 },
  'D': { stationCount: 36 },
  '2': { stationCount: 50 },
  '3': { stationCount: 34 },
  '4': { stationCount: 28 },
  '5': { stationCount: 36 },
  '6': { stationCount: 37 },
  '7': { stationCount: 22 },
  'A': { stationCount: 44 },
  'B': { stationCount: 37 },
  'C': { stationCount: 40 },
  'F': { stationCount: 45 },
  'G': { stationCount: 21 },
  'J': { stationCount: 30 },
  'L': { stationCount: 24 },
  'M': { stationCount: 36 },
  'N': { stationCount: 28 },
  'Q': { stationCount: 29 },
  'R': { stationCount: 45 },
  'W': { stationCount: 23 },
  'Z': { stationCount: 21 },
  'S-GC': { stationCount: 2 },
  'S-FR': { stationCount: 4 },
  'S-RK': { stationCount: 5 }
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
  const [lineMarkers, setLineMarkers] = useState<Record<string, maplibregl.Marker[]>>({});
  const [is3D, setIs3D] = useState(false);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0]);
  const [showStations, setShowStations] = useState(true);
  
  // Use the imported station data directly and transform coordinates format
  const stations: SubwayStation[] = (stationsData as any[]).map(station => ({
    ...station,
    coordinates: [station.longitude, station.latitude]
  }));

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

    // Not using StationTooltipManager - glassmorphic popups only

    // Add controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Wait for map to load
    map.current.on('load', () => {
      console.log('✅ Map loaded');
      setMapLoaded(true);

      // DISABLED: General station system that interferes with our hardcoded trains
      // addStationsToMap();
    });


    const addStationsToMap = () => {
      if (!map.current) return;
      
      console.log('📍 Adding stations to map');
      
      // Create GeoJSON for all stations
      const stationsGeoJSON = {
        type: 'FeatureCollection' as const,
        features: stations.map((station, index) => ({
          type: 'Feature' as const,
          id: index,
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
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            8,
            4
          ],
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

    // Handle S shuttle as a special case - toggle all three shuttles together
    if (lineId === 'S') {
      const shuttleLines = ['S-GC', 'S-FR', 'S-RK'];
      const anyShuttleActive = shuttleLines.some(shuttle => activeLines.includes(shuttle));

      if (anyShuttleActive) {
        // Turn off all shuttles
        shuttleLines.forEach(shuttle => {
          if (activeLines.includes(shuttle)) {
            toggleLine(shuttle);
          }
        });
      } else {
        // Turn on all shuttles
        shuttleLines.forEach(shuttle => {
          if (!activeLines.includes(shuttle)) {
            toggleLine(shuttle);
          }
        });
      }
      return;
    }

    const sourceId = `line-${lineId}`;
    const layerId = `line-layer-${lineId}`;
    const stationsSourceId = `line-stations-${lineId}`;
    const stationsLayerId = `line-stations-layer-${lineId}`;

    if (activeLines.includes(lineId)) {
      // Remove line
      console.log(`Removing line ${lineId}`);
      
      // Remove hardcoded layers for E, 1, and D trains
      if (HARDCODED_LINES[lineId]) {
        // Remove the main line layer
        if (map.current.getLayer(`line-${lineId}`)) {
          map.current.removeLayer(`line-${lineId}`);
        }
        if (map.current.getSource(`line-${lineId}`)) {
          map.current.removeSource(`line-${lineId}`);
        }

        // Remove all markers for this line
        if (lineMarkers[lineId]) {
          lineMarkers[lineId].forEach(marker => marker.remove());
          setLineMarkers(prev => {
            const updated = { ...prev };
            delete updated[lineId];
            return updated;
          });
        }

        // Remove hardcoded station layers and event listeners
        const stationCount = HARDCODED_LINES[lineId].stationCount;
        for (let i = 0; i < stationCount; i++) {
          const stationId = `station-${lineId}-${i}`;
          if (map.current.getLayer(stationId)) {
            map.current.removeLayer(stationId);
          }
          if (map.current.getSource(stationId)) {
            map.current.removeSource(stationId);
          }
        }
      } else {
        // Remove layers for non-hardcoded lines
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
      }
      
      setActiveLines(prev => prev.filter(id => id !== lineId));
    } else {
      // Add line
      console.log(`Adding line ${lineId}`);

      // HARDCODED TRAIN IMPLEMENTATIONS
      if (lineId === 'E') {
        console.log('🔵 Using hardcoded E train coordinates (WORKING FIX)');
        const eLineCoords: [number, number][] = [
          [-73.801109, 40.702147], // Jamaica Center-Parsons/Archer
          [-73.807969, 40.700486], // Sutphin Blvd-Archer Av-JFK Airport
          [-73.816859, 40.702566], // Jamaica-Van Wyck
          [-73.820574, 40.709179], // Briarwood
          [-73.831008, 40.714441], // Kew Gardens-Union Tpke
          [-73.837324, 40.718331], // 75 Av
          [-73.844521, 40.721691], // Forest Hills-71 Av
          [-73.891366, 40.746746], // Jackson Hts-Roosevelt Av
          [-73.937243, 40.748973], // Queens Plaza
          [-73.945032, 40.747141], // Court Sq-23 St
          [-73.970488, 40.757330], // Lexington Av/53 St
          [-73.975224, 40.760167], // 5 Av/53 St
          [-73.981637, 40.762862], // 7 Av
          [-73.985984, 40.762456], // 50 St
          [-73.987581, 40.755746], // Times Sq-42 St
          [-73.993391, 40.752287], // 34 St-Penn Station
          [-73.998041, 40.745906], // 23 St
          [-74.002134, 40.740335], // 14 St
          [-74.000495, 40.732338], // W 4 St-Wash Sq
          [-74.003739, 40.726227], // Spring St
          [-74.005229, 40.720824], // Canal St
          [-74.009266, 40.713243], // Chambers St (8th Ave - A/C/E platform)
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: eLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const eLineStations = [
          { name: "Jamaica Center-Parsons/Archer", coordinates: [-73.801109, 40.702147], lines: ['E'] },
          { name: "Sutphin Blvd-Archer Av-JFK Airport", coordinates: [-73.807969, 40.700486], lines: ['E'] },
          { name: "Jamaica-Van Wyck", coordinates: [-73.816859, 40.702566], lines: ['E'] },
          { name: "Briarwood", coordinates: [-73.820574, 40.709179], lines: ['E'] },
          { name: "Kew Gardens-Union Tpke", coordinates: [-73.831008, 40.714441], lines: ['E'] },
          { name: "75 Av", coordinates: [-73.837324, 40.718331], lines: ['E'] },
          { name: "Forest Hills-71 Av", coordinates: [-73.844521, 40.721691], lines: ['E', 'F'] },
          { name: "Jackson Hts-Roosevelt Av", coordinates: [-73.891366, 40.746746], lines: ['E', 'F', 'M', 'R', '7'] },
          { name: "Queens Plaza", coordinates: [-73.937243, 40.748973], lines: ['E', 'M', 'R'] },
          { name: "Court Sq-23 St", coordinates: [-73.945032, 40.747141], lines: ['E', 'M', '7'] },
          { name: "Lexington Av/53 St", coordinates: [-73.970488, 40.757330], lines: ['E', 'M', '6'] },
          { name: "5 Av/53 St", coordinates: [-73.975224, 40.760167], lines: ['E', 'M'] },
          { name: "7 Av", coordinates: [-73.981637, 40.762862], lines: ['E', 'B', 'D'] },
          { name: "50 St", coordinates: [-73.985984, 40.762456], lines: ['C', 'E'] },
          { name: "Times Sq-42 St", coordinates: [-73.987581, 40.755746], lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S', 'A', 'C', 'E'] },
          { name: "34 St-Penn Station", coordinates: [-73.993391, 40.752287], lines: ['A', 'C', 'E'] },
          { name: "23 St", coordinates: [-73.998041, 40.745906], lines: ['A', 'C', 'E'] },
          { name: "14 St", coordinates: [-74.002134, 40.740335], lines: ['A', 'C', 'E'] },
          { name: "W 4 St-Wash Sq", coordinates: [-74.000495, 40.732338], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: "Spring St", coordinates: [-74.003739, 40.726227], lines: ['C', 'E'] },
          { name: "Canal St", coordinates: [-74.005229, 40.720824], lines: ['A', 'C', 'E'] },
          { name: "Chambers St (8th Ave A/C/E)", coordinates: [-74.009266, 40.713243], lines: ['A', 'C', 'E'] },
        ];

        eLineStations.forEach((station, index) => {
          const stationId = `station-${lineId}-${index}`;
          if (!map.current!.getSource(stationId)) {
            map.current!.addSource(stationId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: { name: station.name },
                geometry: {
                  type: 'Point',
                  coordinates: station.coordinates,
                },
              },
            });
          }
          if (!map.current!.getLayer(stationId)) {
            map.current!.addLayer({
              id: stationId,
              type: 'circle',
              source: stationId,
              paint: {
                'circle-radius': 8,
                'circle-color': MTA_COLORS[lineId] || '#000000',
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
              },
            });
          }

          let hoverPopup: maplibregl.Popup | null = null;

          map.current!.on('mouseenter', stationId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';

              // Use platform-specific lines from our hardcoded station data
              const stationData = eLineStations[index];
              const allLines = stationData.lines || [lineId];

              hoverPopup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'glassmorphic-tooltip',
                offset: 25,
                maxWidth: '280px'
              })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="glassmorphic-tooltip-content">
                    <div class="font-semibold text-sm mb-2">${stationName}</div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                              style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });

          map.current!.on('mouseleave', stationId, () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });
        });

        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded E train added successfully with ${eLineStations.length} stations`);
        return;
      }

      if (lineId === '1') {
        console.log('🔴 Using hardcoded 1 train coordinates');
        const oneLineCoords: [number, number][] = [
          [-73.898583, 40.889248], // Van Cortlandt Park-242 St
          [-73.90087, 40.884667], // 238 St
          [-73.904834, 40.878856], // 231 St
          [-73.909831, 40.874561], // Marble Hill-225 St
          [-73.915279, 40.869444], // 215 St
          [-73.918822, 40.864621], // 207 St
          [-73.925536, 40.860531], // Dyckman St
          [-73.929412, 40.855225], // 191 St
          [-73.933596, 40.849505], // 181 St
          [-73.939847, 40.8406375], // 168 St
          [-73.94489, 40.834041], // 157 St
          [-73.95036, 40.826551], // 145 St
          [-73.953676, 40.822008], // 137 St-City College
          [-73.958372, 40.815581], // 125 St
          [-73.96411, 40.807722], // 116 St-Columbia University
          [-73.966847, 40.803967], // Cathedral Pkwy (110 St)
          [-73.968379, 40.799446], // 103 St
          [-73.972323, 40.793919], // 96 St
          [-73.976218, 40.788644], // 86 St
          [-73.979917, 40.783934], // 79 St
          [-73.98197, 40.778453], // 72 St
          [-73.982209, 40.77344], // 66 St-Lincoln Center
          [-73.9818325, 40.7682715], // 59 St-Columbus Circle
          [-73.983849, 40.761728], // 50 St
          [-73.9875808, 40.755746], // Times Sq-42 St
          [-73.991057, 40.750373], // 34 St-Penn Station
          [-73.993365, 40.747215], // 28 St
          [-73.995657, 40.744081], // 23 St
          [-73.997871, 40.74104], // 18 St
          [-73.999704, 40.73779633333333], // 14 St-7 Av
          [-74.002906, 40.733422], // Christopher St-Stonewall
          [-74.005367, 40.728251], // Houston St
          [-74.006277, 40.722854], // Canal St
          [-74.006886, 40.719318], // Franklin St
          [-74.009266, 40.715478], // Chambers St
          [-74.012188, 40.711835], // WTC Cortlandt
          [-74.013783, 40.707513], // Rector St
          [-74.013329, 40.7025775], // Whitehall St-South Ferry
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: oneLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        // Add stations for 1 train
        const oneLineStations = [
          { name: "Van Cortlandt Park-242 St", coordinates: [-73.898583, 40.889248], lines: ['1'] },
          { name: "238 St", coordinates: [-73.90087, 40.884667], lines: ['1'] },
          { name: "231 St", coordinates: [-73.904834, 40.878856], lines: ['1'] },
          { name: "Marble Hill-225 St", coordinates: [-73.909831, 40.874561], lines: ['1'] },
          { name: "215 St", coordinates: [-73.915279, 40.869444], lines: ['1'] },
          { name: "207 St", coordinates: [-73.918822, 40.864621], lines: ['1'] },
          { name: "Dyckman St", coordinates: [-73.925536, 40.860531], lines: ['1'] },
          { name: "191 St", coordinates: [-73.929412, 40.855225], lines: ['1'] },
          { name: "181 St", coordinates: [-73.933596, 40.849505], lines: ['1'] },
          { name: "168 St", coordinates: [-73.939847, 40.8406375], lines: ['1', 'A', 'C'] },
          { name: "157 St", coordinates: [-73.94489, 40.834041], lines: ['1'] },
          { name: "145 St", coordinates: [-73.95036, 40.826551], lines: ['1'] },
          { name: "137 St-City College", coordinates: [-73.953676, 40.822008], lines: ['1'] },
          { name: "125 St", coordinates: [-73.958372, 40.815581], lines: ['1'] },
          { name: "116 St-Columbia University", coordinates: [-73.96411, 40.807722], lines: ['1'] },
          { name: "Cathedral Pkwy (110 St)", coordinates: [-73.966847, 40.803967], lines: ['1'] },
          { name: "103 St", coordinates: [-73.968379, 40.799446], lines: ['1'] },
          { name: "96 St", coordinates: [-73.972323, 40.793919], lines: ['1', '2', '3'] },
          { name: "86 St", coordinates: [-73.976218, 40.788644], lines: ['1'] },
          { name: "79 St", coordinates: [-73.979917, 40.783934], lines: ['1'] },
          { name: "72 St", coordinates: [-73.98197, 40.778453], lines: ['1', '2', '3'] },
          { name: "66 St-Lincoln Center", coordinates: [-73.982209, 40.77344], lines: ['1'] },
          { name: "59 St-Columbus Circle", coordinates: [-73.9818325, 40.7682715], lines: ['1', 'A', 'B', 'C', 'D'] },
          { name: "50 St", coordinates: [-73.983849, 40.761728], lines: ['1'] },
          { name: "Times Sq-42 St", coordinates: [-73.9875808, 40.755746], lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S', 'A', 'C', 'E'] },
          { name: "34 St-Penn Station", coordinates: [-73.991057, 40.750373], lines: ['1', '2', '3'] },
          { name: "28 St", coordinates: [-73.993365, 40.747215], lines: ['1'] },
          { name: "23 St", coordinates: [-73.995657, 40.744081], lines: ['1'] },
          { name: "18 St", coordinates: [-73.997871, 40.74104], lines: ['1'] },
          { name: "14 St-7 Av", coordinates: [-73.999704, 40.73779633333333], lines: ['1', '2', '3'] },
          { name: "Christopher St-Stonewall", coordinates: [-74.002906, 40.733422], lines: ['1'] },
          { name: "Houston St", coordinates: [-74.005367, 40.728251], lines: ['1'] },
          { name: "Canal St", coordinates: [-74.006277, 40.722854], lines: ['1'] },
          { name: "Franklin St", coordinates: [-74.006886, 40.719318], lines: ['1'] },
          { name: "Chambers St", coordinates: [-74.009266, 40.715478], lines: ['1', '2', '3'] },
          { name: "WTC Cortlandt", coordinates: [-74.012188, 40.711835], lines: ['1'] },
          { name: "Rector St", coordinates: [-74.013783, 40.707513], lines: ['1'] },
          { name: "Whitehall St-South Ferry", coordinates: [-74.013329, 40.7025775], lines: ['1', 'R', 'W'] },
        ];

        oneLineStations.forEach((station, index) => {
          const stationId = `station-${lineId}-${index}`;
          if (!map.current!.getSource(stationId)) {
            map.current!.addSource(stationId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: { name: station.name },
                geometry: {
                  type: 'Point',
                  coordinates: station.coordinates,
                },
              },
            });
          }
          if (!map.current!.getLayer(stationId)) {
            map.current!.addLayer({
              id: stationId,
              type: 'circle',
              source: stationId,
              paint: {
                'circle-radius': 8,
                'circle-color': MTA_COLORS[lineId] || '#000000',
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
              },
            });
          }

          let hoverPopup: maplibregl.Popup | null = null;

          map.current!.on('mouseenter', stationId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';

              // Use platform-specific lines from our hardcoded station data
              const stationData = oneLineStations[index];
              const allLines = stationData.lines || [lineId];

              hoverPopup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'glassmorphic-tooltip',
                offset: 25,
                maxWidth: '280px'
              })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="glassmorphic-tooltip-content">
                    <div class="font-semibold text-sm mb-2">${stationName}</div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                              style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });

          map.current!.on('mouseleave', stationId, () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          map.current!.on('click', stationId, (e) => {
            e.preventDefault();
            e.originalEvent.stopPropagation();
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';
              let transfers = 'None';

              // Use platform-specific lines from our hardcoded station data
              const stationData = oneLineStations[index];
              const allLines = stationData.lines || [lineId];
              transfers = allLines.filter(line => line !== lineId).join(', ') || 'None';

              new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'dark-glassmorphic-popup',
                offset: 25,
                maxWidth: '280px'
              })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="dark-tooltip-content">
                    <div class="font-semibold text-base text-white mb-2">
                      ${stationName}
                    </div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${stationName === 'Chambers St (8th Ave A/C/E)' ?
                        ['A', 'C', 'E'].map(line => `
                          <span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                                style="background-color: ${MTA_COLORS[line]}">
                            ${line}
                          </span>
                        `).join('') :
                        `<span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                               style="background-color: ${MTA_COLORS[lineId]}">
                           ${lineId}
                         </span>
                         ${transfers !== 'None' ? transfers.split(', ').map(line => `
                           <span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                                 style="background-color: ${MTA_COLORS[line.trim()] || '#808183'}">
                             ${line.trim()}
                           </span>
                         `).join('') : ''}`
                      }
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });
        });

        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 1 train added successfully with ${oneLineStations.length} stations`);
        return;
      }
      if (lineId === 'D') {
        console.log('🟠 Using hardcoded D train coordinates');
        const dLineCoords: [number, number][] = [
          [-73.878855, 40.874811], // Norwood-205 St
          [-73.887138, 40.873244], // Bedford Park Blvd
          [-73.893509, 40.866978], // Kingsbridge Rd
          [-73.897749, 40.861296], // Fordham Rd
          [-73.905227, 40.85041], // Tremont Av
          [-73.900741, 40.856093], // 182-183 Sts
          [-73.910136, 40.8459], // 174-175 Sts
          [-73.9134, 40.839306], // 170 St
          [-73.91844, 40.833771], // 167 St
          [-73.925741, 40.8279495], // 161 St-Yankee Stadium
          [-73.938209, 40.830135], // 155 St
          [-73.944216, 40.824783], // 145 St
          [-73.952343, 40.811109], // 125 St
          [-73.9818325, 40.7682715], // 59 St-Columbus Circle
          [-73.981637, 40.762862], // 7 Av
          [-73.981329, 40.758663], // 47-50 Sts-Rockefeller Ctr
          [-73.98326599999999, 40.7540215], // 42 St-Bryant Pk
          [-73.9878865, 40.749643], // 34 St-Herald Sq
          [-74.000495, 40.732338], // W 4 St-Wash Sq
          [-73.9954315, 40.725606], // Broadway-Lafayette St
          [-73.993753, 40.718267], // Grand St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-74.003549, 40.655144], // 36 St
          [-73.994324, 40.646292], // 9 Av
          [-73.994304, 40.640914], // Fort Hamilton Pkwy
          [-73.994791, 40.63626], // 50 St
          [-73.995476, 40.631435], // 55 St
          [-73.996624, 40.625657000000004], // 62 St
          [-73.998864, 40.619589], // 71 St
          [-74.00061, 40.613501], // 79 St
          [-74.001736, 40.607954], // 18 Av
          [-73.998168, 40.604556], // 20 Av
          [-73.993728, 40.601875], // Bay Pkwy
          [-73.986829, 40.597704], // 25 Av
          [-73.983765, 40.588841], // Bay 50 St
          [-73.981233, 40.577422], // Coney Island-Stillwell Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: dLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        // Add stations for D train
        const dLineStations = [
          { name: "Norwood-205 St", coordinates: [-73.878855, 40.874811], lines: ['D'] },
          { name: "Bedford Park Blvd", coordinates: [-73.887138, 40.873244], lines: ['B', 'D'] },
          { name: "Kingsbridge Rd", coordinates: [-73.893509, 40.866978], lines: ['B', 'D'] },
          { name: "Fordham Rd", coordinates: [-73.897749, 40.861296], lines: ['B', 'D'] },
          { name: "Tremont Av", coordinates: [-73.905227, 40.85041], lines: ['B', 'D'] },
          { name: "182-183 Sts", coordinates: [-73.900741, 40.856093], lines: ['B', 'D'] },
          { name: "174-175 Sts", coordinates: [-73.910136, 40.8459], lines: ['B', 'D'] },
          { name: "170 St", coordinates: [-73.9134, 40.839306], lines: ['B', 'D'] },
          { name: "167 St", coordinates: [-73.91844, 40.833771], lines: ['B', 'D'] },
          { name: "161 St-Yankee Stadium", coordinates: [-73.925741, 40.8279495], lines: ['4', 'B', 'D'] },
          { name: "155 St", coordinates: [-73.938209, 40.830135], lines: ['B', 'D'] },
          { name: "145 St", coordinates: [-73.944216, 40.824783], lines: ['A', 'B', 'C', 'D'] },
          { name: "125 St", coordinates: [-73.952343, 40.811109], lines: ['A', 'B', 'C', 'D'] },
          { name: "59 St-Columbus Circle", coordinates: [-73.9818325, 40.7682715], lines: ['1', 'A', 'B', 'C', 'D'] },
          { name: "7 Av", coordinates: [-73.981637, 40.762862], lines: ['B', 'D', 'E'] },
          { name: "47-50 Sts-Rockefeller Ctr", coordinates: [-73.981329, 40.758663], lines: ['B', 'D', 'F', 'M'] },
          { name: "42 St-Bryant Pk", coordinates: [-73.98326599999999, 40.7540215], lines: ['7', 'B', 'D', 'F', 'M'] },
          { name: "34 St-Herald Sq", coordinates: [-73.9878865, 40.749643], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: "W 4 St-Wash Sq", coordinates: [-74.000495, 40.732338], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: "Broadway-Lafayette St", coordinates: [-73.9954315, 40.725606], lines: ['6', 'B', 'D', 'F', 'M'] },
          { name: "Grand St", coordinates: [-73.993753, 40.718267], lines: ['B', 'D'] },
          { name: "Atlantic Av-Barclays Ctr", coordinates: [-73.97778866666665, 40.68416166666667], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: "36 St", coordinates: [-74.003549, 40.655144], lines: ['D', 'N', 'R'] },
          { name: "9 Av", coordinates: [-73.994324, 40.646292], lines: ['D'] },
          { name: "Fort Hamilton Pkwy", coordinates: [-73.994304, 40.640914], lines: ['D'] },
          { name: "50 St", coordinates: [-73.994791, 40.63626], lines: ['D'] },
          { name: "55 St", coordinates: [-73.995476, 40.631435], lines: ['D'] },
          { name: "62 St", coordinates: [-73.996624, 40.625657000000004], lines: ['D', 'N'] },
          { name: "71 St", coordinates: [-73.998864, 40.619589], lines: ['D'] },
          { name: "79 St", coordinates: [-74.00061, 40.613501], lines: ['D'] },
          { name: "18 Av", coordinates: [-74.001736, 40.607954], lines: ['D'] },
          { name: "20 Av", coordinates: [-73.998168, 40.604556], lines: ['D'] },
          { name: "Bay Pkwy", coordinates: [-73.993728, 40.601875], lines: ['D'] },
          { name: "25 Av", coordinates: [-73.986829, 40.597704], lines: ['D'] },
          { name: "Bay 50 St", coordinates: [-73.983765, 40.588841], lines: ['D'] },
          { name: "Coney Island-Stillwell Av", coordinates: [-73.981233, 40.577422], lines: ['D', 'F', 'N', 'Q'] },
        ];

        dLineStations.forEach((station, index) => {
          const stationId = `station-${lineId}-${index}`;
          if (!map.current!.getSource(stationId)) {
            map.current!.addSource(stationId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: { name: station.name },
                geometry: {
                  type: 'Point',
                  coordinates: station.coordinates,
                },
              },
            });
          }
          if (!map.current!.getLayer(stationId)) {
            map.current!.addLayer({
              id: stationId,
              type: 'circle',
              source: stationId,
              paint: {
                'circle-radius': 8,
                'circle-color': MTA_COLORS[lineId] || '#000000',
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
              },
            });
          }

          let hoverPopup: maplibregl.Popup | null = null;

          map.current!.on('mouseenter', stationId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';

              // Use platform-specific lines from our hardcoded station data
              const stationData = dLineStations[index];
              const allLines = stationData.lines || [lineId];

              hoverPopup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'glassmorphic-tooltip',
                offset: 25,
                maxWidth: '280px'
              })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="glassmorphic-tooltip-content">
                    <div class="font-semibold text-sm mb-2">${stationName}</div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                              style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });

          map.current!.on('mouseleave', stationId, () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          map.current!.on('click', stationId, (e) => {
            e.preventDefault();
            e.originalEvent.stopPropagation();
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';
              let transfers = 'None';

              // Use platform-specific lines from our hardcoded station data
              const stationData = dLineStations[index];
              const allLines = stationData.lines || [lineId];

              if (allLines.length > 1) {
                transfers = allLines.filter(line => line !== lineId).join(', ');
              }

              new maplibregl.Popup({ closeOnClick: false, className: 'dark-tooltip' })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="dark-tooltip-content">
                    <div class="font-semibold text-base text-white mb-2">
                      ${stationName}
                    </div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                              style="background-color: ${MTA_COLORS[line]}">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });
        });

        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded D train added successfully with ${dLineStations.length} stations`);
        return;
      }
      if (lineId === '2') {
        console.log('🔴 Using hardcoded 2 train coordinates');
        const markersForLine: maplibregl.Marker[] = [];
        const twoLineCoords: [number, number][] = [
          [-73.947642, 40.632836], // Flatbush Av-Brooklyn College
          [-73.948411, 40.639967], // Newkirk Av-Little Haiti
          [-73.948959, 40.645098], // Beverly Rd
          [-73.949575, 40.650843], // Church Av
          [-73.9502, 40.656652], // Winthrop St
          [-73.95085, 40.662742], // Sterling St
          [-73.950683, 40.667883], // President St-Medgar Evers College
          [-73.958688, 40.6705125], // Botanic Garden
          [-73.958416, 40.674249], // Franklin Av
          [-73.964375, 40.671987], // Eastern Pkwy-Brooklyn Museum
          [-73.971046, 40.675235], // Grand Army Plaza
          [-73.975098, 40.680829], // Bergen St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.980492, 40.688246], // Nevins St
          [-73.985065, 40.690545], // Hoyt St
          [-73.989998, 40.693219], // Borough Hall
          [-73.993086, 40.697466], // Clark St
          [-74.0091, 40.706821], // Wall St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.009266, 40.715478], // Chambers St
          [-73.989862, 40.734803], // 14 St
          [-73.991057, 40.750373], // 34 St-Penn Station
          [-73.9875808, 40.755746], // Times Sq-42 St
          [-73.98197, 40.778453], // 72 St
          [-73.972323, 40.793919], // 96 St
          [-73.968379, 40.799446], // 103 St
          [-73.951822, 40.799075], // 110 St-Malcolm X Plaza
          [-73.949625, 40.802098], // 116 St
          [-73.945495, 40.807754], // 125 St
          [-73.94077, 40.814229], // 135 St
          [-73.92703449999999, 40.8183925], // 149 St-Grand Concourse
          [-73.917757, 40.816109], // 3 Av-149 St
          [-73.907807, 40.81649], // Jackson Av
          [-73.90177, 40.819585], // Prospect Av
          [-73.896736, 40.822181], // Intervale Av
          [-73.893064, 40.824073], // Simpson St
          [-73.891865, 40.829993], // Freeman St
          [-73.887734, 40.837288], // 174 St
          [-73.880049, 40.840295], // West Farms Sq-E Tremont Av
          [-73.873488, 40.841894], // E 180 St
          [-73.868457, 40.848828], // Bronx Park East
          [-73.867615, 40.857192], // Pelham Pkwy
          [-73.867352, 40.865462], // Allerton Av
          [-73.867164, 40.871356], // Burke Av
          [-73.866256, 40.87785], // Gun Hill Rd
          [-73.862633, 40.883895], // 219 St
          [-73.860341, 40.888022], // 225 St
          [-73.857473, 40.893193], // 233 St
          [-73.854376, 40.898379], // Nereid Av
          [-73.85062, 40.903125], // Wakefield-241 St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: twoLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        // Add stations for 2 train
        const twoLineStations = [
          { name: "Flatbush Av-Brooklyn College", coordinates: [-73.947642, 40.632836], lines: ['2', '5'] },
          { name: "Newkirk Av-Little Haiti", coordinates: [-73.948411, 40.639967], lines: ['2', '5'] },
          { name: "Beverly Rd", coordinates: [-73.948959, 40.645098], lines: ['2', '5'] },
          { name: "Church Av", coordinates: [-73.949575, 40.650843], lines: ['2', '5'] },
          { name: "Winthrop St", coordinates: [-73.9502, 40.656652], lines: ['2', '5'] },
          { name: "Sterling St", coordinates: [-73.95085, 40.662742], lines: ['2', '5'] },
          { name: "President St-Medgar Evers College", coordinates: [-73.950683, 40.667883], lines: ['2', '5'] },
          { name: "Botanic Garden", coordinates: [-73.958688, 40.6705125], lines: ['2', '4', '5', 'S'] },
          { name: "Franklin Av", coordinates: [-73.958416, 40.674249], lines: ['2', '3', '4', '5', 'S'] },
          { name: "Eastern Pkwy-Brooklyn Museum", coordinates: [-73.964375, 40.671987], lines: ['2', '3'] },
          { name: "Grand Army Plaza", coordinates: [-73.971046, 40.675235], lines: ['2', '3'] },
          { name: "Bergen St", coordinates: [-73.975098, 40.680829], lines: ['2', '3'] },
          { name: "Atlantic Av-Barclays Ctr", coordinates: [-73.97778866666665, 40.68416166666667], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: "Nevins St", coordinates: [-73.980492, 40.688246], lines: ['2', '3', '4', '5'] },
          { name: "Hoyt St", coordinates: [-73.985065, 40.690545], lines: ['2', '3'] },
          { name: "Borough Hall", coordinates: [-73.989998, 40.693219], lines: ['2', '3', '4', '5', 'R'] },
          { name: "Clark St", coordinates: [-73.993086, 40.697466], lines: ['2', '3'] },
          { name: "Wall St", coordinates: [-74.0091, 40.706821], lines: ['2', '3'] },
          { name: "Fulton St", coordinates: [-74.00783824999999, 40.71008875], lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
          { name: "Chambers St", coordinates: [-74.009266, 40.715478], lines: ['1', '2', '3'] },
          { name: "14 St", coordinates: [-73.989862, 40.734803], lines: ['2', '3'] },
          { name: "34 St-Penn Station", coordinates: [-73.991057, 40.750373], lines: ['1', '2', '3'] },
          { name: "Times Sq-42 St", coordinates: [-73.9875808, 40.755746], lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S', 'A', 'C', 'E'] },
          { name: "72 St", coordinates: [-73.98197, 40.778453], lines: ['1', '2', '3'] },
          { name: "96 St", coordinates: [-73.972323, 40.793919], lines: ['1', '2', '3'] },
          { name: "103 St", coordinates: [-73.968379, 40.799446], lines: ['1'] },
          { name: "110 St-Malcolm X Plaza", coordinates: [-73.951822, 40.799075], lines: ['2', '3'] },
          { name: "116 St", coordinates: [-73.949625, 40.802098], lines: ['2', '3'] },
          { name: "125 St", coordinates: [-73.945495, 40.807754], lines: ['2', '3'] },
          { name: "135 St", coordinates: [-73.94077, 40.814229], lines: ['2', '3'] },
          { name: "149 St-Grand Concourse", coordinates: [-73.92703449999999, 40.8183925], lines: ['2', '4', '5'] },
          { name: "3 Av-149 St", coordinates: [-73.917757, 40.816109], lines: ['2', '5'] },
          { name: "Jackson Av", coordinates: [-73.907807, 40.81649], lines: ['2', '5'] },
          { name: "Prospect Av", coordinates: [-73.90177, 40.819585], lines: ['2', '5'] },
          { name: "Intervale Av", coordinates: [-73.896736, 40.822181], lines: ['2', '5'] },
          { name: "Simpson St", coordinates: [-73.893064, 40.824073], lines: ['2', '5'] },
          { name: "Freeman St", coordinates: [-73.891865, 40.829993], lines: ['2', '5'] },
          { name: "174 St", coordinates: [-73.887734, 40.837288], lines: ['2', '5'] },
          { name: "West Farms Sq-E Tremont Av", coordinates: [-73.880049, 40.840295], lines: ['2', '5'] },
          { name: "E 180 St", coordinates: [-73.873488, 40.841894], lines: ['2', '5'] },
          { name: "Bronx Park East", coordinates: [-73.868457, 40.848828], lines: ['2', '5'] },
          { name: "Pelham Pkwy", coordinates: [-73.867615, 40.857192], lines: ['2', '5'] },
          { name: "Allerton Av", coordinates: [-73.867352, 40.865462], lines: ['2', '5'] },
          { name: "Burke Av", coordinates: [-73.867164, 40.871356], lines: ['2', '5'] },
          { name: "Gun Hill Rd", coordinates: [-73.866256, 40.87785], lines: ['2', '5'] },
          { name: "219 St", coordinates: [-73.862633, 40.883895], lines: ['2', '5'] },
          { name: "225 St", coordinates: [-73.860341, 40.888022], lines: ['2', '5'] },
          { name: "233 St", coordinates: [-73.857473, 40.893193], lines: ['2', '5'] },
          { name: "Nereid Av", coordinates: [-73.854376, 40.898379], lines: ['2', '5'] },
          { name: "Wakefield-241 St", coordinates: [-73.85062, 40.903125], lines: ['2', '5'] },
        ];

        twoLineStations.forEach((station, index) => {
          const stationId = `station-${lineId}-${index}`;
          if (!map.current!.getSource(stationId)) {
            map.current!.addSource(stationId, {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: { name: station.name },
                geometry: {
                  type: 'Point',
                  coordinates: station.coordinates,
                },
              },
            });
          }
          if (!map.current!.getLayer(stationId)) {
            map.current!.addLayer({
              id: stationId,
              type: 'circle',
              source: stationId,
              paint: {
                'circle-radius': 8,
                'circle-color': MTA_COLORS[lineId] || '#000000',
                'circle-stroke-width': 3,
                'circle-stroke-color': '#ffffff',
              },
            });
          }

          let hoverPopup: maplibregl.Popup | null = null;

          map.current!.on('mouseenter', stationId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';

              // Use platform-specific lines from our hardcoded station data
              const stationData = twoLineStations[index];
              const allLines = stationData.lines || [lineId];

              hoverPopup = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'glassmorphic-tooltip',
                offset: 25,
                maxWidth: '280px'
              })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="glassmorphic-tooltip-content">
                    <div class="font-semibold text-sm mb-2">${stationName}</div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                              style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });

          map.current!.on('mouseleave', stationId, () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          map.current!.on('click', stationId, (e) => {
            e.preventDefault();
            e.originalEvent.stopPropagation();
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const coordinates = (feature.geometry as any).coordinates.slice();
              const stationName = feature.properties?.name || 'Unknown Station';

              // Use platform-specific lines from our hardcoded station data
              const stationData = twoLineStations[index];
              const allLines = stationData.lines || [lineId];

              new maplibregl.Popup({ closeOnClick: false, className: 'dark-tooltip' })
                .setLngLat(coordinates)
                .setHTML(`
                  <div class="dark-tooltip-content">
                    <div class="font-semibold text-base text-white mb-2">
                      ${stationName}
                    </div>
                    <div class="flex gap-1.5 flex-wrap">
                      ${allLines.map(line => `
                        <span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                              style="background-color: ${MTA_COLORS[line]}">
                          ${line}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                `)
                .addTo(map.current!);
            }
          });
        });

        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 2 train added successfully with ${twoLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE 3 IMPLEMENTATION
      if (lineId === '3') {
        const markersForLine: maplibregl.Marker[] = [];
        const threeLineCoords: [number, number][] = [
          [-73.884079, 40.666235], // New Lots Av
          [-73.889395, 40.665449], // Van Siclen Av
          [-73.894895, 40.664635], // Pennsylvania Av
          [-73.902447, 40.663515], // Junius St
          [-73.908946, 40.662549], // Rockaway Av
          [-73.916327, 40.661453], // Saratoga Av
          [-73.92261, 40.664717], // Sutter Av-Rutland Rd
          [-73.932942, 40.668897], // Crown Hts-Utica Av
          [-73.942161, 40.669399], // Kingston Av
          [-73.950466, 40.669847], // Nostrand Av
          [-73.958688, 40.6705125], // Botanic Garden
          [-73.964375, 40.671987], // Eastern Pkwy-Brooklyn Museum
          [-73.971046, 40.675235], // Grand Army Plaza
          [-73.975098, 40.680829], // Bergen St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.980492, 40.688246], // Nevins St
          [-73.985065, 40.690545], // Hoyt St
          [-73.990642, 40.693241], // Court St
          [-73.993086, 40.697466], // Clark St
          [-74.0091, 40.706821], // Wall St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.0095515, 40.712603], // Cortlandt St
          [-74.009266, 40.715478], // Chambers St
          [-73.989862, 40.734803], // 14 St
          [-73.991057, 40.750373], // 34 St-Penn Station
          [-73.9875808, 40.755746], // Times Sq-42 St
          [-73.98197, 40.778453], // 72 St
          [-73.972323, 40.793919], // 96 St
          [-73.951822, 40.799075], // 110 St-Malcolm X Plaza
          [-73.949625, 40.802098], // 116 St
          [-73.945495, 40.807754], // 125 St
          [-73.94077, 40.814229], // 135 St
          [-73.936245, 40.820421], // 145 St
          [-73.93647, 40.82388], // Harlem-148 St
        ];

        // Add line to map
        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: threeLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        // Add line layer
        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
        }

        const threeLineStations = [
          { name: "New Lots Av", coordinates: [-73.884079, 40.666235], lines: ["3"] },
          { name: "Van Siclen Av", coordinates: [-73.889395, 40.665449], lines: ["3"] },
          { name: "Pennsylvania Av", coordinates: [-73.894895, 40.664635], lines: ["3"] },
          { name: "Junius St", coordinates: [-73.902447, 40.663515], lines: ["3"] },
          { name: "Rockaway Av", coordinates: [-73.908946, 40.662549], lines: ["3"] },
          { name: "Saratoga Av", coordinates: [-73.916327, 40.661453], lines: ["3"] },
          { name: "Sutter Av-Rutland Rd", coordinates: [-73.92261, 40.664717], lines: ["3"] },
          { name: "Crown Hts-Utica Av", coordinates: [-73.932942, 40.668897], lines: ["3","4"] },
          { name: "Kingston Av", coordinates: [-73.942161, 40.669399], lines: ["3"] },
          { name: "Nostrand Av", coordinates: [-73.950466, 40.669847], lines: ["3"] },
          { name: "Botanic Garden", coordinates: [-73.958688, 40.6705125], lines: ["2","3","4","5","S"] },
          { name: "Eastern Pkwy-Brooklyn Museum", coordinates: [-73.964375, 40.671987], lines: ["2","3"] },
          { name: "Grand Army Plaza", coordinates: [-73.971046, 40.675235], lines: ["2","3"] },
          { name: "Bergen St", coordinates: [-73.975098, 40.680829], lines: ["2","3"] },
          { name: "Atlantic Av-Barclays Ctr", coordinates: [-73.97778866666665, 40.68416166666667], lines: ["2","3","4","5","B","D","N","Q","R"] },
          { name: "Nevins St", coordinates: [-73.980492, 40.688246], lines: ["2","3","4","5"] },
          { name: "Hoyt St", coordinates: [-73.985065, 40.690545], lines: ["2","3"] },
          { name: "Court St", coordinates: [-73.990642, 40.693241], lines: ["2","3","4","5","R"] },
          { name: "Clark St", coordinates: [-73.993086, 40.697466], lines: ["2","3"] },
          { name: "Wall St", coordinates: [-74.0091, 40.706821], lines: ["2","3"] },
          { name: "Fulton St", coordinates: [-74.00783824999999, 40.71008875], lines: ["2","3","4","5","A","C","J","Z"] },
          { name: "Cortlandt St", coordinates: [-74.0095515, 40.712603], lines: ["2","3","A","C","E","R","W"] },
          { name: "Chambers St", coordinates: [-74.009266, 40.715478], lines: ["1","2","3"] },
          { name: "14 St", coordinates: [-73.989862, 40.734803], lines: ["2","3"] },
          { name: "34 St-Penn Station", coordinates: [-73.991057, 40.750373], lines: ["1","2","3"] },
          { name: "Times Sq-42 St", coordinates: [-73.9875808, 40.755746], lines: ["1","2","3","7","A","C","E","N","Q","R","S","W"] },
          { name: "72 St", coordinates: [-73.98197, 40.778453], lines: ["1","2","3"] },
          { name: "96 St", coordinates: [-73.972323, 40.793919], lines: ["1","2","3"] },
          { name: "110 St-Malcolm X Plaza", coordinates: [-73.951822, 40.799075], lines: ["2","3"] },
          { name: "116 St", coordinates: [-73.949625, 40.802098], lines: ["2","3"] },
          { name: "125 St", coordinates: [-73.945495, 40.807754], lines: ["2","3"] },
          { name: "135 St", coordinates: [-73.94077, 40.814229], lines: ["2","3"] },
          { name: "145 St", coordinates: [-73.936245, 40.820421], lines: ["3"] },
          { name: "Harlem-148 St", coordinates: [-73.93647, 40.82388], lines: ["3"] },
        ];

        // Add station markers and event handlers
        threeLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'station-marker';
          el.style.cssText = `
            width: 8px;
            height: 8px;
            background-color: white;
            border: 2px solid ${MTA_COLORS[lineId] || '#000000'};
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
          `;

          // Mouse events with glassmorphic popup
          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', (e) => {
            const stationData = threeLineStations[index];
            const lines = stationData.lines.sort();

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(stationData.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${lines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-white text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = threeLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 3 train added successfully with ${threeLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE 4 IMPLEMENTATION
      if (lineId === '4') {
        const markersForLine: maplibregl.Marker[] = [];
        const fourLineCoords: [number, number][] = [
          [-73.878751, 40.886037], // Woodlawn
          [-73.884655, 40.87975], // Mosholu Pkwy
          [-73.890064, 40.873412], // Bedford Park Blvd-Lehman College
          [-73.897174, 40.86776], // Kingsbridge Rd
          [-73.901034, 40.862803], // Fordham Rd
          [-73.903879, 40.858407], // 183 St
          [-73.907684, 40.853453], // Burnside Av
          [-73.911794, 40.84848], // 176 St
          [-73.914685, 40.844434], // Mt Eden Av
          [-73.917791, 40.840075], // 170 St
          [-73.9214, 40.835537], // 167 St
          [-73.925741, 40.8279495], // 161 St-Yankee Stadium
          [-73.92703449999999, 40.8183925], // 149 St-Grand Concourse
          [-73.929849, 40.813224], // 138 St-Grand Concourse
          [-73.937594, 40.804138], // 125 St
          [-73.955589, 40.779492], // 86 St
          [-73.9676125, 40.762592999999995], // Lexington Av/59 St
          [-73.97735933333333, 40.751992], // Grand Central-42 St
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-74.003766, 40.713154], // Brooklyn Bridge-City Hall
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.011862, 40.707557], // Wall St
          [-74.014065, 40.704817], // Bowling Green
          [-73.989998, 40.693219], // Borough Hall
          [-73.980492, 40.688246], // Nevins St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.958416, 40.674249], // Franklin Av
          [-73.932942, 40.668897], // Crown Hts-Utica Av
        ];

        // Add line to map
        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: fourLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        // Add line layer
        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
        }

        const fourLineStations = [
          { name: "Woodlawn", coordinates: [-73.878751, 40.886037], lines: ["4"] },
          { name: "Mosholu Pkwy", coordinates: [-73.884655, 40.87975], lines: ["4"] },
          { name: "Bedford Park Blvd-Lehman College", coordinates: [-73.890064, 40.873412], lines: ["4"] },
          { name: "Kingsbridge Rd", coordinates: [-73.897174, 40.86776], lines: ["4"] },
          { name: "Fordham Rd", coordinates: [-73.901034, 40.862803], lines: ["4"] },
          { name: "183 St", coordinates: [-73.903879, 40.858407], lines: ["4"] },
          { name: "Burnside Av", coordinates: [-73.907684, 40.853453], lines: ["4"] },
          { name: "176 St", coordinates: [-73.911794, 40.84848], lines: ["4"] },
          { name: "Mt Eden Av", coordinates: [-73.914685, 40.844434], lines: ["4"] },
          { name: "170 St", coordinates: [-73.917791, 40.840075], lines: ["4"] },
          { name: "167 St", coordinates: [-73.9214, 40.835537], lines: ["4"] },
          { name: "161 St-Yankee Stadium", coordinates: [-73.925741, 40.8279495], lines: ["4","B","D"] },
          { name: "149 St-Grand Concourse", coordinates: [-73.92703449999999, 40.8183925], lines: ["2","4","5"] },
          { name: "138 St-Grand Concourse", coordinates: [-73.929849, 40.813224], lines: ["4","5"] },
          { name: "125 St", coordinates: [-73.937594, 40.804138], lines: ["4","5","6"] },
          { name: "86 St", coordinates: [-73.955589, 40.779492], lines: ["4","5","6"] },
          { name: "Lexington Av/59 St", coordinates: [-73.9676125, 40.762592999999995], lines: ["4","5","6","N","R","W"] },
          { name: "Grand Central-42 St", coordinates: [-73.97735933333333, 40.751992], lines: ["4","5","6","7","S"] },
          { name: "14 St-Union Sq", coordinates: [-73.99041633333333, 40.735066], lines: ["4","5","6","L","N","Q","R","W"] },
          { name: "Brooklyn Bridge-City Hall", coordinates: [-74.003766, 40.713154], lines: ["4","5","6"] },
          { name: "Fulton St", coordinates: [-74.00783824999999, 40.71008875], lines: ["2","3","4","5","A","C","J","Z"] },
          { name: "Wall St", coordinates: [-74.011862, 40.707557], lines: ["4","5"] },
          { name: "Bowling Green", coordinates: [-74.014065, 40.704817], lines: ["4","5"] },
          { name: "Borough Hall", coordinates: [-73.989998, 40.693219], lines: ["2","3","4","5","R"] },
          { name: "Nevins St", coordinates: [-73.980492, 40.688246], lines: ["2","3","4","5"] },
          { name: "Atlantic Av-Barclays Ctr", coordinates: [-73.97778866666665, 40.68416166666667], lines: ["2","3","4","5","B","D","N","Q","R"] },
          { name: "Franklin Av", coordinates: [-73.958416, 40.674249], lines: ["2","3","4","5","S"] },
          { name: "Crown Hts-Utica Av", coordinates: [-73.932942, 40.668897], lines: ["3","4"] },
        ];

        // Add station markers and event handlers
        fourLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'station-marker';
          el.style.cssText = `
            width: 8px;
            height: 8px;
            background-color: white;
            border: 2px solid ${MTA_COLORS[lineId] || '#000000'};
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
          `;

          // Mouse events with glassmorphic popup
          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', (e) => {
            const stationData = fourLineStations[index];
            const lines = stationData.lines.sort();

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(stationData.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${lines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-white text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = fourLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 4 train added successfully with ${fourLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE 5 IMPLEMENTATION
      if (lineId === '5') {
        const markersForLine: maplibregl.Marker[] = [];
        const fiveLineCoords: [number, number][] = [
          [-73.830834, 40.8883], // Eastchester-Dyre Av
          [-73.838591, 40.878663], // Baychester Av
          [-73.866256, 40.87785], // Gun Hill Rd
          [-73.867615, 40.857192], // Pelham Pkwy
          [-73.860495, 40.854364], // Morris Park
          [-73.873488, 40.841894], // E 180 St
          [-73.880049, 40.840295], // West Farms Sq-E Tremont Av
          [-73.887734, 40.837288], // 174 St
          [-73.891865, 40.829993], // Freeman St
          [-73.893064, 40.824073], // Simpson St
          [-73.896736, 40.822181], // Intervale Av
          [-73.90177, 40.819585], // Prospect Av
          [-73.907807, 40.81649], // Jackson Av
          [-73.917757, 40.816109], // 3 Av-149 St
          [-73.92703449999999, 40.8183925], // 149 St-Grand Concourse
          [-73.929849, 40.813224], // 138 St-Grand Concourse
          [-73.937594, 40.804138], // 125 St
          [-73.955589, 40.779492], // 86 St
          [-73.9676125, 40.762592999999995], // Lexington Av/59 St
          [-73.97735933333333, 40.751992], // Grand Central-42 St
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-74.003766, 40.713154], // Brooklyn Bridge-City Hall
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.011862, 40.707557], // Wall St
          [-74.014065, 40.704817], // Bowling Green
          [-73.989998, 40.693219], // Borough Hall
          [-73.980492, 40.688246], // Nevins St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.958416, 40.674249], // Franklin Av
          [-73.950683, 40.667883], // President St-Medgar Evers College
          [-73.95085, 40.662742], // Sterling St
          [-73.9502, 40.656652], // Winthrop St
          [-73.949575, 40.650843], // Church Av
          [-73.948959, 40.645098], // Beverly Rd
          [-73.948411, 40.639967], // Newkirk Av-Little Haiti
          [-73.947642, 40.632836], // Flatbush Av-Brooklyn College
        ];

        // Add line to map
        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: fiveLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        // Add line layer
        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });
        }

        const fiveLineStations = [
          { name: "Eastchester-Dyre Av", coordinates: [-73.830834, 40.8883], lines: ["5"] },
          { name: "Baychester Av", coordinates: [-73.838591, 40.878663], lines: ["5"] },
          { name: "Gun Hill Rd", coordinates: [-73.866256, 40.87785], lines: ["2","5"] },
          { name: "Pelham Pkwy", coordinates: [-73.867615, 40.857192], lines: ["2","5"] },
          { name: "Morris Park", coordinates: [-73.860495, 40.854364], lines: ["5"] },
          { name: "E 180 St", coordinates: [-73.873488, 40.841894], lines: ["2","5"] },
          { name: "West Farms Sq-E Tremont Av", coordinates: [-73.880049, 40.840295], lines: ["2","5"] },
          { name: "174 St", coordinates: [-73.887734, 40.837288], lines: ["2","5"] },
          { name: "Freeman St", coordinates: [-73.891865, 40.829993], lines: ["2","5"] },
          { name: "Simpson St", coordinates: [-73.893064, 40.824073], lines: ["2","5"] },
          { name: "Intervale Av", coordinates: [-73.896736, 40.822181], lines: ["2","5"] },
          { name: "Prospect Av", coordinates: [-73.90177, 40.819585], lines: ["2","5"] },
          { name: "Jackson Av", coordinates: [-73.907807, 40.81649], lines: ["2","5"] },
          { name: "3 Av-149 St", coordinates: [-73.917757, 40.816109], lines: ["2","5"] },
          { name: "149 St-Grand Concourse", coordinates: [-73.92703449999999, 40.8183925], lines: ["2","4","5"] },
          { name: "138 St-Grand Concourse", coordinates: [-73.929849, 40.813224], lines: ["4","5"] },
          { name: "125 St", coordinates: [-73.937594, 40.804138], lines: ["4","5","6"] },
          { name: "86 St", coordinates: [-73.955589, 40.779492], lines: ["4","5","6"] },
          { name: "Lexington Av/59 St", coordinates: [-73.9676125, 40.762592999999995], lines: ["4","5","6","N","R","W"] },
          { name: "Grand Central-42 St", coordinates: [-73.97735933333333, 40.751992], lines: ["4","5","6","7","S"] },
          { name: "14 St-Union Sq", coordinates: [-73.99041633333333, 40.735066], lines: ["4","5","6","L","N","Q","R","W"] },
          { name: "Brooklyn Bridge-City Hall", coordinates: [-74.003766, 40.713154], lines: ["4","5","6"] },
          { name: "Fulton St", coordinates: [-74.00783824999999, 40.71008875], lines: ["2","3","4","5","A","C","J","Z"] },
          { name: "Wall St", coordinates: [-74.011862, 40.707557], lines: ["4","5"] },
          { name: "Bowling Green", coordinates: [-74.014065, 40.704817], lines: ["4","5"] },
          { name: "Borough Hall", coordinates: [-73.989998, 40.693219], lines: ["2","3","4","5","R"] },
          { name: "Nevins St", coordinates: [-73.980492, 40.688246], lines: ["2","3","4","5"] },
          { name: "Atlantic Av-Barclays Ctr", coordinates: [-73.97778866666665, 40.68416166666667], lines: ["2","3","4","5","B","D","N","Q","R"] },
          { name: "Franklin Av", coordinates: [-73.958416, 40.674249], lines: ["2","3","4","5","S"] },
          { name: "President St-Medgar Evers College", coordinates: [-73.950683, 40.667883], lines: ["2","5"] },
          { name: "Sterling St", coordinates: [-73.95085, 40.662742], lines: ["2","5"] },
          { name: "Winthrop St", coordinates: [-73.9502, 40.656652], lines: ["2","5"] },
          { name: "Church Av", coordinates: [-73.949575, 40.650843], lines: ["2","5"] },
          { name: "Beverly Rd", coordinates: [-73.948959, 40.645098], lines: ["2","5"] },
          { name: "Newkirk Av-Little Haiti", coordinates: [-73.948411, 40.639967], lines: ["2","5"] },
          { name: "Flatbush Av-Brooklyn College", coordinates: [-73.947642, 40.632836], lines: ["2","5"] },
        ];

        // Add station markers and event handlers
        fiveLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'station-marker';
          el.style.cssText = `
            width: 8px;
            height: 8px;
            background-color: white;
            border: 2px solid ${MTA_COLORS[lineId] || '#000000'};
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
          `;

          // Mouse events with glassmorphic popup
          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', (e) => {
            const stationData = fiveLineStations[index];
            const lines = stationData.lines.sort();

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(stationData.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${lines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-white text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = fiveLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 5 train added successfully with ${fiveLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE 6 IMPLEMENTATION
      if (lineId === '6') {
        const markersForLine: maplibregl.Marker[] = [];
        const sixLineCoords: [number, number][] = [
          [-73.828121, 40.852462], // Pelham Bay Park
          [-73.832569, 40.84681], // Buhre Av
          [-73.836322, 40.843863], // Middletown Rd
          [-73.842952, 40.839892], // Westchester Sq-E Tremont Av
          [-73.847036, 40.836488], // Zerega Av
          [-73.851222, 40.834255], // Castle Hill Av
          [-73.860816, 40.833226], // Parkchester
          [-73.867618, 40.831509], // St Lawrence Av
          [-73.874516, 40.829521], // Morrison Av-Soundview
          [-73.879159, 40.828584], // Elder Av
          [-73.886283, 40.826525], // Whitlock Av
          [-73.890549, 40.820948], // Hunts Point Av
          [-73.896435, 40.816104], // Longwood Av
          [-73.904098, 40.812118], // E 149 St
          [-73.907657, 40.808719], // E 143 St-St Mary's St
          [-73.914042, 40.805368], // Cypress Av
          [-73.91924, 40.807566], // Brook Av
          [-73.926138, 40.810476], // 3 Av-138 St
          [-73.937594, 40.804138], // 125 St
          [-73.941617, 40.798629], // 116 St
          [-73.94425, 40.79502], // 110 St
          [-73.947478, 40.7906], // 103 St
          [-73.95107, 40.785672], // 96 St
          [-73.955589, 40.779492], // 86 St
          [-73.959874, 40.77362], // 77 St
          [-73.96387, 40.768141], // 68 St-Hunter College
          [-73.9676125, 40.762593], // Lexington Av/59 St
          [-73.97048749999999, 40.7573295], // Lexington Av/53 St
          [-73.97735933333333, 40.751992], // Grand Central-42 St
          [-73.982076, 40.746081], // 33 St
          [-73.984264, 40.74307], // 28 St
          [-73.986599, 40.739864], // 23 St
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-73.99107, 40.730054], // Astor Pl
          [-73.997141, 40.722301], // Spring St
          [-74.00057999999999, 40.71870125], // Canal St
          [-74.003766, 40.713154] // Chambers St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: sixLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const sixLineStations = [
          { name: "Pelham Bay Park", coordinates: [-73.828121, 40.852462], lines: ['6'] },
          { name: "Buhre Av", coordinates: [-73.832569, 40.84681], lines: ['6'] },
          { name: "Middletown Rd", coordinates: [-73.836322, 40.843863], lines: ['6'] },
          { name: "Westchester Sq-E Tremont Av", coordinates: [-73.842952, 40.839892], lines: ['6'] },
          { name: "Zerega Av", coordinates: [-73.847036, 40.836488], lines: ['6'] },
          { name: "Castle Hill Av", coordinates: [-73.851222, 40.834255], lines: ['6'] },
          { name: "Parkchester", coordinates: [-73.860816, 40.833226], lines: ['6'] },
          { name: "St Lawrence Av", coordinates: [-73.867618, 40.831509], lines: ['6'] },
          { name: "Morrison Av-Soundview", coordinates: [-73.874516, 40.829521], lines: ['6'] },
          { name: "Elder Av", coordinates: [-73.879159, 40.828584], lines: ['6'] },
          { name: "Whitlock Av", coordinates: [-73.886283, 40.826525], lines: ['6'] },
          { name: "Hunts Point Av", coordinates: [-73.890549, 40.820948], lines: ['6'] },
          { name: "Longwood Av", coordinates: [-73.896435, 40.816104], lines: ['6'] },
          { name: "E 149 St", coordinates: [-73.904098, 40.812118], lines: ['6'] },
          { name: "E 143 St-St Mary's St", coordinates: [-73.907657, 40.808719], lines: ['6'] },
          { name: "Cypress Av", coordinates: [-73.914042, 40.805368], lines: ['6'] },
          { name: "Brook Av", coordinates: [-73.91924, 40.807566], lines: ['6'] },
          { name: "3 Av-138 St", coordinates: [-73.926138, 40.810476], lines: ['6'] },
          { name: "125 St", coordinates: [-73.937594, 40.804138], lines: ['6'] },
          { name: "116 St", coordinates: [-73.941617, 40.798629], lines: ['6'] },
          { name: "110 St", coordinates: [-73.94425, 40.79502], lines: ['6'] },
          { name: "103 St", coordinates: [-73.947478, 40.7906], lines: ['6'] },
          { name: "96 St", coordinates: [-73.95107, 40.785672], lines: ['6'] },
          { name: "86 St", coordinates: [-73.955589, 40.779492], lines: ['6'] },
          { name: "77 St", coordinates: [-73.959874, 40.77362], lines: ['6'] },
          { name: "68 St-Hunter College", coordinates: [-73.96387, 40.768141], lines: ['6'] },
          { name: "Lexington Av/59 St", coordinates: [-73.9676125, 40.762593], lines: ['6'] },
          { name: "Lexington Av/53 St", coordinates: [-73.97048749999999, 40.7573295], lines: ['6'] },
          { name: "Grand Central-42 St", coordinates: [-73.97735933333333, 40.751992], lines: ['6', '4', '5', '7'] },
          { name: "33 St", coordinates: [-73.982076, 40.746081], lines: ['6'] },
          { name: "28 St", coordinates: [-73.984264, 40.74307], lines: ['6'] },
          { name: "23 St", coordinates: [-73.986599, 40.739864], lines: ['6'] },
          { name: "14 St-Union Sq", coordinates: [-73.99041633333333, 40.735066], lines: ['6', '4', '5', 'N', 'Q', 'R', 'W'] },
          { name: "Astor Pl", coordinates: [-73.99107, 40.730054], lines: ['6'] },
          { name: "Spring St", coordinates: [-73.997141, 40.722301], lines: ['6'] },
          { name: "Canal St", coordinates: [-74.00057999999999, 40.71870125], lines: ['6'] },
          { name: "Chambers St", coordinates: [-74.003766, 40.713154], lines: ['6'] }
        ];

        // Add station markers and event handlers
        sixLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'station-marker';
          el.style.cssText = `
            width: 8px;
            height: 8px;
            background-color: white;
            border: 2px solid ${MTA_COLORS[lineId] || '#000000'};
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
          `;

          // Mouse events with glassmorphic popup
          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', (e) => {
            const stationData = sixLineStations[index];
            const lines = stationData.lines.sort();

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(stationData.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${lines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = sixLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 6 train added successfully with ${sixLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE F IMPLEMENTATION
      if (lineId === 'F') {
        const markersForLine: maplibregl.Marker[] = [];
        const fLineCoords: [number, number][] = [
          [-73.783817, 40.712646], // Jamaica-179 St
          [-73.793604, 40.71047], // 169 St
          [-73.803326, 40.707564], // Parsons Blvd
          [-73.810708, 40.70546], // Sutphin Blvd
          [-73.820574, 40.709179], // Briarwood
          [-73.831008, 40.714441], // Kew Gardens-Union Tpke
          [-73.837324, 40.718331], // 75 Av
          [-73.844521, 40.721691], // Forest Hills-71 Av
          [-73.891366, 40.746746], // Jackson Hts-Roosevelt Av
          [-73.942836, 40.754203], // 21 St-Queensbridge
          [-73.95326, 40.759145], // Roosevelt Island
          [-73.966113, 40.764629], // Lexington Av/63 St
          [-73.97745, 40.763972], // 57 St
          [-73.981329, 40.758663], // 47-50 Sts-Rockefeller Ctr
          [-73.98326599999999, 40.7540215], // 42 St-Bryant Pk
          [-73.9878865, 40.749643], // 34 St-Herald Sq
          [-73.992821, 40.742878], // 23 St
          [-73.997732, 40.73779633333333], // 14 St (6 Av)
          [-74.000495, 40.732338], // W 4 St-Wash Sq
          [-73.9954315, 40.725606], // Broadway-Lafayette St
          [-73.989938, 40.723402], // 2 Av
          [-73.9877755, 40.718463], // Delancey St-Essex St
          [-73.990173, 40.713715], // East Broadway
          [-73.986751, 40.701397], // York St
          [-73.98664199999999, 40.692259], // Jay St-MetroTech
          [-73.990862, 40.686145], // Bergen St
          [-73.995048, 40.680303], // Carroll St
          [-73.995959, 40.67358], // Smith-9 Sts
          [-73.9890405, 40.670559499999996], // 4 Av-9 St
          [-73.980305, 40.666271], // 7 Av
          [-73.979493, 40.660365], // 15 St-Prospect Park
          [-73.975776, 40.650782], // Fort Hamilton Pkwy
          [-73.979678, 40.644041], // Church Av
          [-73.978172, 40.636119], // Ditmas Av
          [-73.976971, 40.629755], // 18 Av
          [-73.976127, 40.625322], // Avenue I
          [-73.975264, 40.620769], // Bay Pkwy
          [-73.974197, 40.61514], // Avenue N
          [-73.973022, 40.608944], // Avenue P
          [-73.972361, 40.603217], // Kings Hwy
          [-73.973357, 40.596063], // Avenue U
          [-73.97425, 40.58962], // Avenue X
          [-73.974574, 40.581011], // Neptune Av
          [-73.975939, 40.576127], // W 8 St-NY Aquarium
          [-73.981233, 40.577422], // Coney Island-Stillwell Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: fLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const fLineStations = [
          { name: "Jamaica-179 St", coordinates: [-73.783817, 40.712646], lines: ['F'] },
          { name: "169 St", coordinates: [-73.793604, 40.71047], lines: ['F'] },
          { name: "Parsons Blvd", coordinates: [-73.803326, 40.707564], lines: ['F'] },
          { name: "Sutphin Blvd", coordinates: [-73.810708, 40.70546], lines: ['F'] },
          { name: "Briarwood", coordinates: [-73.820574, 40.709179], lines: ['E', 'F'] },
          { name: "Kew Gardens-Union Tpke", coordinates: [-73.831008, 40.714441], lines: ['E', 'F'] },
          { name: "75 Av", coordinates: [-73.837324, 40.718331], lines: ['E', 'F'] },
          { name: "Forest Hills-71 Av", coordinates: [-73.844521, 40.721691], lines: ['E', 'F', 'M', 'R'] },
          { name: "Jackson Hts-Roosevelt Av", coordinates: [-73.891366, 40.746746], lines: ['7', 'E', 'F', 'M', 'R'] },
          { name: "21 St-Queensbridge", coordinates: [-73.942836, 40.754203], lines: ['F'] },
          { name: "Roosevelt Island", coordinates: [-73.95326, 40.759145], lines: ['F'] },
          { name: "Lexington Av/63 St", coordinates: [-73.966113, 40.764629], lines: ['F', 'Q'] },
          { name: "57 St", coordinates: [-73.97745, 40.763972], lines: ['F'] },
          { name: "47-50 Sts-Rockefeller Ctr", coordinates: [-73.981329, 40.758663], lines: ['B', 'D', 'F', 'M'] },
          { name: "42 St-Bryant Pk", coordinates: [-73.98326599999999, 40.7540215], lines: ['7', 'B', 'D', 'F', 'M'] },
          { name: "34 St-Herald Sq", coordinates: [-73.9878865, 40.749643], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: "23 St", coordinates: [-73.992821, 40.742878], lines: ['F', 'M'] },
          { name: "14 St", coordinates: [-73.997732, 40.73779633333333], lines: ['1', '2', '3', 'F', 'L', 'M'] },
          { name: "W 4 St-Wash Sq", coordinates: [-74.000495, 40.732338], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: "Broadway-Lafayette St", coordinates: [-73.9954315, 40.725606], lines: ['6', 'B', 'D', 'F', 'M'] },
          { name: "2 Av", coordinates: [-73.989938, 40.723402], lines: ['F'] },
          { name: "Delancey St-Essex St", coordinates: [-73.9877755, 40.718463], lines: ['F', 'J', 'M', 'Z'] },
          { name: "East Broadway", coordinates: [-73.990173, 40.713715], lines: ['F'] },
          { name: "York St", coordinates: [-73.986751, 40.701397], lines: ['F'] },
          { name: "Jay St-MetroTech", coordinates: [-73.98664199999999, 40.692259], lines: ['A', 'C', 'F', 'R'] },
          { name: "Bergen St", coordinates: [-73.990862, 40.686145], lines: ['F', 'G'] },
          { name: "Carroll St", coordinates: [-73.995048, 40.680303], lines: ['F', 'G'] },
          { name: "Smith-9 Sts", coordinates: [-73.995959, 40.67358], lines: ['F', 'G'] },
          { name: "4 Av-9 St", coordinates: [-73.9890405, 40.670559499999996], lines: ['F', 'G', 'R'] },
          { name: "7 Av", coordinates: [-73.980305, 40.666271], lines: ['F', 'G'] },
          { name: "15 St-Prospect Park", coordinates: [-73.979493, 40.660365], lines: ['F', 'G'] },
          { name: "Fort Hamilton Pkwy", coordinates: [-73.975776, 40.650782], lines: ['F', 'G'] },
          { name: "Church Av", coordinates: [-73.979678, 40.644041], lines: ['F', 'G'] },
          { name: "Ditmas Av", coordinates: [-73.978172, 40.636119], lines: ['F'] },
          { name: "18 Av", coordinates: [-73.976971, 40.629755], lines: ['F'] },
          { name: "Avenue I", coordinates: [-73.976127, 40.625322], lines: ['F'] },
          { name: "Bay Pkwy", coordinates: [-73.975264, 40.620769], lines: ['F'] },
          { name: "Avenue N", coordinates: [-73.974197, 40.61514], lines: ['F'] },
          { name: "Avenue P", coordinates: [-73.973022, 40.608944], lines: ['F'] },
          { name: "Kings Hwy", coordinates: [-73.972361, 40.603217], lines: ['F'] },
          { name: "Avenue U", coordinates: [-73.973357, 40.596063], lines: ['F'] },
          { name: "Avenue X", coordinates: [-73.97425, 40.58962], lines: ['F'] },
          { name: "Neptune Av", coordinates: [-73.974574, 40.581011], lines: ['F'] },
          { name: "W 8 St-NY Aquarium", coordinates: [-73.975939, 40.576127], lines: ['F', 'Q'] },
          { name: "Coney Island-Stillwell Av", coordinates: [-73.981233, 40.577422], lines: ['D', 'F', 'N', 'Q'] },
        ];

        fLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const stationData = fLineStations[index];
            const allLines = stationData.lines || [lineId];

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(station.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${allLines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = fLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded F train added successfully with ${fLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE G IMPLEMENTATION
      if (lineId === 'G') {
        const markersForLine: maplibregl.Marker[] = [];
        const gLineCoords: [number, number][] = [
          [-73.94503200000001, 40.747141000000006], // Court Sq-23 St
          [-73.949724, 40.744065], // 21 St
          [-73.954449, 40.731352], // Greenpoint Av
          [-73.951277, 40.724635], // Nassau Av
          [-73.95084650000001, 40.7134275], // Lorimer St
          [-73.950308, 40.706092], // Broadway
          [-73.950234, 40.700377], // Flushing Av
          [-73.949046, 40.694568], // Myrtle-Willoughby Avs
          [-73.953522, 40.689627], // Bedford-Nostrand Avs
          [-73.96007, 40.688873], // Classon Av
          [-73.966839, 40.688089], // Clinton-Washington Avs
          [-73.975375, 40.687119], // Fulton St
          [-73.985001, 40.688484], // Hoyt-Schermerhorn Sts
          [-73.990862, 40.686145], // Bergen St
          [-73.995048, 40.680303], // Carroll St
          [-73.995959, 40.67358], // Smith-9 Sts
          [-73.9890405, 40.670559499999996], // 4 Av-9 St
          [-73.980305, 40.666271], // 7 Av
          [-73.979493, 40.660365], // 15 St-Prospect Park
          [-73.975776, 40.650782], // Fort Hamilton Pkwy
          [-73.979678, 40.644041], // Church Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: gLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const gLineStations = [
          { name: "Court Sq-23 St", coordinates: [-73.94503200000001, 40.747141000000006], lines: ['7', 'E', 'G', 'M'] },
          { name: "21 St", coordinates: [-73.949724, 40.744065], lines: ['G'] },
          { name: "Greenpoint Av", coordinates: [-73.954449, 40.731352], lines: ['G'] },
          { name: "Nassau Av", coordinates: [-73.951277, 40.724635], lines: ['G'] },
          { name: "Lorimer St", coordinates: [-73.95084650000001, 40.7134275], lines: ['G', 'L'] },
          { name: "Broadway", coordinates: [-73.950308, 40.706092], lines: ['G'] },
          { name: "Flushing Av", coordinates: [-73.950234, 40.700377], lines: ['G'] },
          { name: "Myrtle-Willoughby Avs", coordinates: [-73.949046, 40.694568], lines: ['G'] },
          { name: "Bedford-Nostrand Avs", coordinates: [-73.953522, 40.689627], lines: ['G'] },
          { name: "Classon Av", coordinates: [-73.96007, 40.688873], lines: ['G'] },
          { name: "Clinton-Washington Avs", coordinates: [-73.966839, 40.688089], lines: ['G'] },
          { name: "Fulton St", coordinates: [-73.975375, 40.687119], lines: ['G'] },
          { name: "Hoyt-Schermerhorn Sts", coordinates: [-73.985001, 40.688484], lines: ['A', 'C', 'G'] },
          { name: "Bergen St", coordinates: [-73.990862, 40.686145], lines: ['F', 'G'] },
          { name: "Carroll St", coordinates: [-73.995048, 40.680303], lines: ['F', 'G'] },
          { name: "Smith-9 Sts", coordinates: [-73.995959, 40.67358], lines: ['F', 'G'] },
          { name: "4 Av-9 St", coordinates: [-73.9890405, 40.670559499999996], lines: ['F', 'G', 'R'] },
          { name: "7 Av", coordinates: [-73.980305, 40.666271], lines: ['F', 'G'] },
          { name: "15 St-Prospect Park", coordinates: [-73.979493, 40.660365], lines: ['F', 'G'] },
          { name: "Fort Hamilton Pkwy", coordinates: [-73.975776, 40.650782], lines: ['F', 'G'] },
          { name: "Church Av", coordinates: [-73.979678, 40.644041], lines: ['F', 'G'] },
        ];

        gLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const stationData = gLineStations[index];
            const allLines = stationData.lines || [lineId];

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(station.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${allLines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = gLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded G train added successfully with ${gLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE J IMPLEMENTATION
      if (lineId === 'J') {
        const markersForLine: maplibregl.Marker[] = [];
        const jLineCoords: [number, number][] = [
          [-73.801109, 40.702147], // Jamaica Center-Parsons/Archer
          [-73.807969, 40.700486], // Sutphin Blvd-Archer Av-JFK Airport
          [-73.828294, 40.700492], // 121 St
          [-73.836345, 40.697418], // 111 St
          [-73.84433, 40.695178], // 104 St
          [-73.851576, 40.693879], // Woodhaven Blvd
          [-73.86001, 40.692435], // 85 St-Forest Pkwy
          [-73.867139, 40.691324], // 75 St-Elderts Ln
          [-73.87255, 40.689941], // Cypress Hills
          [-73.873785, 40.683194], // Crescent St
          [-73.880039, 40.68141], // Norwood Av
          [-73.884639, 40.679947], // Cleveland St
          [-73.891688, 40.678024], // Van Siclen Av
          [-73.898654, 40.676992], // Alabama Av
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.910456, 40.682893], // Chauncey St
          [-73.916559, 40.68637], // Halsey St
          [-73.92227, 40.68963], // Gates Av
          [-73.928814, 40.693342], // Kosciuszko St
          [-73.935657, 40.697207], // Myrtle Av
          [-73.941126, 40.70026], // Flushing Av
          [-73.947408, 40.703869], // Lorimer St
          [-73.953431, 40.70687], // Hewes St
          [-73.957757, 40.708359], // Marcy Av
          [-73.9877755, 40.718463], // Delancey St-Essex St
          [-73.993915, 40.72028], // Bowery
          [-74.00057999999999, 40.71870125], // Canal St
          [-74.003766, 40.713154], // Chambers St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.011056, 40.706476], // Broad St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: jLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const jLineStations = [
          { name: "Jamaica Center-Parsons/Archer", coordinates: [-73.801109, 40.702147], lines: ['E', 'J', 'Z'] },
          { name: "Sutphin Blvd-Archer Av-JFK Airport", coordinates: [-73.807969, 40.700486], lines: ['E', 'J', 'Z'] },
          { name: "121 St", coordinates: [-73.828294, 40.700492], lines: ['J', 'Z'] },
          { name: "111 St", coordinates: [-73.836345, 40.697418], lines: ['J'] },
          { name: "104 St", coordinates: [-73.84433, 40.695178], lines: ['J', 'Z'] },
          { name: "Woodhaven Blvd", coordinates: [-73.851576, 40.693879], lines: ['J', 'Z'] },
          { name: "85 St-Forest Pkwy", coordinates: [-73.86001, 40.692435], lines: ['J'] },
          { name: "75 St-Elderts Ln", coordinates: [-73.867139, 40.691324], lines: ['J', 'Z'] },
          { name: "Cypress Hills", coordinates: [-73.87255, 40.689941], lines: ['J'] },
          { name: "Crescent St", coordinates: [-73.873785, 40.683194], lines: ['J', 'Z'] },
          { name: "Norwood Av", coordinates: [-73.880039, 40.68141], lines: ['J', 'Z'] },
          { name: "Cleveland St", coordinates: [-73.884639, 40.679947], lines: ['J'] },
          { name: "Van Siclen Av", coordinates: [-73.891688, 40.678024], lines: ['J', 'Z'] },
          { name: "Alabama Av", coordinates: [-73.898654, 40.676992], lines: ['J', 'Z'] },
          { name: "Broadway Junction", coordinates: [-73.90435599999999, 40.678896], lines: ['A', 'C', 'J', 'L', 'Z'] },
          { name: "Chauncey St", coordinates: [-73.910456, 40.682893], lines: ['J', 'Z'] },
          { name: "Halsey St", coordinates: [-73.916559, 40.68637], lines: ['J'] },
          { name: "Gates Av", coordinates: [-73.92227, 40.68963], lines: ['J', 'Z'] },
          { name: "Kosciuszko St", coordinates: [-73.928814, 40.693342], lines: ['J'] },
          { name: "Myrtle Av", coordinates: [-73.935657, 40.697207], lines: ['J', 'M', 'Z'] },
          { name: "Flushing Av", coordinates: [-73.941126, 40.70026], lines: ['J', 'M'] },
          { name: "Lorimer St", coordinates: [-73.947408, 40.703869], lines: ['J', 'M'] },
          { name: "Hewes St", coordinates: [-73.953431, 40.70687], lines: ['J', 'M'] },
          { name: "Marcy Av", coordinates: [-73.957757, 40.708359], lines: ['J', 'M', 'Z'] },
          { name: "Delancey St-Essex St", coordinates: [-73.9877755, 40.718463], lines: ['F', 'J', 'M', 'Z'] },
          { name: "Bowery", coordinates: [-73.993915, 40.72028], lines: ['J', 'Z'] },
          { name: "Canal St", coordinates: [-74.00057999999999, 40.71870125], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: "Chambers St", coordinates: [-74.003766, 40.713154], lines: ['4', '5', '6', 'J', 'Z'] },
          { name: "Fulton St", coordinates: [-74.00783824999999, 40.71008875], lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
          { name: "Broad St", coordinates: [-74.011056, 40.706476], lines: ['J', 'Z'] },
        ];

        jLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const stationData = jLineStations[index];
            const allLines = stationData.lines || [lineId];

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(station.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${allLines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = jLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded J train added successfully with ${jLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE L IMPLEMENTATION
      if (lineId === 'L') {
        const markersForLine: maplibregl.Marker[] = [];
        const lLineCoords: [number, number][] = [
          [-74.002134, 40.740335], // 8 Av
          [-73.997732, 40.73779633333333], // 6 Av
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-73.986122, 40.732849], // 3 Av
          [-73.981628, 40.730953], // 1 Av
          [-73.956872, 40.717304], // Bedford Av
          [-73.95084650000001, 40.7134275], // Lorimer St
          [-73.944053, 40.714565], // Graham Av
          [-73.94067, 40.711926], // Grand St
          [-73.93985, 40.707739], // Montrose Av
          [-73.933147, 40.706152], // Morgan Av
          [-73.922913, 40.706607], // Jefferson St
          [-73.918425, 40.703811], // DeKalb Av
          [-73.9119855, 40.699622000000005], // Myrtle-Wyckoff Avs
          [-73.904084, 40.695602], // Halsey St
          [-73.904046, 40.688764], // Wilson Av
          [-73.905249, 40.682829], // Bushwick Av-Aberdeen St
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.903097, 40.675345], // Atlantic Av
          [-73.901975, 40.669367], // Sutter Av
          [-73.900571, 40.664038], // Livonia Av
          [-73.899232, 40.658733], // New Lots Av
          [-73.899485, 40.650573], // East 105 St
          [-73.90185, 40.646654], // Canarsie-Rockaway Pkwy
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: lLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const lLineStations = [
          { name: "8 Av", coordinates: [-74.002134, 40.740335], lines: ['A', 'C', 'E', 'L'] },
          { name: "6 Av", coordinates: [-73.997732, 40.73779633333333], lines: ['1', '2', '3', 'F', 'L', 'M'] },
          { name: "14 St-Union Sq", coordinates: [-73.99041633333333, 40.735066], lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'] },
          { name: "3 Av", coordinates: [-73.986122, 40.732849], lines: ['L'] },
          { name: "1 Av", coordinates: [-73.981628, 40.730953], lines: ['L'] },
          { name: "Bedford Av", coordinates: [-73.956872, 40.717304], lines: ['L'] },
          { name: "Lorimer St", coordinates: [-73.95084650000001, 40.7134275], lines: ['G', 'L'] },
          { name: "Graham Av", coordinates: [-73.944053, 40.714565], lines: ['L'] },
          { name: "Grand St", coordinates: [-73.94067, 40.711926], lines: ['L'] },
          { name: "Montrose Av", coordinates: [-73.93985, 40.707739], lines: ['L'] },
          { name: "Morgan Av", coordinates: [-73.933147, 40.706152], lines: ['L'] },
          { name: "Jefferson St", coordinates: [-73.922913, 40.706607], lines: ['L'] },
          { name: "DeKalb Av", coordinates: [-73.918425, 40.703811], lines: ['L'] },
          { name: "Myrtle-Wyckoff Avs", coordinates: [-73.9119855, 40.699622000000005], lines: ['L', 'M'] },
          { name: "Halsey St", coordinates: [-73.904084, 40.695602], lines: ['L'] },
          { name: "Wilson Av", coordinates: [-73.904046, 40.688764], lines: ['L'] },
          { name: "Bushwick Av-Aberdeen St", coordinates: [-73.905249, 40.682829], lines: ['L'] },
          { name: "Broadway Junction", coordinates: [-73.90435599999999, 40.678896], lines: ['A', 'C', 'J', 'L', 'Z'] },
          { name: "Atlantic Av", coordinates: [-73.903097, 40.675345], lines: ['L'] },
          { name: "Sutter Av", coordinates: [-73.901975, 40.669367], lines: ['L'] },
          { name: "Livonia Av", coordinates: [-73.900571, 40.664038], lines: ['L'] },
          { name: "New Lots Av", coordinates: [-73.899232, 40.658733], lines: ['L'] },
          { name: "East 105 St", coordinates: [-73.899485, 40.650573], lines: ['L'] },
          { name: "Canarsie-Rockaway Pkwy", coordinates: [-73.90185, 40.646654], lines: ['L'] },
        ];

        lLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const stationData = lLineStations[index];
            const allLines = stationData.lines || [lineId];

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(station.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${allLines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = lLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded L train added successfully with ${lLineStations.length} stations`);
        return;
      }

      // HARDCODED LINE M IMPLEMENTATION
      if (lineId === 'M') {
        const markersForLine: maplibregl.Marker[] = [];
        const mLineCoords: [number, number][] = [
          [-73.844521, 40.721691], // Forest Hills-71 Av
          [-73.861604, 40.729846], // 63 Dr-Rego Park
          [-73.852719, 40.726523], // 67 Av
          [-73.869229, 40.733106], // Woodhaven Blvd
          [-73.877223, 40.737015], // Grand Av-Newtown
          [-73.882017, 40.742454], // Elmhurst Av
          [-73.891366, 40.746746], // Jackson Hts-Roosevelt Av
          [-73.898453, 40.749669], // 65 St
          [-73.906006, 40.752885], // Northern Blvd
          [-73.913333, 40.756312], // 46 St
          [-73.92074, 40.756879], // Steinway St
          [-73.928781, 40.752039], // 36 St
          [-73.937243, 40.748973], // Queens Plaza
          [-73.94503200000001, 40.747141000000006], // Court Sq-23 St
          [-73.97048749999999, 40.7573295], // Lexington Av/53 St
          [-73.975224, 40.760167], // 5 Av/53 St
          [-73.981329, 40.758663], // 47-50 Sts-Rockefeller Ctr
          [-73.98326599999999, 40.7540215], // 42 St-Bryant Pk
          [-73.9878865, 40.749643], // 34 St-Herald Sq
          [-73.992821, 40.742878], // 23 St
          [-73.997732, 40.73779633333333], // 6 Av
          [-74.000495, 40.732338], // W 4 St-Wash Sq
          [-73.9954315, 40.725606], // Broadway-Lafayette St
          [-73.9877755, 40.718463], // Delancey St-Essex St
          [-73.957757, 40.708359], // Marcy Av
          [-73.953431, 40.70687], // Hewes St
          [-73.947408, 40.703869], // Lorimer St
          [-73.941126, 40.70026], // Flushing Av
          [-73.935657, 40.697207], // Myrtle Av
          [-73.9119855, 40.699622000000005], // Myrtle-Wyckoff Avs
          [-73.919711, 40.698664], // Knickerbocker Av
          [-73.927397, 40.697857], // Central Av
          [-73.903077, 40.704423], // Forest Av
          [-73.895877, 40.706186], // Fresh Pond Rd
          [-73.90774, 40.702762], // Seneca Av
          [-73.889601, 40.711396], // Middle Village-Metropolitan Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: mLineCoords,
          },
        };

        if (!map.current!.getSource(`line-${lineId}`)) {
          map.current!.addSource(`line-${lineId}`, {
            type: 'geojson',
            data: lineGeoJSON,
          });
        }

        if (!map.current!.getLayer(`line-${lineId}`)) {
          map.current!.addLayer({
            id: `line-${lineId}`,
            type: 'line',
            source: `line-${lineId}`,
            paint: {
              'line-color': MTA_COLORS[lineId] || '#000000',
              'line-width': 4,
              'line-opacity': 0.8,
            },
          });
        }

        const mLineStations = [
          { name: "Forest Hills-71 Av", coordinates: [-73.844521, 40.721691], lines: ['E', 'F', 'M', 'R'] },
          { name: "63 Dr-Rego Park", coordinates: [-73.861604, 40.729846], lines: ['M', 'R'] },
          { name: "67 Av", coordinates: [-73.852719, 40.726523], lines: ['M', 'R'] },
          { name: "Woodhaven Blvd", coordinates: [-73.869229, 40.733106], lines: ['M', 'R'] },
          { name: "Grand Av-Newtown", coordinates: [-73.877223, 40.737015], lines: ['M', 'R'] },
          { name: "Elmhurst Av", coordinates: [-73.882017, 40.742454], lines: ['M', 'R'] },
          { name: "Jackson Hts-Roosevelt Av", coordinates: [-73.891366, 40.746746], lines: ['7', 'E', 'F', 'M', 'R'] },
          { name: "65 St", coordinates: [-73.898453, 40.749669], lines: ['M', 'R'] },
          { name: "Northern Blvd", coordinates: [-73.906006, 40.752885], lines: ['M', 'R'] },
          { name: "46 St", coordinates: [-73.913333, 40.756312], lines: ['M', 'R'] },
          { name: "Steinway St", coordinates: [-73.92074, 40.756879], lines: ['M', 'R'] },
          { name: "36 St", coordinates: [-73.928781, 40.752039], lines: ['M', 'R'] },
          { name: "Queens Plaza", coordinates: [-73.937243, 40.748973], lines: ['E', 'M', 'R'] },
          { name: "Court Sq-23 St", coordinates: [-73.94503200000001, 40.747141000000006], lines: ['7', 'E', 'G', 'M'] },
          { name: "Lexington Av/53 St", coordinates: [-73.97048749999999, 40.7573295], lines: ['6', 'E', 'M'] },
          { name: "5 Av/53 St", coordinates: [-73.975224, 40.760167], lines: ['E', 'M'] },
          { name: "47-50 Sts-Rockefeller Ctr", coordinates: [-73.981329, 40.758663], lines: ['B', 'D', 'F', 'M'] },
          { name: "42 St-Bryant Pk", coordinates: [-73.98326599999999, 40.7540215], lines: ['7', 'B', 'D', 'F', 'M'] },
          { name: "34 St-Herald Sq", coordinates: [-73.9878865, 40.749643], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: "23 St", coordinates: [-73.992821, 40.742878], lines: ['F', 'M'] },
          { name: "6 Av", coordinates: [-73.997732, 40.73779633333333], lines: ['1', '2', '3', 'F', 'L', 'M'] },
          { name: "W 4 St-Wash Sq", coordinates: [-74.000495, 40.732338], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: "Broadway-Lafayette St", coordinates: [-73.9954315, 40.725606], lines: ['6', 'B', 'D', 'F', 'M'] },
          { name: "Delancey St-Essex St", coordinates: [-73.9877755, 40.718463], lines: ['F', 'J', 'M', 'Z'] },
          { name: "Marcy Av", coordinates: [-73.957757, 40.708359], lines: ['J', 'M', 'Z'] },
          { name: "Hewes St", coordinates: [-73.953431, 40.70687], lines: ['J', 'M'] },
          { name: "Lorimer St", coordinates: [-73.947408, 40.703869], lines: ['J', 'M'] },
          { name: "Flushing Av", coordinates: [-73.941126, 40.70026], lines: ['J', 'M'] },
          { name: "Myrtle Av", coordinates: [-73.935657, 40.697207], lines: ['J', 'M', 'Z'] },
          { name: "Myrtle-Wyckoff Avs", coordinates: [-73.9119855, 40.699622000000005], lines: ['L', 'M'] },
          { name: "Knickerbocker Av", coordinates: [-73.919711, 40.698664], lines: ['M'] },
          { name: "Central Av", coordinates: [-73.927397, 40.697857], lines: ['M'] },
          { name: "Forest Av", coordinates: [-73.903077, 40.704423], lines: ['M'] },
          { name: "Fresh Pond Rd", coordinates: [-73.895877, 40.706186], lines: ['M'] },
          { name: "Seneca Av", coordinates: [-73.90774, 40.702762], lines: ['M'] },
          { name: "Middle Village-Metropolitan Av", coordinates: [-73.889601, 40.711396], lines: ['M'] },
        ];

        mLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let hoverPopup: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const stationData = mLineStations[index];
            const allLines = stationData.lines || [lineId];

            hoverPopup = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: 'glassmorphic-tooltip',
              offset: 25,
              maxWidth: '280px'
            })
              .setLngLat(station.coordinates as [number, number])
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div class="font-semibold text-sm mb-2">${stationData.name}</div>
                  <div class="flex gap-1.5 flex-wrap">
                    ${allLines.map(line => `
                      <span class="inline-block w-6 h-6 rounded-full text-xs font-bold text-center leading-6"
                            style="background-color: ${MTA_COLORS[line] || '#000000'}; color: white;">
                        ${line}
                      </span>
                    `).join('')}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (hoverPopup) {
              hoverPopup.remove();
              hoverPopup = null;
            }
          });

          el.addEventListener('click', (e) => {
            e.stopPropagation();
            const stationData = mLineStations[index];
            console.log('Station clicked:', stationData.name);
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates as [number, number])
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded M train added successfully with ${mLineStations.length} stations`);
        return;
      }

      // N Train - Hardcoded implementation (Astoria-Ditmars Blvd to Coney Island-Stillwell Av)
      if (lineId === 'N') {
        const markersForLine: maplibregl.Marker[] = [];
        const nLineCoords: [number, number][] = [
          [-73.912034, 40.775036],    // Astoria-Ditmars Blvd
          [-73.917843, 40.770258],    // Astoria Blvd
          [-73.921479, 40.766779],    // 30 Av
          [-73.925508, 40.76182],     // Broadway
          [-73.929575, 40.756804],    // 36 Av
          [-73.932755, 40.752882],    // 39 Av-Dutch Kills
          [-73.940202, 40.750582],    // Queensboro Plaza
          [-73.9676125, 40.762592999999995], // Lexington Av/59 St
          [-73.973347, 40.764811],    // 5 Av/59 St
          [-73.980658, 40.764664],    // 57 St-7 Av
          [-73.984139, 40.759901],    // 49 St
          [-73.9875808, 40.755746],   // Times Sq-42 St
          [-73.9878865, 40.749643],   // 34 St-Herald Sq
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-74.00057999999999, 40.71870125], // Canal St
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-74.003549, 40.655144],    // 36 St
          [-74.017881, 40.641362],    // 59 St
          [-74.011719, 40.635064],    // 8 Av
          [-74.005351, 40.631386],    // Fort Hamilton Pkwy
          [-73.996624, 40.625657000000004], // 62 St
          [-73.990414, 40.620671],    // 18 Av
          [-73.985026, 40.61741],     // 20 Av
          [-73.981848, 40.611815],    // Bay Pkwy
          [-73.980353, 40.603923],    // Kings Hwy
          [-73.979137, 40.597473],    // Avenue U
          [-73.97823, 40.592721],     // 86 St
          [-73.981233, 40.577422]     // Coney Island-Stillwell Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: nLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const nLineStations = [
          { name: 'Astoria-Ditmars Blvd', coordinates: [-73.912034, 40.775036] as [number, number], lines: ['N', 'W'] },
          { name: 'Astoria Blvd', coordinates: [-73.917843, 40.770258] as [number, number], lines: ['N', 'W'] },
          { name: '30 Av', coordinates: [-73.921479, 40.766779] as [number, number], lines: ['N', 'W'] },
          { name: 'Broadway', coordinates: [-73.925508, 40.76182] as [number, number], lines: ['N', 'W'] },
          { name: '36 Av', coordinates: [-73.929575, 40.756804] as [number, number], lines: ['N', 'W'] },
          { name: '39 Av-Dutch Kills', coordinates: [-73.932755, 40.752882] as [number, number], lines: ['N', 'W'] },
          { name: 'Queensboro Plaza', coordinates: [-73.940202, 40.750582] as [number, number], lines: ['7', 'N', 'W'] },
          { name: 'Lexington Av/59 St', coordinates: [-73.9676125, 40.762592999999995] as [number, number], lines: ['4', '5', '6', 'N', 'R', 'W'] },
          { name: '5 Av/59 St', coordinates: [-73.973347, 40.764811] as [number, number], lines: ['N', 'R', 'W'] },
          { name: '57 St-7 Av', coordinates: [-73.980658, 40.764664] as [number, number], lines: ['N', 'Q', 'R', 'W'] },
          { name: '49 St', coordinates: [-73.984139, 40.759901] as [number, number], lines: ['N', 'R', 'W'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Herald Sq', coordinates: [-73.9878865, 40.749643] as [number, number], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: '14 St-Union Sq', coordinates: [-73.99041633333333, 40.735066] as [number, number], lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'] },
          { name: 'Canal St', coordinates: [-74.00057999999999, 40.71870125] as [number, number], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: 'Atlantic Av-Barclays Ctr', coordinates: [-73.97778866666665, 40.68416166666667] as [number, number], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: '36 St', coordinates: [-74.003549, 40.655144] as [number, number], lines: ['D', 'N', 'R'] },
          { name: '59 St', coordinates: [-74.017881, 40.641362] as [number, number], lines: ['N', 'R'] },
          { name: '8 Av', coordinates: [-74.011719, 40.635064] as [number, number], lines: ['N'] },
          { name: 'Fort Hamilton Pkwy', coordinates: [-74.005351, 40.631386] as [number, number], lines: ['N'] },
          { name: '62 St', coordinates: [-73.996624, 40.625657000000004] as [number, number], lines: ['D', 'N'] },
          { name: '18 Av', coordinates: [-73.990414, 40.620671] as [number, number], lines: ['N'] },
          { name: '20 Av', coordinates: [-73.985026, 40.61741] as [number, number], lines: ['N'] },
          { name: 'Bay Pkwy', coordinates: [-73.981848, 40.611815] as [number, number], lines: ['N'] },
          { name: 'Kings Hwy', coordinates: [-73.980353, 40.603923] as [number, number], lines: ['N'] },
          { name: 'Avenue U', coordinates: [-73.979137, 40.597473] as [number, number], lines: ['N'] },
          { name: '86 St', coordinates: [-73.97823, 40.592721] as [number, number], lines: ['N'] },
          { name: 'Coney Island-Stillwell Av', coordinates: [-73.981233, 40.577422] as [number, number], lines: ['D', 'F', 'N', 'Q'] }
        ];

        nLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background-color: ${MTA_COLORS[lineId] || '#000000'};
            border: 3px solid white;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          `;

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000000'}; color: white; text-align: center; font-weight: bold; font-size: 14px; margin-right: 4px;">${line}</span>`)
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded N train added successfully with ${nLineStations.length} stations`);
        return;
      }

      // Q Train - Hardcoded implementation (96 St to Coney Island-Stillwell Av)
      if (lineId === 'Q') {
        const markersForLine: maplibregl.Marker[] = [];
        const qLineCoords: [number, number][] = [
          [-73.947152, 40.784318],    // 96 St
          [-73.951787, 40.777891],    // 86 St
          [-73.958424, 40.768799],    // 72 St
          [-73.966113, 40.764629],    // Lexington Av/63 St
          [-73.980658, 40.764664],    // 57 St-7 Av
          [-73.9875808, 40.755746],   // Times Sq-42 St
          [-73.9878865, 40.749643],   // 34 St-Herald Sq
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-74.00057999999999, 40.71870125], // Canal St
          [-73.981824, 40.690635],    // DeKalb Av
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.972367, 40.67705],     // 7 Av
          [-73.962246, 40.661614],    // Prospect Park
          [-73.961495, 40.655292],    // Parkside Av
          [-73.962982, 40.650527],    // Church Av
          [-73.964492, 40.644031],    // Beverley Rd
          [-73.963891, 40.640927],    // Cortelyou Rd
          [-73.962793, 40.635082],    // Newkirk Plaza
          [-73.957734, 40.60867],     // Kings Hwy
          [-73.961639, 40.62927],     // Avenue H
          [-73.960803, 40.625039],    // Avenue J
          [-73.959399, 40.617618],    // Avenue M
          [-73.955929, 40.5993],      // Avenue U
          [-73.955161, 40.595246],    // Neck Rd
          [-73.954155, 40.586896],    // Sheepshead Bay
          [-73.961376, 40.577621],    // Brighton Beach
          [-73.968501, 40.576312],    // Ocean Pkwy
          [-73.975939, 40.576127],    // W 8 St-NY Aquarium
          [-73.981233, 40.577422]     // Coney Island-Stillwell Av
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: qLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const qLineStations = [
          { name: '96 St', coordinates: [-73.947152, 40.784318] as [number, number], lines: ['Q'] },
          { name: '86 St', coordinates: [-73.951787, 40.777891] as [number, number], lines: ['Q'] },
          { name: '72 St', coordinates: [-73.958424, 40.768799] as [number, number], lines: ['Q'] },
          { name: 'Lexington Av/63 St', coordinates: [-73.966113, 40.764629] as [number, number], lines: ['F', 'Q'] },
          { name: '57 St-7 Av', coordinates: [-73.980658, 40.764664] as [number, number], lines: ['N', 'Q', 'R', 'W'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Herald Sq', coordinates: [-73.9878865, 40.749643] as [number, number], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: '14 St-Union Sq', coordinates: [-73.99041633333333, 40.735066] as [number, number], lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'] },
          { name: 'Canal St', coordinates: [-74.00057999999999, 40.71870125] as [number, number], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: 'DeKalb Av', coordinates: [-73.981824, 40.690635] as [number, number], lines: ['B', 'Q', 'R'] },
          { name: 'Atlantic Av-Barclays Ctr', coordinates: [-73.97778866666665, 40.68416166666667] as [number, number], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: '7 Av', coordinates: [-73.972367, 40.67705] as [number, number], lines: ['B', 'Q'] },
          { name: 'Prospect Park', coordinates: [-73.962246, 40.661614] as [number, number], lines: ['B', 'Q', 'S'] },
          { name: 'Parkside Av', coordinates: [-73.961495, 40.655292] as [number, number], lines: ['Q'] },
          { name: 'Church Av', coordinates: [-73.962982, 40.650527] as [number, number], lines: ['B', 'Q'] },
          { name: 'Beverley Rd', coordinates: [-73.964492, 40.644031] as [number, number], lines: ['Q'] },
          { name: 'Cortelyou Rd', coordinates: [-73.963891, 40.640927] as [number, number], lines: ['Q'] },
          { name: 'Newkirk Plaza', coordinates: [-73.962793, 40.635082] as [number, number], lines: ['B', 'Q'] },
          { name: 'Kings Hwy', coordinates: [-73.957734, 40.60867] as [number, number], lines: ['B', 'Q'] },
          { name: 'Avenue H', coordinates: [-73.961639, 40.62927] as [number, number], lines: ['Q'] },
          { name: 'Avenue J', coordinates: [-73.960803, 40.625039] as [number, number], lines: ['Q'] },
          { name: 'Avenue M', coordinates: [-73.959399, 40.617618] as [number, number], lines: ['Q'] },
          { name: 'Avenue U', coordinates: [-73.955929, 40.5993] as [number, number], lines: ['Q'] },
          { name: 'Neck Rd', coordinates: [-73.955161, 40.595246] as [number, number], lines: ['Q'] },
          { name: 'Sheepshead Bay', coordinates: [-73.954155, 40.586896] as [number, number], lines: ['B', 'Q'] },
          { name: 'Brighton Beach', coordinates: [-73.961376, 40.577621] as [number, number], lines: ['B', 'Q'] },
          { name: 'Ocean Pkwy', coordinates: [-73.968501, 40.576312] as [number, number], lines: ['Q'] },
          { name: 'W 8 St-NY Aquarium', coordinates: [-73.975939, 40.576127] as [number, number], lines: ['F', 'Q'] },
          { name: 'Coney Island-Stillwell Av', coordinates: [-73.981233, 40.577422] as [number, number], lines: ['D', 'F', 'N', 'Q'] }
        ];

        qLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded Q train added successfully with ${qLineStations.length} stations`);
        return;
      }

      // R Train - Hardcoded implementation (Forest Hills-71 Av to Bay Ridge-95 St)
      if (lineId === 'R') {
        const markersForLine: maplibregl.Marker[] = [];
        const rLineCoords: [number, number][] = [
          [-73.844521, 40.721691],    // Forest Hills-71 Av
          [-73.861604, 40.729846],    // 63 Dr-Rego Park
          [-73.852719, 40.726523],    // 67 Av
          [-73.869229, 40.733106],    // Woodhaven Blvd
          [-73.877223, 40.737015],    // Grand Av-Newtown
          [-73.882017, 40.742454],    // Elmhurst Av
          [-73.891366, 40.746746],    // Jackson Hts-Roosevelt Av
          [-73.898453, 40.749669],    // 65 St
          [-73.906006, 40.752885],    // Northern Blvd
          [-73.913333, 40.756312],    // 46 St
          [-73.92074, 40.756879],     // Steinway St
          [-73.928781, 40.752039],    // 36 St
          [-73.937243, 40.748973],    // Queens Plaza
          [-73.9676125, 40.762592999999995], // Lexington Av/59 St
          [-73.973347, 40.764811],    // 5 Av/59 St
          [-73.980658, 40.764664],    // 57 St-7 Av
          [-73.984139, 40.759901],    // 49 St
          [-73.9875808, 40.755746],   // Times Sq-42 St
          [-73.9878865, 40.749643],   // 34 St-Herald Sq
          [-73.988691, 40.745494],    // 28 St
          [-73.989344, 40.741303],    // 23 St
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-73.992629, 40.730328],    // 8 St-NYU
          [-73.997702, 40.724329],    // Prince St
          [-74.00057999999999, 40.71870125], // Canal St
          [-74.006978, 40.713282],    // City Hall
          [-74.0095515, 40.712603],   // Cortlandt St
          [-74.013342, 40.70722],     // Rector St
          [-74.013329, 40.7025775],   // Whitehall St-South Ferry
          [-73.990642, 40.693241],    // Court St
          [-73.98664199999999, 40.692259], // Jay St-MetroTech
          [-73.981824, 40.690635],    // DeKalb Av
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.98311, 40.677316],     // Union St
          [-73.9890405, 40.670559499999996], // 4 Av-9 St
          [-73.992872, 40.665414],    // Prospect Av
          [-73.998091, 40.660397],    // 25 St
          [-74.003549, 40.655144],    // 36 St
          [-74.010006, 40.648939],    // 45 St
          [-74.014034, 40.645069],    // 53 St
          [-74.017881, 40.641362],    // 59 St
          [-74.023377, 40.634967],    // Bay Ridge Av
          [-74.02551, 40.629742],     // 77 St
          [-74.028398, 40.622687],    // 86 St
          [-74.030876, 40.616622]     // Bay Ridge-95 St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: rLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const rLineStations = [
          { name: 'Forest Hills-71 Av', coordinates: [-73.844521, 40.721691] as [number, number], lines: ['E', 'F', 'M', 'R'] },
          { name: '63 Dr-Rego Park', coordinates: [-73.861604, 40.729846] as [number, number], lines: ['M', 'R'] },
          { name: '67 Av', coordinates: [-73.852719, 40.726523] as [number, number], lines: ['M', 'R'] },
          { name: 'Woodhaven Blvd', coordinates: [-73.869229, 40.733106] as [number, number], lines: ['M', 'R'] },
          { name: 'Grand Av-Newtown', coordinates: [-73.877223, 40.737015] as [number, number], lines: ['M', 'R'] },
          { name: 'Elmhurst Av', coordinates: [-73.882017, 40.742454] as [number, number], lines: ['M', 'R'] },
          { name: 'Jackson Hts-Roosevelt Av', coordinates: [-73.891366, 40.746746] as [number, number], lines: ['7', 'E', 'F', 'M', 'R'] },
          { name: '65 St', coordinates: [-73.898453, 40.749669] as [number, number], lines: ['M', 'R'] },
          { name: 'Northern Blvd', coordinates: [-73.906006, 40.752885] as [number, number], lines: ['M', 'R'] },
          { name: '46 St', coordinates: [-73.913333, 40.756312] as [number, number], lines: ['M', 'R'] },
          { name: 'Steinway St', coordinates: [-73.92074, 40.756879] as [number, number], lines: ['M', 'R'] },
          { name: '36 St', coordinates: [-73.928781, 40.752039] as [number, number], lines: ['M', 'R'] },
          { name: 'Queens Plaza', coordinates: [-73.937243, 40.748973] as [number, number], lines: ['E', 'M', 'R'] },
          { name: 'Lexington Av/59 St', coordinates: [-73.9676125, 40.762592999999995] as [number, number], lines: ['4', '5', '6', 'N', 'R', 'W'] },
          { name: '5 Av/59 St', coordinates: [-73.973347, 40.764811] as [number, number], lines: ['N', 'R', 'W'] },
          { name: '57 St-7 Av', coordinates: [-73.980658, 40.764664] as [number, number], lines: ['N', 'Q', 'R', 'W'] },
          { name: '49 St', coordinates: [-73.984139, 40.759901] as [number, number], lines: ['N', 'R', 'W'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Herald Sq', coordinates: [-73.9878865, 40.749643] as [number, number], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: '28 St', coordinates: [-73.988691, 40.745494] as [number, number], lines: ['R', 'W'] },
          { name: '23 St', coordinates: [-73.989344, 40.741303] as [number, number], lines: ['R', 'W'] },
          { name: '14 St-Union Sq', coordinates: [-73.99041633333333, 40.735066] as [number, number], lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'] },
          { name: '8 St-NYU', coordinates: [-73.992629, 40.730328] as [number, number], lines: ['R', 'W'] },
          { name: 'Prince St', coordinates: [-73.997702, 40.724329] as [number, number], lines: ['R', 'W'] },
          { name: 'Canal St', coordinates: [-74.00057999999999, 40.71870125] as [number, number], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: 'City Hall', coordinates: [-74.006978, 40.713282] as [number, number], lines: ['R', 'W'] },
          { name: 'Cortlandt St', coordinates: [-74.0095515, 40.712603] as [number, number], lines: ['2', '3', 'A', 'C', 'E', 'R', 'W'] },
          { name: 'Rector St', coordinates: [-74.013342, 40.70722] as [number, number], lines: ['R', 'W'] },
          { name: 'Whitehall St-South Ferry', coordinates: [-74.013329, 40.7025775] as [number, number], lines: ['1', 'R', 'W'] },
          { name: 'Court St', coordinates: [-73.990642, 40.693241] as [number, number], lines: ['2', '3', '4', '5', 'R'] },
          { name: 'Jay St-MetroTech', coordinates: [-73.98664199999999, 40.692259] as [number, number], lines: ['A', 'C', 'F', 'R'] },
          { name: 'DeKalb Av', coordinates: [-73.981824, 40.690635] as [number, number], lines: ['B', 'Q', 'R'] },
          { name: 'Atlantic Av-Barclays Ctr', coordinates: [-73.97778866666665, 40.68416166666667] as [number, number], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: 'Union St', coordinates: [-73.98311, 40.677316] as [number, number], lines: ['R'] },
          { name: '4 Av-9 St', coordinates: [-73.9890405, 40.670559499999996] as [number, number], lines: ['F', 'G', 'R'] },
          { name: 'Prospect Av', coordinates: [-73.992872, 40.665414] as [number, number], lines: ['R'] },
          { name: '25 St', coordinates: [-73.998091, 40.660397] as [number, number], lines: ['R'] },
          { name: '36 St', coordinates: [-74.003549, 40.655144] as [number, number], lines: ['D', 'N', 'R'] },
          { name: '45 St', coordinates: [-74.010006, 40.648939] as [number, number], lines: ['R'] },
          { name: '53 St', coordinates: [-74.014034, 40.645069] as [number, number], lines: ['R'] },
          { name: '59 St', coordinates: [-74.017881, 40.641362] as [number, number], lines: ['N', 'R'] },
          { name: 'Bay Ridge Av', coordinates: [-74.023377, 40.634967] as [number, number], lines: ['R'] },
          { name: '77 St', coordinates: [-74.02551, 40.629742] as [number, number], lines: ['R'] },
          { name: '86 St', coordinates: [-74.028398, 40.622687] as [number, number], lines: ['R'] },
          { name: 'Bay Ridge-95 St', coordinates: [-74.030876, 40.616622] as [number, number], lines: ['R'] }
        ];

        rLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded R train added successfully with ${rLineStations.length} stations`);
        return;
      }

      // W Train - Hardcoded implementation (Astoria-Ditmars Blvd to Whitehall St-South Ferry)
      if (lineId === 'W') {
        const markersForLine: maplibregl.Marker[] = [];
        const wLineCoords: [number, number][] = [
          [-73.912034, 40.775036],    // Astoria-Ditmars Blvd
          [-73.917843, 40.770258],    // Astoria Blvd
          [-73.921479, 40.766779],    // 30 Av
          [-73.925508, 40.76182],     // Broadway
          [-73.929575, 40.756804],    // 36 Av
          [-73.932755, 40.752882],    // 39 Av-Dutch Kills
          [-73.940202, 40.750582],    // Queensboro Plaza
          [-73.9676125, 40.762592999999995], // Lexington Av/59 St
          [-73.973347, 40.764811],    // 5 Av/59 St
          [-73.980658, 40.764664],    // 57 St-7 Av
          [-73.984139, 40.759901],    // 49 St
          [-73.9875808, 40.755746],   // Times Sq-42 St
          [-73.9878865, 40.749643],   // 34 St-Herald Sq
          [-73.988691, 40.745494],    // 28 St
          [-73.989344, 40.741303],    // 23 St
          [-73.99041633333333, 40.735066], // 14 St-Union Sq
          [-73.992629, 40.730328],    // 8 St-NYU
          [-73.997702, 40.724329],    // Prince St
          [-74.00057999999999, 40.71870125], // Canal St
          [-74.006978, 40.713282],    // City Hall
          [-74.0095515, 40.712603],   // Cortlandt St
          [-74.013342, 40.70722],     // Rector St
          [-74.013329, 40.7025775]    // Whitehall St-South Ferry
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: wLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const wLineStations = [
          { name: 'Astoria-Ditmars Blvd', coordinates: [-73.912034, 40.775036] as [number, number], lines: ['N', 'W'] },
          { name: 'Astoria Blvd', coordinates: [-73.917843, 40.770258] as [number, number], lines: ['N', 'W'] },
          { name: '30 Av', coordinates: [-73.921479, 40.766779] as [number, number], lines: ['N', 'W'] },
          { name: 'Broadway', coordinates: [-73.925508, 40.76182] as [number, number], lines: ['N', 'W'] },
          { name: '36 Av', coordinates: [-73.929575, 40.756804] as [number, number], lines: ['N', 'W'] },
          { name: '39 Av-Dutch Kills', coordinates: [-73.932755, 40.752882] as [number, number], lines: ['N', 'W'] },
          { name: 'Queensboro Plaza', coordinates: [-73.940202, 40.750582] as [number, number], lines: ['7', 'N', 'W'] },
          { name: 'Lexington Av/59 St', coordinates: [-73.9676125, 40.762592999999995] as [number, number], lines: ['4', '5', '6', 'N', 'R', 'W'] },
          { name: '5 Av/59 St', coordinates: [-73.973347, 40.764811] as [number, number], lines: ['N', 'R', 'W'] },
          { name: '57 St-7 Av', coordinates: [-73.980658, 40.764664] as [number, number], lines: ['N', 'Q', 'R', 'W'] },
          { name: '49 St', coordinates: [-73.984139, 40.759901] as [number, number], lines: ['N', 'R', 'W'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Herald Sq', coordinates: [-73.9878865, 40.749643] as [number, number], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: '28 St', coordinates: [-73.988691, 40.745494] as [number, number], lines: ['R', 'W'] },
          { name: '23 St', coordinates: [-73.989344, 40.741303] as [number, number], lines: ['R', 'W'] },
          { name: '14 St-Union Sq', coordinates: [-73.99041633333333, 40.735066] as [number, number], lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'] },
          { name: '8 St-NYU', coordinates: [-73.992629, 40.730328] as [number, number], lines: ['R', 'W'] },
          { name: 'Prince St', coordinates: [-73.997702, 40.724329] as [number, number], lines: ['R', 'W'] },
          { name: 'Canal St', coordinates: [-74.00057999999999, 40.71870125] as [number, number], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: 'City Hall', coordinates: [-74.006978, 40.713282] as [number, number], lines: ['R', 'W'] },
          { name: 'Cortlandt St', coordinates: [-74.0095515, 40.712603] as [number, number], lines: ['2', '3', 'A', 'C', 'E', 'R', 'W'] },
          { name: 'Rector St', coordinates: [-74.013342, 40.70722] as [number, number], lines: ['R', 'W'] },
          { name: 'Whitehall St-South Ferry', coordinates: [-74.013329, 40.7025775] as [number, number], lines: ['1', 'R', 'W'] }
        ];

        wLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded W train added successfully with ${wLineStations.length} stations`);
        return;
      }

      // S-GC: 42 St Shuttle (Grand Central Shuttle) - Hardcoded implementation
      if (lineId === 'S-GC') {
        const markersForLine: maplibregl.Marker[] = [];
        const sgcLineCoords: [number, number][] = [
          [-73.9875808, 40.755746],   // Times Sq-42 St
          [-73.97735933333333, 40.751992]  // Grand Central-42 St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: sgcLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const sgcLineStations = [
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: 'Grand Central-42 St', coordinates: [-73.97735933333333, 40.751992] as [number, number], lines: ['4', '5', '6', '7', 'S'] }
        ];

        sgcLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded S-GC (42 St Shuttle) added successfully with ${sgcLineStations.length} stations`);
        return;
      }

      // S-FR: Franklin Shuttle - Hardcoded implementation
      if (lineId === 'S-FR') {
        const markersForLine: maplibregl.Marker[] = [];
        const sfrLineCoords: [number, number][] = [
          [-73.95633749999999, 40.680988],  // Franklin Av
          [-73.957624, 40.674772],          // Park Pl
          [-73.958688, 40.6705125],         // Botanic Garden
          [-73.962246, 40.661614]           // Prospect Park
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: sfrLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const sfrLineStations = [
          { name: 'Franklin Av', coordinates: [-73.95633749999999, 40.680988] as [number, number], lines: ['C', 'S'] },
          { name: 'Park Pl', coordinates: [-73.957624, 40.674772] as [number, number], lines: ['S'] },
          { name: 'Botanic Garden', coordinates: [-73.958688, 40.6705125] as [number, number], lines: ['2', '3', '4', '5', 'S'] },
          { name: 'Prospect Park', coordinates: [-73.962246, 40.661614] as [number, number], lines: ['B', 'Q', 'S'] }
        ];

        sfrLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded S-FR (Franklin Shuttle) added successfully with ${sfrLineStations.length} stations`);
        return;
      }

      // S-RK: Rockaway Shuttle - Hardcoded implementation
      if (lineId === 'S-RK') {
        const markersForLine: maplibregl.Marker[] = [];
        const srkLineCoords: [number, number][] = [
          [-73.815925, 40.608382],   // Broad Channel
          [-73.813641, 40.588034],   // Beach 90 St
          [-73.820558, 40.585307],   // Beach 98 St
          [-73.827559, 40.583209],   // Beach 105 St
          [-73.835592, 40.580903]    // Rockaway Park-Beach 116 St
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: srkLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const srkLineStations = [
          { name: 'Broad Channel', coordinates: [-73.815925, 40.608382] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 90 St', coordinates: [-73.813641, 40.588034] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 98 St', coordinates: [-73.820558, 40.585307] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 105 St', coordinates: [-73.827559, 40.583209] as [number, number], lines: ['A', 'S'] },
          { name: 'Rockaway Park-Beach 116 St', coordinates: [-73.835592, 40.580903] as [number, number], lines: ['A', 'S'] }
        ];

        srkLineStations.forEach((station, index) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.backgroundColor = MTA_COLORS[lineId] || '#000000';
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.cursor = 'pointer';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          let tooltip: maplibregl.Popup | null = null;

          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines
              .map(line => {
                const color = MTA_COLORS[line] || '#000000';
                return `<span class="w-6 h-6 rounded-full text-center leading-6 inline-block font-bold" style="background-color: ${color}; color: white;">${line}</span>`;
              })
              .join('');

            tooltip = new maplibregl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 25,
              className: 'glassmorphic-tooltip'
            })
              .setLngLat(station.coordinates)
              .setHTML(`
                <div class="glassmorphic-tooltip-content">
                  <div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${lineBadges}
                  </div>
                </div>
              `)
              .addTo(map.current!);
          });

          el.addEventListener('mouseleave', () => {
            if (tooltip) {
              tooltip.remove();
              tooltip = null;
            }
          });

          el.addEventListener('click', () => {
            map.current?.flyTo({
              center: station.coordinates,
              zoom: 14,
              duration: 1000
            });
          });

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat(station.coordinates)
            .addTo(map.current!);

          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded S-RK (Rockaway Shuttle) added successfully with ${srkLineStations.length} stations`);
        return;
      }

      // HARDCODED 7 LINE IMPLEMENTATION (Flushing Line - Main St to Hudson Yards)
      if (lineId === '7') {
        const markersForLine: maplibregl.Marker[] = [];
        const sevenLineCoords: [number, number][] = [
          [-73.83003, 40.7596],      // Flushing-Main St (terminal)
          [-73.845625, 40.754622],   // Mets-Willets Point
          [-73.855334, 40.75173],    // 111 St
          [-73.8627, 40.749865],     // 103 St-Corona Plaza
          [-73.869527, 40.749145],   // Junction Blvd
          [-73.876613, 40.748408],   // 90 St-Elmhurst Av
          [-73.883697, 40.747659],   // 82 St-Jackson Hts
          [-73.891366, 40.746746],   // Jackson Hts-Roosevelt Av
          [-73.896403, 40.746325],   // 69 St
          [-73.902984, 40.74563],    // 61 St-Woodside
          [-73.912549, 40.744149],   // 52 St
          [-73.918435, 40.743132],   // 46 St-Bliss St
          [-73.924016, 40.743781],   // 40 St-Lowery St
          [-73.930997, 40.744587],   // 33 St-Rawson St
          [-73.940202, 40.750582],   // Queensboro Plaza
          [-73.94503200000001, 40.747141000000006], // Court Sq-23 St
          [-73.948916, 40.742216],   // Hunters Point Av
          [-73.953581, 40.742626],   // Vernon Blvd-Jackson Av
          [-73.97735933333333, 40.751992], // Grand Central-42 St
          [-73.98326599999999, 40.7540215], // 42 St-Bryant Pk
          [-73.9875808, 40.755746],  // Times Sq-42 St
          [-74.00191, 40.755882],    // 34 St-Hudson Yards (terminal)
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: sevenLineCoords,
          },
        };

        map.current!.addSource(`line-${lineId}`, {
          type: 'geojson',
          data: lineGeoJSON,
        });

        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': MTA_COLORS[lineId] || '#000000',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        const sevenLineStations = [
          { name: 'Flushing-Main St', coordinates: [-73.83003, 40.7596] as [number, number], lines: ['7'] },
          { name: 'Mets-Willets Point', coordinates: [-73.845625, 40.754622] as [number, number], lines: ['7'] },
          { name: '111 St', coordinates: [-73.855334, 40.75173] as [number, number], lines: ['7'] },
          { name: '103 St-Corona Plaza', coordinates: [-73.8627, 40.749865] as [number, number], lines: ['7'] },
          { name: 'Junction Blvd', coordinates: [-73.869527, 40.749145] as [number, number], lines: ['7'] },
          { name: '90 St-Elmhurst Av', coordinates: [-73.876613, 40.748408] as [number, number], lines: ['7'] },
          { name: '82 St-Jackson Hts', coordinates: [-73.883697, 40.747659] as [number, number], lines: ['7'] },
          { name: 'Jackson Hts-Roosevelt Av', coordinates: [-73.891366, 40.746746] as [number, number], lines: ['7', 'E', 'F', 'M', 'R'] },
          { name: '69 St', coordinates: [-73.896403, 40.746325] as [number, number], lines: ['7'] },
          { name: '61 St-Woodside', coordinates: [-73.902984, 40.74563] as [number, number], lines: ['7'] },
          { name: '52 St', coordinates: [-73.912549, 40.744149] as [number, number], lines: ['7'] },
          { name: '46 St-Bliss St', coordinates: [-73.918435, 40.743132] as [number, number], lines: ['7'] },
          { name: '40 St-Lowery St', coordinates: [-73.924016, 40.743781] as [number, number], lines: ['7'] },
          { name: '33 St-Rawson St', coordinates: [-73.930997, 40.744587] as [number, number], lines: ['7'] },
          { name: 'Queensboro Plaza', coordinates: [-73.940202, 40.750582] as [number, number], lines: ['7', 'N', 'W'] },
          { name: 'Court Sq-23 St', coordinates: [-73.94503200000001, 40.747141000000006] as [number, number], lines: ['7', 'E', 'G', 'M'] },
          { name: 'Hunters Point Av', coordinates: [-73.948916, 40.742216] as [number, number], lines: ['7'] },
          { name: 'Vernon Blvd-Jackson Av', coordinates: [-73.953581, 40.742626] as [number, number], lines: ['7'] },
          { name: 'Grand Central-42 St', coordinates: [-73.97735933333333, 40.751992] as [number, number], lines: ['4', '5', '6', '7', 'S'] },
          { name: '42 St-Bryant Pk', coordinates: [-73.98326599999999, 40.7540215] as [number, number], lines: ['7', 'B', 'D', 'F', 'M'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Hudson Yards', coordinates: [-74.00191, 40.755882] as [number, number], lines: ['7'] },
        ];

        sevenLineStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background-color: ${MTA_COLORS[lineId]}; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

          let tooltip: maplibregl.Popup | null = null;
          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines.map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000'}; color: white; text-align: center; font-weight: bold; font-size: 14px;">${line}</span>`).join('');
            tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'glassmorphic-tooltip' })
              .setLngLat(station.coordinates)
              .setHTML(`<div class="glassmorphic-tooltip-content"><div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">${lineBadges}</div></div>`)
              .addTo(map.current!);
          });
          el.addEventListener('mouseleave', () => { if (tooltip) { tooltip.remove(); tooltip = null; } });
          el.addEventListener('click', () => { map.current?.flyTo({ center: station.coordinates, zoom: 14, duration: 1000 }); });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(station.coordinates).addTo(map.current!);
          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded 7 train added successfully with ${sevenLineStations.length} stations`);
        return;
      }

      // HARDCODED A LINE IMPLEMENTATION (8th Ave Express - Multi-branch: Inwood to Far Rockaway/Lefferts/Rockaway Park)
      if (lineId === 'A') {
        const markersForLine: maplibregl.Marker[] = [];

        // Main trunk: Inwood-207 St to Euclid Av
        const aLineMainCoords: [number, number][] = [
          [-73.919899, 40.868072],   // Inwood-207 St (terminal)
          [-73.927271, 40.865491],   // Dyckman St
          [-73.93418, 40.859022],    // 190 St
          [-73.937969, 40.851695],   // 181 St
          [-73.939704, 40.847391],   // 175 St
          [-73.939847, 40.8406375],  // 168 St
          [-73.944216, 40.824783],   // 145 St
          [-73.952343, 40.811109],   // 125 St
          [-73.9818325, 40.7682715], // 59 St-Columbus Circle
          [-73.9875808, 40.755746],  // Times Sq-42 St
          [-73.993391, 40.752287],   // 34 St-Penn Station
          [-74.002134, 40.740335],   // 8 Av (14 St)
          [-74.000495, 40.732338],   // W 4 St-Wash Sq
          [-74.005229, 40.720824],   // Canal St
          [-74.0095515, 40.712603],  // Cortlandt St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-73.990531, 40.699337],   // High St
          [-73.98664199999999, 40.692259], // Jay St-MetroTech
          [-73.985001, 40.688484],   // Hoyt-Schermerhorn Sts
          [-73.950426, 40.680438],   // Nostrand Av
          [-73.930729, 40.679364],   // Utica Av
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.872106, 40.675377],   // Euclid Av
        ];

        // Lefferts Branch: Euclid Av to Ozone Park-Lefferts Blvd
        const aLineLeffertsCoords: [number, number][] = [
          [-73.872106, 40.675377],   // Euclid Av (branch point)
          [-73.86505, 40.677044],    // Grant Av
          [-73.858992, 40.679371],   // 80 St
          [-73.85147, 40.679843],    // 88 St
          [-73.843853, 40.680429],   // Rockaway Blvd
          [-73.837683, 40.681711],   // 104 St
          [-73.832163, 40.684331],   // 111 St
          [-73.825798, 40.685951],   // Ozone Park-Lefferts Blvd (terminal)
        ];

        // Far Rockaway Branch: Broadway Junction to Far Rockaway
        const aLineFarRockawayCoords: [number, number][] = [
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.872106, 40.675377],   // Euclid Av
          [-73.835919, 40.672097],   // Aqueduct Racetrack
          [-73.834058, 40.668234],   // Aqueduct-N Conduit Av
          [-73.830301, 40.660476],   // Howard Beach-JFK Airport
          [-73.815925, 40.608382],   // Broad Channel
          [-73.796924, 40.590927],   // Beach 67 St
          [-73.788522, 40.592374],   // Beach 60 St
          [-73.776013, 40.592943],   // Beach 44 St
          [-73.768175, 40.595398],   // Beach 36 St
          [-73.761353, 40.600066],   // Beach 25 St
          [-73.755405, 40.603995],   // Far Rockaway-Mott Av (terminal)
        ];

        // Rockaway Park Branch: Broad Channel to Rockaway Park
        const aLineRockawayParkCoords: [number, number][] = [
          [-73.815925, 40.608382],   // Broad Channel
          [-73.813641, 40.588034],   // Beach 90 St
          [-73.820558, 40.585307],   // Beach 98 St
          [-73.827559, 40.583209],   // Beach 105 St
          [-73.835592, 40.580903],   // Rockaway Park-Beach 116 St (terminal)
        ];

        // Add all three branches as separate line segments
        const aLineGeoJSON = {
          type: 'FeatureCollection' as const,
          features: [
            { type: 'Feature' as const, properties: { branch: 'main' }, geometry: { type: 'LineString' as const, coordinates: aLineMainCoords } },
            { type: 'Feature' as const, properties: { branch: 'lefferts' }, geometry: { type: 'LineString' as const, coordinates: aLineLeffertsCoords } },
            { type: 'Feature' as const, properties: { branch: 'far-rockaway' }, geometry: { type: 'LineString' as const, coordinates: aLineFarRockawayCoords } },
            { type: 'Feature' as const, properties: { branch: 'rockaway-park' }, geometry: { type: 'LineString' as const, coordinates: aLineRockawayParkCoords } },
          ],
        };

        map.current!.addSource(`line-${lineId}`, { type: 'geojson', data: aLineGeoJSON });
        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': MTA_COLORS[lineId] || '#000000', 'line-width': 4, 'line-opacity': 0.8 },
        });

        const aLineStations = [
          { name: 'Inwood-207 St', coordinates: [-73.919899, 40.868072] as [number, number], lines: ['A'] },
          { name: 'Dyckman St', coordinates: [-73.927271, 40.865491] as [number, number], lines: ['A'] },
          { name: '190 St', coordinates: [-73.93418, 40.859022] as [number, number], lines: ['A'] },
          { name: '181 St', coordinates: [-73.937969, 40.851695] as [number, number], lines: ['A'] },
          { name: '175 St', coordinates: [-73.939704, 40.847391] as [number, number], lines: ['A'] },
          { name: '168 St', coordinates: [-73.939847, 40.8406375] as [number, number], lines: ['1', 'A', 'C'] },
          { name: '145 St', coordinates: [-73.944216, 40.824783] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '125 St', coordinates: [-73.952343, 40.811109] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '59 St-Columbus Circle', coordinates: [-73.9818325, 40.7682715] as [number, number], lines: ['1', 'A', 'B', 'C', 'D'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Penn Station', coordinates: [-73.993391, 40.752287] as [number, number], lines: ['A', 'C', 'E'] },
          { name: '8 Av', coordinates: [-74.002134, 40.740335] as [number, number], lines: ['A', 'C', 'E', 'L'] },
          { name: 'W 4 St-Wash Sq', coordinates: [-74.000495, 40.732338] as [number, number], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: 'Canal St', coordinates: [-74.005229, 40.720824] as [number, number], lines: ['A', 'C', 'E'] },
          { name: 'Cortlandt St', coordinates: [-74.0095515, 40.712603] as [number, number], lines: ['2', '3', 'A', 'C', 'E', 'R', 'W'] },
          { name: 'Fulton St', coordinates: [-74.00783824999999, 40.71008875] as [number, number], lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
          { name: 'High St', coordinates: [-73.990531, 40.699337] as [number, number], lines: ['A', 'C'] },
          { name: 'Jay St-MetroTech', coordinates: [-73.98664199999999, 40.692259] as [number, number], lines: ['A', 'C', 'F', 'R'] },
          { name: 'Hoyt-Schermerhorn Sts', coordinates: [-73.985001, 40.688484] as [number, number], lines: ['A', 'C', 'G'] },
          { name: 'Nostrand Av', coordinates: [-73.950426, 40.680438] as [number, number], lines: ['A', 'C'] },
          { name: 'Utica Av', coordinates: [-73.930729, 40.679364] as [number, number], lines: ['A', 'C'] },
          { name: 'Broadway Junction', coordinates: [-73.90435599999999, 40.678896] as [number, number], lines: ['A', 'C', 'J', 'L', 'Z'] },
          { name: 'Euclid Av', coordinates: [-73.872106, 40.675377] as [number, number], lines: ['A', 'C'] },
          { name: 'Grant Av', coordinates: [-73.86505, 40.677044] as [number, number], lines: ['A'] },
          { name: '80 St', coordinates: [-73.858992, 40.679371] as [number, number], lines: ['A'] },
          { name: '88 St', coordinates: [-73.85147, 40.679843] as [number, number], lines: ['A'] },
          { name: 'Rockaway Blvd', coordinates: [-73.843853, 40.680429] as [number, number], lines: ['A'] },
          { name: '104 St', coordinates: [-73.837683, 40.681711] as [number, number], lines: ['A'] },
          { name: '111 St', coordinates: [-73.832163, 40.684331] as [number, number], lines: ['A'] },
          { name: 'Ozone Park-Lefferts Blvd', coordinates: [-73.825798, 40.685951] as [number, number], lines: ['A'] },
          { name: 'Aqueduct Racetrack', coordinates: [-73.835919, 40.672097] as [number, number], lines: ['A'] },
          { name: 'Aqueduct-N Conduit Av', coordinates: [-73.834058, 40.668234] as [number, number], lines: ['A'] },
          { name: 'Howard Beach-JFK Airport', coordinates: [-73.830301, 40.660476] as [number, number], lines: ['A'] },
          { name: 'Broad Channel', coordinates: [-73.815925, 40.608382] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 67 St', coordinates: [-73.796924, 40.590927] as [number, number], lines: ['A'] },
          { name: 'Beach 60 St', coordinates: [-73.788522, 40.592374] as [number, number], lines: ['A'] },
          { name: 'Beach 44 St', coordinates: [-73.776013, 40.592943] as [number, number], lines: ['A'] },
          { name: 'Beach 36 St', coordinates: [-73.768175, 40.595398] as [number, number], lines: ['A'] },
          { name: 'Beach 25 St', coordinates: [-73.761353, 40.600066] as [number, number], lines: ['A'] },
          { name: 'Far Rockaway-Mott Av', coordinates: [-73.755405, 40.603995] as [number, number], lines: ['A'] },
          { name: 'Beach 90 St', coordinates: [-73.813641, 40.588034] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 98 St', coordinates: [-73.820558, 40.585307] as [number, number], lines: ['A', 'S'] },
          { name: 'Beach 105 St', coordinates: [-73.827559, 40.583209] as [number, number], lines: ['A', 'S'] },
          { name: 'Rockaway Park-Beach 116 St', coordinates: [-73.835592, 40.580903] as [number, number], lines: ['A', 'S'] },
        ];

        aLineStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background-color: ${MTA_COLORS[lineId]}; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

          let tooltip: maplibregl.Popup | null = null;
          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines.map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000'}; color: white; text-align: center; font-weight: bold; font-size: 14px;">${line}</span>`).join('');
            tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'glassmorphic-tooltip' })
              .setLngLat(station.coordinates)
              .setHTML(`<div class="glassmorphic-tooltip-content"><div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">${lineBadges}</div></div>`)
              .addTo(map.current!);
          });
          el.addEventListener('mouseleave', () => { if (tooltip) { tooltip.remove(); tooltip = null; } });
          el.addEventListener('click', () => { map.current?.flyTo({ center: station.coordinates, zoom: 14, duration: 1000 }); });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(station.coordinates).addTo(map.current!);
          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded A train added successfully with ${aLineStations.length} stations (3 branches)`);
        return;
      }

      // HARDCODED B LINE IMPLEMENTATION (6th Ave Express - Bedford Park to Brighton Beach)
      if (lineId === 'B') {
        const markersForLine: maplibregl.Marker[] = [];
        const bLineCoords: [number, number][] = [
          [-73.887138, 40.873244],   // Bedford Park Blvd (terminal)
          [-73.893509, 40.866978],   // Kingsbridge Rd
          [-73.897749, 40.861296],   // Fordham Rd
          [-73.900741, 40.856093],   // 182-183 Sts
          [-73.905227, 40.85041],    // Tremont Av
          [-73.910136, 40.8459],     // 174-175 Sts
          [-73.9134, 40.839306],     // 170 St
          [-73.91844, 40.833771],    // 167 St
          [-73.925741, 40.8279495],  // 161 St-Yankee Stadium
          [-73.938209, 40.830135],   // 155 St
          [-73.944216, 40.824783],   // 145 St
          [-73.947649, 40.817894],   // 135 St
          [-73.952343, 40.811109],   // 125 St
          [-73.954882, 40.805085],   // 116 St
          [-73.958161, 40.800603],   // Cathedral Pkwy (110 St)
          [-73.961454, 40.796092],   // 103 St
          [-73.964696, 40.791642],   // 96 St
          [-73.968916, 40.785868],   // 86 St
          [-73.972143, 40.781433],   // 81 St-Museum of Natural History
          [-73.97641, 40.775594],    // 72 St
          [-73.9818325, 40.7682715], // 59 St-Columbus Circle
          [-73.981329, 40.758663],   // 47-50 Sts-Rockefeller Ctr
          [-73.98326599999999, 40.7540215], // 42 St-Bryant Pk
          [-73.9878865, 40.749643],  // 34 St-Herald Sq
          [-74.000495, 40.732338],   // W 4 St-Wash Sq
          [-73.9954315, 40.725606],  // Broadway-Lafayette St
          [-73.993753, 40.718267],   // Grand St
          [-73.981824, 40.690635],   // DeKalb Av
          [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
          [-73.972367, 40.67705],    // 7 Av
          [-73.962246, 40.661614],   // Prospect Park
          [-73.962982, 40.650527],   // Church Av
          [-73.962793, 40.635082],   // Newkirk Plaza
          [-73.957734, 40.60867],    // Kings Hwy
          [-73.954155, 40.586896],   // Sheepshead Bay
          [-73.961376, 40.577621],   // Brighton Beach (terminal)
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'LineString' as const, coordinates: bLineCoords },
        };

        map.current!.addSource(`line-${lineId}`, { type: 'geojson', data: lineGeoJSON });
        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': MTA_COLORS[lineId] || '#000000', 'line-width': 4, 'line-opacity': 0.8 },
        });

        const bLineStations = [
          { name: 'Bedford Park Blvd', coordinates: [-73.887138, 40.873244] as [number, number], lines: ['B', 'D'] },
          { name: 'Kingsbridge Rd', coordinates: [-73.893509, 40.866978] as [number, number], lines: ['B', 'D'] },
          { name: 'Fordham Rd', coordinates: [-73.897749, 40.861296] as [number, number], lines: ['B', 'D'] },
          { name: '182-183 Sts', coordinates: [-73.900741, 40.856093] as [number, number], lines: ['B', 'D'] },
          { name: 'Tremont Av', coordinates: [-73.905227, 40.85041] as [number, number], lines: ['B', 'D'] },
          { name: '174-175 Sts', coordinates: [-73.910136, 40.8459] as [number, number], lines: ['B', 'D'] },
          { name: '170 St', coordinates: [-73.9134, 40.839306] as [number, number], lines: ['B', 'D'] },
          { name: '167 St', coordinates: [-73.91844, 40.833771] as [number, number], lines: ['B', 'D'] },
          { name: '161 St-Yankee Stadium', coordinates: [-73.925741, 40.8279495] as [number, number], lines: ['4', 'B', 'D'] },
          { name: '155 St', coordinates: [-73.938209, 40.830135] as [number, number], lines: ['B', 'D'] },
          { name: '145 St', coordinates: [-73.944216, 40.824783] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '135 St', coordinates: [-73.947649, 40.817894] as [number, number], lines: ['B', 'C'] },
          { name: '125 St', coordinates: [-73.952343, 40.811109] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '116 St', coordinates: [-73.954882, 40.805085] as [number, number], lines: ['B', 'C'] },
          { name: 'Cathedral Pkwy (110 St)', coordinates: [-73.958161, 40.800603] as [number, number], lines: ['B', 'C'] },
          { name: '103 St', coordinates: [-73.961454, 40.796092] as [number, number], lines: ['B', 'C'] },
          { name: '96 St', coordinates: [-73.964696, 40.791642] as [number, number], lines: ['B', 'C'] },
          { name: '86 St', coordinates: [-73.968916, 40.785868] as [number, number], lines: ['B', 'C'] },
          { name: '81 St-Museum of Natural History', coordinates: [-73.972143, 40.781433] as [number, number], lines: ['B', 'C'] },
          { name: '72 St', coordinates: [-73.97641, 40.775594] as [number, number], lines: ['B', 'C'] },
          { name: '59 St-Columbus Circle', coordinates: [-73.9818325, 40.7682715] as [number, number], lines: ['1', 'A', 'B', 'C', 'D'] },
          { name: '47-50 Sts-Rockefeller Ctr', coordinates: [-73.981329, 40.758663] as [number, number], lines: ['B', 'D', 'F', 'M'] },
          { name: '42 St-Bryant Pk', coordinates: [-73.98326599999999, 40.7540215] as [number, number], lines: ['7', 'B', 'D', 'F', 'M'] },
          { name: '34 St-Herald Sq', coordinates: [-73.9878865, 40.749643] as [number, number], lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'] },
          { name: 'W 4 St-Wash Sq', coordinates: [-74.000495, 40.732338] as [number, number], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: 'Broadway-Lafayette St', coordinates: [-73.9954315, 40.725606] as [number, number], lines: ['6', 'B', 'D', 'F', 'M'] },
          { name: 'Grand St', coordinates: [-73.993753, 40.718267] as [number, number], lines: ['B', 'D'] },
          { name: 'DeKalb Av', coordinates: [-73.981824, 40.690635] as [number, number], lines: ['B', 'Q', 'R'] },
          { name: 'Atlantic Av-Barclays Ctr', coordinates: [-73.97778866666665, 40.68416166666667] as [number, number], lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'] },
          { name: '7 Av', coordinates: [-73.972367, 40.67705] as [number, number], lines: ['B', 'Q'] },
          { name: 'Prospect Park', coordinates: [-73.962246, 40.661614] as [number, number], lines: ['B', 'Q', 'S'] },
          { name: 'Church Av', coordinates: [-73.962982, 40.650527] as [number, number], lines: ['B', 'Q'] },
          { name: 'Newkirk Plaza', coordinates: [-73.962793, 40.635082] as [number, number], lines: ['B', 'Q'] },
          { name: 'Kings Hwy', coordinates: [-73.957734, 40.60867] as [number, number], lines: ['B', 'Q'] },
          { name: 'Sheepshead Bay', coordinates: [-73.954155, 40.586896] as [number, number], lines: ['B', 'Q'] },
          { name: 'Brighton Beach', coordinates: [-73.961376, 40.577621] as [number, number], lines: ['B', 'Q'] },
        ];

        bLineStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background-color: ${MTA_COLORS[lineId]}; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

          let tooltip: maplibregl.Popup | null = null;
          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines.map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000'}; color: white; text-align: center; font-weight: bold; font-size: 14px;">${line}</span>`).join('');
            tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'glassmorphic-tooltip' })
              .setLngLat(station.coordinates)
              .setHTML(`<div class="glassmorphic-tooltip-content"><div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">${lineBadges}</div></div>`)
              .addTo(map.current!);
          });
          el.addEventListener('mouseleave', () => { if (tooltip) { tooltip.remove(); tooltip = null; } });
          el.addEventListener('click', () => { map.current?.flyTo({ center: station.coordinates, zoom: 14, duration: 1000 }); });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(station.coordinates).addTo(map.current!);
          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded B train added successfully with ${bLineStations.length} stations`);
        return;
      }

      // HARDCODED C LINE IMPLEMENTATION (8th Ave Local - 168 St to Euclid Av)
      if (lineId === 'C') {
        const markersForLine: maplibregl.Marker[] = [];
        const cLineCoords: [number, number][] = [
          [-73.939847, 40.8406375],  // 168 St (terminal)
          [-73.939892, 40.836013],   // 163 St-Amsterdam Av
          [-73.941514, 40.830518],   // 155 St
          [-73.944216, 40.824783],   // 145 St
          [-73.947649, 40.817894],   // 135 St
          [-73.952343, 40.811109],   // 125 St
          [-73.954882, 40.805085],   // 116 St
          [-73.958161, 40.800603],   // Cathedral Pkwy (110 St)
          [-73.961454, 40.796092],   // 103 St
          [-73.964696, 40.791642],   // 96 St
          [-73.968916, 40.785868],   // 86 St
          [-73.972143, 40.781433],   // 81 St-Museum of Natural History
          [-73.97641, 40.775594],    // 72 St
          [-73.9818325, 40.7682715], // 59 St-Columbus Circle
          [-73.985984, 40.762456],   // 50 St
          [-73.9875808, 40.755746],  // Times Sq-42 St
          [-73.993391, 40.752287],   // 34 St-Penn Station
          [-73.998041, 40.745906],   // 23 St
          [-74.002134, 40.740335],   // 8 Av (14 St)
          [-74.000495, 40.732338],   // W 4 St-Wash Sq
          [-74.003739, 40.726227],   // Spring St
          [-74.005229, 40.720824],   // Canal St
          [-74.0095515, 40.712603],  // Cortlandt St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-73.990531, 40.699337],   // High St
          [-73.98664199999999, 40.692259], // Jay St-MetroTech
          [-73.985001, 40.688484],   // Hoyt-Schermerhorn Sts
          [-73.973946, 40.686113],   // Lafayette Av
          [-73.965838, 40.683263],   // Clinton-Washington Avs
          [-73.95633749999999, 40.680988], // Franklin Av
          [-73.950426, 40.680438],   // Nostrand Av
          [-73.940858, 40.679921],   // Kingston-Throop Avs
          [-73.930729, 40.679364],   // Utica Av
          [-73.920786, 40.678822],   // Ralph Av
          [-73.911946, 40.67834],    // Rockaway Av
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.896548, 40.674542],   // Liberty Av
          [-73.890358, 40.67271],    // Van Siclen Av
          [-73.88075, 40.67413],     // Shepherd Av
          [-73.872106, 40.675377],   // Euclid Av (terminal)
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'LineString' as const, coordinates: cLineCoords },
        };

        map.current!.addSource(`line-${lineId}`, { type: 'geojson', data: lineGeoJSON });
        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': MTA_COLORS[lineId] || '#000000', 'line-width': 4, 'line-opacity': 0.8 },
        });

        const cLineStations = [
          { name: '168 St', coordinates: [-73.939847, 40.8406375] as [number, number], lines: ['1', 'A', 'C'] },
          { name: '163 St-Amsterdam Av', coordinates: [-73.939892, 40.836013] as [number, number], lines: ['C'] },
          { name: '155 St', coordinates: [-73.941514, 40.830518] as [number, number], lines: ['C'] },
          { name: '145 St', coordinates: [-73.944216, 40.824783] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '135 St', coordinates: [-73.947649, 40.817894] as [number, number], lines: ['B', 'C'] },
          { name: '125 St', coordinates: [-73.952343, 40.811109] as [number, number], lines: ['A', 'B', 'C', 'D'] },
          { name: '116 St', coordinates: [-73.954882, 40.805085] as [number, number], lines: ['B', 'C'] },
          { name: 'Cathedral Pkwy (110 St)', coordinates: [-73.958161, 40.800603] as [number, number], lines: ['B', 'C'] },
          { name: '103 St', coordinates: [-73.961454, 40.796092] as [number, number], lines: ['B', 'C'] },
          { name: '96 St', coordinates: [-73.964696, 40.791642] as [number, number], lines: ['B', 'C'] },
          { name: '86 St', coordinates: [-73.968916, 40.785868] as [number, number], lines: ['B', 'C'] },
          { name: '81 St-Museum of Natural History', coordinates: [-73.972143, 40.781433] as [number, number], lines: ['B', 'C'] },
          { name: '72 St', coordinates: [-73.97641, 40.775594] as [number, number], lines: ['B', 'C'] },
          { name: '59 St-Columbus Circle', coordinates: [-73.9818325, 40.7682715] as [number, number], lines: ['1', 'A', 'B', 'C', 'D'] },
          { name: '50 St', coordinates: [-73.985984, 40.762456] as [number, number], lines: ['C', 'E'] },
          { name: 'Times Sq-42 St', coordinates: [-73.9875808, 40.755746] as [number, number], lines: ['1', '2', '3', '7', 'A', 'C', 'E', 'N', 'Q', 'R', 'S', 'W'] },
          { name: '34 St-Penn Station', coordinates: [-73.993391, 40.752287] as [number, number], lines: ['A', 'C', 'E'] },
          { name: '23 St', coordinates: [-73.998041, 40.745906] as [number, number], lines: ['C', 'E'] },
          { name: '8 Av', coordinates: [-74.002134, 40.740335] as [number, number], lines: ['A', 'C', 'E', 'L'] },
          { name: 'W 4 St-Wash Sq', coordinates: [-74.000495, 40.732338] as [number, number], lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'] },
          { name: 'Spring St', coordinates: [-74.003739, 40.726227] as [number, number], lines: ['C', 'E'] },
          { name: 'Canal St', coordinates: [-74.005229, 40.720824] as [number, number], lines: ['A', 'C', 'E'] },
          { name: 'Cortlandt St', coordinates: [-74.0095515, 40.712603] as [number, number], lines: ['2', '3', 'A', 'C', 'E', 'R', 'W'] },
          { name: 'Fulton St', coordinates: [-74.00783824999999, 40.71008875] as [number, number], lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
          { name: 'High St', coordinates: [-73.990531, 40.699337] as [number, number], lines: ['A', 'C'] },
          { name: 'Jay St-MetroTech', coordinates: [-73.98664199999999, 40.692259] as [number, number], lines: ['A', 'C', 'F', 'R'] },
          { name: 'Hoyt-Schermerhorn Sts', coordinates: [-73.985001, 40.688484] as [number, number], lines: ['A', 'C', 'G'] },
          { name: 'Lafayette Av', coordinates: [-73.973946, 40.686113] as [number, number], lines: ['C'] },
          { name: 'Clinton-Washington Avs', coordinates: [-73.965838, 40.683263] as [number, number], lines: ['C'] },
          { name: 'Franklin Av', coordinates: [-73.95633749999999, 40.680988] as [number, number], lines: ['C', 'S'] },
          { name: 'Nostrand Av', coordinates: [-73.950426, 40.680438] as [number, number], lines: ['A', 'C'] },
          { name: 'Kingston-Throop Avs', coordinates: [-73.940858, 40.679921] as [number, number], lines: ['C'] },
          { name: 'Utica Av', coordinates: [-73.930729, 40.679364] as [number, number], lines: ['A', 'C'] },
          { name: 'Ralph Av', coordinates: [-73.920786, 40.678822] as [number, number], lines: ['C'] },
          { name: 'Rockaway Av', coordinates: [-73.911946, 40.67834] as [number, number], lines: ['C'] },
          { name: 'Broadway Junction', coordinates: [-73.90435599999999, 40.678896] as [number, number], lines: ['A', 'C', 'J', 'L', 'Z'] },
          { name: 'Liberty Av', coordinates: [-73.896548, 40.674542] as [number, number], lines: ['C'] },
          { name: 'Van Siclen Av', coordinates: [-73.890358, 40.67271] as [number, number], lines: ['C'] },
          { name: 'Shepherd Av', coordinates: [-73.88075, 40.67413] as [number, number], lines: ['C'] },
          { name: 'Euclid Av', coordinates: [-73.872106, 40.675377] as [number, number], lines: ['A', 'C'] },
        ];

        cLineStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background-color: ${MTA_COLORS[lineId]}; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

          let tooltip: maplibregl.Popup | null = null;
          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines.map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000'}; color: white; text-align: center; font-weight: bold; font-size: 14px;">${line}</span>`).join('');
            tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'glassmorphic-tooltip' })
              .setLngLat(station.coordinates)
              .setHTML(`<div class="glassmorphic-tooltip-content"><div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">${lineBadges}</div></div>`)
              .addTo(map.current!);
          });
          el.addEventListener('mouseleave', () => { if (tooltip) { tooltip.remove(); tooltip = null; } });
          el.addEventListener('click', () => { map.current?.flyTo({ center: station.coordinates, zoom: 14, duration: 1000 }); });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(station.coordinates).addTo(map.current!);
          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded C train added successfully with ${cLineStations.length} stations`);
        return;
      }

      // HARDCODED Z LINE IMPLEMENTATION (Nassau Street Express - Skip-stop service)
      if (lineId === 'Z') {
        const markersForLine: maplibregl.Marker[] = [];
        const zLineCoords: [number, number][] = [
          [-73.801109, 40.702147],   // Jamaica Center-Parsons/Archer (terminal)
          [-73.807969, 40.700486],   // Sutphin Blvd-Archer Av-JFK Airport
          [-73.828294, 40.700492],   // 121 St
          [-73.851576, 40.693879],   // Woodhaven Blvd
          [-73.84433, 40.695178],    // 104 St
          [-73.880039, 40.68141],    // Norwood Av
          [-73.873785, 40.683194],   // Crescent St
          [-73.867139, 40.691324],   // 75 St-Elderts Ln
          [-73.90435599999999, 40.678896], // Broadway Junction
          [-73.898654, 40.676992],   // Alabama Av
          [-73.891688, 40.678024],   // Van Siclen Av
          [-73.910456, 40.682893],   // Chauncey St
          [-73.92227, 40.68963],     // Gates Av
          [-73.935657, 40.697207],   // Myrtle Av
          [-73.957757, 40.708359],   // Marcy Av
          [-73.9877755, 40.718463],  // Delancey St-Essex St
          [-73.993915, 40.72028],    // Bowery
          [-74.00057999999999, 40.71870125], // Canal St
          [-74.003766, 40.713154],   // Chambers St
          [-74.00783824999999, 40.71008875], // Fulton St
          [-74.011056, 40.706476],   // Broad St (terminal)
        ];

        const lineGeoJSON = {
          type: 'Feature' as const,
          properties: {},
          geometry: { type: 'LineString' as const, coordinates: zLineCoords },
        };

        map.current!.addSource(`line-${lineId}`, { type: 'geojson', data: lineGeoJSON });
        map.current!.addLayer({
          id: `line-${lineId}`,
          type: 'line',
          source: `line-${lineId}`,
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': MTA_COLORS[lineId] || '#000000', 'line-width': 4, 'line-opacity': 0.8 },
        });

        const zLineStations = [
          { name: 'Jamaica Center-Parsons/Archer', coordinates: [-73.801109, 40.702147] as [number, number], lines: ['E', 'J', 'Z'] },
          { name: 'Sutphin Blvd-Archer Av-JFK Airport', coordinates: [-73.807969, 40.700486] as [number, number], lines: ['E', 'J', 'Z'] },
          { name: '121 St', coordinates: [-73.828294, 40.700492] as [number, number], lines: ['J', 'Z'] },
          { name: 'Woodhaven Blvd', coordinates: [-73.851576, 40.693879] as [number, number], lines: ['J', 'Z'] },
          { name: '104 St', coordinates: [-73.84433, 40.695178] as [number, number], lines: ['J', 'Z'] },
          { name: 'Norwood Av', coordinates: [-73.880039, 40.68141] as [number, number], lines: ['J', 'Z'] },
          { name: 'Crescent St', coordinates: [-73.873785, 40.683194] as [number, number], lines: ['J', 'Z'] },
          { name: '75 St-Elderts Ln', coordinates: [-73.867139, 40.691324] as [number, number], lines: ['J', 'Z'] },
          { name: 'Broadway Junction', coordinates: [-73.90435599999999, 40.678896] as [number, number], lines: ['A', 'C', 'J', 'L', 'Z'] },
          { name: 'Alabama Av', coordinates: [-73.898654, 40.676992] as [number, number], lines: ['J', 'Z'] },
          { name: 'Van Siclen Av', coordinates: [-73.891688, 40.678024] as [number, number], lines: ['J', 'Z'] },
          { name: 'Chauncey St', coordinates: [-73.910456, 40.682893] as [number, number], lines: ['J', 'Z'] },
          { name: 'Gates Av', coordinates: [-73.92227, 40.68963] as [number, number], lines: ['J', 'Z'] },
          { name: 'Myrtle Av', coordinates: [-73.935657, 40.697207] as [number, number], lines: ['J', 'M', 'Z'] },
          { name: 'Marcy Av', coordinates: [-73.957757, 40.708359] as [number, number], lines: ['J', 'M', 'Z'] },
          { name: 'Delancey St-Essex St', coordinates: [-73.9877755, 40.718463] as [number, number], lines: ['F', 'J', 'M', 'Z'] },
          { name: 'Bowery', coordinates: [-73.993915, 40.72028] as [number, number], lines: ['J', 'Z'] },
          { name: 'Canal St', coordinates: [-74.00057999999999, 40.71870125] as [number, number], lines: ['6', 'J', 'N', 'Q', 'R', 'W', 'Z'] },
          { name: 'Chambers St', coordinates: [-74.003766, 40.713154] as [number, number], lines: ['4', '5', '6', 'J', 'Z'] },
          { name: 'Fulton St', coordinates: [-74.00783824999999, 40.71008875] as [number, number], lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'] },
          { name: 'Broad St', coordinates: [-74.011056, 40.706476] as [number, number], lines: ['J', 'Z'] },
        ];

        zLineStations.forEach((station) => {
          const el = document.createElement('div');
          el.className = 'subway-marker';
          el.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background-color: ${MTA_COLORS[lineId]}; border: 3px solid white; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.3);`;

          let tooltip: maplibregl.Popup | null = null;
          el.addEventListener('mouseenter', () => {
            const lineBadges = station.lines.map(line => `<span style="display: inline-block; width: 24px; height: 24px; line-height: 24px; border-radius: 50%; background-color: ${MTA_COLORS[line] || '#000'}; color: white; text-align: center; font-weight: bold; font-size: 14px;">${line}</span>`).join('');
            tooltip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 25, className: 'glassmorphic-tooltip' })
              .setLngLat(station.coordinates)
              .setHTML(`<div class="glassmorphic-tooltip-content"><div style="font-weight: bold; margin-bottom: 8px; color: white;">${station.name}</div><div style="display: flex; flex-wrap: wrap; gap: 6px;">${lineBadges}</div></div>`)
              .addTo(map.current!);
          });
          el.addEventListener('mouseleave', () => { if (tooltip) { tooltip.remove(); tooltip = null; } });
          el.addEventListener('click', () => { map.current?.flyTo({ center: station.coordinates, zoom: 14, duration: 1000 }); });

          const marker = new maplibregl.Marker({ element: el }).setLngLat(station.coordinates).addTo(map.current!);
          markersForLine.push(marker);
        });

        setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));
        setActiveLines(prev => [...prev, lineId]);
        console.log(`✅ Hardcoded Z train added successfully with ${zLineStations.length} stations`);
        return;
      }

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
      console.log(`✅ Line ${lineId} added successfully`);
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
      // Clear all - use a copy of activeLines to avoid mutation issues
      const linesToClear = [...activeLines];
      linesToClear.forEach(lineId => {
        toggleLine(lineId);
      });
    } else {
      // Show all (filter out individual shuttle IDs)
      Object.keys(MTA_COLORS)
        .filter(lineId => !['S-GC', 'S-FR', 'S-RK'].includes(lineId))
        .forEach(lineId => {
          if (lineId === 'S') {
            // For 'S', check if any shuttle is active
            const anyShuttleActive = ['S-GC', 'S-FR', 'S-RK'].some(shuttle => activeLines.includes(shuttle));
            if (!anyShuttleActive) {
              toggleLine(lineId);
            }
          } else if (!activeLines.includes(lineId)) {
            toggleLine(lineId);
          }
        });
    }
  };

  // Quick tour function
  const startQuickTour = () => {
    if (!map.current) return;
    
    const tourStops = [
      { center: [-73.9857, 40.7589] as [number, number], zoom: 12, pitch: 0 }, // Overview
      { center: [-73.9851, 40.7589] as [number, number], zoom: 14, pitch: 45 }, // Midtown
      { center: [-73.9891, 40.7143] as [number, number], zoom: 15, pitch: 60 }, // Downtown
      { center: [-73.9442, 40.6782] as [number, number], zoom: 14, pitch: 45 }, // Brooklyn
      { center: [-73.8603, 40.7489] as [number, number], zoom: 13, pitch: 30 }, // Queens
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
          {Object.keys(MTA_COLORS)
            .filter(line => !['S-GC', 'S-FR', 'S-RK'].includes(line)) // Filter out individual shuttle IDs
            .map(line => {
              // For 'S', check if any of the three shuttles are active
              const isActive = line === 'S'
                ? ['S-GC', 'S-FR', 'S-RK'].some(shuttle => activeLines.includes(shuttle))
                : activeLines.includes(line);

              return (
                <button
                  key={line}
                  onClick={() => toggleLine(line)}
                  className={`w-10 h-10 rounded font-bold text-sm transition-all ${
                    isActive
                      ? 'text-white shadow-lg transform scale-110'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? MTA_COLORS[line]
                      : undefined
                  }}
                >
                  {line}
                </button>
              );
            })}
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