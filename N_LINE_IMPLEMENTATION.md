# N Train (Broadway/Astoria Local) - Implementation Documentation

## Overview
The N train (Broadway/Astoria Local) runs from Astoria-Ditmars Blvd in Queens through Manhattan to Coney Island-Stillwell Av in Brooklyn. This implementation includes complete routing with accurate station coordinates and proper integration with the existing subway map system.

## Line Characteristics
- **Line ID**: N
- **Color**: #FCCC0A (MTA Yellow - shared with Q/R/W trains)
- **Service Type**: Local service
- **Total Stations**: 28 stations
- **Route**: Astoria-Ditmars Blvd (Queens) → Manhattan → Coney Island-Stillwell Av (Brooklyn)
- **Broadway Express**: Serves Broadway corridor in Manhattan

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx` (lines 2687-2845)

### Implementation Structure
The N train is implemented with hardcoded markers using:
- Line coordinates array (28 stations)
- Station markers array (28 stations)
- GeoJSON structure for rendering
- Glassmorphic tooltip support with transfer information
- Custom DOM marker elements

## Complete Station List with Coordinates

### Queens (7 stations)
1. **Astoria-Ditmars Blvd** - [-73.912034, 40.775036] - Transfers: W
2. **Astoria Blvd** - [-73.917843, 40.770258] - Transfers: W
3. **30 Av** - [-73.921479, 40.766779] - Transfers: W
4. **Broadway** - [-73.925508, 40.76182] - Transfers: W
5. **36 Av** - [-73.929575, 40.756804] - Transfers: W
6. **39 Av-Dutch Kills** - [-73.932755, 40.752882] - Transfers: W
7. **Queensboro Plaza** - [-73.940202, 40.750582] - Major hub, transfers: 7, W

### Manhattan (8 stations)
8. **Lexington Av/59 St** - [-73.9676125, 40.762592999999995] - Major hub, transfers: 4, 5, 6, R, W
9. **5 Av/59 St** - [-73.973347, 40.764811] - Transfers: R, W
10. **57 St-7 Av** - [-73.980658, 40.764664] - Transfers: Q, R, W
11. **49 St** - [-73.984139, 40.759901] - Transfers: R, W
12. **Times Sq-42 St** - [-73.9875808, 40.755746] - Major hub, transfers: 1, 2, 3, 7, A, C, E, Q, R, S, W
13. **34 St-Herald Sq** - [-73.9878865, 40.749643] - Major hub, transfers: B, D, F, M, Q, R, W
14. **14 St-Union Sq** - [-73.99041633333333, 40.735066] - Major hub, transfers: 4, 5, 6, L, Q, R, W
15. **Canal St** - [-74.00057999999999, 40.71870125] - Transfers: 6, J, Q, R, W, Z

### Brooklyn (13 stations)
16. **Atlantic Av-Barclays Ctr** - [-73.97778866666665, 40.68416166666667] - Major hub, transfers: 2, 3, 4, 5, B, D, Q, R
17. **36 St** - [-74.003549, 40.655144] - Transfers: D, R
18. **59 St** - [-74.017881, 40.641362] - Transfers: R
19. **8 Av** - [-74.011719, 40.635064] - No transfers
20. **Fort Hamilton Pkwy** - [-74.005351, 40.631386] - No transfers
21. **62 St** - [-73.996624, 40.625657000000004] - Transfers: D
22. **18 Av** - [-73.990414, 40.620671] - No transfers
23. **20 Av** - [-73.985026, 40.61741] - No transfers
24. **Bay Pkwy** - [-73.981848, 40.611815] - No transfers
25. **Kings Hwy** - [-73.980353, 40.603923] - No transfers
26. **Avenue U** - [-73.979137, 40.597473] - No transfers
27. **86 St** - [-73.97823, 40.592721] - No transfers
28. **Coney Island-Stillwell Av** - [-73.981233, 40.577422] - Terminal, transfers: D, F, Q

## Service Patterns

### Regular Service
- **All Times**: Local service at all stops
- **Direction**: Bidirectional service between Astoria-Ditmars Blvd and Coney Island-Stillwell Av
- **Broadway Express**: Runs express on Broadway in Manhattan during rush hours (some variations)

### Weekend Service
- Full local service on weekends
- May run with modified service patterns

### Late Night Service
- Limited late night service
- Local service at all stops

## Major Transfer Points
1. **Times Sq-42 St**: Major Midtown hub (12 lines: 1, 2, 3, 7, A, C, E, N, Q, R, S, W)
2. **34 St-Herald Sq**: Midtown Manhattan hub (8 lines: B, D, F, M, N, Q, R, W)
3. **14 St-Union Sq**: Major downtown hub (8 lines: 4, 5, 6, L, N, Q, R, W)
4. **Atlantic Av-Barclays Ctr**: Brooklyn hub (9 lines: 2, 3, 4, 5, B, D, N, Q, R)
5. **Lexington Av/59 St**: Uptown hub (6 lines: 4, 5, 6, N, R, W)
6. **Coney Island-Stillwell Av**: Brooklyn terminal (4 lines: D, F, N, Q)

## Implementation Details

### Code Structure
```typescript
if (lineId === 'N') {
  const markersForLine: maplibregl.Marker[] = [];
  const nLineCoords: [number, number][] = [
    // 28 station coordinates from Astoria-Ditmars Blvd to Coney Island-Stillwell Av
  ];

  const nLineStations = [
    // 28 station objects with name, coordinates, and transfer lines
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
- **Broadway Corridor**: Serves major Broadway corridor in Manhattan
- **Astoria Service**: Connects Astoria, Queens to Coney Island
- **Shared with W train**: 6 consecutive stations in Queens (Astoria-Ditmars Blvd to 39 Av-Dutch Kills)
- **Broadway Express**: Express service on Broadway during rush hours (some variations)
- **Coney Island Connection**: Direct service to Coney Island boardwalk

### Shared Track Sections
- **With W train**: Astoria-Ditmars Blvd → Queensboro Plaza (7 stations)
- **With R train**: Lexington Av/59 St, 5 Av/59 St, 49 St (multiple Manhattan stations)
- **With Q train**: Times Sq-42 St, 34 St-Herald Sq, 14 St-Union Sq, Canal St, Atlantic Av-Barclays Ctr, Coney Island-Stillwell Av
- **With D train**: 36 St, 62 St, Coney Island-Stillwell Av

## Verification Status
✅ All 28 stations verified against MTA official data
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Line renders continuously from terminal to terminal
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- N train serves the Broadway corridor in Manhattan
- Important connection between Astoria and Coney Island
- Serves Times Square, Herald Square, and Union Square (major hubs)
- Shares track with W train in Queens (Astoria line)
- Terminal at Coney Island provides beach access
- No service to Lower Manhattan Financial District

## Shared Stations with Other Lines
- **N/W Shared Stations**: Astoria-Ditmars Blvd, Astoria Blvd, 30 Av, Broadway, 36 Av, 39 Av-Dutch Kills, Queensboro Plaza
- **N/R Shared Stations**: Lexington Av/59 St, 5 Av/59 St, 49 St, 36 St, 59 St
- **N/Q Shared Stations**: Times Sq-42 St, 34 St-Herald Sq, 14 St-Union Sq, Canal St, Atlantic Av-Barclays Ctr, Coney Island-Stillwell Av
- **N/D Shared Stations**: 36 St, 62 St, Coney Island-Stillwell Av

## Notable Station Names in Data
- "Astoria-Ditmars Blvd" (northern terminal in Queens)
- "39 Av-Dutch Kills" (Dutch Kills neighborhood)
- "Lexington Av/59 St" (major transfer hub)
- "Times Sq-42 St" (busiest station complex)
- "Atlantic Av-Barclays Ctr" (major Brooklyn hub)
- "Coney Island-Stillwell Av" (southern terminal, beach access)

---

**Implementation Date**: October 18, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 28
**Line Type**: Local service
**Implementation Method**: Hardcoded with custom DOM markers
