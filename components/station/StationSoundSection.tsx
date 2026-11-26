'use client';

import { useCallback, useEffect, useState } from 'react';
import VideoCard from './VideoCard';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  duration: string | null;
  tags?: string[];
}

interface StationSoundSectionProps {
  stationSlug: string;
  stationName: string;
}

/** ISO 8601 duration → "11:04". Returns null when unparseable. */
function formatDuration(iso: string | null): string | null {
  if (!iso) return null;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const [, h, min, s] = m;
  const mm = min ?? '0';
  const ss = (s ?? '0').padStart(2, '0');
  return h ? `${h}:${mm.padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

function durationSeconds(iso: string | null): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

/** Label comes from the video's own tags — never invented. */
function labelFor(v: VideoItem, isShort: boolean): string {
  const tag = v.tags?.[0];
  if (tag) return tag.toUpperCase();
  return isShort ? 'SHORT' : 'RECORDING';
}

function metaFor(v: VideoItem): string | null {
  if (!v.publishedAt) return null;
  const d = new Date(v.publishedAt);
  if (Number.isNaN(d.getTime())) return null;
  return `Recorded ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

function SectionHead({ count }: { count: number | null }) {
  return (
    <div className="flex items-end justify-between gap-[34px] border-b border-ink pb-[21px]">
      <div className="flex flex-col gap-[8px]">
        <span className="text-[13px] font-bold uppercase leading-[21px] tracking-[.08em] text-muted">
          &ldquo;Sound&rdquo;
        </span>
        <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-ink">
          Recorded at this station
        </h2>
      </div>
      {count !== null && (
        <span className="whitespace-nowrap text-[13px] font-bold uppercase leading-[21px] tracking-[.08em] text-muted">
          {count} {count === 1 ? 'Recording' : 'Recordings'}
        </span>
      )}
    </div>
  );
}

export default function StationSoundSection({
  stationSlug,
  stationName,
}: StationSoundSectionProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/videos/station/${stationSlug}`);
      if (!res.ok) return;
      const json = await res.json();
      setVideos(json?.data?.videos ?? json?.videos ?? []);
    } catch {
      // No videos is a valid state — the empty block below covers it.
    } finally {
      setLoading(false);
    }
  }, [stationSlug]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <section className="flex flex-col gap-[55px]">
        <SectionHead count={null} />
        <div className="aspect-video w-full animate-pulse bg-seam" />
        <div className="grid grid-cols-2 gap-[34px]">
          <div className="aspect-video animate-pulse bg-seam" />
          <div className="aspect-video animate-pulse bg-seam" />
        </div>
      </section>
    );
  }

  // No recordings is a valid state — hide the section entirely rather than
  // showing an empty "Recorded at this station" heading.
  if (videos.length === 0) {
    return null;
  }

  const shorts = videos.filter((v) => durationSeconds(v.duration) > 0 && durationSeconds(v.duration) <= 60);
  const longform = videos.filter((v) => !shorts.includes(v));

  const featured = longform[0] ?? videos[0];
  const pair = longform.slice(1, 3);
  const shortList = shorts.slice(0, 4);

  return (
    <section className="flex flex-col gap-[55px]">
      <SectionHead count={videos.length} />

      {playing ? (
        <div className="relative w-full">
          <div className="aspect-video w-full border border-ink bg-jet">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${playing}?autoplay=1&rel=0`}
              title="Station recording"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => setPlaying(null)}
            className="mt-[13px] border border-ink px-[21px] py-[8px] text-[13px] font-bold uppercase tracking-[.08em] text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Close player
          </button>
        </div>
      ) : (
        featured && (
          <VideoCard
            variant="featured"
            youtubeId={featured.youtubeId}
            title={featured.title}
            label={labelFor(featured, false)}
            duration={formatDuration(featured.duration)}
            meta={metaFor(featured)}
            onPlay={setPlaying}
          />
        )
      )}

      {pair.length > 0 && (
        <div className="grid grid-cols-1 gap-[34px] md:grid-cols-2">
          {pair.map((v) => (
            <VideoCard
              key={v.id}
              youtubeId={v.youtubeId}
              title={v.title}
              label={labelFor(v, false)}
              duration={formatDuration(v.duration)}
              meta={metaFor(v)}
              onPlay={setPlaying}
            />
          ))}
        </div>
      )}

      {shortList.length > 0 && (
        <div className="grid grid-cols-2 gap-[21px] lg:grid-cols-4">
          {shortList.map((v) => (
            <VideoCard
              key={v.id}
              variant="short"
              youtubeId={v.youtubeId}
              title={v.title}
              label={labelFor(v, true)}
              duration={formatDuration(v.duration)}
              meta={metaFor(v)}
              onPlay={setPlaying}
            />
          ))}
        </div>
      )}
    </section>
  );
}
