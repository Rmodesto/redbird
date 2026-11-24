'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import VideoCard from '@/components/station/VideoCard';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';
import AdSlot from '@/components/AdSlot';

/**
 * One row of the library. Every field is sourced from the synced YouTube
 * record (or from the station it is tagged to) — nothing here is invented.
 */
export interface LibraryVideo {
  id: string;
  youtubeId: string;
  title: string;
  /** Already formatted, e.g. "4:12". Null when YouTube gave us no duration. */
  duration: string | null;
  /** Duration in seconds; 0 when unknown. Used only to split shorts out. */
  seconds: number;
  publishedAt: string | null;
  tags: string[];
  lines: string[];
  stationName: string | null;
  borough: string | null;
}

interface SoundsLibraryProps {
  videos: LibraryVideo[];
  /** Thumbnail of the newest recording — the hero still. */
  heroThumbnail: string | null;
  /** Server-rendered editorial copy, dropped inside the paper panel. */
  children?: ReactNode;
}

/** Official MTA trunk order, so the line filter reads like a system map. */
const LINE_ORDER = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'C', 'E', 'B', 'D', 'F', 'M',
  'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', 'S',
];

const SHORT_MAX_SECONDS = 60;
const SHORTS_PREVIEW = 6;
const SHORTS_PER_PAGE = 18;
const RECORDINGS_PER_PAGE = 12;
const MAX_TYPE_TABS = 5;

const ALL = 'ALL';
const SHORTS = 'SHORTS';

function isShort(v: LibraryVideo) {
  return v.seconds > 0 && v.seconds <= SHORT_MAX_SECONDS;
}

/** Label comes from the video's own tags — never invented. */
function labelFor(v: LibraryVideo): string {
  const tag = v.tags[0];
  if (tag) return tag.toUpperCase();
  return isShort(v) ? 'SHORT' : 'RECORDING';
}

