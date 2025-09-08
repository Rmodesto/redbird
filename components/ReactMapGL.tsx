'use client';

import { useState, useCallback } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

interface Station {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
  borough: string;
}

const SAMPLE_STATIONS: Station[] = [
  {
    id: 'times-square',
    name: 'Times Square-42 St',
    lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'],
    coordinates: [-73.9873, 40.7550],
    borough: 'Manhattan'
  },
  {
    id: 'grand-central',
    name: 'Grand Central-42 St',
    lines: ['4', '5', '6', '7', 'S'],
    coordinates: [-73.9772, 40.7527],
    borough: 'Manhattan'
  },
  {
    id: 'union-square',
    name: 'Union Square-14 St',
    lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9897, 40.7359],
    borough: 'Manhattan'
  },
  {
    id: 'penn-station',
    name: 'Penn Station-34 St',
    lines: ['1', '2', '3', 'A', 'C', 'E'],
    coordinates: [-73.9934, 40.7506],
    borough: 'Manhattan'
  },
  {
    id: 'herald-square',
    name: 'Herald Square-34 St',
    lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'],
    coordinates: [-73.9879, 40.7484],
    borough: 'Manhattan'
  },
  {
    id: 'fulton-street',
    name: 'Fulton St',
    lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'],
    coordinates: [-74.0096, 40.7103],
    borough: 'Manhattan'
  },
  {
    id: 'columbus-circle',
    name: '59 St-Columbus Circle',
    lines: ['1', '2', 'A', 'B', 'C', 'D'],
    coordinates: [-73.9815, 40.7681],
    borough: 'Manhattan'
  },
  {
    id: 'atlantic-barclays',
    name: 'Atlantic Av-Barclays Ctr',
    lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'],
    coordinates: [-73.9776, 40.6842],
    borough: 'Brooklyn'
  }
];

export default function ReactMapGL() {
  const [viewState, setViewState] = useState({
    longitude: -73.9857,
    latitude: 40.7589,
    zoom: 12
  });
  
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const handleMarkerClick = useCallback((station: Station, e: any) => {
    e.originalEvent.stopPropagation();
    setSelectedStation(station);
  }, []);

  return (
    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      style={{ width: '100%', height: '100%' }}
      mapLib={maplibregl}
    >
      <NavigationControl position="top-right" />
      
      {/* Station Markers */}
      {SAMPLE_STATIONS.map((station) => (
        <Marker
          key={station.id}
          longitude={station.coordinates[0]}
          latitude={station.coordinates[1]}
          anchor="bottom"
          onClick={(e) => handleMarkerClick(station, e)}
        >
          <div className="relative cursor-pointer">
            {/* Station marker */}
            <div className="bg-white rounded-full p-2 shadow-lg border-2 border-gray-800 hover:scale-110 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#000" />
                <text x="12" y="17" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                  M
                </text>
              </svg>
            </div>
            
            {/* Line badges */}
            <div className="absolute -top-2 -right-2 flex flex-wrap gap-0.5">
              {station.lines.slice(0, 3).map((line) => (
                <div
                  key={line}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ backgroundColor: MTA_COLORS[line] || '#666' }}
                >
                  {line}
                </div>
              ))}
              {station.lines.length > 3 && (
                <div className="w-4 h-4 rounded-full bg-gray-600 flex items-center justify-center text-white text-[8px]">
                  +{station.lines.length - 3}
                </div>
              )}
            </div>
          </div>
        </Marker>
      ))}
      
      {/* Popup */}
      {selectedStation && (
        <Popup
          longitude={selectedStation.coordinates[0]}
          latitude={selectedStation.coordinates[1]}
          anchor="bottom"
          offset={[0, -40]}
          onClose={() => setSelectedStation(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div className="p-2">
            <h3 className="font-bold text-lg mb-2">{selectedStation.name}</h3>
            <div className="text-sm text-gray-600 mb-2">{selectedStation.borough}</div>
            <div className="flex flex-wrap gap-1">
              {selectedStation.lines.map((line) => (
                <span
                  key={line}
                  className="px-2 py-1 rounded text-white text-xs font-bold"
                  style={{ backgroundColor: MTA_COLORS[line] || '#666' }}
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        </Popup>
      )}
    </Map>
  );
}