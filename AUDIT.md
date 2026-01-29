# Architecture & Quality Audit Report

**Repository:** SubwaySounds (redbird)
**Framework:** Next.js 14.2.14 with App Router
**Date:** January 2026
**Auditor:** Principal Engineer Review

---

## Implementation Status

### Phase 1: Quick Wins - COMPLETED

| Change | Files | Status |
|--------|-------|--------|
| Centralized types | `lib/types/index.ts` | Done |
| Centralized constants (colors, feeds) | `lib/constants/index.ts` | Done |
| Standardized API responses | `lib/api/responses.ts` | Done |
| Error boundary | `app/error.tsx` | Done |
| Loading boundary | `app/loading.tsx` | Done |
| 404 page | `app/not-found.tsx` | Done |
| Remove dead inline script | `app/map/page.tsx` | Done |
| Fix API route typing | `app/api/stations/route.ts` | Done |

### Phase 2: Structural Improvements - COMPLETED

| Change | Files | Status |
|--------|-------|--------|
| Static generation for stations | `app/station/[id]/page.tsx` - added `generateStaticParams` | Done |
| Use centralized response helpers | `app/api/stations/[id]/route.ts`, `app/api/lines/[line]/route.ts` | Done |
| Add line badge helpers | `lib/constants/index.ts` - `getLineBgClass`, `getLineTextClass` | Done |
| Reduce inline color logic | `app/station/[id]/page.tsx` - use helpers | Done |
| Fix API cache override | `next.config.mjs` - removed blanket no-store | Done |
| Re-export for backwards compat | `lib/utils/subway-colors.ts` - re-exports from constants | Done |

### Build Verification

- **445 station pages now statically generated** (changed from dynamic `ƒ` to static `●`)
- **Build: Passed**
- **No type errors in new files**

### Important: Station ID vs Slug

NYC has **56 stations with duplicate slugs** (e.g., "103 St" exists on 1, 6, and B/C lines at different locations). The normalized data handles this by:

- **`id` field**: Unique numeric string (e.g., "119", "156", "309") - use for routing
- **`slug` field**: Human-readable but NOT unique (e.g., "103-st" appears 3 times)

Static generation uses the unique `id` field. The page still supports slug lookups as fallback for existing links, but slug lookups may return unpredictable results for duplicate names.

Example duplicate slugs:
- `103-st`: id=156 (B/C), id=309 (1), id=395 (6)
- `86-st`: 6 different stations across different lines
- `125-st`: 4 different stations

---

## A) Executive Summary

### Top 5 Architectural/Quality Risks

1. **God Component (WorkingSubwayMap.tsx)** - 4,000+ line component handling map rendering, 18+ hardcoded subway line implementations, event handling, tooltips, and UI controls. Violates Single Responsibility Principle severely.

2. **Duplicated Type Definitions** - `Station` interface defined in 3+ locations (`types/station.ts`, `lib/services/mta-data-service.ts`, `app/api/stations/route.ts`) with slight variations. Creates maintenance burden and type inconsistencies.

3. **XSS Vulnerability in Map Popups** - Direct HTML string interpolation in MapLibre popups without sanitization. Station names from data files are rendered unsafely with `.setHTML()`.

4. **Missing Error Boundaries** - No `error.tsx` or `loading.tsx` files exist anywhere in the app. Users see default Next.js error pages instead of branded fallback UI.

5. **Duplicate Color/Constants Definitions** - Subway line colors defined in 8+ files with different formats (hex, Tailwind classes, inline objects). Terminal/destination mappings duplicated across 3 files.

### Assumptions Made

- MTA GTFS feeds are public endpoints (no API keys exposed)
- Environment variables prefixed with `NEXT_PUBLIC_` are intentionally public
- Station data in JSON files is trusted (no external user input)
- CDK infrastructure in `/cdk` is deployed separately
- Current mock data fallbacks are intentional for development

---

## B) Findings Table

### Critical Severity

| Area | File(s) | Problem | Why It Matters | Proposed Fix | Effort | Risk |
|------|---------|---------|----------------|--------------|--------|------|
| Security | `components/WorkingSubwayMap.tsx:1093-1145` | XSS via `.setHTML()` with unsanitized station names | Malicious station data could execute scripts | Sanitize HTML or use DOM APIs | 2h | Low |
| Security | `app/map/page.tsx:136-150` | Inline script with invalid CSS selector | Dead code; potential XSS if "fixed" | Remove inline script, use React handler | 1h | Low |
| Architecture | `components/WorkingSubwayMap.tsx` (4000+ lines) | God component violates SRP | Untestable, unmaintainable, fragile | Split into smaller components | 2d | Med |

