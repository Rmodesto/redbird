# Branching Line Patterns

Some NYC subway lines split into multiple branches. These require special handling for the GeoJSON line path since a single LineString cannot represent a fork.

## Lines with Branches

| Line | Branch Point | Branches |
|------|-------------|----------|
| A | Howard Beach / Rockaway Blvd | Lefferts Blvd, Far Rockaway, Rockaway Park |
| 2 | Flatbush Av / Nevins St | Main (Flatbush), White Plains Rd |
| 5 | Bowling Green / E 180 St | Main (Dyre Av), Nereid Av |
| S | Three separate shuttles | 42nd St, Franklin Av, Rockaway Park |

## Implementation: Multiple Line Segments

Use separate GeoJSON sources for each branch segment, sharing the same line style.

```typescript
// Example: A train with 3 branches
const aLineMainCoords: [number, number][] = [
  // Inwood-207 St → Rockaway Blvd (shared trunk)
];

const aLineLefferts: [number, number][] = [
  // Rockaway Blvd → Ozone Park-Lefferts Blvd
];

const aLineFarRockaway: [number, number][] = [
  // Howard Beach → Far Rockaway-Mott Av
];

const aLineRockawayPark: [number, number][] = [
  // Broad Channel → Rockaway Park-Beach 116 St
];

// Add each segment as a separate source/layer
const segments = [
  { id: `line-${lineId}`, coords: aLineMainCoords },
  { id: `line-${lineId}-lefferts`, coords: aLineLefferts },
  { id: `line-${lineId}-far-rockaway`, coords: aLineFarRockaway },
  { id: `line-${lineId}-rockaway-park`, coords: aLineRockawayPark },
];

segments.forEach(seg => {
  if (!map.current!.getSource(seg.id)) {
    map.current!.addSource(seg.id, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: seg.coords },
      },
    });
  }
  if (!map.current!.getLayer(seg.id)) {
    map.current!.addLayer({
      id: seg.id,
      type: 'line',
      source: seg.id,
      paint: {
        'line-color': MTA_COLORS[lineId] || '#000000',
        'line-width': 4,
        'line-opacity': 0.8,
      },
    });
  }
});
```

## Cleanup for Branching Lines

Must remove ALL segment sources and layers, not just `line-${lineId}`:

```typescript
// Remove all branch segments
const branchSuffixes = ['', '-lefferts', '-far-rockaway', '-rockaway-park'];
branchSuffixes.forEach(suffix => {
  const id = `line-${lineId}${suffix}`;
  if (map.current.getLayer(id)) map.current.removeLayer(id);
  if (map.current.getSource(id)) map.current.removeSource(id);
});
```

## Station Array for Branching Lines

All stations across all branches go in a single flat array. The station index determines the cleanup ID (`station-${lineId}-${index}`), so the `stationCount` in `HARDCODED_LINES` must equal the total across all branches.

```typescript
const aLineStations = [
  // Main trunk stations (0..N)
  // Lefferts branch stations (N+1..M)
  // Far Rockaway branch stations (M+1..P)
  // Rockaway Park branch stations (P+1..Q)
];

// stationCount = total length of this array
```

## S Shuttle Special Case

The S shuttle is implemented as three separate "lines" in `HARDCODED_LINES`:
- `S-GC`: 42nd St shuttle (Times Sq ↔ Grand Central) — 2 stations
- `S-FR`: Franklin Av shuttle — 4 stations
- `S-RK`: Rockaway Park shuttle — 5 stations

The `S` button in the toggle panel activates/deactivates all three.
