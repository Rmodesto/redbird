"use client";

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { StationTooltipManager, StationInfo } from '@/lib/map/stationTooltip';

interface StationMapProps {
  stationName: string;
  latitude: number;
  longitude: number;
  lines: string[];
  borough: string;
}

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

export default function StationMap({ 
  stationName, 
  latitude, 
  longitude, 
  lines, 
  borough 
}: StationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const tooltipManager = useRef<StationTooltipManager | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
        center: [longitude, latitude] as [number, number],
        zoom: 16,
        pitch: 45, // Start with 3D view
        bearing: 0,
        maxZoom: 18,
        minZoom: 10
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        setIs3D(true); // Start in 3D mode
        
        if (map.current) {
          // Initialize tooltip manager
          tooltipManager.current = new StationTooltipManager(map.current);
          
          // Create station info object
          const stationInfo: StationInfo = {
            id: stationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
            name: stationName,
            lines: lines,
            coordinates: [longitude, latitude] as [number, number]
          };

          // Create custom circle marker element
          const markerEl = document.createElement('div');
          markerEl.className = 'station-circle-marker';
          markerEl.style.cssText = `
            width: 24px;
            height: 24px;
            background-color: #FF6B35;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            cursor: pointer;
          `;

          // Add station marker
          const marker = new maplibregl.Marker(markerEl)
          .setLngLat([longitude, latitude])
          .addTo(map.current);

          // Show enhanced tooltip with station details button immediately
          setTimeout(() => {
            showStationDetailsTooltip(stationInfo, marker);
          }, 500);

          // Add navigation controls
          map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
          
          // Add scale control
          map.current.addControl(new maplibregl.ScaleControl({
            maxWidth: 80,
            unit: 'imperial'
          }), 'bottom-left');
        }
      });

      map.current.on('error', (e) => {
        console.warn('Map error (non-critical):', e.error);
      });

    } catch (error) {
      console.warn('Failed to initialize map:', error);
    }

    return () => {
      if (tooltipManager.current) {
        tooltipManager.current.hideTooltip();
        tooltipManager.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, stationName, lines, borough]);

  const toggle3D = () => {
    if (!map.current) return;
    
    const newPitch = is3D ? 0 : 45;
    map.current.easeTo({
      pitch: newPitch,
      duration: 1000,
    });
    setIs3D(!is3D);
  };

  // Enhanced glassmorphic tooltip with station details button
  const showStationDetailsTooltip = (station: StationInfo, marker: maplibregl.Marker) => {
    if (!map.current) return;

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      className: 'dark-glassmorphic-popup',
      offset: 25,
      maxWidth: '280px'
    })
      .setLngLat(station.coordinates)
      .setHTML(`
        <div class="dark-tooltip-content">
          <div class="font-semibold text-base text-white mb-2">
            ${station.name}
          </div>
          <div class="flex gap-1.5 flex-wrap">
            ${station.lines.map(line => `
              <span class="inline-block w-7 h-7 rounded-full text-xs font-bold text-white text-center leading-7"
                    style="background-color: ${MTA_COLORS[line] || '#808183'}">
                ${line}
              </span>
            `).join('')}
          </div>
        </div>
      `)
      .addTo(map.current);
  };

  if (!mapContainer) {
    return (
      <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center border border-gray-700">
        <div className="text-center text-gray-400">
          <span className="text-6xl mb-4 block">📍</span>
          <p className="text-lg">Map loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-64 rounded-lg border border-gray-700"
        style={{ minHeight: '256px' }}
      />
      
      {/* 3D Toggle Button */}
      {mapLoaded && (
        <button
          onClick={toggle3D}
          className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800/90 transition-colors text-sm font-medium"
        >
          {is3D ? '2D' : '3D'} View
        </button>
      )}
      
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-sm">Loading interactive map...</p>
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500 text-right">
        <p>Interactive 3D map • Click marker for details</p>
        <p>Map data: CartoDB Dark Matter</p>
      </div>
    </div>
  );
}