'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────
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
interface PostPin {
  postId: string;
  position: number;
}
interface AdminVideo {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  duration: string | null;
  status: string;
  reviewed: boolean;
  stations: VideoStationTag[];
  posts: PostPin[];
}
interface Stats {
  total: number;
  untagged: number;
  needsReview: number;
  tagged: number;
  lastSyncedAt: string | null;
}
interface Props {
  stations: StationLite[];
  defaultChannelId: string;
}

type TabKey = '' | 'untagged' | 'needs_review' | 'tagged';
const TABS: { key: TabKey; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'untagged', label: 'Untagged' },
  { key: 'needs_review', label: 'Needs review' },
  { key: 'tagged', label: 'Tagged' },
];
const PAGE_SIZE = 50;

const LINE_COLORS: Record<string, string> = {
  '1': '#ee352e', '2': '#ee352e', '3': '#ee352e', '4': '#00933c', '5': '#00933c', '6': '#00933c',
  '7': '#b933ad', A: '#0039a6', C: '#0039a6', E: '#0039a6', B: '#ff6319', D: '#ff6319', F: '#ff6319',
  M: '#ff6319', G: '#6cbe45', J: '#996633', Z: '#996633', L: '#a7a9ac', N: '#fccc0a', Q: '#fccc0a',
  R: '#fccc0a', W: '#fccc0a', S: '#808183', SIR: '#0039a6',
};
const lineColor = (l: string) => LINE_COLORS[l.toUpperCase()] || '#4b5563';
const lineText = (l: string) => (['N', 'Q', 'R', 'W'].includes(l.toUpperCase()) ? '#000' : '#fff');

function durationSeconds(iso: string | null): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

function statusLabel(v: AdminVideo): string {
  const n = v.stations.length;
  if (!v.reviewed && n === 0) return 'UNTAGGED';
  if (!v.reviewed && n > 0) return `NEEDS REVIEW · ${n} TAG${n > 1 ? 'S' : ''}`;
  if (v.reviewed && n === 0) return 'SKIPPED';
  return `${n} STATION${n > 1 ? 'S' : ''}`;
}

// ─── Line badge ──────────────────────────────────────────────────────────
function LineBadge({ line, size = 20 }: { line: string; size?: number }) {
  return (
    <span
      style={{ background: lineColor(line), color: lineText(line), width: size, height: size }}
      className="inline-flex items-center justify-center rounded-full font-bold"
      // eslint-disable-next-line react/forbid-dom-props
    >
      <span style={{ fontSize: size * 0.6 }}>{line}</span>
    </span>
  );
}

