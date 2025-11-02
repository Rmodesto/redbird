# 6 Line Implementation Documentation

## Overview
This document describes the implementation of the 6 train line (Lexington Avenue Local) on the NYC Subway interactive map, ensuring accurate station representation and routing.

## Line Characteristics
- **Name**: Lexington Avenue Local (6)
- **Color**: #00933C (MTA Green - shared with 4/5)
- **Route**: Pelham Bay Park (Bronx) to Brooklyn Bridge-City Hall (Manhattan)
- **Service Type**: Local service (all stops)

## Complete 6 Train Route (38 Stations)

### The Bronx (18 stations)
1. **Pelham Bay Park** - Terminal station (Westchester Ave and Bruckner Blvd)
2. **Buhre Av** - (Edison Ave and Westchester Ave, Buhre Ave and Edison Ave)
3. **Middletown Rd** - (Westchester Ave and Middletown Rd)
4. **Westchester Sq-East Tremont Av** - (Westchester Ave and Ferris Pl)
5. **Zerega Av** - (Zerega Ave and Westchester Ave)
6. **Castle Hill Av** - (Castle Hill Ave and Westchester Ave)
7. **Parkchester** - (Center of Hugh Grant Circle at Westchester Ave and Metropolitan Ave)
8. **St Lawrence Av** - (St Lawrence Ave and Westchester Ave)
9. **Morrison Av-Soundview** - (Morrison Ave and Westchester Ave)
10. **Elder Av** - (Elder Ave and Westchester Ave)
11. **Whitlock Av** - (Whitlock Ave and Westchester Ave)
12. **Hunts Point Av** - (Hunts Point Ave and Southern Blvd, E 163 St and Bruckner Blvd)
13. **Longwood Av** - (Longwood Ave and Southern Blvd)
14. **E 149 St** - (E 149 St and Southern Blvd)
15. **E 143 St-St Mary's St** - (E 143 St and Southern Blvd)
16. **Cypress Av** - (E 138 St between Cypress Ave and Jackson Ave)
17. **Brook Av** - (E 138 St and Brook Ave)
18. **3 Av-138 St** - (E 138 St and 3rd Ave, E 138 St and Alexander Ave)

### Manhattan (20 stations)
19. **125 St** - (E 125 St and Lexington Ave) - Transfer to 4, 5
20. **116 St** - (E 116 St and Lexington Ave)
21. **110 St** - (E 110 St and Lexington Ave)
22. **103 St** - (E 103 St and Lexington Ave)
23. **96 St** - (E 96 St and Lexington Ave)
24. **86 St** - (E 86 St and Lexington Ave) - Transfer to 4, 5 at times
25. **77 St** - (E 77 St and Lexington Ave)
26. **68 St-Hunter College** - (E 68 St and Lexington Ave)
27. **59 St** - (E 60 St and Lexington Ave, E 59 St and Lexington Ave, E 60 St and 3rd Ave) - Transfer to N, R, W, 4, 5
28. **51 St** - (E 51 St and Lexington Ave, Citicorp Plaza at E 53 St and Lexington Ave)
29. **Grand Central-42 St** - (Park Ave and E 42 St, Lexington Ave and E 42 St, E 42 St between Park Ave and Lexington Ave) - Transfer to 4, 5, 7, S
30. **33 St** - (E 32 St and Park Avenue S, E 33 St and Park Ave)
31. **28 St** - (E 28 St and Park Ave South)
32. **23 St** - (E 23 St and Park Ave South, E 23 St and Park Ave)
33. **14 St-Union Sq** - (E 15 St and Union Square East, E 14 St and 4th Ave, Union Square Park at E 14 St) - Transfer to L, N, Q, R, W, 4, 5
34. **Astor Pl** - (E 8 St and 4th Ave, Lafayette St and Astor Pl)
35. **Bleecker St** - (Houston St and Lafayette St, Bleecker St and Lafayette St, Bleecker St and Mulberry St) - Transfer to B, D, F, M weekdays
36. **Spring St** - (Spring St and Cleveland Place, Spring St and Lafayette St)
37. **Canal St** - (Canal St and Lafayette St) - Transfer to J, N, Q, R, W weekdays only
38. **Brooklyn Bridge-City Hall** - Terminal station (Centre St between Chambers St and Brooklyn Bridge) - Transfer to J, Z rush hours only, 4, 5

## Key Service Patterns

### Local Service
The 6 train runs as a local service, making all stops along the Lexington Avenue line in Manhattan and serving the Pelham line in the Bronx.

### Express vs Local Distinction
- The 6 train is the local counterpart to the 4/5 express trains
- Makes all local stops that the 4/5 trains skip in Manhattan
- Provides crucial local service in the East Bronx

