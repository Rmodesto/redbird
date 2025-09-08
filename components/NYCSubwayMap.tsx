'use client';

import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Station data
const STATIONS = [
  { id: '1', name: 'Times Square-42 St', lines: ['N', 'Q', 'R', 'W', '1', '2', '3', '7', 'S'], lat: 40.7550, lng: -73.9873, borough: 'Manhattan' },
  { id: '2', name: 'Grand Central-42 St', lines: ['4', '5', '6', '7', 'S'], lat: 40.7527, lng: -73.9772, borough: 'Manhattan' },
  { id: '3', name: 'Union Square-14 St', lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'], lat: 40.7359, lng: -73.9897, borough: 'Manhattan' },
  { id: '4', name: '34 St-Penn Station', lines: ['1', '2', '3', 'A', 'C', 'E'], lat: 40.7506, lng: -73.9934, borough: 'Manhattan' },
  { id: '5', name: '34 St-Herald Sq', lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'], lat: 40.7484, lng: -73.9879, borough: 'Manhattan' },
  { id: '6', name: 'Fulton St', lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'], lat: 40.7103, lng: -74.0096, borough: 'Manhattan' },
  { id: '7', name: '14 St-Union Sq', lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'], lat: 40.7359, lng: -73.9897, borough: 'Manhattan' },
  { id: '8', name: '59 St-Columbus Circle', lines: ['1', 'A', 'B', 'C', 'D'], lat: 40.7681, lng: -73.9815, borough: 'Manhattan' },
  { id: '9', name: 'Atlantic Av-Barclays', lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'], lat: 40.6842, lng: -73.9776, borough: 'Brooklyn' },
  { id: '10', name: 'Jackson Heights', lines: ['E', 'F', 'M', 'R', '7'], lat: 40.7466, lng: -73.8914, borough: 'Queens' },
];

// Line colors
const LINE_COLORS: Record<string, string> = {
  '1': '#EE352E', '2': '#EE352E', '3': '#EE352E',
  '4': '#00933C', '5': '#00933C', '6': '#00933C', '6X': '#00933C',
  '7': '#B933AD', '7X': '#B933AD',
  'A': '#0039A6', 'C': '#0039A6', 'E': '#0039A6',
  'B': '#FF6319', 'D': '#FF6319', 'F': '#FF6319', 'FX': '#FF6319', 'M': '#FF6319',
  'G': '#6CBE45',
  'J': '#996633', 'Z': '#996633',
  'L': '#A7A9AC',
  'N': '#FCCC0A', 'Q': '#FCCC0A', 'R': '#FCCC0A', 'W': '#FCCC0A',
  'S': '#808183', 'SR': '#808183',
};

interface PopupInfo {
  station: typeof STATIONS[0];
  longitude: number;
  latitude: number;
}

export default function NYCSubwayMap() {
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -73.9857,
    latitude: 40.7589,
    zoom: 11,
    pitch: 0,
    bearing: 0
  });

  const pins = useMemo(
    () =>
      STATIONS.map((station) => (
        <Marker
          key={station.id}
          longitude={station.lng}
          latitude={station.lat}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setPopupInfo({
              station,
              longitude: station.lng,
              latitude: station.lat
            });
          }}
        >
          <div className="cursor-pointer group">
            {/* Station dot */}
            <div className="w-3 h-3 bg-white rounded-full border-2 border-black group-hover:scale-150 transition-transform" />
            {/* Station name on hover */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {station.name}
            </div>
          </div>
        </Marker>
      )),
    []
  );

  return (
    <>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        mapLib={maplibregl}
        // mapStyle="https://demotiles.maplibre.org/style.json"
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="bottom-right" />
        
        {pins}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
          >
            <div className="p-2">
              <p className="font-bold text-sm mb-2">{popupInfo.station.name}</p>
              <p className="text-xs text-gray-600 mb-2">{popupInfo.station.borough}</p>
              <div className="flex flex-wrap gap-1">
                {popupInfo.station.lines.map((line) => (
                  <span
                    key={line}
                    className="inline-block px-2 py-1 text-white text-xs font-bold rounded"
                    style={{ backgroundColor: LINE_COLORS[line] || '#666' }}
                  >
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur p-4 rounded-lg shadow-lg max-w-xs">
        <h3 className="font-bold text-sm mb-3 text-gray-900">NYC Subway Lines</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="flex gap-1 mb-1">
              {['1', '2', '3'].map(l => (
                <span key={l} className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: LINE_COLORS[l] }}>{l}</span>
              ))}
            </div>
            <div className="text-gray-600">Broadway-7th Ave</div>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {['4', '5', '6'].map(l => (
                <span key={l} className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: LINE_COLORS[l] }}>{l}</span>
              ))}
            </div>
            <div className="text-gray-600">Lexington Ave</div>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {['N', 'Q', 'R', 'W'].map(l => (
                <span key={l} className="w-5 h-5 rounded-full text-black flex items-center justify-center font-bold" style={{ backgroundColor: LINE_COLORS[l] }}>{l}</span>
              ))}
            </div>
            <div className="text-gray-600">Broadway</div>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {['B', 'D', 'F', 'M'].map(l => (
                <span key={l} className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: LINE_COLORS[l] }}>{l}</span>
              ))}
            </div>
            <div className="text-gray-600">6th Avenue</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur p-3 rounded-lg shadow-lg">
        <p className="text-xs text-gray-700">
          Click stations for details • {STATIONS.length} major stations
        </p>
      </div>
    </>
  );
}