'use client';

import { useState, useCallback } from 'react';
import Map, { 
  Marker, 
  NavigationControl, 
  FullscreenControl,
  Popup,
  Source,
  Layer
} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Tell react-map-gl to use MapLibre GL JS
const mapLib = maplibregl as any;

interface Station {
  id: string;
  name: string;
  lines: string[];
  lat: number;
  lng: number;
}

const stations: Station[] = [
  { id: '1', name: 'Times Square-42 St', lines: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W'], lat: 40.7550, lng: -73.9873 },
  { id: '2', name: 'Grand Central-42 St', lines: ['4', '5', '6', '7', 'S'], lat: 40.7527, lng: -73.9772 },
  { id: '3', name: 'Union Square-14 St', lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'], lat: 40.7359, lng: -73.9897 },
  { id: '4', name: '34 St-Penn Station', lines: ['1', '2', '3'], lat: 40.7506, lng: -73.9934 },
  { id: '5', name: '34 St-Herald Sq', lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'], lat: 40.7484, lng: -73.9879 },
];

export default function MapLibreReact() {
  const [viewState, setViewState] = useState({
    longitude: -73.9857,
    latitude: 40.7589,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [is3D, setIs3D] = useState(false);

  const handle3DToggle = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      pitch: is3D ? 0 : 45
    }));
    setIs3D(!is3D);
  }, [is3D]);

  return (
    <div className="relative w-full h-full">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://demotiles.maplibre.org/style.json"
        mapLib={mapLib}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />

        {/* Station Markers */}
        {stations.map(station => (
          <Marker
            key={station.id}
            longitude={station.lng}
            latitude={station.lat}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedStation(station);
            }}
          >
            <div className="cursor-pointer transform hover:scale-110 transition-transform">
              <div className="bg-white rounded-full p-1 shadow-lg border-2 border-black">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#000" />
                  <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                    M
                  </text>
                </svg>
              </div>
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {selectedStation && (
          <Popup
            longitude={selectedStation.lng}
            latitude={selectedStation.lat}
            anchor="bottom"
            onClose={() => setSelectedStation(null)}
            closeOnClick={false}
            className="maplibre-popup"
          >
            <div className="p-2">
              <h3 className="font-bold text-sm mb-1">{selectedStation.name}</h3>
              <div className="flex flex-wrap gap-1">
                {selectedStation.lines.map(line => (
                  <span 
                    key={line}
                    className="px-1 py-0.5 bg-gray-800 text-white text-xs rounded"
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg">
        <h3 className="font-semibold text-sm mb-2">NYC Subway Map</h3>
        <button
          onClick={handle3DToggle}
          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition"
        >
          {is3D ? '2D View' : '3D View'}
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg max-w-xs">
        <p className="text-xs text-gray-600">
          Click on stations to see details • {stations.length} stations loaded
        </p>
      </div>
    </div>
  );
}