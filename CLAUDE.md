# Redbird - NYC Subway Sounds Website

## Project Overview
A comprehensive NYC subway website featuring real-time train tracking, subway sounds, interactive maps, and cultural references. Built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14.2.14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Maps**: MapLibre GL, react-map-gl
- **Data**: MTA real-time GTFS feeds
- **Deployment**: AWS CDK infrastructure

## Key Features
1. **Real-time Train Tracking**: Live subway arrivals using MTA GTFS feeds
2. **Interactive 3D Map**: Dynamic subway map with MapLibre GL
3. **Subway Sounds**: Authentic platform audio recordings
4. **Station Information**: 445+ stations with amenities, accessibility info
5. **Cultural References**: Movies, music, art featuring NYC subway
6. **SEO Optimized**: Structured data, metadata for all pages

## Project Structure
```
/app                  # Next.js app directory
  /api               # API routes (force-dynamic for real-time data)
  /station/[id]      # Individual station pages (SSG)
  /line/[line-id]    # Subway line pages
  /map               # Interactive 3D map (dynamic)
  /culture           # Cultural references page
  /subway-sounds     # Subway sounds collection
/components          # React components
/lib                 # Utilities and services
  /services          # MTA data service
/data               # Static JSON data files
/public             # Static assets
```

## Important Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

## Build Configuration
- API routes use `export const dynamic = 'force-dynamic'` for real-time data
- Map page uses dynamic rendering to handle client-side interactions
- Station pages use static generation (SSG) for performance
- ESLint configured to ignore during builds (see next.config.mjs)

## Known Issues & Resolutions
1. **react-map-gl imports**: Use `'react-map-gl/maplibre'` subpath
2. **TypeScript Set spread**: Use `Array.from(new Set())` instead of spread operator
3. **CDK files**: Excluded from TypeScript compilation in tsconfig.json

## Data Sources
- **Stations**: 445 normalized MTA stations in `/data/stations-normalized.json`
- **Real-time**: MTA GTFS feeds for live train positions
- **Static Data**: Station amenities, coordinates, platform info

## Interactive Map Station Implementation

### Station Data Approach
The interactive subway map uses a **platform-specific hardcoded approach** for accurate station representation:

#### Data Normalization Strategy
- **Source**: Official MTA data from `/data/stations-normalized.json`
- **Platform-Specific**: Each station includes exact coordinates for its specific platform
- **Line-Specific Transfers**: Shows only trains that actually serve each platform
- **Complex Handling**: NYC station complexes (e.g., Times Square, 14th St) are handled by platform rather than fuzzy name matching

#### Hardcoded Implementation Pattern
```typescript
// Example: E Train stations with platform-specific data
const eLineStations = [
  {
    name: "Times Sq-42 St",
    coordinates: [-73.987581, 40.755746],
    lines: ['A', 'C', 'E'] // Only ACE platform, not all Times Square lines
  },
  {
    name: "Chambers St (8th Ave A/C/E)",
    coordinates: [-74.009266, 40.713243],
    lines: ['A', 'C', 'E'] // Specific to 8th Ave platform
  }
];
```

### Tooltip System

#### Glassmorphic Tooltip Design
- **Style**: Dark glassmorphic effect with blur and transparency
- **Trigger**: Hover over station markers
- **Content**: Station name + colored MTA line badges
- **Implementation**: MapLibre GL popup with custom CSS classes

#### CSS Classes
```css
.glassmorphic-tooltip .maplibregl-popup-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.glassmorphic-tooltip-content {
  padding: 12px;
  color: white;
}
```

