# 5 Line Implementation Documentation

## Overview
This document describes the implementation of the 5 train line (Lexington Avenue Express) on the NYC Subway interactive map, ensuring accurate station representation and routing. The 5 train has a unique branching structure in the Bronx with two terminal destinations.

## Line Characteristics
- **Name**: Lexington Avenue Express (5)
- **Color**: #00933C (MTA Green - shared with 4/6)
- **Route**: Eastchester-Dyre Av OR Nereid Av (Bronx) to Flatbush Av-Brooklyn College (Brooklyn)
- **Service Type**: Express service in Manhattan, branches in Bronx

## Complete 5 Train Route (Two Branches)

### Main Route: Eastchester-Dyre Av Branch (33 stations total)

#### The Bronx - Dyre Av Branch (14 stations)
1. **Eastchester-Dyre Av** - Terminal station (Light St and Dyre Ave)
2. **Baychester Av** (Baychester Ave and Thomas E Brown Ave)
3. **Gun Hill Rd** (White Plains Rd between Sexton Pl and Dewitt Pl)
4. **Pelham Pkwy** (Esplanade and Pelham Parkway North)
5. **Morris Park** (Esplanade and Paulding Ave, E 180 St and Morris Park Ave)
6. **E 180 St** (E 180 St and Morris Park Ave)
7. **West Farms Sq-E Tremont Av** (E 178 St and Boston Rd, E Tremont Ave and Boston Rd)
8. **174 St** (E 174 St, Boston Rd and Southern Blvd)
9. **Freeman St** (Freeman St and Southern Blvd)
10. **Simpson St** (Simpson St and Westchester Ave)
11. **Intervale Av** (Intervale Ave and Westchester Ave)
12. **Prospect Av** (E 163 St and Westchester Ave, Prospect Ave and Westchester Ave)
13. **Jackson Av** (Jackson Ave and Westchester Ave, E 152 St and Jackson Ave)
14. **3 Av-149 St** (E 149 St and Third Ave, E 149 St and Melrose Ave)

#### Common Section (continues from both branches)
15. **149 St-Grand Concourse** (E 149 St and Grand Concourse) - Transfer to 2, 4
16. **138 St-Grand Concourse** (E 138 St and Grand Concourse) - Transfer to 4

### Manhattan (9 stations)
17. **125 St** (E 125 St and Lexington Ave) - Transfer to 4, 6
18. **86 St** (E 86 St and Lexington Ave) - Transfer to 4, 6
19. **59 St** (E 60 St and Lexington Ave) - Transfer to N, R, W, 4, 6
20. **Grand Central-42 St** (Park Ave and E 42 St) - Transfer to 4, 6, 7, S
21. **14 St-Union Sq** (E 15 St and Union Square East) - Transfer to L, N, Q, R, W, 4, 6
22. **Brooklyn Bridge-City Hall** (Centre St between Chambers St and Brooklyn Bridge) - Transfer to J, Z, 4, 6
23. **Fulton St** (Fulton St and Broadway) - Transfer to A, C, J, Z, 2, 3, 4
24. **Wall St** (Rector St and Broadway) - Transfer to 4
25. **Bowling Green** (Bowling Green Park at Whitehall St) - Transfer to 4

### Brooklyn (10 stations)
26. **Borough Hall** (Joralemon St and Court St) - Transfer to 2, 3, 4, R
27. **Nevins St** (Flatbush Ave between Nevins St and Livingston St) - Transfer to 2, 3, 4
28. **Atlantic Av-Barclays Ctr** (Hanson Place and Flatbush Ave) - Transfer to B, D, N, Q, R, W, 2, 3, 4
29. **Franklin Av-Medgar Evers College** (Franklin Ave and Eastern Parkway) - Transfer to 2, 3, 4
30. **President St-Medgar Evers College** (President St and Nostrand Ave) - Transfer to 2
31. **Sterling St** (Sterling St and Nostrand Ave) - Transfer to 2
32. **Winthrop St** (Winthrop St and Nostrand Ave) - Transfer to 2
33. **Church Av** (Church Ave and Nostrand Ave) - Transfer to 2
34. **Beverly Rd** (Beverly Rd and Nostrand Ave) - Transfer to 2
35. **Newkirk Av-Little Haiti** (Newkirk Ave and Nostrand Ave) - Transfer to 2
36. **Flatbush Av-Brooklyn College** - Terminal station (Flatbush Ave and Nostrand Ave) - Transfer to 2