### High Severity

| Area | File(s) | Problem | Why It Matters | Proposed Fix | Effort | Risk |
|------|---------|---------|----------------|--------------|--------|------|
| DRY | `types/station.ts`, `lib/services/mta-data-service.ts`, `app/api/stations/route.ts` | Station interface defined 3+ times | Type drift, maintenance burden | Single source in `types/station.ts` | 1h | Low |
| DRY | 8+ files | Subway colors duplicated (hex, Tailwind, inline) | Inconsistent styling, hard to update | Centralize in `lib/constants/colors.ts` | 2h | Low |
| DRY | 3+ files | Terminal/destination mappings duplicated | Same data in mta-data-service and API routes | Single source in mta-data-service | 1h | Low |
| Reliability | App-wide | No `error.tsx` or `loading.tsx` files | Users see ugly default errors | Add error/loading boundaries | 2h | Low |
| Performance | `app/api/stations/route.ts` | `force-dynamic` with no caching strategy | Station list re-read on every request | Add proper cache headers or ISR | 1h | Low |
| Typing | `app/api/stations/route.ts:27` | `stopIdLookup: Record<string, any>` | Type safety bypassed | Proper typing | 30m | Low |
| API | `app/api/contact/route.ts:47-52` | Contact form doesn't send emails | User submissions silently discarded | Implement SendGrid/SES | 4h | Low |

### Medium Severity

| Area | File(s) | Problem | Why It Matters | Proposed Fix | Effort | Risk |
|------|---------|---------|----------------|--------------|--------|------|
| DRY | `app/api/stations/route.ts`, `app/api/arrivals/[stationId]/route.ts` | Duplicate `loadStationData()` functions | Same file loading logic repeated | Extract to shared utility | 1h | Low |
| DRY | 5+ API routes | Identical error response patterns | Boilerplate, inconsistent messages | Create `apiError()` helper | 1h | Low |
| Performance | `app/station/[id]/page.tsx` | No `generateStaticParams` | 445 pages generated dynamically | Add static generation | 1h | Low |
| Performance | `components/StationOverviewCard.tsx:57-76` | Client-side fetch for stats | Waterfall loading, shows spinner | Fetch server-side, pass as props | 2h | Med |
| Next.js | `next.config.mjs:50-56` | Blanket `no-store` on all `/api/*` | Overrides route-level caching | Remove or make specific | 30m | Low |
| Validation | All API routes | No input validation (Zod/etc) | Unsafe params, potential DoS | Add Zod schemas | 4h | Low |
| Reliability | `app/api/station-stats/route.ts:49-78` | External API calls without timeout | Requests could hang indefinitely | Add AbortController timeout | 1h | Low |
| SOLID | `components/SubwayMap.tsx` (862 lines) | Mixed concerns: fetch, UI, animation | Hard to test and maintain | Split into focused components | 4h | Med |

### Low Severity

| Area | File(s) | Problem | Why It Matters | Proposed Fix | Effort | Risk |
|------|---------|---------|----------------|--------------|--------|------|
| DRY | `app/line/[line-id]/page.tsx:13-32` | `formatStationName()` not centralized | String formatting logic repeated | Extract to `lib/utils/format.ts` | 30m | Low |
| DRY | Multiple | Borough/line filtering logic repeated | Same filter code in 3+ routes | Add to mta-data-service | 30m | Low |
| Code | Multiple | `console.log` debug statements | Noise in production logs | Remove or use proper logging | 30m | Low |
| Typing | `app/api/arrivals/[stationId]/route.ts:369-403` | Mock data uses `Date.now()` randomness | Breaks determinism, testing | Use seeded pseudo-random | 1h | Low |
| Unused | `/data/` directory | Multiple backup/version JSON files | Clutter, confusion | Archive or remove | 30m | Low |

---

## C) Refactor Plan

### Phase 1: Quick Wins (1-2 hours, low risk)

These changes are safe, isolated, and immediately improve code quality:

1. **Create centralized types** (`lib/types/index.ts`)
   - Export `Station`, `Platform`, `LineInfo`, `TrainArrival`, `ServiceAlert` from single location
   - Update all imports to use centralized types
   - Remove duplicate interface definitions

2. **Create constants file** (`lib/constants/index.ts`)
   - Centralize `MTA_COLORS` with both hex and Tailwind class formats
   - Centralize `MTA_FEEDS` mapping
   - Export `BOROUGHS`, `ALL_LINES` arrays

3. **Add error and loading boundaries**
   - Create `app/error.tsx` with branded error UI
   - Create `app/loading.tsx` with skeleton/spinner
   - Create `app/not-found.tsx` with custom 404

4. **Fix typing issues**
   - Remove `any` types in API routes
   - Add proper types to `stopIdLookup` and similar

5. **Remove/fix dead code**
   - Remove invalid inline script in `app/map/page.tsx`
   - Remove debug `console.log` statements

### Phase 2: Structural Improvements (half day)

6. **Create shared API utilities** (`lib/api/`)
   - `lib/api/responses.ts` - Standardized error/success responses
   - `lib/api/validation.ts` - Zod schemas for route params
   - `lib/api/cache.ts` - Caching utilities and headers

7. **Extract data loading utilities** (`lib/data/`)
   - `lib/data/stations.ts` - Cached station loader (replaces duplicate `loadStationData`)
   - Use mta-data-service singleton instead of per-route loading

8. **Add generateStaticParams to station pages**
   - Pre-generate all 445 station pages at build time
   - Add proper caching headers

9. **Fix caching strategy**
   - Remove blanket `no-store` from `next.config.mjs`
   - Add appropriate cache headers per route type:
     - `/api/stations` - `s-maxage=3600, stale-while-revalidate`
     - `/api/arrivals/*` - `no-cache` (real-time data)
     - `/api/station-stats` - `s-maxage=300`

10. **Sanitize HTML in map popups**
    - Use DOM APIs instead of `.setHTML()` for popup content
    - Or add DOMPurify for sanitization

### Phase 3: Deeper Hardening (1-2 days)

11. **Split WorkingSubwayMap.tsx** (largest effort)
    - `components/map/MapContainer.tsx` - Map lifecycle
    - `components/map/MapControls.tsx` - Toggle buttons, style selector
    - `components/map/LineRenderer.tsx` - Line path rendering
    - `components/map/StationMarkers.tsx` - Marker management
    - `lib/map/lineData.ts` - Hardcoded line coordinates
    - `lib/map/colors.ts` - Map-specific color handling

12. **Add input validation**
    - Create Zod schemas for all API route params
    - Validate `stationId`, `lineId`, `borough` values
    - Add max length/format checks for search params

13. **Implement contact form email**
    - Integrate SendGrid or AWS SES
    - Add confirmation emails

14. **Add request timeouts for external APIs**
    - Wrap NYC Open Data calls with AbortController
    - Add fallback/error handling

15. **Consolidate map components**
    - Evaluate 5+ map variants (SubwayMap, SubwayMapFixed, WorkingSubwayMap, etc.)
    - Keep one canonical implementation
    - Remove or deprecate others

---

## D) Recommended Codebase Conventions

### Folder and Module Boundaries

```
/lib
  /constants        # All constants: colors, feeds, boroughs, lines
    index.ts        # Re-exports
    colors.ts       # MTA_COLORS, MTA_HEX_COLORS
    feeds.ts        # MTA_FEEDS URLs
    lines.ts        # Line metadata
  /types            # All TypeScript interfaces
    index.ts        # Re-exports
    station.ts      # Station, Platform
    arrivals.ts     # TrainArrival, ServiceAlert
    api.ts          # API response types
  /data             # Data fetching with caching
    stations.ts     # Cached station loader
  /api              # API utilities
    responses.ts    # createSuccess(), createError()
    validation.ts   # Zod schemas
    cache.ts        # Cache header helpers
  /services         # External service integrations
    mta-data-service.ts  # Existing singleton (no changes needed)
  /utils            # Pure utility functions
    format.ts       # formatStationName(), slugify()
    geo.ts          # calculateDistance(), haversine
```

### Naming Standards

- **Files:** kebab-case (`mta-data-service.ts`, `station-search.tsx`)
- **Components:** PascalCase (`StationSearch.tsx`)
- **Utilities:** camelCase exports (`formatStationName`, `calculateDistance`)
- **Constants:** SCREAMING_SNAKE_CASE (`MTA_COLORS`, `ALL_LINES`)
- **Types/Interfaces:** PascalCase (`Station`, `TrainArrival`)