#### Line Badge System
- **Colors**: Official MTA line colors (#EE352E for 1/2/3, #0039A6 for A/C/E, etc.)
- **Format**: Circular badges with white text
- **Size**: 24px diameter (w-6 h-6)
- **Layout**: Flexbox with gap spacing

### Key Implementation Files
- **Map Component**: `/components/WorkingSubwayMap.tsx`
- **Tooltip Styles**: `/app/globals.css`
- **Station Data**: `/data/stations-normalized.json`
- **Line Documentation**: `/E_LINE_IMPLEMENTATION.md`, `/1_LINE_IMPLEMENTATION.md`, `/D_LINE_IMPLEMENTATION.md`

### Why Platform-Specific Approach
1. **Accuracy**: Avoids showing wrong transfers for complex stations
2. **Geography**: Ensures stations appear at correct geographic locations
3. **User Experience**: Provides accurate transfer information
4. **Maintainability**: Clear documentation and predictable behavior

## Subway Map Line Toggle Feature

### Overview
The interactive subway map includes a line selector panel that allows users to toggle individual subway lines on and off. This provides a cleaner visualization and helps users focus on specific routes.

### Implementation Details
- **Location**: Bottom-left corner of the map interface
- **Component**: `/components/WorkingSubwayMap.tsx`
- **UI Panel**: Grid of circular buttons for each subway line

### How It Works
1. **Line Buttons**: Each subway line has a circular button (40x40px) showing its designation (1, 2, 3, A, B, C, etc.)
2. **Color Coding**: Buttons use official MTA colors when active
3. **Toggle Behavior**:
   - Click a line button to toggle it on/off
   - Active lines show with their MTA color background
   - Inactive lines show with gray background
   - Multiple lines can be active simultaneously

### Currently Implemented Lines (Hardcoded)
- **E Train**: 6th/8th Avenue Express route with 22 stations (Blue #0039A6)
- **1 Train**: Broadway-7th Avenue Local with 38 stations (Red #EE352E)
- **D Train**: Brighton Local/4th Avenue Express with 36 stations (Orange #FF6319)
- **2 Train**: 7th Avenue Express with 50 stations (Red #EE352E) - Uses layers, not markers
- **3 Train**: IRT Broadway-7th Avenue Local with 34 stations (Red #EE352E) - Uses markers
- **4 Train**: Lexington Avenue Express with 28 stations (Green #00933C) - Uses markers
- **5 Train**: Lexington Avenue Express with 36 stations (Green #00933C) - Uses markers
- **6 Train**: Lexington Avenue Local with 37 stations (Green #00933C) - Uses markers

### Other Lines (Dynamic - uses station data)
All other lines (7, A, B, C, F, G, J, L, M, N, Q, R, S, W, Z) use the dynamic station ordering from the `stations-normalized.json` file and may not display accurate routes yet.

### User Experience
- Click any line button to show/hide that subway line on the map
- Line paths render as colored lines with station markers
- Hover over stations to see glassmorphic tooltips with transfer information
- Click stations for detailed popup with all connecting lines

## Critical Implementation Guidelines & Lessons Learned

### Subway Line Implementation Standards

#### NEVER Make Style Changes Unless Explicitly Requested
- **Rule**: Do NOT modify tooltip styling, colors, spacing, or visual appearance without explicit user request
- **Why**: User specifically wants glassmorphic tooltip design as documented - maintain consistency
- **Example**: Never change `gap-1.5` to `gap-1` or add/remove CSS classes without permission

#### Coordinate Data Sources
- **ALWAYS Use Official MTA Data**: Extract coordinates from `/data/stations-normalized.json`
- **NEVER Make Up Coordinates**: Fabricated coordinates cause lines to plot in wrong locations (e.g., New Jersey instead of NYC)
- **Validation Process**:
  ```bash
  # Extract coordinates for any line
  node -e "
  const data = require('./data/stations-normalized.json');
  const stations = data.filter(station => station.lines.includes('LINEID'));
  stations.forEach((station, i) => console.log(\`\${i+1}. \${station.name} - [\${station.longitude}, \${station.latitude}]\`));
  "
  ```

#### Hardcoded vs Dynamic Lines
- **Hardcoded Lines**: Listed in `HARDCODED_LINES` config - use custom implementations with markers
- **Dynamic Lines**: Use `stations-normalized.json` data with MapLibre layers
- **Marker Management**: Hardcoded lines MUST store markers in `lineMarkers` state for proper cleanup

#### Tooltip System Requirements
- **Only Use Glassmorphic Tooltips**: MapLibre GL popups with `glassmorphic-tooltip` className
- **Required CSS Classes**:
  - Container: `glassmorphic-tooltip-content`
  - Badges: `w-6 h-6 rounded-full text-center leading-6`
  - Spacing: `gap-1.5` between badges, `mb-2` after station name
- **Text Color**: Use inline `color: white;` style, NOT Tailwind classes
- **Badge Colors**: Official MTA colors with `|| '#000000'` fallback

#### Station Marker Cleanup
- **Problem**: Markers staying on map when toggling lines off
- **Solution**: Store all markers in `lineMarkers` state and remove them in `toggleLine` function
- **Implementation**:
  ```typescript
  // Store markers
  const markersForLine: maplibregl.Marker[] = [];
  const marker = new maplibregl.Marker({ element: el }).addTo(map.current!);
  markersForLine.push(marker);
  setLineMarkers(prev => ({ ...prev, [lineId]: markersForLine }));

  // Remove markers
  if (lineMarkers[lineId]) {
    lineMarkers[lineId].forEach(marker => marker.remove());
    setLineMarkers(prev => { const updated = { ...prev }; delete updated[lineId]; return updated; });
  }
  ```

### Development Workflow
1. **Check Existing Implementation**: Look at working lines first
2. **Use Official Data**: Extract coordinates from normalized JSON
3. **Follow Existing Patterns**: Copy successful implementations exactly
4. **Test Geographic Accuracy**: Verify lines plot in correct NYC locations
5. **Maintain Consistency**: All hardcoded lines should behave identically

### Recent Critical Fixes (October 2024)
- **Fixed 6 Line**: Added missing hardcoded implementation with correct MTA coordinates
- **Fixed Station Marker Removal**: Markers now properly cleanup when toggling lines off
- **Fixed Tooltip Styling**: Standardized glassmorphic tooltips across all lines
- **Removed Unused Code**: Cleaned up StationTooltipManager and other unused tooltip systems

## Recent Updates
- Added comprehensive culture page with NYC subway in media
- Fixed all build errors for successful deployment
- Configured dynamic rendering for API routes
- Implemented SEO optimization with structured data

## Environment Variables
- `NEXT_PUBLIC_SITE_URL`: Production URL (default: https://subwaysounds.net)
- `NEXT_PUBLIC_SITE_NAME`: Site name for SEO
- `NEXT_PUBLIC_SITE_DESCRIPTION`: Site description for meta tags

## Testing
Currently no automated tests. Consider adding:
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows

## Deployment
Ready for deployment with successful build. Consider:
- Vercel for easy Next.js hosting
- AWS using included CDK infrastructure
- Static export for CDN hosting (requires config changes)