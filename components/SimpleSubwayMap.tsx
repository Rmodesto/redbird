'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function SimpleSubwayMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('Initializing simple map...');
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-73.9857, 40.7589], // NYC
      zoom: 12
    });

    map.current.on('load', () => {
      console.log('Map loaded!');
      setMapReady(true);
      
      // Test coordinates from our TEST line
      const testCoords = [
        [-73.96837899924822, 40.799446333013954], // 103rd-st
        [-73.96410999793571, 40.807722333328456], // 116th-st-columbia-university
        [-73.95367600034146, 40.82200833171166],  // 137th-st-city-college
        [-73.95035999809502, 40.82655133184121]   // 145th-st
      ];

      console.log('Adding test line source...');
      
      try {
        map.current!.addSource('simple-line', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: testCoords
            }
          }
        });

        console.log('Adding test line layer...');
        
        map.current!.addLayer({
          id: 'simple-line',
          type: 'line',
          source: 'simple-line',
          paint: {
            'line-color': '#ff0000',
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        console.log('Adding test point source...');
        
        map.current!.addSource('simple-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: testCoords.map((coord, i) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: coord
              },
              properties: {
                name: `Station ${i + 1}`
              }
            }))
          }
        });

        console.log('Adding test point layer...');
        
        map.current!.addLayer({
          id: 'simple-points',
          type: 'circle',
          source: 'simple-points',
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': 8,
            'circle-stroke-color': '#ff0000',
            'circle-stroke-width': 2
          }
        });

        console.log('✅ All layers added successfully!');
        
      } catch (error) {
        console.error('❌ Error adding layers:', error);
      }
    });

    map.current.on('error', (e) => {
      console.error('Map error:', e);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const testAnimation = () => {
    if (!map.current || !mapReady) {
      console.log('Map not ready for animation');
      return;
    }

    console.log('Starting test animation...');
    
    const testCoords = [
      [-73.96837899924822, 40.799446333013954], // 103rd-st
      [-73.96410999793571, 40.807722333328456], // 116th-st-columbia-university
      [-73.95367600034146, 40.82200833171166],  // 137th-st-city-college
      [-73.95035999809502, 40.82655133184121]   // 145th-st
    ];

    let progress = 0;
    const duration = 3000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      const pointsToShow = Math.floor(progress * testCoords.length);
      const animatedCoords = testCoords.slice(0, pointsToShow + 1);

      try {
        const source = map.current!.getSource('simple-line') as maplibregl.GeoJSONSource;
        if (source) {
          source.setData({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: animatedCoords
            }
          });
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          console.log('✅ Animation complete!');
        }
      } catch (error) {
        console.error('❌ Animation error:', error);
      }
    };

    animate();
  };

  return (
    <div className="w-full h-screen relative">
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg">
        <h3 className="text-lg font-bold mb-2">Simple Map Test</h3>
        <p className="text-sm mb-2">Map Ready: {mapReady ? '✅' : '❌'}</p>
        <button
          onClick={testAnimation}
          disabled={!mapReady}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
        >
          Test Animation
        </button>
      </div>
    </div>
  );
}