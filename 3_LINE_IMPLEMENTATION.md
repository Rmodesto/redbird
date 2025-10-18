# 3 Line Implementation Documentation

## Overview
This document describes the implementation of the 3 train line (7th Avenue Express) on the NYC Subway interactive map, correcting routing errors and ensuring accurate station representation.

## Problem Statement
The 3 line had significant routing errors in the original implementation:

### Major Issues Identified
1. **Incorrect Route Definition**: The 3 line was incorrectly routed through stations it doesn't serve
2. **Missing Branch Information**: Failed to show the 3 line's unique Eastern Brooklyn branch
3. **Station Confusion**: Mixed up stations between the 2 and 3 lines after Franklin Avenue
4. **Missing Station**: Park Place (Cortlandt St) station was missing from the route

## Critical Route Correction

### The 2/3 Split at Franklin Avenue
The most important aspect of the 3 train implementation is understanding where it diverges from the 2 train:
- **2 Train**: Continues to Flatbush Avenue-Brooklyn College via the local stops (President St, Sterling St, Winthrop St, Church Av, Beverly Rd, Newkirk Av)
- **3 Train**: Branches east at Franklin Avenue/Botanic Garden to serve Eastern Brooklyn (Crown Heights, East New York, Brownsville)

### Incorrect Stations Removed
The following stations were incorrectly included in the 3 train route and have been removed:
- ❌ President St
- ❌ Sterling St
- ❌ Winthrop St
- ❌ Church Av
- ❌ Beverly Rd
- ❌ Newkirk Av
- ❌ Flatbush Av-Brooklyn College

These stations are ONLY served by the 2 and 5 trains, not the 3.

### Station Added (Post-Implementation Update)
- ✅ **Park Place/Cortlandt St** - Initially thought to not exist, but was discovered to be served by 2/3 lines as Cortlandt St station

## Complete 3 Train Route (34 Stations)

### Eastern Brooklyn Branch (10 stations) - UNIQUE TO 3 TRAIN
1. **New Lots Av** - Terminal station
2. **Van Siclen Av**
3. **Pennsylvania Av**
4. **Junius St**
5. **Rockaway Av**
6. **Saratoga Av**
7. **Sutter Av-Rutland Rd**
8. **Crown Hts-Utica Av** - Transfer to 4
9. **Kingston Av**
10. **Nostrand Av**

### Central Brooklyn (Shared with 2) - 7 stations
11. **Botanic Garden** - Junction point where 3 joins 2/4/5
12. **Eastern Pkwy-Brooklyn Museum**
13. **Grand Army Plaza**
14. **Bergen St**
15. **Atlantic Av-Barclays Ctr** - Major transfer hub
16. **Nevins St**
17. **Hoyt St**

### Brooklyn Downtown (Shared with 2) - 2 stations
18. **Borough Hall (Court St)**
19. **Clark St**

### Manhattan Financial District (Shared with 2) - 4 stations
20. **Wall St**
21. **Fulton St**
22. **Cortlandt St (Park Place)**
23. **Chambers St**

### Manhattan Midtown (Shared with 1/2) - 3 stations
24. **14 St** (shown as "14 St (6 Av)")
25. **34 St-Penn Station**
26. **Times Sq-42 St**

### Manhattan Upper West Side (Shared with 1/2) - 5 stations
27. **72 St**
28. **96 St**
29. **110 St-Central Park North**
30. **116 St**
31. **125 St**

### Harlem (3 diverges from 2) - 3 stations
32. **135 St** - Last shared stop with 2
33. **145 St** - 3 ONLY (2 skips this)
34. **Harlem-148 St** - Terminal (Lenox Terminal)

## Key Differences Between 2 and 3 Lines

### In Brooklyn:
- **3 Train**: New Lots Av → Eastern Brooklyn → Botanic Garden → Atlantic Av
- **2 Train**: Flatbush Av → Local stops → Franklin Av → Atlantic Av