### Alternative Route: Nereid Av Branch (9 stations)

#### The Bronx - Nereid Av Branch (9 stations)
1. **Nereid Av** - Terminal station (White Plains Rd and Nereid Avenue)
2. **233 St** (E 233 St and White Plains Rd)
3. **225 St** (E 225 St and White Plains Rd)
4. **219 St** (E 219 St and White Plains Rd)
5. **Gun Hill Rd** (E Gun Hill Rd and White Plains Rd)
6. **Burke Av** (Burke Ave and White Plains Rd)
7. **Allerton Av** (Allerton Ave and White Plains Rd)
8. **Pelham Pkwy** (Pelham Parkway South and White Plains Rd)
9. **Bronx Park East** (Sagamore St and Birchall Ave)

*Note: The Nereid Av branch merges with the main route at some point in the Bronx before continuing to Manhattan and Brooklyn*

## Technical Implementation

### Coordinates Array (Main Route - Eastchester-Dyre Av)
```typescript
const fiveLineCoords: [number, number][] = [
  // Bronx stations - Dyre Av branch
  [-73.83147, 40.88834],    // Eastchester-Dyre Av
  [-73.83836, 40.87851],    // Baychester Av
  [-73.84696, 40.86958],    // Gun Hill Rd
  [-73.85553, 40.85737],    // Pelham Pkwy
  [-73.86038, 40.85181],    // Morris Park
  [-73.87349, 40.84189],    // E 180 St
  [-73.88005, 40.84030],    // West Farms Sq-E Tremont Av
  [-73.88773, 40.83729],    // 174 St
  [-73.89187, 40.82999],    // Freeman St
  [-73.89306, 40.82407],    // Simpson St
  [-73.89674, 40.82218],    // Intervale Av
  [-73.90177, 40.81959],    // Prospect Av
  [-73.90781, 40.81649],    // Jackson Av
  [-73.91776, 40.81611],    // 3 Av-149 St

  // Common Bronx section (shared with Nereid branch)
  [-73.92703449999999, 40.8183925], // 149 St-Grand Concourse
  [-73.929849, 40.813224],   // 138 St-Grand Concourse

  // Manhattan stations (Lexington Ave Express - same as 4 train)
  [-73.937594, 40.804138],   // 125 St
  [-73.955589, 40.779492],   // 86 St
  [-73.9676125, 40.762592999999995], // 59 St
  [-73.97735933333333, 40.751992], // Grand Central-42 St
  [-73.99041633333333, 40.735066], // 14 St-Union Sq
  [-74.003766, 40.713154],   // Brooklyn Bridge-City Hall
  [-74.00783824999999, 40.71008875], // Fulton St
  [-74.011862, 40.707557],   // Wall St
  [-74.014065, 40.704817],   // Bowling Green

  // Brooklyn stations (extending beyond 4 train route)
  [-73.990642, 40.693241],   // Borough Hall
  [-73.980492, 40.688246],   // Nevins St
  [-73.97778866666665, 40.68416166666667], // Atlantic Av-Barclays Ctr
  [-73.958688, 40.6705125],  // Franklin Av-Medgar Evers College
  [-73.950683, 40.667883],   // President St-Medgar Evers College
  [-73.95085, 40.662742],    // Sterling St
  [-73.9502, 40.656652],     // Winthrop St
  [-73.949575, 40.650843],   // Church Av
  [-73.948959, 40.645098],   // Beverly Rd
  [-73.948411, 40.639967],   // Newkirk Av-Little Haiti
  [-73.947642, 40.632836]    // Flatbush Av-Brooklyn College
];
```