### Server vs Client Component Rules

| Component Type | Directive | When to Use |
|----------------|-----------|-------------|
| Server (default) | None | Data fetching, SEO, static content |
| Client | `'use client'` | Event handlers, useState/useEffect, browser APIs |

**Guidelines:**
- Keep `'use client'` as low in component tree as possible
- Data fetching happens in Server Components, passed as props
- Interactive elements (buttons, inputs, toggles) are Client Components
- Map components are always Client (MapLibre requires browser)

### Data-Fetching and Caching Patterns

```typescript
// API Route with caching
export async function GET(request: Request) {
  const data = await getData();
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}

// Page with static generation
export async function generateStaticParams() {
  const stations = mtaDataService.getAllStations();
  return stations.map(s => ({ id: s.slug }));
}
```

**Cache Strategy by Route:**
| Route | Strategy | TTL |
|-------|----------|-----|
| `/stations`, `/lines` | ISR | 1 hour |
| `/station/[id]` | Static | Build time |
| `/api/stations` | Response cache | 1 hour |
| `/api/arrivals/*` | No cache | Real-time |
| `/api/station-stats` | Response cache | 5 minutes |

### Error-Handling Conventions

```typescript
// lib/api/responses.ts
export function apiError(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, headers?: HeadersInit) {
  return NextResponse.json(data, { headers });
}

// Usage in route
try {
  const data = await fetchData();
  return apiSuccess(data);
} catch (error) {
  console.error('[API] Error:', error);
  return apiError('Failed to fetch data', 500);
}
```

### Constants Placement

| Type | Location | Example |
|------|----------|---------|
| MTA colors | `lib/constants/colors.ts` | `MTA_COLORS`, `MTA_HEX_COLORS` |
| Feed URLs | `lib/constants/feeds.ts` | `MTA_FEEDS` |
| Line metadata | `lib/constants/lines.ts` | `LINE_TERMINALS` |
| Boroughs | `lib/constants/boroughs.ts` | `BOROUGHS` |
| Route paths | `lib/constants/routes.ts` | `ROUTES.station(slug)` |

### Types Placement

| Type | Location | Exports |
|------|----------|---------|
| Core station types | `lib/types/station.ts` | `Station`, `Platform` |
| API response types | `lib/types/api.ts` | `StationsResponse`, `ArrivalsResponse` |
| Service types | `lib/types/service.ts` | `LineInfo`, `ServiceAlert` |
| UI component props | Colocated with component | `StationCardProps` |

---

## Next PRs

After Phase 1 is complete, the following PRs should be created:

### PR #2: Caching & Performance
- Add `generateStaticParams` to station pages
- Fix `next.config.mjs` caching rules
- Add proper cache headers to API routes

### PR #3: Input Validation
- Add Zod schemas for route params
- Validate all API inputs
- Add parameter documentation

### PR #4: Map Component Refactor
- Split `WorkingSubwayMap.tsx` into focused modules
- Extract line data to data files
- Consolidate map variants

### PR #5: Contact Form Implementation
- Integrate email service (SendGrid/SES)
- Add form validation
- Add confirmation flow

---

## Files Verified as Unused

Before deleting any files, verify these have no imports:

```bash
# Check for imports of a file
grep -r "from.*stations-merged" --include="*.ts" --include="*.tsx"
grep -r "from.*stations-before-consolidation" --include="*.ts" --include="*.tsx"
```

Potentially unused data files (verify before removal):
- `/data/stations-merged.json`
- `/data/stations-before-consolidation.json`
- `/data/normalization-report.json`
- `/data/mta-update-log.json`

---

## Appendix: Key File Locations

| Concern | File |
|---------|------|
| Root layout | `app/layout.tsx` |
| MTA data service | `lib/services/mta-data-service.ts` |
| Main map component | `components/WorkingSubwayMap.tsx` |
| Station types (canonical) | `types/station.ts` |
| Subway colors | `lib/utils/subway-colors.ts` |
| SEO utilities | `lib/seo.ts` |
| Structured data | `lib/structured-data.ts` |
| Station data | `data/stations-normalized.json` |
| Next.js config | `next.config.mjs` |
| TypeScript config | `tsconfig.json` |
