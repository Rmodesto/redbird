# design-sync notes — redbird / Subway Sounds

Repo-specific gotchas for future syncs. Read this before re-running.

## This repo is an app, not a component library

`package.json` is `private: true` with no `main`/`module`/`exports`, and there is no
`dist/`. The converter therefore runs in synth-entry mode against source. Two
consequences that are easy to trip over:

- **`--entry` is required**, and not for the reason the skill's main path implies.
  `PKG_DIR` is otherwise computed as `node_modules/<pkg>`, which does not exist for a
  repo that *is* the package — the build dies with
  `ENOENT … node_modules/redbird/package.json`. Passing any `--entry` inside the repo
  makes it walk up to the root `package.json` instead.
- **`components/ui/index.ts` is NOT a usable entry.** It re-exports only 6 of the 20
  synced components, so the other 14 never land on `window.SubwaySounds` and validate
  fails with `[BUNDLE_EXPORT] 14/20 not a component`. `.design-sync/ds-entry.ts` is the
  real entry — a hand-maintained barrel naming all 20. **Keep it in sync with
  `componentSrcMap` whenever components are added or removed.**

## `next/link` must stay shimmed

Several components (`PostCard`, `Pagination`, `SubwayBadge`, `CultureCard`, `Footer`)
import `next/link`. Bundled for real it drags in Next's client router, and every
preview dies with `ReferenceError: process is not defined`. `tsconfig.ds-sync.json`
maps `next/link` → `.design-sync/shims/next-link.tsx`, which renders a plain anchor.

Effect of the shim: bundle **236 KB → 137 KB**, and `next` + `@swc/helpers` drop out of
the inlined externals entirely. If the bundle ever grows back toward 230 KB, check this
mapping first.

## Do not put a `"//"` comment key in `tsconfig.ds-sync.json`

The converter's `tsconfigPathsPlugin` strips comments with
`.replace(/(^|[^:])\/\/.*$/gm, '$1')` before `JSON.parse`. A `"//": "…"` key matches
that regex, the parse throws, and the plugin **returns null silently** — path mappings
stop applying with no error message. Cost an hour. Keep that file comment-free.

## `tsconfig.ds-sync.json` declares ONLY `next/link`

Deliberate. `sharedBuildOptions` never passes `tsconfig` to esbuild — only to the paths
plugin — so `@/*` is resolved by esbuild's own nearest-`tsconfig.json` lookup, which
handles directory→index resolution correctly. The plugin does **not**: its extension
loop tries `stem + ''` first, which matches a *directory*, so a `@/*` rule there makes
esbuild try to read `components/ui` as a file
(`Cannot read file "components/ui": is a directory`). Leaving `@/*` out of the DS
tsconfig is what keeps both working.

## CSS is compiled, not shipped

A Next app has no standalone stylesheet — Tailwind output lives in hashed `.next/`
chunks. `cfg.buildCmd` compiles one explicitly:

- `.design-sync/ds-tailwind.css` — the repo's `app/globals.css` with the three
  `@tailwind` directives re-added and the **MapLibre `@import` dropped** (map-only, and
  it would need the maplibre package present).
- `.design-sync/ds-tailwind.config.ts` — the repo's theme with `content` scoped to
  `components/`, `lib/`, and `.design-sync/previews/`. The previews glob matters:
  without it, classes that appear only in an authored preview are never generated.

Re-run `cfg.buildCmd` before the converter whenever component classes change.

## The tailwind bin ships without its exec bit

`npx tailwindcss` fails with `Permission denied` in this checkout. Either
`chmod +x node_modules/.bin/tailwindcss` or invoke
`node node_modules/tailwindcss/lib/cli.js` directly (which is what `buildCmd` does).

## Prop contracts are hand-written

With no built `.d.ts` tree, extraction produced `[key: string]: unknown` for all 20
components — i.e. **no API at all** for the design agent. `cfg.dtsPropsFor` carries
hand-authored prop bodies for every component, transcribed from the source interfaces.
**When a component's props change, update `dtsPropsFor` or the design agent will code
against a stale contract.** Object-typed props are inlined structurally rather than
referencing `BlogPost` / `StationAmenities` etc., because the emitted `.d.ts` imports
only React and an unresolved type name fails the parse check.

## Browser: no chromium download needed

No playwright cache and no system chromium here, but Chrome.app is present and both
`package-validate.mjs` and `package-capture.mjs` honour `DS_CHROMIUM_PATH`. Install
`playwright` into `.ds-sync/` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` and export:

```sh
export DS_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Saves the ~200 MB browser download.

## Images do not resolve from the bundle

Previews cannot reference `/blog-images/*` or any repo-relative asset — the bundle is
served from its own root, so the `src` 404s and the card renders visibly incomplete.
Authored previews use self-contained `data:image/svg+xml` artwork instead.

## Known real defects, rendered honestly

These are **the truth of the components today**, deliberately not patched in previews.
They are documented in the design brief and should be fixed in the app, not the sync:

- `SubwayLinesBadges` hard-codes `text-white` on every bullet, so the yellow N/Q/R/W
  (`#FCCC0A`) and green G bullets sit near **1.5:1** contrast. The shared constants
  correctly specify `text-black` for those lines.
