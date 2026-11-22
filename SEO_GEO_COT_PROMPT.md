# Chain-of-Thought Implementation Prompt: SEO + GEO Strategy for SubwaySounds.net

> **Purpose**: This is a reusable CoT prompt. Feed it to any LLM (or yourself) before implementing any SEO/GEO feature on the Redbird codebase. It forces step-by-step reasoning, enforces DRY/SOLID architecture, and ensures every change moves toward Google AdSense approval.

---

## The Prompt

```
You are implementing SEO and GEO features for SubwaySounds.net, a Next.js 14 App Router site (TypeScript + Tailwind CSS) with 445 subway station pages, line pages, a sounds hub, an interactive map, and a blog. The site targets Google AdSense approval.

Before writing ANY code, walk through these 7 gates in order. Do not skip a gate. Show your reasoning at each step. If a gate reveals a conflict with an existing pattern, STOP and resolve it before proceeding.

═══════════════════════════════════════════════
GATE 1: WHAT ALREADY EXISTS? (Prevent duplication)
═══════════════════════════════════════════════

Before touching a single file, answer:

1. Does this feature or keyword already have a page, component, or data field?
   - Check: /app/* routes, /components/*, /data/*.json, /types/station.ts
   - Check: lib/utils/seo-keywords.ts (keyword templates with {station} placeholders)
   - Check: lib/structured-data.ts (schema generators)
   - Check: lib/seo.ts (metadata factory)

2. Is there an existing abstraction I should extend rather than duplicate?
   - Station metadata: buildPageTitle() and buildMetaDescription() in seo-keywords.ts
   - Schema markup: generateStationSchema() in structured-data.ts
   - Data service: mtaDataService singleton in lib/services/mta-data-service.ts
   - Station type: Station interface in types/station.ts

3. Does the data already live in stations-normalized.json or another data file?
   - 445 stations with: id, name, slug, borough, lat/lng, lines[], platforms[], ada, amenities{}

STOP CHECK: If the feature overlaps with something existing, your job is to EXTEND that abstraction — never create a parallel one.

═══════════════════════════════════════════════
GATE 2: WHICH KEYWORD(S) DOES THIS SERVE?
═══════════════════════════════════════════════

Every code change must map to at least one keyword from the strategy. Answer:

1. What is the primary keyword? (e.g., "busiest subway stations NYC")
2. What is the intent? (Informational / Navigational / Utility / Experiential / Local)
3. What is the target page type? (Station page / Line page / Hub page / Blog post / New page)
4. Does this keyword belong to a content silo? Which one?
   - Map + Navigation
   - Station Directory
   - Sounds Library
   - Operations + Signals
   - Infrastructure + Maintenance
   - History + Rare Topics

5. What are the internal links TO and FROM this content?
   - Every new page must link to at least 2 existing pages
   - Every new page must be linked FROM at least 1 existing page

STOP CHECK: If you cannot name the keyword, do not write the code. Features without keyword targets are wasted effort for SEO.

═══════════════════════════════════════════════
GATE 3: DRY ARCHITECTURE — SINGLE SOURCE OF TRUTH
═══════════════════════════════════════════════

Apply these DRY rules to every implementation:

A. DATA LAYER (one source, many consumers)
   ┌─────────────────────────────────────────────────────────────┐
   │ /data/*.json          → Static datasets (stations, artwork, │
   │                          ridership, neighborhoods)          │
   │ /types/station.ts     → THE Station interface. Extend it.   │
   │                          Never create StationV2 or similar. │
   │ /lib/services/*.ts    → Singleton services that load,       │
   │                          cache, and expose data.            │
   │                          Pattern: mtaDataService singleton. │
   └─────────────────────────────────────────────────────────────┘

   Rules:
   - New data fields go into the EXISTING Station interface + stations-normalized.json
   - New datasets get their OWN service file in /lib/services/ following the singleton pattern
   - Never fetch the same data in two different ways
   - Never hardcode station names, line colors, or coordinates — always reference data files

B. METADATA LAYER (one factory, many pages)
   ┌─────────────────────────────────────────────────────────────┐
   │ lib/seo.ts                → generateSEOMetadata() factory   │
   │ lib/utils/seo-keywords.ts → Token replacement engine        │
   │                              {station}, {borough}, {lines}  │
   │ lib/structured-data.ts    → Schema generators per type      │
   └─────────────────────────────────────────────────────────────┘

   Rules:
   - ALL metadata goes through generateSEOMetadata() — never write raw Metadata objects
   - ALL station-specific text uses replaceStationPlaceholders() — never inline station names
   - ALL schema markup uses the generators in structured-data.ts — never write raw JSON-LD
   - Title formula: "{Station Name} Station ({Lines}) — {Feature} | SubwaySounds"
   - Description formula: "Live {feature} at {Station Name} in {Borough}. Lines: {Lines}. {Unique token}."

C. COMPONENT LAYER (composition over duplication)
   ┌─────────────────────────────────────────────────────────────┐
   │ /components/station/*  → Station page sections (cards)      │
   │ /components/ui/*       → Reusable primitives (button, card) │
   │ /components/maps/*     → Map components                     │
   │ /components/home/*     → Homepage sections                  │
   └─────────────────────────────────────────────────────────────┘

   Rules:
   - New station page sections → new file in /components/station/
   - New page types (neighborhood, landmark) → compose from existing station components
   - UI primitives (buttons, badges, cards) → always use /components/ui/ — never re-style inline
   - Every component gets typed props — no `any`, no implicit types

═══════════════════════════════════════════════
GATE 4: SOLID PRINCIPLES — APPLIED TO NEXT.JS
═══════════════════════════════════════════════

S — Single Responsibility
   - Each /app/*/page.tsx does ONE thing: fetch data + render layout
   - Each /components/* does ONE thing: display a specific UI section
   - Each /lib/services/* does ONE thing: load, cache, and expose one dataset
   - Each /app/api/* does ONE thing: handle one REST endpoint

   Anti-pattern: A page.tsx that fetches data AND computes SEO AND renders UI AND handles errors inline.
   Fix: Extract data fetching to service, SEO to seo-keywords.ts, UI to components.

O — Open/Closed
   - Station interface is OPEN for extension (add fields), CLOSED for modification (never remove/rename existing fields)
   - Schema generators are OPEN for new types (add generateVideoSchema), CLOSED for changing existing signatures
   - seo-keywords.ts is OPEN for new section configs in seo-keywords.json, CLOSED for changing the replacement engine

   How to extend a station page with new data:
   1. Add field to Station interface in types/station.ts
   2. Add data to stations-normalized.json (or new data file)
   3. Add service method in lib/services/ if new data source
   4. Create component in /components/station/NewFeatureCard.tsx
   5. Import and render in app/station/[id]/page.tsx
   6. Add keywords to seo-keywords.json
   → You never modified an existing component. You composed a new one.

L — Liskov Substitution
   - Any station page must render correctly with MINIMAL data (just id, name, slug, lines, borough)
   - New optional fields (structureType, ridership, artwork) must have fallbacks
   - Components must handle: undefined | null | empty array | zero gracefully
   - Pattern: {station.artwork && <ArtworkCard artwork={station.artwork} />}

I — Interface Segregation
   - Don't force components to accept the entire Station object if they only need 2 fields
   - Pattern: RidershipChart needs { stationId: string; stationName: string } — not the full Station
   - API routes return only what the consumer needs, not entire datasets

D — Dependency Inversion
   - Components depend on INTERFACES (types/station.ts), not implementations
   - Pages depend on SERVICE ABSTRACTIONS (mtaDataService.getStationById), not raw file reads
   - Never import from /data/*.json directly in components — always go through a service

═══════════════════════════════════════════════
GATE 5: GOOGLE ADSENSE APPROVAL CHECKLIST
═══════════════════════════════════════════════

Every page you create or modify must pass these AdSense requirements:

CONTENT QUALITY
□ Substantial original content (not just data tables or API output)
   → Every station page needs at LEAST 2-3 sentences of unique descriptive text
   → Every hub page (sounds, ridership, operations) needs 300+ words of editorial copy
   → Blog posts need 800+ words minimum
□ No thin/doorway pages
   → Station pages must provide REAL utility (arrivals, scores, maps) not just templated text
   → Neighborhood hub pages must have genuine editorial value, not just station lists
□ No duplicate content
   → Use the unique-token formula: name + borough + lines + structure type + accessibility
   → Each station description MUST differ from every other station description
□ Content is people-first, not search-engine-first
   → If you wouldn't publish the page without SEO benefit, don't publish it

SITE STRUCTURE
□ Clear, functional navigation on every page
   → Navigation component is global — verify it renders on new page types
□ Privacy Policy page exists → /privacy-policy ✓
□ Terms of Service page exists → /terms ✓
□ Contact page exists → /contact ✓
□ About page or clear site identity
   → Verify footer has organization info, email, purpose statement

TECHNICAL REQUIREMENTS
□ Mobile responsive (Tailwind handles this — verify new components)
□ Fast page load (< 3s LCP)
   → Use Next.js SSG where possible (station pages already do this)
   → Lazy-load heavy components (maps, charts) with dynamic(() => import(...))
   → Defer non-critical JS with strategy="afterInteractive"
□ No broken links or 404s
   → After adding new routes, verify all internal links resolve
□ No intrusive interstitials or popups
□ HTTPS enabled
□ Sitemap.xml up to date
   → After adding new page types, update sitemap generation
□ robots.txt allows crawling of all public pages

AD PLACEMENT (when ready)
□ Max 3 ad units per page initially
□ Ads must not interfere with content consumption
□ No ads on pages with < 300 words of content
□ Label ad sections clearly if using native-style placements
□ Don't place ads near interactive elements (map clicks, audio players)

═══════════════════════════════════════════════
GATE 6: IMPLEMENTATION — WRITE THE CODE
═══════════════════════════════════════════════

Now — and only now — write the code. Follow this order:

1. TYPES FIRST
   - Extend interfaces in /types/ if new fields are needed
   - Add Zod schemas in /lib/api/schemas.ts if new API validation is needed

2. DATA SECOND
   - Add/enrich data files in /data/
   - Add service methods in /lib/services/

3. SEO THIRD
   - Add keyword entries to /data/seo-keywords.json
   - Add/extend schema generators in /lib/structured-data.ts
   - Update generateMetadata in the page file using seo-keywords.ts helpers

4. COMPONENTS FOURTH
   - Build new UI in /components/ with typed props
   - Follow existing patterns: card-based layout, Tailwind utility classes
   - Include semantic HTML (proper heading hierarchy, aria-labels, landmarks)

5. PAGES LAST
   - Wire everything together in /app/*/page.tsx
   - Use generateStaticParams for SSG where data is static
   - Use force-dynamic only for real-time data (arrivals, live status)
   - Add internal links to/from existing pages

═══════════════════════════════════════════════
GATE 7: VERIFY — BEFORE YOU COMMIT
═══════════════════════════════════════════════

Run these checks:

□ TypeScript: Does `npm run typecheck` pass with zero errors?
□ Lint: Does `npm run lint` pass?
□ Build: Does `npm run build` complete without errors?
□ DRY: Did I create any new file that duplicates logic from an existing file?
□ SOLID: Can I remove this new component without breaking anything else?
□ SEO: Does the page have a unique <title>, unique meta description, and correct schema?
□ AdSense: Does the page have substantial original content (not just data)?
□ Links: Does the page link to at least 2 other pages? Is it linked FROM at least 1?
□ Mobile: Does the layout work on a 375px viewport?
□ Accessibility: Are images alt-tagged? Are interactive elements keyboard-navigable?

If ANY check fails, fix it before moving on. Every merge to main must pass all gates.
```

