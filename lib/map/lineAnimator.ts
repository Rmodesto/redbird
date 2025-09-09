import maplibregl from 'maplibre-gl';

export interface LineAnimation {
  lineId: string;
  color: string;
  coordinates: [number, number][];
  progress: number;
  animationId?: number;
  speed: number;
}

export class SubwayLineAnimator {
  private map: maplibregl.Map;
  private animations: Map<string, LineAnimation> = new Map();
  private animationCallbacks: Map<string, () => void> = new Map();

  constructor(map: maplibregl.Map) {
    this.map = map;
  }

  /**
   * Animate a subway line from start to end
   */
  animateLine(
    lineId: string,
    coordinates: [number, number][],
    color: string,
    duration: number = 3000,
    onComplete?: () => void
  ) {
    // Remove existing line if it exists
    this.removeLine(lineId);

    // Create line source with initial empty coordinates
    this.map.addSource(`line-${lineId}`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    });

    // Add line layer with the subway line color
    this.map.addLayer({
      id: `line-${lineId}`,
      type: 'line',
      source: `line-${lineId}`,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': color,
        'line-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 2,
          15, 4,
          20, 6
        ],
        'line-opacity': 0.8
      }
    });

    // Start animation
    const startTime = Date.now();
    const totalPoints = coordinates.length;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-in-out animation
      const easedProgress = this.easeInOutCubic(progress);
      
      // Calculate how many points to show
      const pointsToShow = Math.floor(easedProgress * totalPoints);
      const animatedCoords = coordinates.slice(0, pointsToShow + 1);

      // Update the line on the map
      const source = this.map.getSource(`line-${lineId}`) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: animatedCoords
          }
        });
      }

      if (progress < 1) {
        const animationId = requestAnimationFrame(animate);
        this.animations.set(lineId, {
          lineId,
          color,
          coordinates,
          progress: easedProgress,
          animationId,
          speed: duration
        });
      } else {
        this.animations.delete(lineId);
        if (onComplete) onComplete();
      }
    };

    animate();
  }

  /**
   * Add stations along a line
   */
  addStationMarkers(lineId: string, stations: Array<{
    id: string;
    name: string;
    coordinates: [number, number];
  }>) {
    // Add station source
    this.map.addSource(`stations-${lineId}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: stations.map(station => ({
          type: 'Feature',
          properties: {
            id: station.id,
            name: station.name,
            lineId
          },
          geometry: {
            type: 'Point',
            coordinates: station.coordinates
          }
        }))
      }
    });

    // Add station circles
    this.map.addLayer({
      id: `stations-${lineId}`,
      type: 'circle',
      source: `stations-${lineId}`,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 3,
          15, 5,
          20, 8
        ],
        'circle-color': '#ffffff',
        'circle-stroke-color': '#000000',
        'circle-stroke-width': 2,
        'circle-opacity': 0.9
      }
    });

    // Add station labels
    this.map.addLayer({
      id: `station-labels-${lineId}`,
      type: 'symbol',
      source: `stations-${lineId}`,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 0,
          12, 10,
          15, 12,
          20, 14
        ],
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });
  }

  /**
   * Remove a line and its stations from the map
   */
  removeLine(lineId: string) {
    // Cancel any ongoing animation
    const animation = this.animations.get(lineId);
    if (animation?.animationId) {
      cancelAnimationFrame(animation.animationId);
    }
    this.animations.delete(lineId);

    // Remove layers
    const layersToRemove = [
      `line-${lineId}`,
      `stations-${lineId}`,
      `station-labels-${lineId}`
    ];

    layersToRemove.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    // Remove sources
    const sourcesToRemove = [
      `line-${lineId}`,
      `stations-${lineId}`
    ];

    sourcesToRemove.forEach(sourceId => {
      if (this.map.getSource(sourceId)) {
        this.map.removeSource(sourceId);
      }
    });
  }

  /**
   * Clear all lines from the map
   */
  clearAllLines() {
    this.animations.forEach((_, lineId) => {
      this.removeLine(lineId);
    });
  }

  /**
   * Easing function for smooth animation
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Check if a line is currently animating
   */
  isAnimating(lineId: string): boolean {
    return this.animations.has(lineId);
  }

  /**
   * Get all currently animated lines
   */
  getAnimatedLines(): string[] {
    return Array.from(this.animations.keys());
  }
}