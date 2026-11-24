// Design-system entry for design-sync.
//
// This repo is a Next.js app, not a published component library, so there is no
// dist/ to bundle. This barrel is the entry the converter bundles instead: it
// names exactly the components the design system ships, so every one lands on
// window.SubwaySounds. components/ui/index.ts only re-exports six of them.
//
// Keep in sync with componentSrcMap in .design-sync/config.json.

// Primitives
export { default as Badge } from "../components/ui/Badge";
export { default as Button } from "../components/ui/Button";
export { default as Card } from "../components/ui/Card";
export { default as Section } from "../components/ui/Section";
export { default as StatCard } from "../components/ui/StatCard";
export { default as SubwayLineBadge } from "../components/ui/SubwayLineBadge";
export { default as GlassmorphicTooltip } from "../components/ui/GlassmorphicTooltip";
export { default as LegalLayout } from "../components/ui/LegalLayout";

// Subway line bullets
export { default as SubwayLinesBadges } from "../components/subway/SubwayLinesBadges";
export { default as SubwayBadge } from "../components/SubwayBadge";

// Content and chrome
export { default as ServiceAlert } from "../components/ServiceAlert";
export { default as CultureCard } from "../components/CultureCard";
export { default as AdSlot } from "../components/AdSlot";
export { default as Footer } from "../components/Footer";

// Blog
export { default as PostCard } from "../components/blog/PostCard";
export { default as Pagination } from "../components/blog/Pagination";

// Station cards
export { default as AmenitiesCard } from "../components/station/AmenitiesCard";
export { default as LiveArrivalsCard } from "../components/station/LiveArrivalsCard";
export { default as CrimeStatsCard } from "../components/station/CrimeStatsCard";
export { default as StationDetailsCard } from "../components/station/StationDetailsCard";