### In Manhattan/Harlem:
- Both lines are identical until 135 St
- **2 Train**: Goes directly from 135 St to 149 St-Grand Concourse (Bronx)
- **3 Train**: Stops at 145 St then terminates at 148 St (Lenox)

## Technical Implementation

### Hardcoded Solution
```typescript
const threeLineCoords: [number, number][] = [
  // Eastern Brooklyn Branch (unique to 3)
  [-73.884079, 40.666235],   // New Lots Av
  [-73.889395, 40.665449],   // Van Siclen Av
  // ... continues through all stations including
  [-74.0095515, 40.712603],  // Cortlandt St (Park Place)
  // ... ending at
  [-73.93647, 40.82388]      // Harlem-148 St
];
```

### Station Name Mapping
Enhanced tooltip logic handles variations:
```typescript
stationName === 'Botanic Garden' && propName === 'Botanic Garden (Franklin Av)' ||
stationName === 'Court St' && propName === 'Borough Hall (Court St)' ||
stationName === 'Cortlandt St' && propName === 'Cortlandt St (Park Place)' ||
stationName === '110 St-Malcolm X Plaza' && propName === '110 St-Central Park North'
```

### Files Modified
- `/components/WorkingSubwayMap.tsx` - Added hardcoded 3 line implementation
- `/lib/map/subwayLineRoutes.ts` - Fixed route definition, removed incorrect stations

## Visual Characteristics
- **Line Color**: `#EE352E` (MTA Red - same as 1/2)
- **Line Width**: 4px
- **Opacity**: 0.8
- **Station Markers**: 6px radius with white stroke

## Verification Points

### Route Integrity
✅ Eastern Brooklyn branch properly rendered
✅ Correct junction at Franklin Avenue/Botanic Garden
✅ No incorrect stations from 2/5 lines
✅ Proper termination at Harlem-148 St
✅ Park Place/Cortlandt St properly included

### Station Validation
✅ All 34 stations correctly plotted
✅ Tooltips show accurate line information
✅ Transfer stations properly marked
✅ Terminal stations correctly identified
✅ Park Place station properly positioned between Fulton and Chambers

### Cross-Line Verification
✅ Shared sections with 2 train properly aligned
✅ 145 St shows only 3 train (not 2)
✅ Major transfer hubs correctly positioned

## Common Misconceptions Corrected

1. **The 3 doesn't go to Flatbush Avenue** - It terminates at New Lots Avenue in Eastern Brooklyn
2. **The 3 stops at 145 St** - The 2 train skips this station
3. **Franklin Avenue is not just a transfer** - It's the critical junction where 2 and 3 diverge
4. **The 3 serves a unique area** - Eastern Brooklyn communities not served by the 2

## Service Pattern Summary

The 3 train provides:
- Express service in Manhattan (same as 1/2)
- Express service in Brooklyn (skips local stops)
- Unique service to Eastern Brooklyn neighborhoods
- Terminal at Harlem-148 St (Lenox Terminal)

## Future Considerations

1. **Weekend Service Patterns**: The 3 often doesn't run late nights (replaced by shuttle)
2. **Express vs Local**: Implementation shows express routing
3. **Service Advisories**: Real-time data integration could show service changes

## Implementation Updates

### Initial Implementation (September 18, 2025)
- Implemented 33 stations with correct Eastern Brooklyn routing
- Fixed branch divergence at Franklin Avenue
- Removed incorrect 2/5 line stations

### Park Place Addition (September 18, 2025 - Update)
- Added missing Park Place/Cortlandt St station
- Station identified as Cortlandt St in MTA data
- Positioned between Fulton St and Chambers St
- Updated both 2 and 3 train implementations simultaneously

---

**Implementation Date**: September 18, 2025
**Last Updated**: September 18, 2025
**Status**: ✅ Complete and Working
**Total Stations**: 34 (New Lots Av to Harlem-148 St)
**Line Color**: #EE352E (MTA Red)
**Unique Feature**: Eastern Brooklyn Branch