---

## Quick Reference: File Ownership Map

| Concern | Owner File(s) | Never Duplicate In |
|---|---|---|
| Station data shape | `types/station.ts` | Component props, API responses |
| Station metadata | `lib/utils/seo-keywords.ts` | Individual page files |
| Schema markup | `lib/structured-data.ts` | Page files, components |
| SEO metadata factory | `lib/seo.ts` | Layout or page files |
| Station data access | `lib/services/mta-data-service.ts` | Direct JSON imports in pages |
| Line colors | `lib/constants/` + `lib/utils/subway-colors.ts` | Component inline styles |
| UI primitives | `components/ui/*` | Any other component file |

## Quick Reference: Title Formulas

| Page Type | Title Pattern |
|---|---|
| Station (non-ambiguous) | `{Name} Subway Station — Arrivals, Map & Lines \| SubwaySounds` |
| Station (ambiguous name) | `{Name} Station ({Lines}) — Arrivals & Map \| SubwaySounds` |
| Station (tourist hub) | `{Name} — Live Arrivals, Transfers & Exits \| SubwaySounds` |
| Line page | `{Line} Train — Stations, Map & Schedule \| SubwaySounds` |
| Map page | `NYC Subway Map (Interactive) — Real-Time Stations \| SubwaySounds` |
| Sounds hub | `NYC Subway Sounds — Recordings & Audio Archive \| SubwaySounds` |
| Blog post | `{Primary keyword phrase} \| SubwaySounds` |
| Neighborhood hub | `Subway Stations Near {Neighborhood}, {Borough} \| SubwaySounds` |
| Landmark hub | `Nearest Subway to {Landmark} — Stations & Directions \| SubwaySounds` |

