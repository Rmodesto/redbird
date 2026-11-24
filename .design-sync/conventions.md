# Subway Sounds — how to build with this library

A NYC subway product: real-time arrivals, station pages, an interactive map, a sounds
archive, and a blog. The visual language is MTA station signage — black bands, heavy
grotesque caps, and the official line colours used as data.

## Setup

**No provider, no theme context.** Components are plain React and style themselves.
Import `styles.css` once; everything else is utility classes. There is nothing to wrap
your app in.

**Type is Helvetica/Arial, deliberately** — it is the MTA signage face. `styles.css`
sets `font-family: Arial, Helvetica, sans-serif` on `body`. Do not introduce a webfont.

## The styling idiom: Tailwind utilities

Every component accepts `className`, and you write your own layout glue in Tailwind.
Use this vocabulary — it is what the product already uses:

| Role | Classes |
|---|---|
| Page container | `max-w-7xl mx-auto px-4` (prose: `max-w-4xl mx-auto px-4`) |
| Section rhythm | `py-12`, alternating white and `bg-gray-50` |
| Section heading | `text-3xl font-bold mb-8` |
| Hero band | `bg-black text-white py-16` |
| Hero title / subtitle | `text-4xl md:text-6xl font-bold` / `text-xl text-gray-300` |
| Card grid | `grid md:grid-cols-2 lg:grid-cols-3 gap-6` |
| Body / secondary text | `text-gray-700` / `text-gray-600` |
| Corner radius | `rounded-lg` everywhere; `rounded-full` for pills and bullets |
| Card hover | `hover:shadow-lg transition-shadow` |

**Primary action is black**, not blue: `<Button variant="primary">` renders
`bg-black text-white`. Reserve `text-blue-600` for inline text links.

**Icons are emoji.** `Section` takes `icon="🚇"`. There is no icon library — do not
import one.

## Line colours are data, not decoration

Ten official MTA hues carry meaning. Never recolour a line, and never use a line colour
as a UI accent. Render them through the components:

- `SubwayLineBadge` — one bullet, `line="A"`, sizes `sm|md|lg`. **Use this one.**
- `SubwayLinesBadges` — a row of bullets, `lines={['A','C','E']}`, `variant="default"`
  (round) or `"compact"` (square pills).
- `SubwayBadge` — larger scale; the caller supplies colour classes, and `line.name` is
  the short designation drawn *inside* the badge (`"A"`), not the route name.

## Composition

- `Card` is the surface: `variant="elevated"` is the house card
  (`bg-white shadow-lg border border-gray-200`). `padding="none"` when the child supplies
  its own.
- `Section` is the titled block inside a card — `title`, `subtitle`, `icon`.
- `StatCard` is the number tile: label above value, `valueColor` carries the semantic
  (`success` / `warning` / `error`).
- Station cards (`AmenitiesCard`, `LiveArrivalsCard`, `CrimeStatsCard`,
  `StationDetailsCard`) each take one structured data prop — check the `.d.ts`.

## Where the truth lives

Read these before styling: `styles.css` and its `@import` closure (it pulls in
`_ds_bundle.css`, which carries every utility the components use), and the per-component
`<Name>.prompt.md` and `<Name>.d.ts` under `components/`.

## Known issues — do not imitate

These ship today and are being fixed. Do not copy them into new work:

- `SubwayLinesBadges` forces white text on every bullet, so yellow (N/Q/R/W) and green
  (G) bullets fail contrast. `SubwayLineBadge` pairs text colour correctly — prefer it.
- `CrimeStatsCard` renders every figure green regardless of value.
- `Pagination` is dark-styled (`bg-gray-800`) even on light pages.
- `GlassmorphicTooltip` only gets its glass surface inside a MapLibre popup; standalone
  it renders unstyled.

## Example

```jsx
<section className="py-12 bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold mb-8">Featured stations</h2>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card variant="elevated" hover>
        <h3 className="text-xl font-bold mb-3">Times Sq-42 St</h3>
        <SubwayLinesBadges lines={['1','2','3','7','N','Q','R','W','S']} size="sm" />
      </Card>
    </div>
  </div>
</section>
```
