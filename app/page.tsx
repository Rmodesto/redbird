import { Metadata } from "next";
import Link from "next/link";
import { generateSEOMetadata, generateFAQSchema } from "@/lib/seo";
import { generateCollectionPageSchema, generateStructuredDataScript } from "@/lib/structured-data";
import SiteHeader from "@/components/site/SiteHeader";
import SubwayLinesBadges from "@/components/subway/SubwayLinesBadges";
import AdSlot from "@/components/AdSlot";
import { mtaDataService } from "@/lib/services/mta-data-service";
import { getVideos, type VideoItem } from "@/lib/video/video.service";
import * as postService from "@/lib/blog/post.service";
import HomeHero, { type HeroVideo } from "@/components/home/HomeHero";
import { getFeaturedVideo } from "@/lib/video/featured";
import HomeVideoSections, { type HomeVideo } from "@/components/home/HomeVideoSections";

export const metadata: Metadata = generateSEOMetadata({
  title: "Subway Sounds NYC - Real-Time NYC Subway Directory, Map & Train Arrivals",
  description: "Navigate NYC subway with real-time train arrivals, interactive subway map, station sounds, and comprehensive directory. Track all 27 lines across 472 stations in Manhattan, Brooklyn, Queens & Bronx.",
  keywords: [
    "NYC subway real-time",
    "subway sounds New York",
    "MTA train tracker",
    "NYC metro map interactive",
    "subway station finder",
    "train arrivals NYC live",
    "Manhattan subway guide",
    "Brooklyn train stations",
    "Queens subway map",
    "Bronx metro stations",
  ],
  canonical: "/",
});

// The library and the blog both live in Postgres; refresh the shell every
// five minutes rather than baking the newest upload into the build.
export const revalidate = 300;

// Generate structured data
const collectionSchema = generateCollectionPageSchema(
  "NYC Subway Directory",
  "Complete directory of New York City subway stations with real-time arrivals",
  "stations",
  472
);

const faqSchema = generateFAQSchema([
  {
    question: "How do I track real-time NYC subway arrivals?",
    answer: "Use our station search to find any NYC subway station and view real-time train arrivals updated every 30 seconds directly from MTA data feeds."
  },
  {
    question: "What are NYC subway sounds?",
    answer: "NYC subway sounds include platform announcements, door chimes, train arrivals, and station ambiance. Our archive features authentic recordings from all 472 stations."
  },
  {
    question: "How many subway lines are in NYC?",
    answer: "The NYC subway system has 27 lines (including shuttles) operating across 472 stations in Manhattan, Brooklyn, Queens, and the Bronx."
  },
  {
    question: "Where can I find an interactive NYC subway map?",
    answer: "Our interactive subway map shows all lines, stations, and real-time service updates. Click on any station for arrivals and platform information."
  }
]);

// ── Formatting helpers ──────────────────────────────────────────────────────
// Everything below reads from a real record. Nothing is synthesised: when a
// field is missing the element is dropped rather than filled with a guess.

/** ISO 8601 duration → "4:12". Null when the feed gave us nothing usable. */
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

/** The station a recording is filed under, when one was matched. */
function stationFor(video: VideoItem) {
  const slug = video.stations[0]?.stationSlug;
  return slug ? mtaDataService.getStationBySlug(slug) : null;
}

function labelFor(video: VideoItem, isShort: boolean): string {
  const tag = video.tags?.[0];
  if (tag) return tag.toUpperCase();
  return isShort ? "SHORT" : "RECORDING";
}

