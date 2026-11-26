'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface StationLite {
  slug: string;
  name: string;
  borough: string;
  lines: string[];
}
interface VideoStationTag {
  stationSlug: string;
  matchType: string;
  confidence: number;
}
interface AdminVideo {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  duration: string | null;
  status: string;
  stations: VideoStationTag[];
}

interface Props {
  stations: StationLite[];
  defaultChannelId: string;
}

const PAGE_SIZE = 24;

export default function VideosAdminClient({ stations, defaultChannelId }: Props) {
  const slugToStation = useMemo(() => {
    const m: Record<string, StationLite> = {};
    stations.forEach((s) => (m[s.slug] = s));
    return m;
  }, [stations]);

  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'ACTIVE' | 'HIDDEN'>('');
  const [untaggedOnly, setUntaggedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [channelId, setChannelId] = useState(defaultChannelId);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (statusFilter) qs.set('status', statusFilter);
      if (search.trim()) qs.set('search', search.trim());
      const res = await fetch(`/api/videos?${qs.toString()}`);
      if (!res.ok) throw new Error(`List failed (${res.status})`);
      const json = await res.json();
      const data = json.data ?? json;
      setVideos(data.videos ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function runSync() {
    if (!channelId.trim()) return;
    setSyncing(true);
    setSyncMsg('Syncing from YouTube… this can take a minute.');
    try {
      const res = await fetch('/api/videos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Sync failed (${res.status})`);
      const r = json.data ?? json;
      setSyncMsg(
        `Done: ${r.newVideos} new, ${r.updatedVideos} updated, ${r.matchedStations} station matches` +
          (r.errors?.length ? `, ${r.errors.length} errors` : ''),
      );
      setPage(1);
      load();
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function tag(video: AdminVideo, slug: string) {
    if (video.stations.some((s) => s.stationSlug === slug)) return;
    // optimistic
    setVideos((vs) =>
      vs.map((v) =>
        v.id === video.id
          ? { ...v, stations: [...v.stations, { stationSlug: slug, matchType: 'MANUAL', confidence: 1 }] }
          : v,
      ),
    );
    try {
      const res = await fetch('/api/videos/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, stationSlug: slug }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setVideos((vs) =>
        vs.map((v) =>
          v.id === video.id ? { ...v, stations: v.stations.filter((s) => s.stationSlug !== slug) } : v,
        ),
      );
      setError('Failed to tag — change reverted.');
    }
  }

  async function untag(video: AdminVideo, slug: string) {
    const prev = video.stations;
    setVideos((vs) =>
      vs.map((v) => (v.id === video.id ? { ...v, stations: v.stations.filter((s) => s.stationSlug !== slug) } : v)),
    );
    try {
      const res = await fetch('/api/videos/tag', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, stationSlug: slug }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setVideos((vs) => vs.map((v) => (v.id === video.id ? { ...v, stations: prev } : v)));
      setError('Failed to remove tag — change reverted.');
    }
  }

  const shown = untaggedOnly ? videos.filter((v) => v.stations.length === 0) : videos;

  return (
    <div className="text-gray-200">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Videos</h1>
        <span className="text-sm text-gray-400">{total} in library</span>
      </div>

      {/* Sync */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            YouTube channel ID
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-white w-72"
              placeholder="UC…"
            />
          </label>
          <button
            onClick={runSync}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded px-4 py-2"
          >
            {syncing ? 'Syncing…' : 'Sync from YouTube'}
          </button>
          {syncMsg && <span className="text-sm text-gray-400">{syncMsg}</span>}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pulls the channel&apos;s uploads into the library and auto-tags confident station matches. Needs
          YOUTUBE_API_KEY set on the server.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search titles…"
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as '' | 'ACTIVE' | 'HIDDEN');
          }}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="HIDDEN">Hidden</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input type="checkbox" checked={untaggedOnly} onChange={(e) => setUntaggedOnly(e.target.checked)} />
          Untagged only
        </label>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3 mb-4">{error}</div>}

      {loading ? (
        <div className="text-gray-500 py-12 text-center">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="text-gray-500 py-12 text-center">
          {total === 0 ? 'Library is empty — run a sync to pull videos in.' : 'No videos match.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {shown.map((v) => (
            <VideoRow key={v.id} video={v} stations={stations} slugToStation={slugToStation} onTag={tag} onUntag={untag} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="text-sm text-gray-300 disabled:opacity-40 border border-gray-700 rounded px-3 py-1.5"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="text-sm text-gray-300 disabled:opacity-40 border border-gray-700 rounded px-3 py-1.5"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function VideoRow({
  video,
  stations,
  slugToStation,
  onTag,
  onUntag,
}: {
  video: AdminVideo;
  stations: StationLite[];
  slugToStation: Record<string, StationLite>;
  onTag: (v: AdminVideo, slug: string) => void;
  onUntag: (v: AdminVideo, slug: string) => void;
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const out: StationLite[] = [];
    for (let i = 0; i < stations.length && out.length < 20; i++) {
      const s = stations[i];
      if (
        s.name.toLowerCase().includes(t) ||
        s.slug.includes(t) ||
        s.borough.toLowerCase().includes(t)
      )
        out.push(s);
    }
    return out;
  }, [q, stations]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex gap-3">
      <a
        href={`https://youtu.be/${video.youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 w-40 aspect-video rounded overflow-hidden bg-gray-800 block"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      </a>
      <div className="min-w-0 flex-1">
        <a
          href={`https://youtu.be/${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:underline line-clamp-2"
        >
          {video.title}
        </a>
        <div className="text-xs text-gray-500 mt-0.5 flex gap-2 flex-wrap">
          {video.publishedAt && <span>{video.publishedAt.slice(0, 10)}</span>}
          <span className="uppercase">{video.status}</span>
        </div>

        {/* current tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {video.stations.length === 0 && <span className="text-xs text-gray-600">No stations tagged</span>}
          {video.stations.map((s) => {
            const st = slugToStation[s.stationSlug];
            return (
              <span
                key={s.stationSlug}
                className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full pl-2 pr-1 py-0.5 text-xs text-gray-200"
                title={`${s.matchType} · confidence ${s.confidence}`}
              >
                {st ? st.name : s.stationSlug}
                <span className={`text-[9px] ${s.matchType === 'MANUAL' ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {s.matchType === 'MANUAL' ? 'M' : 'A'}
                </span>
                <button
                  onClick={() => onUntag(video, s.stationSlug)}
                  className="text-gray-500 hover:text-red-400 px-1"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>

        {/* add station */}
        <div ref={boxRef} className="relative mt-2">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Add station — name, borough, or slug…"
            className="w-full bg-gray-950 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white"
          />
          {open && matches.length > 0 && (
            <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-auto">
              {matches.map((s) => (
                <button
                  key={s.slug}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onTag(video, s.slug);
                    setQ('');
                    setOpen(false);
                  }}
                  className="block w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-800 border-b border-gray-800 last:border-0"
                >
                  <span className="text-gray-200 font-medium">{s.name}</span>
                  <span className="text-gray-500"> · {s.borough} · {s.lines.join(' ')}</span>
                  <span className="block text-gray-600 font-mono text-[10px]">{s.slug}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