/** "Queensboro Plaza · Nov 21" — only the parts we actually hold. */
function metaFor(v: LibraryVideo): string | null {
  const parts: string[] = [];
  const place = v.stationName ?? v.borough;
  if (place) parts.push(place);
  if (v.publishedAt) {
    const d = new Date(v.publishedAt);
    if (!Number.isNaN(d.getTime())) {
      parts.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}

function SectionHead({
  kicker,
  title,
  aside,
}: {
  kicker: string;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-f13 sm:flex-row sm:items-end sm:gap-f21">
      <div className="flex flex-col gap-f8">
        <span className="quoted text-label font-bold uppercase text-muted">{kicker}</span>
        <h2 className="m-0 text-h3 font-bold tracking-[-.01em] text-ink lg:text-h2">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

export default function SoundsLibrary({ videos, heroThumbnail, children }: SoundsLibraryProps) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string>(ALL);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [playing, setPlaying] = useState<LibraryVideo | null>(null);

  // ── Facets, all derived from the rows we actually have ──────────────────
  const typeTabs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of videos) {
      for (const tag of v.tags) {
        const key = tag.trim().toUpperCase();
        if (!key || key === SHORTS) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_TYPE_TABS)
      .map(([tag]) => tag);
    const tabs = [ALL];
    if (videos.some(isShort)) tabs.push(SHORTS);
    return tabs.concat(top);
  }, [videos]);

  const availableLines = useMemo(() => {
    const present = new Set<string>();
    for (const v of videos) for (const l of v.lines) present.add(l.toUpperCase());
    return LINE_ORDER.filter((l) => present.has(l));
  }, [videos]);

  // ── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = videos.filter((v) => {
      if (type === SHORTS && !isShort(v)) return false;
      if (type !== ALL && type !== SHORTS) {
        if (!v.tags.some((t) => t.trim().toUpperCase() === type)) return false;
      }
      if (selectedLines.length > 0) {
        const up = v.lines.map((l) => l.toUpperCase());
        if (!selectedLines.some((l) => up.includes(l))) return false;
      }
      if (q) {
        const haystack = [v.title, v.stationName ?? '', v.borough ?? '', ...v.lines, ...v.tags]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return sort === 'newest' ? bt - at : at - bt;
    });
  }, [videos, query, type, selectedLines, sort]);

  const shorts = useMemo(() => filtered.filter(isShort), [filtered]);
  const longform = useMemo(() => filtered.filter((v) => !isShort(v)), [filtered]);

  const showingShortsOnly = type === SHORTS;
  const gridRows = showingShortsOnly ? shorts : longform;
  const perPage = showingShortsOnly ? SHORTS_PER_PAGE : RECORDINGS_PER_PAGE;
  const totalPages = Math.max(1, Math.ceil(gridRows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = gridRows.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => {
    setPage(1);
  }, [query, type, selectedLines, sort]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlaying(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const toggleLine = (line: string) => {
    setSelectedLines((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line],
    );
  };

  // A short window of page numbers around the current page.
  const pageWindow = useMemo(() => {
    const span = 5;
    let start = Math.max(1, currentPage - Math.floor(span / 2));
    const end = Math.min(totalPages, start + span - 1);
    start = Math.max(1, end - span + 1);
    const out: number[] = [];
    for (let n = start; n <= end; n++) out.push(n);
    return out;
  }, [currentPage, totalPages]);

  const empty = videos.length === 0;

  return (
    <div className="min-w-0 bg-jet font-sans text-ink">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f21 lg:px-f55 lg:pb-f89 lg:pt-f55">
          <div className="relative border border-ripstop bg-jet p-f13 sm:p-f21 lg:h-[466px] lg:p-f55">
            {heroThumbnail && (
              <>
                <img
                  src={heroThumbnail}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-jet/50"
                />
                <span className="absolute right-f21 top-f21 hidden text-micro font-bold text-graphite lg:block">
                  VIDEO STILL · FULL BLEED
                </span>
              </>
            )}

            <div className="surface-smoke relative flex h-full w-full flex-col justify-between gap-f21 border-x border-b border-white/20 p-f21 lg:w-f610 lg:gap-f34 lg:p-f55">
              <div className="flex flex-col gap-f13 lg:gap-f21">
                <span className="quoted text-label font-bold">SOUNDS</span>
                <h1 className="m-0 text-[clamp(34px,8vw,55px)] font-bold uppercase leading-[1] tracking-[-.02em]">
                  The library
                </h1>
                <p className="m-0 max-w-[440px] text-body [text-wrap:pretty] lg:text-body-lg">
                  Every NYC subway recording from the channel — platform announcements, train
                  arrivals and station ambience — sorted by station, line and type of sound.
                </p>
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                role="search"
                className="flex h-f55 shrink-0 items-center justify-between gap-f8 border border-ripstop bg-jet pl-f13 pr-f5 lg:pl-f21 lg:pr-f8"
              >
                <label htmlFor="sounds-search" className="sr-only">
                  Search by station, line or sound
                </label>
                <input
                  id="sounds-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by station, line or sound"
                  className="min-w-0 flex-1 bg-transparent text-body text-paper outline-none placeholder:text-graphite"
                />
                <button
                  type="submit"
                  className="flex h-[39px] shrink-0 items-center bg-paper px-f13 text-label font-bold text-jet lg:px-f21"
                >
                  SEARCH
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Paper panel ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-f8 pb-f34 lg:px-f55 lg:pb-f89">
        <main className="panel relative flex flex-col gap-f34 p-f21 lg:gap-f55 lg:px-f89 lg:pb-f89 lg:pt-f55">
          {/* Stitched tag pinning the panel to the frame */}
          <span aria-hidden="true" className="panel-tag hidden lg:block" />
          <span aria-hidden="true" className="panel-tag-thread hidden lg:block" />

          {/* ── Filter bar ────────────────────────────────────────────── */}
          <div className="flex flex-col gap-f21 border-b border-ink pb-f21 lg:pb-f34">
            <div className="flex flex-col gap-f8 lg:flex-row lg:items-center lg:gap-f21">
              <span className="shrink-0 text-label font-bold uppercase text-muted lg:w-f55">
                Type
              </span>
              <div className="-mx-f21 flex gap-f8 overflow-x-auto px-f21 pb-f5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
                {typeTabs.map((t) => {
                  const active = t === type;
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setType(t)}
                      className={`relative flex h-f34 shrink-0 items-center whitespace-nowrap px-f21 text-label font-bold transition-colors ${
                        active
                          ? 'bg-jet text-paper'
                          : 'border border-ink text-ink hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {t}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="surface-lace absolute inset-x-0 bottom-0 h-f3"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-f13 lg:flex-row lg:items-center lg:justify-between lg:gap-f21">
              {availableLines.length > 0 && (
                <div className="flex min-w-0 flex-col gap-f8 lg:flex-row lg:items-center lg:gap-f21">
                  <span className="shrink-0 text-label font-bold uppercase text-muted lg:w-f55">
                    Line
                  </span>
                  <div className="flex flex-wrap gap-f8">
                    {availableLines.map((line) => {
                      const active = selectedLines.includes(line);
                      return (
                        <button
                          key={line}
                          type="button"
                          aria-pressed={active}
                          aria-label={`Filter by ${line} train`}
                          onClick={() => toggleLine(line)}
                          className={`flex items-center rounded-full transition-[outline] ${
                            active ? 'outline outline-2 outline-offset-2 outline-ink' : ''
                          }`}
                        >
                          <SubwayLinesBadges lines={[line]} size="md" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                className="flex h-f34 shrink-0 items-center gap-f13 self-start border border-ink px-f13 text-label font-bold uppercase text-ink transition-colors hover:bg-[#FAFAFA] lg:self-auto"
              >
                Sort: {sort}
                <span aria-hidden="true" className="text-micro">
                  ▼
                </span>
              </button>
            </div>
          </div>

          {empty ? (
            <section className="flex flex-col gap-f34">
              <SectionHead kicker="Sound" title="The archive" />
              <div className="border border-dashed border-seam p-f34 text-center lg:p-f55">
                <p className="m-0 text-body-lg text-muted">
                  No recordings have been published to the library yet.
                </p>
              </div>
            </section>
          ) : (
            <>
              {/* ── Shorts ─────────────────────────────────────────────── */}
              {!showingShortsOnly && shorts.length > 0 && (
                <section className="flex flex-col gap-f21 lg:gap-f34">
                  <SectionHead
                    kicker="Short"
                    title="Shorts"
                    aside={
                      shorts.length > SHORTS_PREVIEW ? (
                        <button
                          type="button"
                          onClick={() => setType(SHORTS)}
                          className="text-label font-bold uppercase text-ink hover:text-muted"
                        >
                          All shorts →
                        </button>
                      ) : undefined
                    }
                  />
                  <div className="grid grid-cols-2 gap-f13 sm:grid-cols-3 lg:grid-cols-6 lg:gap-f21">
                    {shorts.slice(0, SHORTS_PREVIEW).map((v) => (
                      <VideoCard
                        key={v.id}
                        variant="short"
                        youtubeId={v.youtubeId}
                        title={v.title}
                        label={labelFor(v)}
                        duration={v.duration}
                        meta={metaFor(v)}
                        onPlay={() => setPlaying(v)}
                      />
                    ))}
                  </div>
                </section>
              )}

              <AdSlot size="leaderboard" />

              {/* ── Main grid ──────────────────────────────────────────── */}
              <section className="flex flex-col gap-f21 lg:gap-f34">
                <SectionHead
                  kicker={showingShortsOnly ? 'Short' : 'Ambience'}
                  title={showingShortsOnly ? 'Shorts' : 'Full recordings'}
                  aside={
                    gridRows.length > 0 ? (
                      <span className="whitespace-nowrap text-label normal-case tracking-normal text-muted">
                        Page {currentPage} of {totalPages}
                      </span>
                    ) : undefined
                  }
                />

                {pageRows.length === 0 ? (
                  <div className="border border-dashed border-seam p-f34 text-center lg:p-f55">
                    <p className="m-0 text-body-lg text-muted">
                      No recordings match these filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setType(ALL);
                        setSelectedLines([]);
                      }}
                      className="mt-f21 inline-flex h-f34 items-center border border-ink px-f21 text-label font-bold uppercase text-ink hover:bg-[#FAFAFA]"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={
                      showingShortsOnly
                        ? 'grid grid-cols-2 gap-f13 sm:grid-cols-3 lg:grid-cols-6 lg:gap-f21'
                        : 'grid grid-cols-1 gap-f34 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-f34 lg:gap-y-f55'
                    }
                  >
                    {pageRows.map((v) => (
                      <VideoCard
                        key={v.id}
                        variant={showingShortsOnly ? 'short' : 'default'}
                        youtubeId={v.youtubeId}
                        title={v.title}
                        label={labelFor(v)}
                        duration={v.duration}
                        meta={metaFor(v)}
                        onPlay={() => setPlaying(v)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* ── Pagination ─────────────────────────────────────────── */}
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-f8">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="flex h-[44px] items-center border border-ink px-f21 text-label font-bold uppercase text-muted transition-colors hover:bg-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {pageWindow.map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-current={n === currentPage ? 'page' : undefined}
                      onClick={() => setPage(n)}
                      className={`flex h-[44px] w-[44px] items-center justify-center text-label font-bold tabular-nums ${
                        n === currentPage
                          ? 'bg-jet text-paper'
                          : 'border border-ink text-ink hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                    className="flex h-[44px] items-center bg-jet px-f21 text-label font-bold uppercase text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>
                </nav>
              )}
            </>
          )}

          {children}
        </main>
      </div>

      {/* ── Player ───────────────────────────────────────────────────────── */}
      {playing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Playing ${playing.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-jet/90 p-f21"
          onClick={() => setPlaying(null)}
        >
          <div
            className="flex w-full max-w-[1042px] flex-col gap-f13"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full border border-ripstop bg-jet">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-f13">
              <span className="min-w-0 text-body font-bold text-paper">{playing.title}</span>
              <button
                type="button"
                onClick={() => setPlaying(null)}
                className="flex h-f34 shrink-0 items-center border border-paper px-f21 text-label font-bold uppercase text-paper transition-colors hover:bg-paper hover:text-jet"
              >
                Close player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
