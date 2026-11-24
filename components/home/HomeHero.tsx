'use client';

import Link from 'next/link';
import { useState } from 'react';
import SubwayLinesBadges from '@/components/subway/SubwayLinesBadges';

export interface HeroVideo {
  youtubeId: string;
  title: string;
  /** Already formatted, e.g. "4:12". Null when the feed did not supply one. */
  duration: string | null;
  /** Services at the station this recording is filed under. Empty when unknown. */
  lines: string[];
}

interface HomeHeroProps {
  /** Real station count from the MTA dataset. */
  stationCount: number;
  /** Newest published recording, or null when the library is empty. */
  video: HeroVideo | null;
}

/** The comp's placeholder still: a raked light gradient behind a 55px rule. */
const STILL: React.CSSProperties = {
  backgroundColor: '#1C1C1C',
  backgroundImage:
    'repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 55px),linear-gradient(160deg,#5A5A5A 0%,#262626 45%,#0B0B0B 100%)',
};

export default function HomeHero({ stationCount, video }: HomeHeroProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="surface-ripstop text-paper">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-f21 px-f21 pb-f55 pt-f34 lg:grid-cols-golden-r lg:gap-x-f89 lg:gap-y-f34 lg:px-f55 lg:pb-f144 lg:pt-f89">
        {/* ── Copy ──────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-col gap-f21 lg:col-start-1 lg:row-start-1 lg:gap-f34">
          <span className="quoted text-label font-bold text-graphite">SOUND</span>
          <h1 className="m-0 text-[42px] font-bold uppercase leading-[42px] tracking-[-.02em] text-paper [text-wrap:balance] lg:text-display">
            The sound of {stationCount} stations.
          </h1>
          <p className="m-0 max-w-[440px] text-body text-paper [text-wrap:pretty] lg:text-body-lg">
            Raw audio and video from the New York City subway, recorded on the platform. Find a
            station, pick a line, press play.
          </p>
        </div>

        {/* ── Still ─────────────────────────────────────────────── */}
        <div className="relative mt-f13 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center">
          <div className="relative aspect-video border border-ripstop" style={STILL}>
            {playing && video ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <>
                {video && (
                  <img
                    src={`https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                    alt=""
                    // Not every upload has a maxres still; hqdefault always exists.
                    onError={(e) => {
                      const img = e.currentTarget;
                      const fallback = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
                      if (img.src !== fallback) img.src = fallback;
                    }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <span className="absolute left-f13 top-f13 text-micro font-bold text-graphite lg:left-f21 lg:top-f21">
                  VIDEO STILL<span className="hidden lg:inline"> · 16:9</span>
                </span>
                {video && (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    aria-label={`Play ${video.title}`}
                    className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-tag"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-f34 w-f34 items-center justify-center bg-jet lg:h-f55 lg:w-f55"
                    >
                      <svg width="14" height="14" viewBox="0 0 12 12" fill="#FFFFFF">
                        <path d="M1 0l10 6-10 6z" />
                      </svg>
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Orange index tab + its stitched thread */}
            <span
              aria-hidden="true"
              className="absolute -right-f8 top-f21 h-f13 w-f34 bg-tag lg:-right-f13 lg:top-f55 lg:h-f21 lg:w-f55"
            />
            <span
              aria-hidden="true"
              className="absolute right-f21 top-f55 hidden h-f21 w-f8 bg-stitch-ink bg-repeat-y lg:block"
            />
          </div>

          {/* ── Latest-recording plate ──────────────────────────── */}
          {video && !playing && (
            <div className="surface-smoke absolute inset-x-f8 bottom-f8 flex flex-col gap-f8 border border-[rgba(255,255,255,.18)] p-f13 text-paper lg:inset-x-auto lg:-bottom-f55 lg:-left-f55 lg:w-f377 lg:gap-f13 lg:p-f21">
              <span className="quoted text-micro font-bold lg:text-label">LATEST</span>
              <span className="text-body font-bold leading-[21px] [text-wrap:pretty] lg:text-h4 lg:font-bold">
                {video.title}
              </span>
              <div className="flex items-center justify-between gap-f13">
                {video.lines.length > 0 && (
                  <SubwayLinesBadges lines={video.lines} size="sm" className="hidden lg:flex" />
                )}
                {video.duration && (
                  <span className="ml-auto text-label font-bold tabular-nums lg:ml-0">
                    {video.duration}
                  </span>
                )}
              </div>
              <div aria-hidden="true" className="surface-lace h-f3" />
            </div>
          )}
        </div>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="flex flex-col gap-f8 lg:col-start-1 lg:row-start-2 lg:flex-row lg:gap-f13">
          {video ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="flex h-f55 items-center justify-center bg-paper px-f34 text-label font-bold text-jet transition-colors hover:bg-seam"
            >
              WATCH THE LATEST
            </button>
          ) : (
            <Link
              href="/subway-sounds"
              className="flex h-f55 items-center justify-center bg-paper px-f34 text-label font-bold text-jet no-underline transition-colors hover:bg-seam"
            >
              WATCH THE LATEST
            </Link>
          )}
          <Link
            href="/stations"
            className="flex h-f55 items-center justify-center border border-paper px-f34 text-label font-bold text-paper no-underline transition-colors hover:bg-suede"
          >
            FIND A STATION
          </Link>
        </div>
      </div>
    </section>
  );
}
