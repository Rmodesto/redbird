# L Train (14th Street-Canarsie Local) - Implementation Documentation

## Overview
The L train (14th Street-Canarsie Local) runs from 8 Av in Manhattan through Brooklyn to Canarsie-Rockaway Pkwy. This implementation includes complete routing with accurate station coordinates and proper integration with the existing subway map system.

## Line Characteristics
- **Line ID**: L
- **Color**: #A7A9AC (MTA Gray)
- **Service Type**: Local service (Crosstown line)
- **Total Stations**: 24 stations
- **Route**: 8 Av (Manhattan) → Brooklyn → Canarsie-Rockaway Pkwy
- **Unique Feature**: First fully automated, CBTC-equipped line in NYC

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx` (lines 2355-2507)

### Implementation Structure
The L train is implemented with hardcoded markers using:
- Line coordinates array (24 stations)
- Station markers array (24 stations)
- GeoJSON structure for rendering
- Glassmorphic tooltip support with transfer information
- Custom DOM marker elements

## Complete Station List with Coordinates

### Manhattan (5 stations)
1. **8 Av** - [-74.002134, 40.740335] - Transfers: A, C, E
2. **6 Av** - [-73.997732, 40.73779633333333] - Transfers: 1, 2, 3, F, M
3. **14 St-Union Sq** - [-73.99041633333333, 40.735066] - Major hub, transfers: 4, 5, 6, N, Q, R, W
4. **3 Av** - [-73.986122, 40.732849] - No transfers
5. **1 Av** - [-73.981628, 40.730953] - No transfers

### Brooklyn (19 stations)
6. **Bedford Av** - [-73.956872, 40.717304] - No transfers
7. **Lorimer St** - [-73.95084650000001, 40.7134275] - Transfers: G
8. **Graham Av** - [-73.944053, 40.714565] - No transfers
9. **Grand St** - [-73.94067, 40.711926] - No transfers
10. **Montrose Av** - [-73.93985, 40.707739] - No transfers
11. **Morgan Av** - [-73.933147, 40.706152] - No transfers
12. **Jefferson St** - [-73.922913, 40.706607] - No transfers
13. **DeKalb Av** - [-73.918425, 40.703811] - No transfers
14. **Myrtle-Wyckoff Avs** - [-73.9119855, 40.699622000000005] - Transfers: M
15. **Halsey St** - [-73.904084, 40.695602] - No transfers
16. **Wilson Av** - [-73.904046, 40.688764] - No transfers
17. **Bushwick Av-Aberdeen St** - [-73.905249, 40.682829] - No transfers
18. **Broadway Junction** - [-73.90435599999999, 40.678896] - Major hub, transfers: A, C, J, Z
19. **Atlantic Av** - [-73.903097, 40.675345] - No transfers
20. **Sutter Av** - [-73.901975, 40.669367] - No transfers
21. **Livonia Av** - [-73.900571, 40.664038] - No transfers
22. **New Lots Av** - [-73.899232, 40.658733] - No transfers
23. **East 105 St** - [-73.899485, 40.650573] - No transfers
24. **Canarsie-Rockaway Pkwy** - [-73.90185, 40.646654] - Terminal

## Service Patterns

### Regular Service
- **Full-Time Local**: All stops from 8 Av to Canarsie-Rockaway Pkwy
- **24/7 Service**: Operates around the clock
- **Direction**: Bidirectional service between 8 Av and Canarsie-Rockaway Pkwy
- **CBTC System**: First fully automated subway line in NYC

### Weekend Service
- Full service on weekends
- All local stops

### Late Night Service
- 24/7 service with reduced frequency
- Important crosstown connection at all hours

## Major Transfer Points
1. **14 St-Union Sq**: Major Manhattan hub (8 lines: 4, 5, 6, L, N, Q, R, W)
2. **8 Av**: Transfer to A, C, E
3. **6 Av**: Transfer to 1, 2, 3, F, M
4. **Broadway Junction**: Brooklyn hub (5 lines: A, C, J, L, Z)
5. **Lorimer St**: Transfer to G
6. **Myrtle-Wyckoff Avs**: Transfer to M

## Implementation Details

### Code Structure
```typescript
if (lineId === 'L') {
  const markersForLine: maplibregl.Marker[] = [];
  const lLineCoords: [number, number][] = [
    // 24 station coordinates from 8 Av to Canarsie-Rockaway Pkwy
  ];

  const lLineStations = [
    // 24 station objects with name, coordinates, and transfer lines
  ];

  // Custom DOM marker elements with styling
  // Glassmorphic tooltip on hover
  // Click event handlers
  // Marker storage for cleanup
}
```

### Visual Characteristics
- **Line Color**: #A7A9AC (MTA Gray)
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
- **CBTC Automated**: First fully automated, Communications-Based Train Control line in NYC
- **Crosstown Service**: Runs across 14th Street in Manhattan
- **Williamsburg Access**: Serves trendy Williamsburg neighborhood in Brooklyn
- **Canarsie Line**: Historic route to Canarsie neighborhood
- **Frequent Service**: High-frequency service due to CBTC automation
- **Underground in Manhattan**: Tunnel under 14th Street

### Shared Track Sections
- **With G train**: Lorimer St (shared station)
- **With M train**: Myrtle-Wyckoff Avs (shared station)
- **With A/C/J/Z**: Broadway Junction (major transfer hub)

## Verification Status
✅ All 24 stations verified against MTA official data
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Line renders continuously from terminal to terminal
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- L train was the first NYC subway line with full CBTC automation
- Known for high frequency service (trains every 2-3 minutes during rush hour)
- Important crosstown connection across 14th Street in Manhattan
- Serves Williamsburg, Bushwick, and Canarsie neighborhoods in Brooklyn
- 24/7 service (one of the most reliable lines)
- No express service - local only
- Important connection at Broadway Junction for A/C/J/Z trains
- Popular with commuters to/from Williamsburg

## Shared Stations with Other Lines
- **L/G Shared Stations**: Lorimer St
- **L/M Shared Stations**: Myrtle-Wyckoff Avs
- **L/J/Z Shared Stations**: Broadway Junction (also A/C)
- **Major Hubs**: 14 St-Union Sq (4/5/6/N/Q/R/W), Broadway Junction (A/C/J/Z)

## Notable Station Names in Data
- "14 St-Union Sq" (major Manhattan transfer hub)
- "Myrtle-Wyckoff Avs" (hyphenated avenue names)
- "Bushwick Av-Aberdeen St" (dual street name)
- "Canarsie-Rockaway Pkwy" (terminal in Canarsie)

---

**Implementation Date**: October 18, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 24
**Line Type**: Local service only (Crosstown)
**Implementation Method**: Hardcoded with custom DOM markers
**Special Feature**: First fully CBTC-automated line in NYC
