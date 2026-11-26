import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { generateMapSchema, generateBreadcrumbSchema, generateStructuredDataScript } from "@/lib/structured-data";
import SiteHeader from '@/components/site/SiteHeader';
import { STATION_COUNT, LINE_COUNT } from "@/lib/constants/site";
import { getStationsWithSoundCount } from "@/lib/video/video.service";
import dynamic from 'next/dynamic';

// Re-render hourly so the "Stations with Sound" figure tracks newly tagged
// recordings instead of freezing at build time. (Can't use `export const
// dynamic` here — `dynamic` is the next/dynamic import above.)
export const revalidate = 3600;

// Dynamically import the working map component to avoid SSR issues.
const SubwayMap = dynamic(() => import('@/components/WorkingSubwayMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-suede text-paper">
      <div className="flex flex-col items-center gap-f8 text-center">
        <span className="text-label font-bold uppercase tracking-[.08em] text-graphite">Loading</span>
        <span className="text-[18px] font-bold">NYC subway map…</span>
      </div>
    </div>
  ),
});

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Map (Interactive) - Real-Time Train Tracker | SubwaySounds",
  `Free interactive NYC subway map with real-time train positions. Find any of ${STATION_COUNT} stations, plan routes, and track arrivals. Updated live with MTA data.`,
  [
    "nyc subway map",
    "new york subway map",
    "mta map",
    "NYC subway map interactive",
    "MTA map real-time",
    "subway route planner",
    "live subway map",
    "nyc train map",
  ]
);

const mapSchema = generateMapSchema();
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Subway Map", url: "/subway-map" },
]);

// Ticket-stub zigzag rule, same motif as the station page.
const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23262626%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

const LABEL = "text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]";

function Stat({ value, label, accent, br, bb }: { value: string; label: string; accent?: boolean; br?: boolean; bb?: boolean }) {
  return (
    <div className={`flex flex-col gap-f5 p-f21 ${br ? 'border-r border-ripstop' : ''} ${bb ? 'border-b border-ripstop' : ''}`}>
      <span className={`text-[34px] font-bold leading-[42px] ${accent ? 'text-tag' : 'text-paper'}`}>{value}</span>
      <span className={`${LABEL} text-graphite`}>{label}</span>
    </div>
  );
}

export default async function SubwayMapPage() {
  const stationsWithSound = await getStationsWithSoundCount();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateStructuredDataScript(mapSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)} />

      <div className="min-h-screen bg-jet font-sans text-paper">
        <SiteHeader active="map" />

        {/* ── Masthead ─────────────────────────────────────────── */}
        <section className="surface-ripstop text-paper">
          <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f34 md:px-f55 md:pb-f55 md:pt-f55">
            <div className="flex flex-col gap-f34 lg:flex-row lg:items-end lg:justify-between lg:gap-f55">
              <div className="flex min-w-0 max-w-f610 flex-col gap-f21">
                <span className={`quoted ${LABEL} text-graphite`}>Map</span>
                <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
                  NYC Subway Map
                </h1>
                <p className="m-0 text-[18px] leading-[29px] text-graphite [text-wrap:pretty]">
                  Live train positions across {STATION_COUNT} stations. Click any station for arrivals,
                  accessibility and the sound of the platform.
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 border border-ripstop">
                <Stat value={String(STATION_COUNT)} label="Stations" br bb />
                <Stat value={String(LINE_COUNT)} label="Lines" bb />
                <Stat value={String(stationsWithSound)} label="Stations with Sound" br />
                <Stat value="24/7" label="Service" accent />
              </div>
            </div>
          </div>
        </section>

        {/* zigzag rule */}
        <div aria-hidden="true" className="h-[8px]" style={{ backgroundImage: ZIGZAG, backgroundRepeat: "repeat-x" }} />

        {/* ── Map ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
          <div className="overflow-hidden border border-ripstop bg-suede" style={{ height: "600px" }}>
            <SubwayMap />
          </div>

          <div className="flex flex-wrap gap-f34 pt-f21">
            <Link href="/stations" className={`${LABEL} text-paper no-underline transition-colors hover:text-graphite`}>
              Browse all stations &rarr;
            </Link>
            <Link href="/lines" className={`${LABEL} text-paper no-underline transition-colors hover:text-graphite`}>
              View all lines &rarr;
            </Link>
            <Link href="/subway-sounds" className={`quoted ${LABEL} text-paper no-underline transition-colors hover:text-graphite`}>
              Sounds library &rarr;
            </Link>
          </div>
        </section>

        {/* ── How to use ───────────────────────────────────────── */}
        <section className="mx-auto max-w-f610 px-f21 pb-f89 md:px-f55">
          <div className="flex flex-col gap-f21">
            <span className={`quoted ${LABEL} text-graphite`}>Details</span>
            <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em]">How to use the map</h2>
            <ul className="m-0 flex list-none flex-col gap-f13 p-0 text-[18px] leading-[29px] text-graphite">
              <li>Click any station marker for real-time arrivals, accessibility and platform info.</li>
              <li>Toggle individual lines on and off from the panel on the map.</li>
              <li>Drag to pan, scroll to zoom. Hover a station to see its transfers.</li>
              <li>Arrival times come from the MTA realtime feed and refresh automatically.</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
