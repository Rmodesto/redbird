# W Train (Broadway/Astoria Local) - Implementation Documentation

## Overview
The W train (Broadway/Astoria Local) runs from Astoria-Ditmars Blvd in Queens through Manhattan to Whitehall St-South Ferry. This implementation includes complete routing with accurate station coordinates and proper integration with the existing subway map system.

## Line Characteristics
- **Line ID**: W
- **Color**: #FCCC0A (MTA Yellow - shared with N/Q/R trains)
- **Service Type**: Local service (weekdays only, no late night service)
- **Total Stations**: 23 stations
- **Route**: Astoria-Ditmars Blvd (Queens) → Manhattan → Whitehall St-South Ferry
- **Broadway Local**: Serves Broadway corridor in Manhattan

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx` (lines 3208-3357)

### Implementation Structure
The W train is implemented with hardcoded markers using:
- Line coordinates array (23 stations)
- Station markers array (23 stations)
- GeoJSON structure for rendering
- Glassmorphic tooltip support with transfer information
- Custom DOM marker elements

## Complete Station List with Coordinates

### Queens (7 stations)
1. **Astoria-Ditmars Blvd** - [-73.912034, 40.775036] - Transfers: N
2. **Astoria Blvd** - [-73.917843, 40.770258] - Transfers: N
3. **30 Av** - [-73.921479, 40.766779] - Transfers: N
4. **Broadway** - [-73.925508, 40.76182] - Transfers: N
5. **36 Av** - [-73.929575, 40.756804] - Transfers: N
6. **39 Av-Dutch Kills** - [-73.932755, 40.752882] - Transfers: N
7. **Queensboro Plaza** - [-73.940202, 40.750582] - Transfers: 7, N

### Manhattan (16 stations)
8. **Lexington Av/59 St** - [-73.9676125, 40.762592999999995] - Major hub, transfers: 4, 5, 6, N, R
9. **5 Av/59 St** - [-73.973347, 40.764811] - Transfers: N, R
10. **57 St-7 Av** - [-73.980658, 40.764664] - Transfers: N, Q, R
11. **49 St** - [-73.984139, 40.759901] - Transfers: N, R
12. **Times Sq-42 St** - [-73.9875808, 40.755746] - Major hub, transfers: 1, 2, 3, 7, A, C, E, N, Q, R, S
13. **34 St-Herald Sq** - [-73.9878865, 40.749643] - Major hub, transfers: B, D, F, M, N, Q, R
14. **28 St** - [-73.988691, 40.745494] - Transfers: R
15. **23 St** - [-73.989344, 40.741303] - Transfers: R
16. **14 St-Union Sq** - [-73.99041633333333, 40.735066] - Major hub, transfers: 4, 5, 6, L, N, Q, R
17. **8 St-NYU** - [-73.992629, 40.730328] - Transfers: R
18. **Prince St** - [-73.997702, 40.724329] - Transfers: R
19. **Canal St** - [-74.00057999999999, 40.71870125] - Transfers: 6, J, N, Q, R, Z
20. **City Hall** - [-74.006978, 40.713282] - Transfers: R
21. **Cortlandt St** - [-74.0095515, 40.712603] - Transfers: 2, 3, A, C, E, R
22. **Rector St** - [-74.013342, 40.70722] - Transfers: R
23. **Whitehall St-South Ferry** - [-74.013329, 40.7025775] - Terminal, transfers: 1, R

## Service Patterns

### Regular Service
- **Weekdays Only**: Operates during rush hours and midday (no late night service)
- **Direction**: Bidirectional service between Astoria-Ditmars Blvd and Whitehall St-South Ferry
- **Broadway Local**: Runs local on Broadway in Manhattan
- **No Weekend Service**: Does not operate on weekends

### Weekend Service
- **No Service**: W train does not operate on weekends

### Late Night Service
- **No Service**: W train does not operate late nights

## Major Transfer Points
1. **Times Sq-42 St**: Major Midtown hub (12 lines: 1, 2, 3, 7, A, C, E, N, Q, R, S, W)
2. **34 St-Herald Sq**: Midtown Manhattan hub (8 lines: B, D, F, M, N, Q, R, W)
3. **14 St-Union Sq**: Major downtown hub (8 lines: 4, 5, 6, L, N, Q, R, W)
4. **Lexington Av/59 St**: Uptown hub (6 lines: 4, 5, 6, N, R, W)
5. **Queensboro Plaza**: Queens transfer to 7, N trains
6. **Whitehall St-South Ferry**: Lower Manhattan ferry access (1, R, W)

## Implementation Details

### Code Structure
```typescript
if (lineId === 'W') {
  const markersForLine: maplibregl.Marker[] = [];
  const wLineCoords: [number, number][] = [
    // 23 station coordinates from Astoria-Ditmars Blvd to Whitehall St-South Ferry
  ];

  const wLineStations = [
    // 23 station objects with name, coordinates, and transfer lines
  ];

  // Custom DOM marker elements with styling
  // Glassmorphic tooltip on hover
  // Click event handlers
  // Marker storage for cleanup
}
```

### Visual Characteristics
- **Line Color**: #FCCC0A (MTA Yellow)
- **Line Width**: 4px
- **Line Opacity**: 0.8
- **Station Markers**: 16px diameter circles, 3px white border
- **Tooltip Style**: Glassmorphic with backdrop blur
- **Marker Style**: Custom DOM elements with shadow

### Tooltip Features
- Glassmorphic design with dark background and blur effect
- Station name displayed prominently
- Colored line badges showing all transfers
- Official MTA colors for each line badge
- Hover-triggered, auto-dismiss on mouse leave

## Route Characteristics

### Unique Features
- **Weekday Only Service**: Only operates on weekdays (no weekends or late nights)
- **Astoria Line**: Shares entire Queens section with N train (7 stations)
- **Broadway Local**: Serves Broadway corridor in Manhattan
- **Rush Hour Supplement**: Provides additional service during busy periods
- **R Train Partnership**: Shares 7 stations with R train in Manhattan

### Shared Track Sections
- **With N train**: Astoria-Ditmars Blvd → Queensboro Plaza (7 consecutive stations - entire Queens section!)
- **With R train**: 28 St, 23 St, 8 St-NYU, Prince St, City Hall, Cortlandt St, Rector St, Whitehall St-South Ferry (8 stations)
- **With N/Q/R trains**: Lexington Av/59 St, 5 Av/59 St, 57 St-7 Av, 49 St, Times Sq-42 St, 34 St-Herald Sq, 14 St-Union Sq (7 stations)

## Verification Status
✅ All 23 stations verified against MTA official data
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Line renders continuously from terminal to terminal
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- W train operates **weekdays only** (no weekend or late night service)
- Shares entire Queens section with N train (Astoria line)
- Important rush hour supplement on Broadway corridor
- Serves Times Square, Herald Square, and Union Square (major hubs)
- Terminal at Whitehall St-South Ferry provides ferry access
- Shares most Manhattan stations with R train

## Shared Stations with Other Lines
- **W/N Shared Stations**: Astoria-Ditmars Blvd, Astoria Blvd, 30 Av, Broadway, 36 Av, 39 Av-Dutch Kills, Queensboro Plaza (entire Queens section!)
- **W/R Shared Stations**: 28 St, 23 St, 8 St-NYU, Prince St, City Hall, Cortlandt St, Rector St, Whitehall St-South Ferry
- **W/N/Q/R Shared Stations**: Lexington Av/59 St, 5 Av/59 St, 57 St-7 Av, 49 St, Times Sq-42 St, 34 St-Herald Sq, 14 St-Union Sq

## Notable Station Names in Data
- "Astoria-Ditmars Blvd" (northern terminal, shared with N)
- "39 Av-Dutch Kills" (Dutch Kills neighborhood)
- "Lexington Av/59 St" (major transfer hub)
- "Times Sq-42 St" (busiest station complex)
- "34 St-Herald Sq" (major shopping district)
- "Whitehall St-South Ferry" (southern terminal, ferry access)

---

**Implementation Date**: October 18, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 23
**Line Type**: Local service (weekdays only)
**Implementation Method**: Hardcoded with custom DOM markers