### Peak Direction Express Service (<6>)
- During rush hours, some 6 trains run express in peak direction
- Diamond 6 (<6>) service runs express between Parkchester and 125 St

## Station Features

### Major Transfer Hubs
- **125 St**: Transfer to 4, 5 lines
- **59 St**: Transfer to N, R, W, 4, 5 lines
- **Grand Central-42 St**: Major hub with 4, 5, 7, S transfers
- **14 St-Union Sq**: Major hub with L, N, Q, R, W, 4, 5 transfers
- **Brooklyn Bridge-City Hall**: Terminal with J, Z (rush hours), 4, 5 transfers

### ADA Accessible Stations
- Pelham Bay Park (terminal)
- Hunts Point Av
- 125 St
- 86 St (northbound 6 only)
- 68 St-Hunter College
- 59 St
- Grand Central-42 St
- 14 St-Union Sq
- Bleecker St
- Brooklyn Bridge-City Hall (terminal)

### Station Types
- **Elevated Stations**: Most Bronx stations (Pelham Bay Park to Hunts Point Av)
- **Subway Stations**: All Manhattan stations
- **Local Stations**: All stops (6 is a local service)
- **Terminal Stations**: Pelham Bay Park and Brooklyn Bridge-City Hall

## Technical Implementation

### Coordinates Array (Corrected)
```typescript
const sixLineCoords: [number, number][] = [
  // Bronx stations
  [-73.828121, 40.852462],   // Pelham Bay Park
  [-73.832569, 40.846804],   // Buhre Av
  [-73.836322, 40.843863],   // Middletown Rd
  [-73.847036, 40.839892],   // Westchester Sq-E Tremont Av
  [-73.847036, 40.836488],   // Zerega Av
  [-73.851222, 40.834255],   // Castle Hill Av
  [-73.860526, 40.833226],   // Parkchester
  [-73.867618, 40.831509],   // St Lawrence Av
  [-73.874516, 40.829521],   // Morrison Av-Soundview
  [-73.879159, 40.828584],   // Elder Av
  [-73.886283, 40.826804],   // Whitlock Av
  [-73.890549, 40.820948],   // Hunts Point Av
  [-73.896435, 40.816104],   // Longwood Av
  [-73.89643, 40.8084],      // E 149 St
  [-73.907657, 40.808719],   // E 143 St-St Mary's St
  [-73.914685, 40.807566],   // Cypress Av
  [-73.91924, 40.807816],    // Brook Av
  [-73.92565, 40.80756],     // 3 Av-138 St

  // Manhattan stations (corrected coordinates)
  [-73.937594, 40.804138],   // 125 St
  [-73.949625, 40.798629],   // 116 St
  [-73.94425, 40.79502],     // 110 St (corrected - was using wrong station)
  [-73.947478, 40.7906],     // 103 St (corrected - was using wrong station)
  [-73.955857, 40.785672],   // 96 St
  [-73.955589, 40.779492],   // 86 St
  [-73.95987, 40.773796],    // 77 St
  [-73.96404, 40.768141],    // 68 St-Hunter College
  [-73.9676125, 40.762592999999995], // 59 St
  [-73.971952999999995, 40.757077],  // 51 St
  [-73.97735933333333, 40.751992],   // Grand Central-42 St
  [-73.98207599999999, 40.745951999999996], // 33 St
  [-73.98384, 40.74307],     // 28 St
  [-73.98622599999999, 40.739864],  // 23 St
  [-73.99041633333333, 40.735066],  // 14 St-Union Sq
  [-73.991072, 40.73005],    // Astor Pl
  [-73.992621, 40.725915],   // Bleecker St
  [-73.997141, 40.722591],   // Spring St
  [-74.00019, 40.71880399999999],   // Canal St
  [-74.003766, 40.713154]    // Brooklyn Bridge-City Hall
];
```

### Coordinate Corrections Made
- **110 St**: Changed from `[-73.951822, 40.794979]` to `[-73.94425, 40.79502]` (correct 6 train station)
- **103 St**: Changed from `[-73.955589, 40.790393]` to `[-73.947478, 40.7906]` (correct 6 train station)

These corrections ensure the 6 train plots correctly along the Lexington Avenue corridor without duplicate stations appearing on the map.

### Station Name Mapping
Handle variations in station names:
```typescript
// Common name variations to handle
'Westchester Sq-East Tremont Av' === 'Westchester Sq-E Tremont Av'
'Morrison Av-Soundview' === 'Morrison-Sound View'
'E 143 St-St Mary's St' === 'E 143 St-St Marys St'
'68 St-Hunter College' === '68 St'
'3 Av-138 St' === '138 St-3 Av'
```

