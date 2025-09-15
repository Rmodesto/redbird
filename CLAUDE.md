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
- **Stations**: 445 normalized MTA stations in `/data/stations.json`
- **Real-time**: MTA GTFS feeds for live train positions
- **Static Data**: Station amenities, coordinates, platform info

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