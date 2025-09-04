'use client';

import * as React from 'react';
import Map from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

function SimpleMapGL() {
  return (
    <Map
      initialViewState={{
        longitude: -73.9857,
        latitude: 40.7589,
        zoom: 12
      }}
      style={{ width: '100%', height: '100%' }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      mapLib={maplibregl}
    />
  );
}

export default SimpleMapGL;