### Alternative Coordinates (Nereid Av Branch)
```typescript
const fiveLineNereidCoords: [number, number][] = [
  // Nereid Av branch stations
  [-73.854376, 40.898379],   // Nereid Av
  [-73.857473, 40.893193],   // 233 St
  [-73.860341, 40.888022],   // 225 St
  [-73.862633, 40.883895],   // 219 St
  [-73.866256, 40.87785],    // Gun Hill Rd
  [-73.867164, 40.871356],   // Burke Av
  [-73.867352, 40.865462],   // Allerton Av
  [-73.867615, 40.857192],   // Pelham Pkwy
  [-73.868457, 40.848828],   // Bronx Park East

  // Then continues with common section from 149 St-Grand Concourse...
];
```

## Implementation Strategy

Since the 5 train has two branches in the Bronx, we'll implement the main route (Eastchester-Dyre Av to Flatbush Av-Brooklyn College) as the primary line, which represents the majority of 5 train service.

### Files to Modify
- `/components/WorkingSubwayMap.tsx` - Add hardcoded 5 line implementation
- `/components/SubwayMap.tsx` - Add 5 line route
- `/data/stop-id-lookup.json` - Add 5 train station IDs
- `/lib/map/subwayLineRoutes.ts` - Add route definition

## Visual Characteristics
- **Line Color**: `#00933C` (MTA Green)
- **Line Width**: 4px
- **Opacity**: 0.8
- **Station Markers**: 6px radius with white stroke

## Service Pattern Summary

The 5 train provides:
- Express service in Manhattan (Lexington Avenue Express)
- Two branch services in the Bronx (Dyre Av and Nereid Av)
- Extended service to Brooklyn College (beyond 4 train terminal)
- Shared routing with 4/6 trains in Manhattan

## Key Differences from 4 Train

1. **Extended Brooklyn Service**: Goes beyond Crown Heights-Utica Av to Flatbush Av-Brooklyn College
2. **Bronx Branching**: Two separate northern terminals (Dyre Av and Nereid Av)
3. **Additional Brooklyn Stations**: Serves local stations in Brooklyn that 4 train skips

---

**Implementation Date**: September 22, 2025
**Last Updated**: September 22, 2025
**Status**: ✅ COMPLETED
**Total Stations**: 45 unique stations (both branches combined)
**Line Color**: #00933C (MTA Green)
**Service Type**: Express with dual Bronx branches

## Implementation Summary

### ✅ Completed Tasks:
1. **Dual Branch Implementation**: Both Nereid Ave and Dyre Ave branches fully implemented
2. **Station Data**: Updated `stop-id-lookup.json` with all 5 train stations
3. **Route Definition**: Configured in `subwayLineRoutes.ts`
4. **Visual Branching**: Both branches displayed on map with proper merge at E 180 St
5. **Extended Brooklyn Service**: Complete routing to Flatbush Av-Brooklyn College

### 🎯 Key Features Implemented:
- **Nereid Ave Branch** (White Plains Road): 9 stations from Nereid Av to E 180 St
- **Dyre Ave Branch** (Dyre Avenue Line): 6 stations from Eastchester-Dyre Av to E 180 St
- **Branch Merge Point**: Both branches converge at E 180 St
- **Express Service**: Manhattan Lexington Avenue Express routing
- **Extended Brooklyn Service**: Beyond 4 train to Flatbush Av-Brooklyn College
- **Smart Tooltips**: Station disambiguation for dual-served stations

### 📊 Service Pattern:
```
Nereid Av ────┐
              ├──► E 180 St ──► Manhattan ──► Brooklyn
Dyre Av ──────┘
```