## Quick Reference: Schema Types by Page

| Page | Schema Type | Generator Function |
|---|---|---|
| Station | `SubwayStation` | `generateStationSchema()` — upgrade from TransitStation |
| Line | `Service` | `generateLineSchema()` |
| Map | `Map` | `generateMapSchema()` |
| Blog | `Article` / `BlogPosting` | Add: `generateArticleSchema()` |
| Watch page | `VideoObject` | Add: `generateVideoSchema()` |
| Sound page | `AudioObject` | `generateAudioSchema()` |
| Sounds hub | `CollectionPage` | `generateCollectionPageSchema()` |
| FAQ sections | `FAQPage` | `generateFAQSchema()` |

## Quick Reference: AdSense Content Minimums

| Page Type | Min. Unique Text | Min. Interactive Elements | Ad-Ready? |
|---|---|---|---|
| Station page | 2-3 unique sentences + live data | Arrivals, map, score | Yes |
| Blog post | 800+ words | Embedded media | Yes |
| Hub page (sounds, ridership) | 300+ words editorial | Browse/filter UI | Yes |
| Neighborhood/landmark hub | 200+ words + station list | Links, mini-map | Yes |
| Map page | 200+ words above fold | Interactive map | Yes (sidebar only) |
| Line page | 200+ words + station list | Route viz, arrivals | Yes |