export default function VideosAdminClient({ stations, defaultChannelId }: Props) {
  const slugToStation = useMemo(() => {
    const m: Record<string, StationLite> = {};
    stations.forEach((s) => (m[s.slug] = s));
    return m;
  }, [stations]);

  const [stats, setStats] = useState<Stats | null>(null);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tab, setTab] = useState<TabKey>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [channelId, setChannelId] = useState(defaultChannelId);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/videos/stats');
      if (res.ok) setStats((await res.json()).data ?? null);
    } catch {
      /* non-fatal */
    }
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (tab) qs.set('tagState', tab);
      if (search.trim()) qs.set('search', search.trim());
      const res = await fetch(`/api/videos?${qs.toString()}`);
      if (!res.ok) throw new Error(`List failed (${res.status})`);
      const data = (await res.json()).data ?? {};
      const list: AdminVideo[] = data.videos ?? [];
      setVideos(list);
      setTotalPages(data.totalPages ?? 1);
      setSelectedId((cur) => (cur && list.some((v) => v.id === cur) ? cur : list[0]?.id ?? null));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [page, tab, search]);

  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const selected = videos.find((v) => v.id === selectedId) || null;

  async function runSync() {
    if (!channelId.trim()) return;
    setSyncing(true);
    setSyncMsg('Syncing… this can take a minute.');
    try {
      const res = await fetch('/api/videos/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: channelId.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Sync failed (${res.status})`);
      const r = json.data ?? json;
      setSyncMsg(`Done: ${r.newVideos} new, ${r.updatedVideos} updated, ${r.matchedStations} matches`);
      setPage(1);
      await Promise.all([loadList(), loadStats()]);
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  // advance selection to the next row (used after save/skip)
  function selectNext() {
    const idx = videos.findIndex((v) => v.id === selectedId);
    const next = videos[idx + 1];
    if (next) setSelectedId(next.id);
  }

  async function saveTags(video: AdminVideo, slugs: string[]) {
    const res = await fetch('/api/videos/save-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: video.id, stationSlugs: slugs }),
    });
    if (!res.ok) {
      setError('Failed to save tags.');
      return;
    }
    // optimistic local update
    setVideos((vs) =>
      vs.map((v) =>
        v.id === video.id
          ? { ...v, reviewed: true, stations: slugs.map((s) => ({ stationSlug: s, matchType: 'MANUAL', confidence: 1 })) }
          : v,
      ),
    );
    loadStats();
  }

  async function skip(video: AdminVideo) {
    const res = await fetch('/api/videos/skip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId: video.id }),
    });
    if (!res.ok) {
      setError('Failed to skip.');
      return;
    }
    setVideos((vs) => vs.map((v) => (v.id === video.id ? { ...v, reviewed: true, stations: [] } : v)));
    loadStats();
    selectNext();
  }

  return (
    <div className="text-gray-900">
      {/* Header: sync + stats */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="text-xs font-bold tracking-widest text-gray-500">LIBRARY</div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Tag every recording</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-gray-400">
              <div>Last sync</div>
              <div className="text-gray-300">
                {stats?.lastSyncedAt ? new Date(stats.lastSyncedAt).toLocaleString() : '—'}
              </div>
            </div>
            <button
              onClick={runSync}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded px-4 py-2 whitespace-nowrap"
            >
              {syncing ? 'Syncing…' : 'Sync from YouTube'}
            </button>
          </div>
        </div>

        {/* stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="In library" value={stats?.total} />
          <Stat label="Tagged" value={stats?.tagged} />
          <Stat label="Untagged" value={stats?.untagged} accent />
          <Stat label="Needs review" value={stats?.needsReview} />
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap text-xs text-gray-500">
          <input
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-gray-200 w-64"
            placeholder="YouTube channel ID (UC…)"
          />
          {syncMsg && <span className="text-gray-400">{syncMsg}</span>}
        </div>
      </div>

      {error && <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded p-3 mb-4">{error}</div>}

      {/* Master-detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-6">
        {/* LEFT: list */}
        <div>
          <div className="text-xs font-bold tracking-widest text-gray-500 mb-1">VIDEO</div>
          <h2 className="text-xl font-bold text-white mb-3">Recordings</h2>
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search titles, IDs, car models…"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white mb-3"
          />
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPage(1);
                }}
                className={`text-xs font-semibold rounded px-3 py-1.5 border ${
                  tab === t.key ? 'bg-white text-gray-900 border-white' : 'bg-gray-900 text-gray-400 border-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-500 py-12 text-center text-sm">Loading…</div>
          ) : videos.length === 0 ? (
            <div className="text-gray-500 py-12 text-center text-sm">
              {stats?.total === 0 ? 'Library empty — run a sync.' : 'No videos match.'}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedId(v.id)}
                  className={`text-left flex gap-2.5 p-2 rounded border ${
                    v.id === selectedId ? 'border-orange-500 bg-gray-900' : 'border-gray-800 hover:bg-gray-900'
                  }`}
                >
                  <div className="relative shrink-0 w-24 aspect-video rounded overflow-hidden bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={v.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute bottom-0 left-0 text-[9px] font-bold bg-black/70 text-white px-1">
                      {durationSeconds(v.duration) > 0 && durationSeconds(v.duration) <= 60 ? 'SHORT' : 'LONG'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-white line-clamp-2">{v.title}</div>
                    <div className="text-[11px] text-gray-500 font-mono truncate">[{v.youtubeId}]</div>
                    <div
                      className={`text-[11px] font-bold mt-0.5 ${
                        statusLabel(v).startsWith('UNTAGGED')
                          ? 'text-orange-400'
                          : statusLabel(v).startsWith('NEEDS')
                            ? 'text-yellow-500'
                            : 'text-gray-400'
                      }`}
                    >
                      {statusLabel(v)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
              <span>Page {page} / {totalPages}</span>
              <span className="flex gap-3">
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
                  ← Prev
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="disabled:opacity-40">
                  Next →
                </button>
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: detail */}
        {selected ? (
          <DetailPane
            key={selected.id}
            video={selected}
            stations={stations}
            slugToStation={slugToStation}
            onSave={(slugs) => saveTags(selected, slugs)}
            onSkip={() => skip(selected)}
          />
        ) : (
          <div className="text-gray-600 py-24 text-center">Select a recording to tag.</div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value?: number; accent?: boolean }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
      <div className={`text-2xl font-extrabold tabular-nums ${accent ? 'text-orange-400' : 'text-white'}`}>
        {value ?? '—'}
      </div>
      <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">{label}</div>
    </div>
  );
}

// ─── Detail pane ─────────────────────────────────────────────────────────
function DetailPane({
  video,
  stations,
  slugToStation,
  onSave,
  onSkip,
}: {
  video: AdminVideo;
  stations: StationLite[];
  slugToStation: Record<string, StationLite>;
  onSave: (slugs: string[]) => void;
  onSkip: () => void;
}) {
  const [chosen, setChosen] = useState<string[]>(() => video.stations.map((s) => s.stationSlug));
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState(false);

  const matches = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return stations.slice(0, 8);
    const out: StationLite[] = [];
    for (let i = 0; i < stations.length && out.length < 25; i++) {
      const s = stations[i];
      if (s.name.toLowerCase().includes(t) || s.slug.includes(t) || s.borough.toLowerCase().includes(t)) out.push(s);
    }
    return out;
  }, [q, stations]);

  const toggle = (slug: string) =>
    setChosen((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));

  const lines = useMemo(() => {
    const set = new Set<string>();
    chosen.forEach((slug) => slugToStation[slug]?.lines.forEach((l) => set.add(l)));
    return Array.from(set);
  }, [chosen, slugToStation]);

  const ssTags = chosen.map((s) => `ss:${s}`).join(' ');

  async function copyTags() {
    try {
      await navigator.clipboard.writeText(ssTags);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div>
      {/* NOW TAGGING */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <a
          href={`https://youtu.be/${video.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative shrink-0 w-full sm:w-80 aspect-video rounded-lg overflow-hidden bg-gray-900 block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded">
            {durationSeconds(video.duration) > 0 && durationSeconds(video.duration) <= 60 ? 'SHORT' : 'LONG'} · 16:9
          </span>
        </a>
        <div className="min-w-0">
          <div className="text-xs font-bold tracking-widest text-gray-500">NOW TAGGING</div>
          <h3 className="text-xl font-bold text-white leading-snug mt-1">{video.title}</h3>
          <div className="text-xs text-gray-500 mt-1 font-mono">
            [{video.youtubeId}] ·{' '}
            <a href={`https://youtu.be/${video.youtubeId}`} target="_blank" rel="noopener noreferrer" className="underline">
              Open on YouTube ↗
            </a>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            YouTube tag <code className="text-gray-300 bg-gray-900 px-1 rounded">{ssTags || 'ss:—'}</code>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4 flex-wrap">
        <button onClick={() => onSave(chosen)} className="bg-white text-gray-900 font-semibold text-sm rounded px-5 py-2.5">
          Save tags
        </button>
        <button onClick={copyTags} disabled={!chosen.length} className="border border-gray-700 text-gray-200 font-semibold text-sm rounded px-5 py-2.5 disabled:opacity-40">
          {copied ? 'Copied!' : 'Copy ss: tags'}
        </button>
        <button onClick={onSkip} className="border border-gray-700 text-gray-400 font-semibold text-sm rounded px-5 py-2.5">
          Skip →
        </button>
      </div>

      <hr className="my-6 border-gray-800" />

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-6">
        {/* Attach to stations */}
        <div>
          <div className="text-xs font-bold tracking-widest text-gray-500">STATION</div>
          <h3 className="text-xl font-bold text-white mb-3">Attach to stations</h3>

          {chosen.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {chosen.map((slug) => {
                const s = slugToStation[slug];
                return (
                  <span key={slug} className="inline-flex items-center gap-1.5 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white">
                    {s ? s.name : slug}
                    <span className="flex gap-0.5">{s?.lines.map((l) => <LineBadge key={l} line={l} size={14} />)}</span>
                    <button onClick={() => toggle(slug)} className="text-gray-400 hover:text-red-400 ml-0.5">×</button>
                  </span>
                );
              })}
            </div>
          )}

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search a station — name, borough, or slug…"
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2.5 text-sm text-white mb-2"
          />

          <div className="border border-gray-800 rounded divide-y divide-gray-800 max-h-96 overflow-auto">
            {matches.map((s) => {
              const on = chosen.includes(s.slug);
              return (
                <button
                  key={s.slug}
                  onClick={() => toggle(s.slug)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 hover:bg-gray-900"
                >
                  <span className={`shrink-0 w-4 h-4 rounded-sm border flex items-center justify-center text-[10px] ${on ? 'bg-white border-white text-gray-900' : 'border-gray-600'}`}>
                    {on ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-white">{s.name}</span>
                    <span className="block text-[11px] text-gray-500 font-mono">{s.slug} · {s.borough}</span>
                  </span>
                  <span className="flex gap-0.5 flex-wrap justify-end">{s.lines.map((l) => <LineBadge key={l} line={l} size={18} />)}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 mt-2 border-l-2 border-orange-500 pl-2">
            Same name, different complex. Each has its own station page.
          </p>
        </div>

        {/* Appears on */}
        <div>
          <div className="text-xs font-bold tracking-widest text-gray-500">OUTPUT</div>
          <h3 className="text-xl font-bold text-white mb-3">Appears on</h3>

          <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Station pages</div>
          <div className="mb-3">
            {chosen.length === 0 ? (
              <span className="text-xs text-gray-600">—</span>
            ) : (
              chosen.map((slug) => (
                <a key={slug} href={`/station/${slug}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-400 underline">
                  /station/{slug}
                </a>
              ))
            )}
          </div>

          <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Line pages</div>
          <div className="flex gap-1 flex-wrap mb-3 mt-1">
            {lines.length === 0 ? <span className="text-xs text-gray-600">—</span> : lines.map((l) => <LineBadge key={l} line={l} size={22} />)}
          </div>

          <div className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Blog posts</div>
          <div className="text-xs text-gray-500 mt-1">
            {video.posts.length > 0 ? `${video.posts.length} pinned` : 'None pinned'}
          </div>
        </div>
      </div>
    </div>
  );
}