- `CrimeStatsCard` renders all three figures in `text-green-400` regardless of value —
  a high felony count reads as reassuring.
- The site renders in **Arial**: `app/layout.tsx` loads Geist Sans/Mono as CSS variables
  but `globals.css` sets `font-family: Arial, Helvetica, sans-serif` and the Tailwind
  theme never maps `fontFamily`. Previews showing Helvetica/Arial are correct.
- The official MTA hex palette and the Tailwind class palette in `lib/constants/index.ts`
  disagree for 4/5/6, A/C/E, L and S — the map and the badges render the same line in
  different colours.

## Preview-authoring gotchas (learned across three batches)

- **Cell height is a hard clip (~530px) and nothing flags the overflow.** A capture can
  report "0 with errors" while a page-shell card is sheared mid-paragraph. Only reading
  the PNG catches it. Budget content explicitly for tall components.
- **Tailwind `md:` is viewport-based, so a "narrow/mobile" cell cannot be authored.**
  Wrapping a component in a 26rem div does not trigger its stacked layout — the
  `md:grid-cols-4` stays four columns and overlaps. Use a realistic composition instead.
- **`styled-jsx` survives the bundle.** `LegalLayout`'s `<style jsx global>` rules apply
  with no workaround.
- **Hover-driven components can be captured honestly.** `GlassmorphicTooltip` renders its
  surface only on `onMouseEnter`; the preview wraps the trigger in a small `AutoHover`
  that dispatches a real bubbling `MouseEvent("mouseover")` on mount with `delay={0}`, so
  the component's own code path runs — no lookalike markup. `useEffect`/`useRef` work in
  preview files (the reactShim maps them to `window.React`).
- **Harness gotcha:** `.ds-single` sets `transform: translateZ(0)`, so `position: fixed`
  resolves against the story root rather than the viewport. Dispatched coordinates are
  effectively story-root-relative and can be clipped by an `overflow:hidden` wrapper.
- **`CultureCard`'s `image` prop is an emoji, not a URL** — the data-URI SVG trick does
  not apply there.
- Preview-authored Tailwind classes generate correctly: the ds-tailwind content globs
  already include `.design-sync/previews/**`, so caller-supplied colour classes need no
  safelist.

## Additional component findings (not fixed — source changes, see the Work Orders backlog)

- **`GlassmorphicTooltip` has no standalone styling.** Its glass surface lives in
  `app/globals.css` under `.glassmorphic-tooltip .maplibregl-popup-content`, a selector
  that only matches inside a MapLibre popup. Outside the map it gets no blur, border, or
  shadow — only the caller's `.glassmorphic-tooltip-content` gradient. The component needs
  its own unscoped `.glassmorphic-tooltip` rule.
- **`SubwayBadge.line.name` is the designation drawn inside the badge** (`"A"`), not the
  route name. The only call site (`app/line/[line-id]/page.tsx`) passes the line id and
  keeps the human name on a separate `fullName` field the component never reads. Passing
  a route name overflows a 48px square. `cfg.dtsPropsFor.SubwayBadge` documents this.
- **Station card titles ship literal sarcasm quotes** — `"LIVE" ARRIVALS`,
  `STATION "DETAILS"`, `ACCESSIBILITY & "AMENITIES"`. Almost certainly unintended.
- **Station cards use `-400` semantic tones** (`text-green-400`, `text-red-400`) where the
  rest of the DS uses `-600`.

## Known render warns

(none recorded yet — populate as warns are triaged)

## Re-sync risks

- **`.design-sync/ds-entry.ts` is hand-maintained.** A component added to
  `componentSrcMap` but not to the barrel silently fails `[BUNDLE_EXPORT]`; one removed
  from source but left in the barrel breaks the build outright.
- **`cfg.dtsPropsFor` is hand-maintained** and will rot as props change. It is not
  checked against source — nothing fails if it drifts, the contract just goes stale.
- **The `next/link` shim is API-shaped, not API-complete.** It accepts and discards
  Next-only props. If a component starts relying on real Link behaviour, the shim hides
  that rather than failing.
- **Preview artwork is synthetic SVG**, not the real `/blog-images/*` photography, so
  cards look more abstract here than on the live site.
- **The DS stylesheet drops the MapLibre import**, so any component depending on
  maplibre CSS would render unstyled. None of the 20 synced components do today;
  `GlassmorphicTooltip`'s glass surface is scoped to `.maplibregl-popup-content` and so
  does not apply standalone regardless.
- **Scope is 20 of ~60 components.** Maps, editors, forms, auth and search were
  deliberately excluded as data-coupled. The excluded set is not recorded anywhere but
  here and in `componentSrcMap`.

- **`LiveArrivalsCard` renders a timezone-dependent string.** It prints
  `lastUpdated.toLocaleTimeString()`; the preview pins the `Date`, but the rendered text
  still varies by host timezone, so a sync run from a different TZ will churn that grade.
  The fix belongs in the component or in a `TZ` pin for the capture harness, not the
  preview.
