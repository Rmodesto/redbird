'use client';

import { useCallback, useEffect, useState } from 'react';
import VideoCard from '@/components/station/VideoCard';

interface ApiVideo {
  id: string;
  youtubeId: string;
  title: string;
  publishedAt: string | null;
  duration: string | null;
  tags?: string[];
  stations?: { stationSlug: string }[];
}

export interface LineStationRef {
  slug: string;
  name: string;
  borough: string;
}

interface LineRecordingsPanelProps {
  lineId: string;
  /** Every station the line serves — used to decide which recordings belong here. */
  stations: LineStationRef[];
  /** How many cards to show. */
  limit?: number;
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

/** Label comes from the video's own tags — never invented. */
function labelFor(v: ApiVideo): string {
  const tag = v.tags?.[0];
  return tag ? tag.toUpperCase() : 'RECORDING';
}

const PAGE_SIZE = 50;
const MAX_PAGES = 3;

export default function LineRecordingsPanel({
  lineId,
  stations,
  limit = 3,
}: LineRecordingsPanelProps) {
  const [videos, setVideos] = useState<{ video: ApiVideo; meta: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  const load = useCallback(async () => {
    // Station slug → "Station name · Borough", so a card can say where it came from.
    const bySlug = new Map(stations.map((s) => [s.slug, `${s.name} · ${s.borough}`]));
    const collected: { video: ApiVideo; meta: string | null }[] = [];
    const seen = new Set<string>();

    try {
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const res = await fetch(`/api/videos?page=${page}&limit=${PAGE_SIZE}&status=ACTIVE`);
        if (!res.ok) break;
        const json = await res.json();
        const payload = json?.data ?? json;
        const list: ApiVideo[] = payload?.videos ?? [];

        for (const v of list) {
          if (seen.has(v.youtubeId)) continue;
          const match = v.stations?.find((s) => bySlug.has(s.stationSlug));
          if (!match) continue;
          seen.add(v.youtubeId);
          collected.push({ video: v, meta: bySlug.get(match.stationSlug) ?? null });
        }

        if (collected.length >= limit) break;
        const totalPages: number = payload?.totalPages ?? 1;
        if (page >= totalPages) break;
      }
      setVideos(collected);
    } catch {
      // No recordings is a valid state — the empty block below covers it.
    } finally {
      setLoading(false);
    }
  }, [stations, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const shown = videos.slice(0, limit);

  return (
    <section className="flex flex-col gap-f34">
      <div className="flex items-end justify-between gap-f21 border-b border-ink pb-f21">
        <div className="flex min-w-0 flex-col gap-f8">
          <span className="quoted text-label font-bold uppercase text-muted">Sound</span>
          <h2 className="m-0 text-h3 font-bold text-ink">Recorded on the {lineId}</h2>
        </div>
        {!loading && videos.length > 0 && (
          <span className="whitespace-nowrap text-label font-bold uppercase text-muted">
            {videos.length} {videos.length === 1 ? 'Clip' : 'Clips'}
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-col gap-f34">
          <div className="aspect-video w-full animate-pulse bg-seam" />
          <div className="aspect-video w-full animate-pulse bg-seam" />
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div className="border border-dashed border-seam p-f34 text-center">
          <p className="m-0 text-body leading-[26px] text-muted">
            No recordings tagged to {lineId} train stations yet.
          </p>
        </div>
      )}

      {!loading && playing && (
        <div className="w-full">
          <div className="aspect-video w-full border border-ink bg-jet">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${playing}?autoplay=1&rel=0`}
              title={`${lineId} train recording`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          <button
            type="button"
            onClick={() => setPlaying(null)}
            className="mt-f13 border border-ink px-f21 py-f8 text-label font-bold uppercase text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Close player
          </button>
        </div>
      )}

      {!loading && !playing && shown.length > 0 && (
        <div className="flex flex-col gap-f34">
          {shown.map(({ video, meta }) => (
            <VideoCard
              key={video.id}
              youtubeId={video.youtubeId}
              title={video.title}
              label={labelFor(video)}
              duration={formatDuration(video.duration)}
              meta={meta}
              onPlay={setPlaying}
            />
          ))}
        </div>
      )}
    </section>
  );
}
