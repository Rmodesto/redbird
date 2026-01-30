---
name: subway-line-plotter
description: Implements hardcoded subway line plotting on the interactive map in WorkingSubwayMap.tsx. Use when adding a new subway line, fixing station data for an existing line, updating transfer information, or debugging map rendering issues. Covers station coordinates, GeoJSON line paths, marker creation, glassmorphic tooltips, and the toggleLine cleanup lifecycle.
---

# Subway Line Plotter

Plot NYC subway lines accurately on the interactive MapLibre GL map.

## Critical Concept: NYC Station Uniqueness

NYC subway stations sharing the same name can be **completely different physical locations**. The same name does NOT mean the same station.

**Example — "Chambers St":**
- 8th Ave platform (A/C/E): `[-74.009266, 40.713243]`
- Broadway platform (J/Z): `[-74.003739, 40.713065]`
- Church St platform (1/2/3): `[-74.009390, 40.715478]`

These are separate facilities with different coordinates. Each line's station array must use the correct platform's coordinates, not just any "Chambers St."

**Example — "14 St":**
- 7th Ave (1/2/3): different location than 8th Ave (A/C/E), different from 6th Ave (F/M/L), different from Union Square (4/5/6/N/Q/R/W/L)

## Coordinate Source

**ALWAYS** extract coordinates from `/data/stations-normalized.json`. NEVER fabricate coordinates.

```bash
node -e "
const data = require('./data/stations-normalized.json');
const stations = data.filter(s => s.lines.includes('LINE_ID'));
stations.forEach((s, i) => console.log(\`\${i+1}. \${s.name} [\${s.longitude}, \${s.latitude}] lines: \${s.lines.join(',')}\`));
"
```

Cross-reference with the line's `*_LINE_IMPLEMENTATION.md` file in the project root for station ordering, branch structure, and transfer details.

## Implementation Pattern

All lines are implemented in `/components/WorkingSubwayMap.tsx` inside the `toggleLine` function.

### 1. Register in HARDCODED_LINES

```typescript
const HARDCODED_LINES: Record<string, { stationCount: number }> = {
  // ...existing lines
  'X': { stationCount: N },  // exact count matters for cleanup
};
```

### 2. Station Array (platform-specific)

```typescript
const xLineStations = [
  {
    name: "Station Name",
    coordinates: [-73.xxx, 40.xxx] as [number, number],
    lines: ['X', 'Y', 'Z']  // ONLY lines at THIS platform
  },
];
```

**Transfer lines rules:**
- List every line that serves the specific physical platform/complex the current line stops at
- Do NOT list lines at nearby-but-separate stations with the same name
- Consult `stations-normalized.json` platforms array and the `*_LINE_IMPLEMENTATION.md` for accuracy

### 3. Line Path (GeoJSON LineString)

```typescript
const xLineCoords: [number, number][] = xLineStations.map(s => s.coordinates);

const lineGeoJSON = {
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates: xLineCoords },
};

if (!map.current!.getSource(`line-${lineId}`)) {
  map.current!.addSource(`line-${lineId}`, { type: 'geojson', data: lineGeoJSON });
}
if (!map.current!.getLayer(`line-${lineId}`)) {
  map.current!.addLayer({
    id: `line-${lineId}`,
    type: 'line',
    source: `line-${lineId}`,
    paint: { 'line-color': MTA_COLORS[lineId] || '#000000', 'line-width': 4, 'line-opacity': 0.8 },
  });
}
```

**Branching lines** (A, 2, 5, etc.): Use multiple LineString segments or a MultiLineString. See [references/branching.md](references/branching.md).

### 4. Station Markers + Tooltips

For each station, create a GeoJSON point source, a circle layer, and mouse event handlers:

```typescript
xLineStations.forEach((station, index) => {
  const stationId = `station-${lineId}-${index}`;

  // Source
  if (!map.current!.getSource(stationId)) {
    map.current!.addSource(stationId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { name: station.name },
        geometry: { type: 'Point', coordinates: station.coordinates },
      },
    });
  }

  // Layer
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

  // Tooltip (mouseenter)
  map.current!.on('mouseenter', stationId, (e) => {
    if (e.features && e.features[0]) {
      const coordinates = (e.features[0].geometry as any).coordinates.slice();
      const allLines = station.lines;
      hoverPopup = new maplibregl.Popup({
        closeButton: false, closeOnClick: false,
        className: 'glassmorphic-tooltip', offset: 25, maxWidth: '280px'
      })
        .setLngLat(coordinates)
        .setHTML(`
          <div class="glassmorphic-tooltip-content">
            <div class="font-semibold text-sm mb-2" style="color: white;">${station.name}</div>
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
    if (hoverPopup) { hoverPopup.remove(); hoverPopup = null; }
  });
});
```

### 5. Cleanup in toggleLine (removal branch)

The `HARDCODED_LINES[lineId].stationCount` drives cleanup. If stationCount is wrong, orphan layers remain on the map.

```typescript
// Remove line layer + source
if (map.current.getLayer(`line-${lineId}`)) map.current.removeLayer(`line-${lineId}`);
if (map.current.getSource(`line-${lineId}`)) map.current.removeSource(`line-${lineId}`);

// Remove markers
if (lineMarkers[lineId]) {
  lineMarkers[lineId].forEach(m => m.remove());
  setLineMarkers(prev => { const u = { ...prev }; delete u[lineId]; return u; });
}

// Remove station layers + sources
for (let i = 0; i < HARDCODED_LINES[lineId].stationCount; i++) {
  const sid = `station-${lineId}-${i}`;
  if (map.current.getLayer(sid)) map.current.removeLayer(sid);
  if (map.current.getSource(sid)) map.current.removeSource(sid);
}
```

## Never Change Without Being Asked

- Tooltip CSS classes or styling (`glassmorphic-tooltip`, `gap-1.5`, badge sizes)
- MTA_COLORS values
- Other lines' station arrays
- The toggle panel UI

## Verification Checklist

After implementing a line:
1. Station names match the **official MTA text map** for that specific line (see `references/mta-line-maps.md`)
2. Station order matches the MTA text map route sequence
3. All coordinates come from `stations-normalized.json` filtered by line (not fabricated)
4. Station count in `HARDCODED_LINES` matches array length exactly
5. Transfer lines in each station are **platform-accurate** (not complex-wide)
6. Line plots within NYC boroughs (not New Jersey or Long Island)
7. Toggling off fully removes all layers/sources/markers
8. Tooltips show correct transfers with MTA color badges

## Reference Files

- **MTA official line maps**: See [references/mta-line-maps.md](references/mta-line-maps.md) — authoritative station names and orders per line, with links to MTA source pages
- **Complex vs. platform**: See [references/complex-vs-platform.md](references/complex-vs-platform.md) — explains why the same physical complex has different station names per line (e.g., "World Trade Center" for E, "Chambers St" for A/C, "Cortlandt St" for R/W)
- **Station identity**: See [references/station-identity.md](references/station-identity.md) for same-name station complexes and how to resolve coordinates
- **Branching lines**: See [references/branching.md](references/branching.md) for multi-branch line patterns (A, 2, 5, S)
- **Per-line docs**: See `*_LINE_IMPLEMENTATION.md` files in project root for implementation details