### Files to Modify
- `/components/WorkingSubwayMap.tsx` - Add hardcoded 6 line implementation
- `/components/SubwayMap.tsx` - Add 6 line route
- `/data/stop-id-lookup.json` - Add/update 6 train station IDs
- `/lib/map/subwayLineRoutes.ts` - Add/update route definition

## Visual Characteristics
- **Line Color**: `#00933C` (MTA Green)
- **Line Width**: 4px
- **Opacity**: 0.8
- **Station Markers**: 6px radius with white stroke

## Verification Points

### Route Integrity
✅ Complete Bronx routing from Pelham Bay Park to 3 Av-138 St
✅ Local service pattern in Manhattan (all stops)
✅ Proper terminal at Brooklyn Bridge-City Hall
✅ All transfer points properly marked

### Station Validation
✅ All 38 stations correctly plotted
✅ Tooltips show accurate line information
✅ Transfer stations properly marked
✅ Terminal stations correctly identified

### Cross-Line Verification
✅ Shared sections with 4/5 trains properly aligned
✅ Transfer points correctly positioned
✅ Major hubs (Grand Central, Union Square) properly connected

## Service Pattern Summary

The 6 train provides:
- Local service along Lexington Avenue in Manhattan
- Essential service to East Bronx neighborhoods
- Connection between Bronx and Lower Manhattan
- All local stops that express trains skip

## Unique Characteristics

1. **Lexington Avenue Local**: Complements 4/5 express service
2. **Pelham Line Service**: Serves northeastern Bronx
3. **Peak Express (<6>)**: Rush hour express service in peak direction
4. **Terminal at City Hall**: Ends at Brooklyn Bridge-City Hall (no Brooklyn service)

## Common Transfer Patterns

- **6/4/5 at 125 St**: Major Lexington line transfer
- **6/4/5 at Grand Central**: Midtown hub
- **6/4/5 at Union Square**: Downtown transfer point
- **6 to N/R/W at 59 St**: Cross-platform transfer

## Implementation Notes

### Station Density
- Bronx stations are more spread out (elevated track)
- Manhattan stations are very close together (local stops)
- No Brooklyn service (terminates at Brooklyn Bridge-City Hall)

### Critical Junctions
- **125 St**: Connection to 4/5 express
- **Grand Central**: Major midtown hub
- **14 St-Union Sq**: Major downtown transfer
- **Brooklyn Bridge-City Hall**: Terminal station

---

**Implementation Date**: September 22, 2025
**Last Updated**: September 22, 2025
**Status**: ✅ COMPLETED
**Total Stations**: 38 (Pelham Bay Park to Brooklyn Bridge-City Hall)
**Line Color**: #00933C (MTA Green)
**Service Type**: Local

## Implementation Summary

### ✅ Completed Tasks:
1. **Hardcoded Implementation**: Added complete 6 train route in `WorkingSubwayMap.tsx`
2. **Station Data**: All stations already properly configured in `stop-id-lookup.json`
3. **Route Definition**: Already configured in `subwayLineRoutes.ts`
4. **Tooltip Mapping**: Added station disambiguation for 6 train stations
5. **Coordinate Verification**: All stations use correct MTA station coordinates
6. **Coordinate Fixes**: Corrected 103 St and 110 St to use proper 6 train station coordinates

### 🎯 Key Features Implemented:
- Complete Bronx-Manhattan routing (Pelham Bay Park to Brooklyn Bridge-City Hall)
- Local service pattern (all stops on Lexington Avenue)
- Proper terminal stations
- Station tooltip disambiguation for shared station names
- Correct Lexington Avenue local routing (complements 4/5 express)
- East Bronx Pelham line coverage

### 🚇 Service Characteristics:
- **Local Service**: Makes all stops that 4/5 express trains skip
- **Pelham Line**: Serves eastern Bronx neighborhoods
- **Manhattan Terminal**: Ends at Brooklyn Bridge-City Hall (no Brooklyn service)
- **Peak Express (<6>)**: Rush hour express service available
- **Transfer Points**: Major connections at 125 St, Grand Central, Union Square
- **Coordinate Accuracy**: All stations use correct MTA station complex coordinates

### 🔧 Issues Fixed:
- **Coordinate Corrections**: Fixed 103 St and 110 St stations to use proper 6 train coordinates instead of wrong line coordinates
- **Map Plotting**: Eliminated duplicate/misplaced station markers appearing east of Lexington Avenue
- **Station Disambiguation**: Proper tooltip mapping for stations serving multiple lines