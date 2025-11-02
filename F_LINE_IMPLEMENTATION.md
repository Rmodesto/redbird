# F Train (6th Avenue Local/Culver Express) - Implementation Documentation

## Overview
The F train (6th Avenue Local/Culver Express) runs from Jamaica-179 St in Queens through Manhattan to Coney Island-Stillwell Av in Brooklyn. This implementation includes complete routing with accurate station coordinates and proper integration with the existing subway map system.

## Line Characteristics
- **Line ID**: F
- **Color**: #FF6319 (MTA Orange)
- **Service Type**: Local service in Manhattan, Express in Brooklyn
- **Total Stations**: 45 stations
- **Route**: Jamaica-179 St → Queens → Manhattan → Brooklyn → Coney Island

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx` (lines 1845-2038)

### Implementation Structure
The F train is implemented with hardcoded markers using:
- Line coordinates array (45 stations)
- Station markers array (45 stations)
- GeoJSON structure for rendering
- Glassmorphic tooltip support with transfer information
- Custom DOM marker elements

## Complete Station List with Coordinates

### Queens (10 stations)
1. **Jamaica-179 St** - [-73.783817, 40.712646] - Terminal
2. **169 St** - [-73.793604, 40.71047] - No transfers
3. **Parsons Blvd** - [-73.803326, 40.707564] - No transfers
4. **Sutphin Blvd** - [-73.810708, 40.70546] - No transfers
5. **Briarwood** - [-73.820574, 40.709179] - Transfers: E
6. **Kew Gardens-Union Tpke** - [-73.831008, 40.714441] - Transfers: E
7. **75 Av** - [-73.837324, 40.718331] - Transfers: E
8. **Forest Hills-71 Av** - [-73.844521, 40.721691] - Major hub, transfers: E, M, R
9. **Jackson Hts-Roosevelt Av** - [-73.891366, 40.746746] - Major hub, transfers: 7, E, M, R
10. **21 St-Queensbridge** - [-73.942836, 40.754203] - No transfers

### Manhattan (13 stations)
11. **Roosevelt Island** - [-73.95326, 40.759145] - No transfers
12. **Lexington Av/63 St** - [-73.966113, 40.764629] - Transfers: Q
13. **57 St** - [-73.97745, 40.763972] - No transfers
14. **47-50 Sts-Rockefeller Ctr** - [-73.981329, 40.758663] - Transfers: B, D, M
15. **42 St-Bryant Pk** - [-73.98326599999999, 40.7540215] - Major hub, transfers: 7, B, D, M
16. **34 St-Herald Sq** - [-73.9878865, 40.749643] - Major hub, transfers: B, D, M, N, Q, R, W
17. **23 St** - [-73.992821, 40.742878] - Transfers: M
18. **14 St** - [-73.997732, 40.73779633333333] - Major hub, transfers: 1, 2, 3, L, M
19. **W 4 St-Wash Sq** - [-74.000495, 40.732338] - Major hub, transfers: A, B, C, D, E, M
20. **Broadway-Lafayette St** - [-73.9954315, 40.725606] - Transfers: 6, B, D, M
21. **2 Av** - [-73.989938, 40.723402] - No transfers
22. **Delancey St-Essex St** - [-73.9877755, 40.718463] - Transfers: J, M, Z
23. **East Broadway** - [-73.990173, 40.713715] - No transfers

### Brooklyn (22 stations)
24. **York St** - [-73.986751, 40.701397] - No transfers
25. **Jay St-MetroTech** - [-73.98664199999999, 40.692259] - Major hub, transfers: A, C, R
26. **Bergen St** - [-73.990862, 40.686145] - Transfers: G
27. **Carroll St** - [-73.995048, 40.680303] - Transfers: G
28. **Smith-9 Sts** - [-73.995959, 40.67358] - Transfers: G
29. **4 Av-9 St** - [-73.9890405, 40.670559499999996] - Transfers: G, R
30. **7 Av** - [-73.980305, 40.666271] - Transfers: G
31. **15 St-Prospect Park** - [-73.979493, 40.660365] - Transfers: G
32. **Fort Hamilton Pkwy** - [-73.975776, 40.650782] - Transfers: G
33. **Church Av** - [-73.979678, 40.644041] - Transfers: G
34. **Ditmas Av** - [-73.978172, 40.636119] - No transfers
35. **18 Av** - [-73.976971, 40.629755] - No transfers
36. **Avenue I** - [-73.976127, 40.625322] - No transfers
37. **Bay Pkwy** - [-73.975264, 40.620769] - No transfers
38. **Avenue N** - [-73.974197, 40.61514] - No transfers
39. **Avenue P** - [-73.973022, 40.608944] - No transfers
40. **Kings Hwy** - [-73.972361, 40.603217] - No transfers
41. **Avenue U** - [-73.973357, 40.596063] - No transfers
42. **Avenue X** - [-73.97425, 40.58962] - No transfers
43. **Neptune Av** - [-73.974574, 40.581011] - No transfers
44. **W 8 St-NY Aquarium** - [-73.975939, 40.576127] - Transfers: Q
45. **Coney Island-Stillwell Av** - [-73.981233, 40.577422] - Terminal, transfers: D, N, Q

## Service Patterns

### Regular Service
- **Local in Queens**: All stops from Jamaica-179 St to 21 St-Queensbridge
- **Local in Manhattan**: Makes all stops along 6th Avenue
- **Express in Brooklyn**: Express service in southern Brooklyn (Culver Express)
- **All Times**: 24/7 service with reduced frequency late nights
- **Direction**: Bidirectional service between Jamaica-179 St and Coney Island-Stillwell Av

### Weekend Service
- Full service on weekends
- May have reduced frequency during late nights
- Local service throughout the route

### Late Night Service
- Operates 24/7 but with reduced frequency
- Local service at all stations

## Major Transfer Points
1. **W 4 St-Wash Sq**: Major downtown hub (7 lines: A, B, C, D, E, F, M)
2. **34 St-Herald Sq**: Major midtown hub (8 lines: B, D, F, M, N, Q, R, W)
3. **42 St-Bryant Pk**: Midtown hub (5 lines: 7, B, D, F, M)
4. **Jackson Hts-Roosevelt Av**: Major Queens hub (5 lines: 7, E, F, M, R)
5. **Forest Hills-71 Av**: Queens hub (4 lines: E, F, M, R)
6. **Jay St-MetroTech**: Brooklyn hub (4 lines: A, C, F, R)
7. **14 St (6 Av)**: Major Village hub (5 lines: 1, 2, 3, F, L, M)
8. **Coney Island-Stillwell Av**: Southern terminal (4 lines: D, F, N, Q)

## Implementation Details

### Code Structure
```typescript
if (lineId === 'F') {
  const markersForLine: maplibregl.Marker[] = [];
  const fLineCoords: [number, number][] = [
    // 45 station coordinates from Jamaica-179 St to Coney Island
  ];

  const fLineStations = [
    // 45 station objects with name, coordinates, and transfer lines
  ];

  // Custom DOM marker elements with styling
  // Glassmorphic tooltip on hover
  // Click event handlers
  // Marker storage for cleanup
}
```

### Visual Characteristics
- **Line Color**: #FF6319 (MTA Orange)
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
- **Roosevelt Island Tramway**: Only subway connection to Roosevelt Island
- **Long Brooklyn Run**: 22 consecutive stations in Brooklyn (longest segment)
- **Culver Line**: Historic Culver Express service in Brooklyn
- **Beach Access**: Direct service to Coney Island attractions

### Shared Track Sections
- **With E train**: Briarwood to Jackson Hts-Roosevelt Av (Queens)
- **With G train**: Bergen St to Church Av (Brooklyn)
- **With M train**: Forest Hills-71 Av, Jackson Hts-Roosevelt Av, 47-50 Sts-Rockefeller Ctr, 42 St-Bryant Pk, 34 St-Herald Sq, 23 St, 14 St, W 4 St-Wash Sq, Broadway-Lafayette St, Delancey St-Essex St

## Verification Status
✅ All 45 stations verified against MTA official data
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Line renders continuously from terminal to terminal
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- F train is one of the longest routes in the NYC subway system
- Only train serving Roosevelt Island
- Major connection between Queens, Manhattan, and southern Brooklyn
- 24/7 service (one of the busiest lines in the system)
- Express service in Brooklyn (Culver Express)
- Important beach access to Coney Island

## Shared Stations with Other Lines
- **E/F Shared Stations**: Briarwood, Kew Gardens-Union Tpke, 75 Av, Forest Hills-71 Av, Jackson Hts-Roosevelt Av
- **F/G Shared Stations**: Bergen St, Carroll St, Smith-9 Sts, 4 Av-9 St, 7 Av, 15 St-Prospect Park, Fort Hamilton Pkwy, Church Av
- **F/M Shared Stations**: Forest Hills-71 Av, Jackson Hts-Roosevelt Av, 47-50 Sts-Rockefeller Ctr, 42 St-Bryant Pk, 34 St-Herald Sq, 23 St, 14 St, W 4 St-Wash Sq, Broadway-Lafayette St, Delancey St-Essex St
- **F/Q Shared Stations**: Lexington Av/63 St, W 8 St-NY Aquarium, Coney Island-Stillwell Av

## Notable Station Names in Data
- "W 4 St-Wash Sq" (not "W 4 St-Washington Sq")
- "47-50 Sts-Rockefeller Ctr" (hyphenated street numbers)
- "15 St-Prospect Park" (not "15th Street")
- "Kew Gardens-Union Tpke" (abbreviated Turnpike)

---

**Implementation Date**: October 17, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 45
**Line Type**: Local in Queens/Manhattan, Express in Brooklyn
**Implementation Method**: Hardcoded with custom DOM markers
