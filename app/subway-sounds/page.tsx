import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import {
  generateCollectionPageSchema,
  generateBreadcrumbSchema,
  generateStructuredDataScript,
} from "@/lib/structured-data";
import SiteHeader from "@/components/site/SiteHeader";
import SoundsLibrary, { type LibraryVideo } from "@/components/sounds/SoundsLibrary";
import { mtaDataService } from "@/lib/services/mta-data-service";
import * as videoService from "@/lib/video/video.service";

export const metadata: Metadata = generatePageMetadata(
  "NYC Subway Sounds - Platform Announcements & Train Audio Archive",
  "Experience authentic NYC subway sounds including platform announcements, train arrivals, door chimes, and station ambiance. The most comprehensive collection of New York subway audio.",
  [
    "subway sounds NYC",
    "train platform sounds",
    "MTA announcements audio",
    "subway door chime",
    "New York metro sounds",
    "train arrival sounds",
    "subway station ambiance",
    "NYC transit audio",
    "subway platform announcements",
    "train sounds recording",
  ]
);

/** The library is database-backed; refresh it hourly. */
export const revalidate = 3600;

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Subway Sounds", url: "/subway-sounds" },
]);

/** ISO 8601 duration → "11:04". Returns null when unparseable. */
function formatDuration(iso: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const [, h, min, s] = m;
  const mm = min ?? "0";
  const ss = (s ?? "0").padStart(2, "0");
  return h ? `${h}:${mm.padStart(2, "0")}:${ss}` : `${mm}:${ss}`;
}

function durationSeconds(iso: string | null): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

interface LibraryData {
  videos: LibraryVideo[];
  /** Stations that actually have a recording tagged to them. */
  stations: { slug: string; name: string; count: number }[];
}

/**
 * Pulls the synced YouTube library and joins each recording to the stations it
 * is tagged to. If the database is unavailable (e.g. no DATABASE_URL at build
 * time) the page renders its empty state rather than failing the build.
 */
