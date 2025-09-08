'use client';

import * as React from 'react';
import { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, ScaleControl, GeolocateControl } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';

// Import MapLibre CSS
import 'maplibre-gl/dist/maplibre-gl.css';

// Types
interface Station {
  id: string;
  name: string;
  lines: string[];
  coordinates: [number, number];
  borough: string;
}

// NYC Subway Stations Data
const STATIONS: Station[] = [
  { id: 'ts', name: 'Times Square-42 St', lines: ['N', 'Q', 'R', 'W', '1', '2', '3', '7', 'S'], coordinates: [-73.9873, 40.7550], borough: 'Manhattan' },
  { id: 'gc', name: 'Grand Central-42 St', lines: ['4', '5', '6', '7', 'S'], coordinates: [-73.9772, 40.7527], borough: 'Manhattan' },
  { id: 'us', name: 'Union Square-14 St', lines: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'], coordinates: [-73.9897, 40.7359], borough: 'Manhattan' },
  { id: 'ps', name: '34 St-Penn Station', lines: ['1', '2', '3', 'A', 'C', 'E'], coordinates: [-73.9934, 40.7506], borough: 'Manhattan' },
  { id: 'hs', name: '34 St-Herald Sq', lines: ['B', 'D', 'F', 'M', 'N', 'Q', 'R', 'W'], coordinates: [-73.9879, 40.7484], borough: 'Manhattan' },
  { id: 'fs', name: 'Fulton St', lines: ['2', '3', '4', '5', 'A', 'C', 'J', 'Z'], coordinates: [-74.0096, 40.7103], borough: 'Manhattan' },
  { id: 'cc', name: '59 St-Columbus Circle', lines: ['1', 'A', 'B', 'C', 'D'], coordinates: [-73.9815, 40.7681], borough: 'Manhattan' },
  { id: 'ws', name: 'W 4 St-Washington Sq', lines: ['A', 'B', 'C', 'D', 'E', 'F', 'M'], coordinates: [-74.0003, 40.7322], borough: 'Manhattan' },
  { id: 'ab', name: 'Atlantic Av-Barclays', lines: ['2', '3', '4', '5', 'B', 'D', 'N', 'Q', 'R'], coordinates: [-73.9776, 40.6842], borough: 'Brooklyn' },
  { id: 'jh', name: 'Jackson Heights', lines: ['E', 'F', 'M', 'R', '7'], coordinates: [-73.8914, 40.7466], borough: 'Queens' },
];

// MTA Line Colors
const LINE_COLORS: { [key: string]: string } = {
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

function SubwayInteractiveMap() {
  const [popupInfo, setPopupInfo] = useState<Station | null>(null);

  const pins = useMemo(
    () =>
      STATIONS.map((station) => (
        <Marker
          key={station.id}
          longitude={station.coordinates[0]}
          latitude={station.coordinates[1]}
          anchor="bottom"
          onClick={(e) => {
            // Prevent map click
            e.originalEvent.stopPropagation();
            setPopupInfo(station);
          }}
        >
          <div 
            className="cursor-pointer"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: '3px solid #000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#000',
            }} />
          </div>
        </Marker>
      )),
    []
  );

  return (
    <Map
      initialViewState={{
        longitude: -73.9857,
        latitude: 40.7589,
        zoom: 11,
        pitch: 0,
        bearing: 0
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      mapLib={maplibregl}
      interactiveLayerIds={[]}
    >
      <GeolocateControl position="top-left" />
      <FullscreenControl position="top-left" />
      <NavigationControl position="top-left" />
      <ScaleControl />

      {pins}

      {popupInfo && (
        <Popup
          anchor="top"
          longitude={popupInfo.coordinates[0]}
          latitude={popupInfo.coordinates[1]}
          onClose={() => setPopupInfo(null)}
        >
          <div style={{ padding: '10px' }}>
            <h3 style={{ margin: 0, marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
              {popupInfo.name}
            </h3>
            <p style={{ margin: 0, marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              {popupInfo.borough}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {popupInfo.lines.map((line) => (
                <span
                  key={line}
                  style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: '#fff',
                    backgroundColor: LINE_COLORS[line] || '#666',
                  }}
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

export default SubwayInteractiveMap;