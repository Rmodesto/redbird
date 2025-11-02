# S Shuttles - Implementation Documentation

## Overview
The S shuttle designation represents THREE distinct, geographically separate shuttle services in the NYC subway system. This implementation uses a unified toggle control that manages all three shuttles simultaneously while maintaining their separate geographic routes.

## Line Characteristics
- **Line ID**: S (unified toggle controlling S-GC, S-FR, S-RK)
- **Color**: #808183 (MTA Gray)
- **Service Type**: Three distinct shuttle services
- **Total Stations**: 11 stations (across all three shuttles)
- **Unique Feature**: One toggle controls three separate routes

## Three Distinct Shuttle Services

### 1. 42 St Shuttle (S-GC) - Grand Central Shuttle
- **Route**: Times Sq-42 St ↔ Grand Central-42 St
- **Stations**: 2 stations
- **Service**: 24/7 (Manhattan Midtown)
- **Purpose**: Critical connection between Times Square and Grand Central

### 2. Franklin Shuttle (S-FR) - Franklin Avenue Shuttle
- **Route**: Franklin Av ↔ Prospect Park
- **Stations**: 4 stations
- **Service**: All times except late nights (Brooklyn)
- **Purpose**: Historic elevated line connecting C train to B/Q trains

### 3. Rockaway Shuttle (S-RK) - Rockaway Park Shuttle
- **Route**: Broad Channel → Rockaway Park-Beach 116 St
- **Stations**: 5 stations
- **Service**: 24/7 (Queens beach access)
- **Purpose**: Beach access and peninsula service

## Technical Implementation

### File Location
`/components/WorkingSubwayMap.tsx`

### Implementation Structure
The S shuttles use a **hybrid approach**:
- **Backend**: Three separate line IDs (S-GC, S-FR, S-RK) with independent implementations
- **Frontend**: One unified "S" toggle that controls all three simultaneously
- **Rendering**: Three geographically separate routes (NOT connected)

### Toggle Logic (lines 189-210)
```typescript
if (lineId === 'S') {
  const shuttleLines = ['S-GC', 'S-FR', 'S-RK'];
  const anyShuttleActive = shuttleLines.some(shuttle => activeLines.includes(shuttle));

  if (anyShuttleActive) {
    // Turn off all shuttles
    shuttleLines.forEach(shuttle => {
      if (activeLines.includes(shuttle)) {
        toggleLine(shuttle);
      }
    });
  } else {
    // Turn on all shuttles
    shuttleLines.forEach(shuttle => {
      if (!activeLines.includes(shuttle)) {
        toggleLine(shuttle);
      }
    });
  }
  return;
}
```

### Button Rendering (lines 3942-3968)
```typescript
Object.keys(MTA_COLORS)
  .filter(line => !['S-GC', 'S-FR', 'S-RK'].includes(line)) // Filter out individual IDs
  .map(line => {
    const isActive = line === 'S'
      ? ['S-GC', 'S-FR', 'S-RK'].some(shuttle => activeLines.includes(shuttle))
      : activeLines.includes(line);
    // Button rendering...
  })
```

## Complete Station List with Coordinates

### 42 St Shuttle (S-GC) - 2 Stations
1. **Times Sq-42 St** - [-73.9875808, 40.755746] - Transfers: 1, 2, 3, 7, A, C, E, N, Q, R, S, W
2. **Grand Central-42 St** - [-73.97735933333333, 40.751992] - Transfers: 4, 5, 6, 7, S

### Franklin Shuttle (S-FR) - 4 Stations
1. **Franklin Av** - [-73.95633749999999, 40.680988] - Transfers: C, S
2. **Park Pl** - [-73.957624, 40.674772] - No transfers
3. **Botanic Garden** - [-73.958688, 40.6705125] - Transfers: 2, 3, 4, 5, S
4. **Prospect Park** - [-73.962246, 40.661614] - Transfers: B, Q, S

### Rockaway Shuttle (S-RK) - 5 Stations
1. **Broad Channel** - [-73.815925, 40.608382] - Transfers: A, S
2. **Beach 90 St** - [-73.813641, 40.588034] - Transfers: A, S
3. **Beach 98 St** - [-73.820558, 40.585307] - Transfers: A, S
4. **Beach 105 St** - [-73.827559, 40.583209] - Transfers: A, S
5. **Rockaway Park-Beach 116 St** - [-73.835592, 40.580903] - Transfers: A, S

## Service Patterns

### 42 St Shuttle (S-GC)
- **Hours**: 24/7 service
- **Frequency**: Every 2-10 minutes (rush hours: every 2-3 minutes)
- **Travel Time**: ~90 seconds
- **Ridership**: ~20,000 passengers/day

