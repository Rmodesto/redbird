# Handoff prompt for Claude Design

Paste the block below into a Claude Design project that has the **Subway Sounds Design
System** attached. Replace the `WHAT I WANT` section with the actual ask.

---

You're designing for **Subway Sounds** (subwaysounds.net) — a NYC subway product with
real-time arrivals, 472 station pages, an interactive map, a platform-sounds archive,
and a blog. Build with the attached design system; its 20 components are the real
shipped components from the codebase, so whatever you design maps 1:1 onto code we can
actually ship.

**The visual language is MTA station signage.** Black full-bleed bands, heavy grotesque
caps, generous white space, and the official line colours used as data. Think the 1970
NYCTA Graphics Standards Manual, not a generic SaaS dashboard. When in doubt, look at
what a station sign would do.

## Hard constraints

- **Line colours are data, never decoration.** The ten MTA hues mean something. Never
  recolour a line, never use a line colour as a UI accent, and always render them
  through `SubwayLineBadge` or `SubwayLinesBadges`.
- **Primary action is black**, not blue. `<Button variant="primary">` is `bg-black`.
  Blue (`text-blue-600`) is for inline text links only.
- **Type is Helvetica/Arial on purpose** — it's the MTA signage face. Don't add a webfont.
- **Icons are emoji.** `Section` takes `icon="🚇"`. There's no icon library; don't import one.
- **Tailwind is the idiom.** Every component takes `className`; write your own layout glue
  in Tailwind using the vocabulary in the README (container `max-w-7xl mx-auto px-4`,
  section rhythm `py-12` alternating with `bg-gray-50`, headings `text-3xl font-bold mb-8`,
  cards `grid md:grid-cols-2 lg:grid-cols-3 gap-6`, radius `rounded-lg`).

## Things in the library that are broken — do not imitate them

These ship today and are on our fix list. Build the correct version instead:

- `SubwayLinesBadges` forces white text on every bullet, so the yellow (N/Q/R/W) and
  green (G) bullets fail contrast badly. **Prefer `SubwayLineBadge`**, which pairs text
  colour correctly.
- `CrimeStatsCard` renders every figure green regardless of value. If you show severity,
  let colour follow the number.
- `Pagination` is dark-styled (`bg-gray-800`) even on light pages.
- `GlassmorphicTooltip` only gets its glass surface inside a MapLibre popup; standalone
  it renders unstyled.

## What the library does NOT have

There are **no form controls, no modal, no tabs, no avatar, and no toast** — the only
toggle and the only dialog in the product are trapped inside a cookie banner. If your
design needs any of those, compose them from `Card` + `Button` and flag clearly that
it's new surface area, so we know it needs to be built rather than reused.

Also absent as components (currently copy-pasted class strings, so feel free to propose
the component): the black hero band, the mobile bottom tab bar, the stat-tile strip, the
sticky filter bar, loading spinners, and skeletons.

## The routes

**Primary — in the nav, highest traffic:**

| Route | What it is | Current state |
|---|---|---|
| `/` | Home — hero search, service alerts, system stats, feature cards, line grid, featured stations | 228 lines; the only page using the `ui/` primitives |
| `/stations` | Station directory — 472 stations, search + filter, grid/list toggle | Thin page, logic in `StationsClient` |
| `/station/[id]` | **Station detail** — live arrivals, amenities, crime stats, details, videos | 555 lines, the richest page; black header, 2-col grid |
| `/lines` | Line directory — all 27 lines, grid/list toggle, quick facts | 602 lines, the largest page |
| `/line/[line-id]` | Line detail — route, stations served, facts | 348 lines |
| `/subway-map` | Interactive MapLibre map with line toggles | 256 lines; the map itself is excluded from the DS |
| `/culture` | NYC subway in film, music, art; decade timeline | 523 lines; has the only mid-page black band |
| `/contact` | Contact form | 245 lines; hand-rolled inputs, no form primitives |

**Secondary — in the sitemap but not the nav:**

| Route | What it is | Note |
|---|---|---|
| `/subway-sounds` | Platform audio archive + player | Dark audio panel inside a light page |
| `/blog` → `/blog/[slug]` | Blog listing and article | Visually a separate sub-brand: `rounded-xl`, blue accent, `bg-gray-900` hero |
| `/history` | System history, 1904–today | 369 lines |
| `/operations` | How the system runs | 326 lines |

**Legal:** `/privacy-policy`, `/terms` — both use `LegalLayout`.

**Auth:** `/sign-in`, `/sign-up`, `/login` — Clerk-rendered, barely styled (14 lines each).

**Admin — a separate dark theme** (`bg-gray-950`, blue primaries, its own form system):
`/admin`, `/admin/analytics` (351), `/admin/blog`, `/admin/blog/new`,
`/admin/blog/[id]/edit`, `/admin/blog/[id]/preview`, `/admin/unlisted` (278).

**Do not design these — they're dead code:** `/nyc-map`, `/react-map`, `/react-maplibre`,
`/realtime-map`, `/subway-interactive`, `/transit-data` have zero inbound links and are
absent from the sitemap — leftover map prototypes. `/map` still has three inbound links
but `next.config.mjs` permanently redirects it to `/subway-map`, so the page never
renders. `/neighborhood/[slug]` (319 lines) is also unreferenced and unlisted.

**IA gaps worth fixing while designing:** `/blog` and `/subway-sounds` are in the sitemap
but not in the nav, so two substantial content sections are effectively unreachable by
browsing. The nav carries 5 destinations; the footer carries 8.

## WHAT I WANT

<!-- Replace this section. Examples:

  Redesign the station detail page. It currently stacks LiveArrivalsCard,
  AmenitiesCard, CrimeStatsCard and StationDetailsCard in a 2-column grid under a black
  header. Make the live arrivals the clear focal point — it's the thing people open the
  page for — and make the supporting data scannable without competing with it.

  — or —

  Design the mobile experience for the arrivals flow: a rider opens the site on a
  platform, wants to know when the next train comes, and has about three seconds of
  attention. Show me the screen and the two states around it (loading, no service).

  — or —

  We have no form system at all. Design the input, select, textarea, and toggle that
  this design language implies, then show them composed in the contact form.
-->

## How to show it

Use real content throughout — real station names (Times Sq-42 St, 14 St-Union Sq,
Jackson Hts-Roosevelt Av, Atlantic Av-Barclays Ctr), real line designations, plausible
arrival times and figures. Never lorem, never "Card Title".

Show the empty and loading states for anything data-driven — on a transit product those
are the states riders actually hit when something's wrong, and they're currently the
least designed part of the site.