function metaFor(video: VideoItem): string | null {
  const parts: string[] = [];
  const station = stationFor(video);
  if (station) {
    parts.push(station.name);
    if (station.borough) parts.push(station.borough);
  }
  if (video.publishedAt) {
    const d = new Date(video.publishedAt);
    if (!Number.isNaN(d.getTime())) {
      parts.push(
        `Uploaded ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      );
    }
  }
  return parts.length ? parts.join(" · ") : null;
}

function toHomeVideo(video: VideoItem, isShort: boolean): HomeVideo {
  return {
    id: video.id,
    youtubeId: video.youtubeId,
    title: video.title,
    label: labelFor(video, isShort),
    duration: formatDuration(video.duration),
    meta: metaFor(video),
  };
}

function formatPostDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Data loading ────────────────────────────────────────────────────────────
// Both sources are optional: a missing database must degrade to an empty
// section, never to a build failure or to invented content.

async function loadVideos(): Promise<VideoItem[]> {
  try {
    const { videos } = await getVideos(1, 24, "ACTIVE");
    return videos;
  } catch {
    return [];
  }
}

async function loadPosts() {
  try {
    const { posts } = await postService.getPublicPosts(1, 3);
    return posts;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const stations = mtaDataService.getAllStations();
  const stationCount = stations.length;

  // Every service that actually calls at a station in the MTA dataset, sorted
  // MTA-style: numbered trunks first, then the letters.
  const lines = Array.from(new Set(stations.flatMap((s) => s.lines)))
    .sort((a, b) => {
      const an = /^\d+$/.test(a);
      const bn = /^\d+$/.test(b);
      if (an && !bn) return -1;
      if (!an && bn) return 1;
      return a.localeCompare(b);
    });

  // "Most connected" is derived, not claimed: it is simply the stations that
  // carry the most services in the MTA dataset. No listen or ridership figure
  // exists in this app, so none is shown.
  const connected = [...stations]
    .sort((a, b) => b.lines.length - a.lines.length || a.name.localeCompare(b.name))
    .slice(0, 5);

  const [videos, posts] = await Promise.all([loadVideos(), loadPosts()]);

  const shortsSource = videos.filter((v) => {
    const s = durationSeconds(v.duration);
    return s > 0 && s <= 60;
  });
  const longform = videos.filter((v) => !shortsSource.includes(v));

  const featuredVideo = longform[0] ?? null;
  const restVideos = longform.slice(1, 3).map((v) => toHomeVideo(v, false));
  const shorts = shortsSource.slice(0, 5).map((v) => toHomeVideo(v, true));

  // The hero leads with a pinned recording rather than whatever synced last,
  // so the front door does not change under us. getFeaturedVideo resolves it
  // from our own library first (which carries the station association, and so
  // the line badges), then YouTube, then the bare id.
  const heroVideo: HeroVideo | null = await getFeaturedVideo();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(collectionSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(faqSchema)}
      />

      <SiteHeader active="" />

      <div className="min-w-0 bg-jet font-sans text-ink">
        <HomeHero stationCount={stationCount} video={heroVideo} />

        {/* ── Paper panel ────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-f8 pb-f34 lg:px-f55 lg:pb-f89">
          <main className="panel relative flex flex-col gap-f55 px-f21 pb-f55 pt-f34 lg:gap-f89 lg:p-f89">
            {/* ── Browse by line ───────────────────────────────── */}
            <section className="grid grid-cols-1 items-end gap-f21 lg:grid-cols-golden-r lg:gap-f55">
              <div className="flex flex-col gap-f5 lg:gap-f13">
                <span className="quoted text-label font-bold text-muted">LINE</span>
                <h2 className="m-0 text-h3 font-bold lg:text-h2 lg:tracking-[-.01em]">
                  Browse by line
                </h2>
                <p className="m-0 hidden max-w-f377 text-body text-muted lg:block">
                  Every station and every recording, line by line.
                </p>
              </div>
              <div className="flex flex-wrap gap-f8">
                {lines.map((line) => (
                  <Link
                    key={line}
                    href={`/line/${line.toLowerCase()}`}
                    aria-label={`${line} line`}
                    className="no-underline"
                  >
                    <SubwayLinesBadges lines={[line]} size="lg" />
                  </Link>
                ))}
              </div>
            </section>

            {/* ── New uploads + Shorts ─────────────────────────── */}
            <HomeVideoSections
              featured={featuredVideo ? toHomeVideo(featuredVideo, false) : null}
              rest={restVideos}
              shorts={shorts}
            />

            <AdSlot size="leaderboard" className="hidden lg:flex" />
            <AdSlot size="mobile_banner" className="lg:hidden" />

            {/* ── Stations + blog ──────────────────────────────── */}
            <section className="grid grid-cols-1 gap-f34 lg:grid-cols-golden lg:gap-f89">
              <div className="flex min-w-0 flex-col gap-f13 lg:gap-f21">
                <div className="flex flex-col gap-f5 lg:gap-f8">
                  <span className="quoted text-label font-bold text-muted">STATION</span>
                  <h2 className="m-0 text-h3 font-bold lg:text-h2 lg:tracking-[-.01em]">
                    Most connected stations
                  </h2>
                  <p className="m-0 hidden text-label normal-case tracking-normal text-muted lg:block">
                    Ranked by the number of services that call at the platform.
                  </p>
                </div>
                <div className="border-t border-ink">
                  {connected.map((station, i) => (
                    <Link
                      key={station.id}
                      href={`/station/${station.slug}`}
                      className="flex flex-col gap-f8 border-b border-seam py-f13 text-ink no-underline transition-colors hover:bg-[#FAFAFA] lg:grid lg:grid-cols-[34px_minmax(0,1fr)_auto] lg:items-center lg:gap-f21 lg:py-f21"
                    >
                      <span className="hidden text-label font-bold tabular-nums text-muted lg:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex items-baseline justify-between gap-f8 lg:flex-col lg:items-start lg:gap-f3">
                        <span className="text-body font-bold leading-[21px] lg:text-h4">
                          {station.name}
                        </span>
                        <span className="whitespace-nowrap text-label normal-case tracking-normal text-muted">
                          {station.borough}
                        </span>
                      </span>
                      <SubwayLinesBadges
                        lines={station.lines}
                        size="sm"
                        className="lg:justify-end"
                      />
                    </Link>
                  ))}
                </div>
                <Link
                  href="/stations"
                  className="text-label font-bold text-ink no-underline transition-colors hover:text-muted"
                >
                  ALL {stationCount} STATIONS &rarr;
                </Link>
              </div>

              {posts.length > 0 && (
                <div className="flex min-w-0 flex-col gap-f13 lg:gap-f21">
                  <div className="flex flex-col gap-f5 lg:gap-f8">
                    <span className="quoted text-label font-bold text-muted">BLOG</span>
                    <h2 className="m-0 text-h3 font-bold lg:text-h2 lg:tracking-[-.01em]">
                      From the blog
                    </h2>
                  </div>
                  <div className="border-t border-ink">
                    {posts.map((post) => {
                      const date = formatPostDate(post.publishedAt ?? post.createdAt);
                      return (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="flex flex-col gap-f8 border-b border-seam py-f13 text-ink no-underline transition-colors hover:bg-[#FAFAFA] lg:py-f21"
                        >
                          {post.category && (
                            <span className="quoted text-label font-bold uppercase text-muted">
                              {post.category}
                            </span>
                          )}
                          <span className="text-body font-bold leading-[21px] [text-wrap:pretty] lg:text-h4">
                            {post.title}
                          </span>
                          <span className="text-label normal-case tracking-normal text-muted">
                            {[date, post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href="/blog"
                    className="text-label font-bold text-ink no-underline transition-colors hover:text-muted"
                  >
                    READ THE BLOG &rarr;
                  </Link>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