### Franklin Shuttle (S-FR)
- **Hours**: All times except late nights (approx. midnight-6am)
- **Frequency**: Every 10-20 minutes
- **Travel Time**: ~4 minutes
- **Ridership**: ~4,000 passengers/day

### Rockaway Shuttle (S-RK)
- **Hours**: 24/7 service
- **Frequency**: Every 10-20 minutes
- **Travel Time**: ~10 minutes
- **Ridership**: ~6,000 passengers/day (higher in summer)

## Implementation Details

### Code Locations

#### Configuration (lines 11-47)
```typescript
// MTA Colors
const MTA_COLORS: Record<string, string> = {
  'S': '#808183',
  'S-GC': '#808183',
  'S-FR': '#808183',
  'S-RK': '#808183',
  // ... other lines
};

// Hardcoded Lines
const HARDCODED_LINES: Record<string, { stationCount: number }> = {
  'S-GC': { stationCount: 2 },
  'S-FR': { stationCount: 4 },
  'S-RK': { stationCount: 5 }
  // ... other lines
};
```

#### 42 St Shuttle Implementation (lines 3363-3469)
- Custom DOM markers for 2 stations
- GeoJSON line rendering
- Glassmorphic tooltips
- Marker cleanup storage

#### Franklin Shuttle Implementation (lines 3472-3582)
- Custom DOM markers for 4 stations
- GeoJSON line rendering
- Glassmorphic tooltips
- Marker cleanup storage

#### Rockaway Shuttle Implementation (lines 3585-3697)
- Custom DOM markers for 5 stations
- GeoJSON line rendering
- Glassmorphic tooltips
- Marker cleanup storage

### Visual Characteristics
- **Line Color**: #808183 (Gray)
- **Line Width**: 4px
- **Line Opacity**: 0.8
- **Station Markers**: 16px diameter circles, 3px white border
- **Tooltip Style**: Glassmorphic with backdrop blur

### Tooltip Features
- Glassmorphic design with dark background and blur effect
- Station name displayed prominently
- Gray line badges showing shuttle designation
- Official MTA gray color for badges
- Hover-triggered, auto-dismiss on mouse leave

## Unique Implementation Features

### Unified Toggle Control
- **User Interface**: Only ONE "S" button appears
- **Backend Logic**: Three separate implementations (S-GC, S-FR, S-RK)
- **Behavior**: All three shuttles toggle on/off together
- **Active State**: Button active if ANY shuttle is active

### Geographic Separation
- **42 St Shuttle**: Manhattan Midtown (0.4 miles)
- **Franklin Shuttle**: Brooklyn Prospect Park area (~1 mile)
- **Rockaway Shuttle**: Queens Jamaica Bay/Rockaway (~3 miles)
- **Important**: NOT drawn as connected - three separate routes

### Why This Approach?
1. **User Clarity**: One toggle for all "S" service
2. **Technical Accuracy**: Maintains geographic separation
3. **Proper Routing**: Each shuttle renders at correct location
4. **Transfer Information**: Accurate platform-specific transfers

## Historical Context

### 42 St Shuttle (S-GC)
- **Opened**: 1904 (with original IRT subway)
- **Significance**: One of NYC's most iconic shuttles
- **Cultural**: Featured in countless movies and photos

### Franklin Shuttle (S-FR)
- **Opened**: 1878 (as part of BMT elevated system)
- **Significance**: One of oldest elevated structures still in use
- **Heritage**: Wooden platforms and vintage station structures

### Rockaway Shuttle (S-RK)
- **Opened**: 1956 (acquired from LIRR)
- **Significance**: Former Long Island Railroad trackage
- **Recovery**: Rebuilt after Hurricane Sandy (2012)

## Verification Status
✅ All 11 stations verified against MTA official data
✅ Three separate implementations with correct geographic routing
✅ Unified toggle control working correctly
✅ Station markers properly rendered with custom DOM elements
✅ Glassmorphic tooltips show correct transfer information
✅ Lines render separately at correct locations
✅ Markers stored in lineMarkers state for proper cleanup
✅ All coordinates extracted from stations-normalized.json

## Notes
- **Three Distinct Services**: Each shuttle serves different purpose and location
- **One Toggle**: Simplified user interface with single "S" button
- **Not Connected**: Routes are geographically separate
- **Official Colors**: All use MTA gray (#808183)
- **Critical Service**: 42 St Shuttle is highest ridership
- **Beach Access**: Rockaway Shuttle crucial for summer beach traffic
- **Historic Preservation**: Franklin Shuttle maintains vintage infrastructure

---

**Implementation Date**: October 18, 2025
**Status**: ✅ COMPLETE
**Total Stations**: 11 (2 + 4 + 5)
**Implementation Method**: Three hardcoded routes with unified toggle control
**Geographic Coverage**: Manhattan, Brooklyn, Queens
