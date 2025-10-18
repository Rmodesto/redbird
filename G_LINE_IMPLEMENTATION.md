# G Train (Brooklyn-Queens Crosstown) - Implementation Documentation

## Overview
The G train (Brooklyn-Queens Crosstown) runs from Court Sq-23 St in Queens through Brooklyn to Church Av. This is the only subway line that does not enter Manhattan. This implementation includes complete routing with accurate station coordinates and proper integration with the existing subway map system.

## Line Characteristics
- **Line ID**: G
- **Color**: #6CBE45 (MTA Light Green)
- **Service Type**: Local service
- **Total Stations**: 21 stations
- **Route**: Court Sq-23 St (Queens) → Brooklyn → Church Av (Brooklyn)
- **Unique Feature**: Only NYC subway line that doesn't enter Manhattan

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx` (lines 2041-2186)

### Implementation Structure
The G train is implemented with hardcoded markers using:
- Line coordinates array (21 stations)
- Station markers array (21 stations)
- GeoJSON structure for rendering
- Glassmorphic tooltip support with transfer information
- Custom DOM marker elements

## Complete Station List with Coordinates

### Queens (2 stations)
1. **Court Sq-23 St** - [-73.94503200000001, 40.747141000000006] - Terminal, transfers: 7, E, M
2. **21 St** - [-73.949724, 40.744065] - No transfers

### Brooklyn (19 stations)
3. **Greenpoint Av** - [-73.954449, 40.731352] - No transfers
4. **Nassau Av** - [-73.951277, 40.724635] - No transfers
5. **Lorimer St** - [-73.95084650000001, 40.7134275] - Transfers: L
6. **Broadway** - [-73.950308, 40.706092] - No transfers
7. **Flushing Av** - [-73.950234, 40.700377] - No transfers
8. **Myrtle-Willoughby Avs** - [-73.949046, 40.694568] - No transfers
9. **Bedford-Nostrand Avs** - [-73.953522, 40.689627] - No transfers
10. **Classon Av** - [-73.96007, 40.688873] - No transfers
11. **Clinton-Washington Avs** - [-73.966839, 40.688089] - No transfers
12. **Fulton St** - [-73.975375, 40.687119] - No transfers
13. **Hoyt-Schermerhorn Sts** - [-73.985001, 40.688484] - Major hub, transfers: A, C
14. **Bergen St** - [-73.990862, 40.686145] - Transfers: F
15. **Carroll St** - [-73.995048, 40.680303] - Transfers: F
16. **Smith-9 Sts** - [-73.995959, 40.67358] - Transfers: F
17. **4 Av-9 St** - [-73.9890405, 40.670559499999996] - Transfers: F, R
18. **7 Av** - [-73.980305, 40.666271] - Transfers: F
19. **15 St-Prospect Park** - [-73.979493, 40.660365] - Transfers: F
20. **Fort Hamilton Pkwy** - [-73.975776, 40.650782] - Transfers: F
21. **Church Av** - [-73.979678, 40.644041] - Terminal, transfers: F

## Service Patterns

### Regular Service
- **Local Service**: All stops from Court Sq-23 St to Church Av
- **All Times**: Operates during all service hours
- **Direction**: Bidirectional service between Court Sq-23 St and Church Av
- **No Manhattan**: Only line that doesn't enter Manhattan

### Weekend Service
- Full service on weekends
- All local stops

### Late Night Service
- Limited late night service
- Some late night service interruptions possible

## Major Transfer Points
1. **Court Sq-23 St**: Queens hub (4 lines: 7, E, G, M)
2. **Hoyt-Schermerhorn Sts**: Brooklyn hub (3 lines: A, C, G)
3. **Lorimer St**: Transfer to L train for Manhattan access
4. **Bergen St to Church Av**: 8 consecutive shared stations with F train

## Implementation Details

### Code Structure
```typescript
if (lineId === 'G') {
  const markersForLine: maplibregl.Marker[] = [];
  const gLineCoords: [number, number][] = [
    // 21 station coordinates from Court Sq-23 St to Church Av
  ];

  const gLineStations = [
    // 21 station objects with name, coordinates, and transfer lines
  ];

  // Custom DOM marker elements with styling
  // Glassmorphic tooltip on hover
  // Click event handlers
  // Marker storage for cleanup
}
```

### Visual Characteristics
- **Line Color**: #6CBE45 (MTA Light Green)
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
- **Only Non-Manhattan Line**: Connects Queens and Brooklyn without entering Manhattan
- **Brooklyn-Queens Crosstown**: Serves neighborhoods not accessible by other lines
- **F Train Overlap**: Shares 8 stations with F train (Bergen St to Church Av)
- **Local Service Only**: No express service

### Shared Track Sections
- **With F train**: Bergen St to Church Av (8 stations in Brooklyn)
- **Parallel to F**: Both serve southern Brooklyn neighborhoods

## Verification Status
✅ All 21 stations verified against MTA official data
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Line renders continuously from terminal to terminal
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- G train is the shortest lettered line in the system
- Only subway line that doesn't enter Manhattan
- Important connection between Queens and Brooklyn neighborhoods
- Provides crosstown service in Brooklyn
- Limited late night service
- Major connection to F train for southern Brooklyn access

## Shared Stations with Other Lines
- **E/G/M Shared Stations**: Court Sq-23 St
- **F/G Shared Stations**: Bergen St, Carroll St, Smith-9 Sts, 4 Av-9 St, 7 Av, 15 St-Prospect Park, Fort Hamilton Pkwy, Church Av
- **L/G Shared Stations**: Lorimer St
- **A/C/G Shared Stations**: Hoyt-Schermerhorn Sts

## Notable Station Names in Data
- "Court Sq-23 St" (shared with 7, E, M trains)
- "Hoyt-Schermerhorn Sts" (hyphenated street names)
- "Myrtle-Willoughby Avs" (dual avenue name)
- "Bedford-Nostrand Avs" (dual avenue name)
- "Clinton-Washington Avs" (dual avenue name)

---

**Implementation Date**: October 17, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 21
**Line Type**: Local service only
**Implementation Method**: Hardcoded with custom DOM markers