async function getLibrary(): Promise<LibraryData> {
  try {
    const { videos } = await videoService.getVideos(1, 500, "ACTIVE");
    const stationCounts = new Map<string, { slug: string; name: string; count: number }>();

    const rows: LibraryVideo[] = videos.map((v) => {
      const stations = [...v.stations].sort((a, b) => b.confidence - a.confidence);
      const lines = new Set<string>();
      let stationName: string | null = null;
      let borough: string | null = null;

      for (const assoc of stations) {
        const station = mtaDataService.getStationBySlug(assoc.stationSlug);
        if (!station) continue;
        station.lines.forEach((l) => lines.add(l.toUpperCase()));
        if (!stationName) {
          stationName = station.name;
          borough = station.borough;
        }
        const existing = stationCounts.get(station.slug);
        stationCounts.set(station.slug, {
          slug: station.slug,
          name: station.name,
          count: (existing?.count ?? 0) + 1,
        });
      }

      return {
        id: v.id,
        youtubeId: v.youtubeId,
        title: v.title,
        duration: formatDuration(v.duration),
        seconds: durationSeconds(v.duration),
        publishedAt: v.publishedAt,
        tags: v.tags,
        lines: Array.from(lines),
        stationName,
        borough,
      };
    });

    const stations = Array.from(stationCounts.values())
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      .slice(0, 12);

    return { videos: rows, stations };
  } catch {
    // No database at build time is a valid state — the empty state covers it.
    return { videos: [], stations: [] };
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.subwaysounds.net";

export default async function SubwaySoundsPage() {
  const { videos, stations } = await getLibrary();

  const collectionSchema = generateCollectionPageSchema(
    "NYC Subway Sounds Archive",
    "Comprehensive collection of authentic NYC subway sounds and announcements",
    "stations",
    videos.length
  );

  // Real recordings only — the list mirrors exactly what the page renders.
  const itemListSchema =
    videos.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "NYC Subway Sounds Archive",
          url: `${SITE_URL}/subway-sounds`,
          numberOfItems: videos.length,
          itemListElement: videos.slice(0, 20).map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "VideoObject",
              name: v.title,
              url: `https://www.youtube.com/watch?v=${v.youtubeId}`,
              thumbnailUrl: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
              ...(v.publishedAt ? { uploadDate: v.publishedAt } : {}),
            },
          })),
        }
      : null;

  const heroThumbnail = videos[0]
    ? `https://i.ytimg.com/vi/${videos[0].youtubeId}/maxresdefault.jpg`
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(breadcrumbSchema)}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredDataScript(itemListSchema)}
        />
      )}

      <SiteHeader active="sounds" />

      <SoundsLibrary videos={videos} heroThumbnail={heroThumbnail}>
        {/* ── Stations in the library ─────────────────────────────────── */}
        {stations.length > 0 && (
          <section className="flex flex-col gap-f21">
            <div className="flex flex-col gap-f8">
              <span className="quoted text-label font-bold uppercase text-muted">Stations</span>
              <h2 className="m-0 text-h3 font-bold tracking-[-.01em] text-ink lg:text-h2">
                Where these were recorded
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-f8 sm:grid-cols-2 lg:grid-cols-3">
              {stations.map((s) => (
                <Link
                  key={s.slug}
                  href={`/station/${s.slug}`}
                  className="flex items-center justify-between gap-f13 border border-ink p-f13 text-ink no-underline transition-colors hover:bg-[#FAFAFA]"
                >
                  <span className="min-w-0 text-body font-bold leading-[21px]">{s.name}</span>
                  <span className="shrink-0 text-label normal-case tracking-normal text-muted">
                    {s.count} {s.count === 1 ? "recording" : "recordings"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Zigzag rule ─────────────────────────────────────────────── */}
        <div
          aria-hidden="true"
          className="h-f8"
          style={{
            backgroundImage:
              "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23111%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)",
            backgroundRepeat: "repeat-x",
          }}
        />

        {/* ── Editorial copy (kept for search) ────────────────────────── */}
        <section className="flex max-w-f610 flex-col gap-f21">
          <span className="quoted text-label font-bold uppercase text-muted">About</span>
          <h2 className="m-0 text-h3 font-bold tracking-[-.01em] text-ink lg:text-h2">
            The iconic sounds of the NYC subway
          </h2>
          <p className="m-0 text-body [text-wrap:pretty] lg:text-body-lg">
            The New York City Subway has a unique acoustic signature that millions recognise
            instantly. From the distinctive &ldquo;stand clear of the closing doors please&rdquo;
            announcement to the rumble of trains arriving at platforms, these sounds are an
            integral part of NYC&rsquo;s cultural identity.
          </p>

          <h3 className="m-0 mt-f13 text-h4 font-bold text-ink">
            What makes subway sounds unique?
          </h3>
          <p className="m-0 text-body [text-wrap:pretty] lg:text-body-lg">
            Each element of the subway&rsquo;s soundscape serves a purpose. The door chimes alert
            passengers, conductor announcements provide crucial information, and even the sound of
            trains on tracks tells experienced riders about speed and track conditions.
          </p>

          <h3 className="m-0 mt-f13 text-h4 font-bold text-ink">
            Recording locations &amp; acoustic characteristics
          </h3>
          <ul className="m-0 flex list-none flex-col gap-f8 p-0 text-body lg:text-body-lg">
            {[
              ["Platform recordings", "Captured during peak and off-peak hours at major stations"],
              ["Train interior", "Announcements and ambient sound from inside various train models"],
              ["Station entrances", "Turnstile sounds, MetroCard readers and OMNY taps"],
              ["Underground tunnels", "Echo effects and train approach warnings"],
            ].map(([k, v]) => (
              <li key={k} className="flex gap-f13 border-t border-seam pt-f8">
                <span className="shrink-0 font-bold">{k}</span>
                <span className="min-w-0 text-muted">{v}</span>
              </li>
            ))}
          </ul>

          <h3 className="m-0 mt-f13 text-h4 font-bold text-ink">Evolution of subway sounds</h3>
          <p className="m-0 text-body [text-wrap:pretty] lg:text-body-lg">
            NYC subway sounds have evolved significantly over the decades. From the mechanical
            clicking of token turnstiles to today&rsquo;s electronic OMNY beeps, each era has its
            distinctive audio signature. The archive preserves both historical recordings and
            contemporary sounds, creating an audio timeline of NYC transit.
          </p>
        </section>
      </SoundsLibrary>
    </>
  );
}
