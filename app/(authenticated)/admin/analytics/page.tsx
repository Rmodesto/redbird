'use client';

import { useEffect, useState, useMemo } from 'react';

interface MonthlyData {
  month: string;
  views: number;
  watchMinutes: number;
  watchHours: number;
}

interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  duration: number;
  lifetimeViews: number;
  lifetimeLikes: number;
  lifetimeComments: number;
  yearViews: number;
  yearWatchMins: number;
  yearSubsGained: number;
  yearSubsLost: number;
}

interface AnalyticsData {
  generatedAt: string;
  source: string;
  channel: {
    allTime: { views: number; watchMinutes: number; watchHours: number; subsGained: number; subsLost: number };
    last365: { views: number; watchMinutes: number; watchHours: number; subsGained: number; subsLost: number };
  };
  monthly: MonthlyData[];
  totalVideos: number;
  totalShorts: number;
  totalLongForm: number;
  videosUnder100Views: number;
  unlistedCount: number;
  videos: VideoData[];
}

type SortKey = 'lifetimeViews' | 'yearViews' | 'yearWatchMins' | 'yearSubsGained' | 'lifetimeLikes' | 'duration' | 'title';
type VideoFilter = 'all' | 'shorts' | 'longform';

function StatCard({ label, value, sub, color = 'white' }: { label: string; value: string; sub?: string; color?: string }) {
  const colorClass = {
    green: 'text-green-400', red: 'text-red-400', yellow: 'text-yellow-400', blue: 'text-blue-400', white: 'text-white',
  }[color] || 'text-white';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({ data, dataKey, label, color }: { data: MonthlyData[]; dataKey: 'views' | 'watchHours'; label: string; color: string }) {
  if (!data.length) return null;
  const values = data.map(d => dataKey === 'watchHours' ? d.watchHours : d[dataKey]);
  const max = Math.max(...values);
  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <h3 className="text-white font-semibold mb-4">{label}</h3>
      <div className="flex items-end gap-1.5 h-40">
        {data.map((d, i) => {
          const val = dataKey === 'watchHours' ? d.watchHours : d[dataKey];
          const pct = max > 0 ? (val / max) * 100 : 0;
          const monthNum = parseInt(d.month.substring(5));
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full relative group cursor-default" style={{ height: '160px', display: 'flex', alignItems: 'flex-end' }}>
                <div
                  className={`w-full rounded-t ${color} transition-all hover:opacity-80`}
                  style={{ height: `${Math.max(pct, 2)}%`, minHeight: '2px' }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10 border border-gray-700">
                  {val.toLocaleString()}{dataKey === 'watchHours' ? ' hrs' : ''}
                </div>
              </div>
              <span className="text-[10px] text-gray-500">{monthNames[monthNum]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m${secs % 60 ? ` ${secs % 60}s` : ''}`;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h${m ? ` ${m}m` : ''}`;
}

function VideoType({ duration }: { duration: number }) {
  const type = duration <= 60 ? 'Short' : duration > 3600 ? 'Long' : 'Video';
  const cls = type === 'Short' ? 'bg-blue-900/50 text-blue-300' :
    type === 'Long' ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-400';
  return <span className={`text-xs px-2 py-0.5 rounded ${cls}`}>{type}</span>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('yearViews');
  const [sortAsc, setSortAsc] = useState(false);
  const [filter, setFilter] = useState<VideoFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    fetch('/api/youtube-analytics')
      .then(res => res.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredVideos = useMemo(() => {
    if (!data?.videos) return [];
    let vids = [...data.videos];

    if (filter === 'shorts') vids = vids.filter(v => v.duration <= 60);
    else if (filter === 'longform') vids = vids.filter(v => v.duration > 60);

    if (search) {
      const q = search.toLowerCase();
      vids = vids.filter(v => v.title.toLowerCase().includes(q));
    }

    vids.sort((a, b) => {
      const aVal = sortKey === 'title' ? a.title.toLowerCase() : a[sortKey];
      const bVal = sortKey === 'title' ? b.title.toLowerCase() : b[sortKey];
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

    return vids;
  }, [data, sortKey, sortAsc, filter, search]);

  const paginatedVideos = filteredVideos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filteredVideos.length / PAGE_SIZE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(0);
  }

  function SortHeader({ label, sortField, className = '' }: { label: string; sortField: SortKey; className?: string }) {
    const active = sortKey === sortField;
    return (
      <th
        className={`pb-2 pr-3 cursor-pointer select-none hover:text-gray-200 transition-colors ${active ? 'text-white' : 'text-gray-400'} ${className}`}
        onClick={() => handleSort(sortField)}
      >
        {label} {active ? (sortAsc ? '▲' : '▼') : ''}
      </th>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h2 className="text-red-400 font-semibold mb-2">Error loading analytics</h2>
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { channel, monthly, totalVideos, totalShorts, totalLongForm, videosUnder100Views, unlistedCount } = data;
  const netSubsYear = channel.last365.subsGained - channel.last365.subsLost;

  // Aggregate stats from video data
  const totalYearSubs = data.videos?.reduce((s, v) => s + v.yearSubsGained, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">YouTube Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">
            Subway Sounds
            {data.source === 'cache' && <span className="text-yellow-500 ml-2">(cached)</span>}
          </p>
        </div>
        <p className="text-gray-500 text-xs">
          {new Date(data.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* All-Time Stats */}
      <div>
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">All Time</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Views" value={channel.allTime.views.toLocaleString()} />
          <StatCard label="Watch Time" value={channel.allTime.watchHours.toLocaleString() + ' hrs'} sub={`${Math.round(channel.allTime.watchMinutes / 60 / 24).toLocaleString()} days of viewing`} color="blue" />
          <StatCard label="Net Subscribers" value={(channel.allTime.subsGained - channel.allTime.subsLost).toLocaleString()} sub={`+${channel.allTime.subsGained.toLocaleString()} / -${channel.allTime.subsLost.toLocaleString()}`} color="green" />
          <StatCard label="Active Videos" value={totalVideos.toLocaleString()} sub={`${totalShorts} Shorts / ${totalLongForm} Long-form`} />
          <StatCard label="Unlisted" value={unlistedCount.toString()} sub={`${videosUnder100Views} active < 100 views`} color="yellow" />
        </div>
      </div>

      {/* Last 365 Days */}
      <div>
        <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Last 365 Days</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Views" value={channel.last365.views.toLocaleString()} />
          <StatCard label="Watch Time" value={channel.last365.watchHours.toLocaleString() + ' hrs'} color="blue" />
          <StatCard label="Net Subscribers" value={`+${netSubsYear.toLocaleString()}`} color="green" />
          <StatCard label="Avg Monthly Views" value={Math.round(channel.last365.views / 12).toLocaleString()} sub={`${Math.round(channel.last365.watchHours / 12).toLocaleString()} hrs/mo`} />
        </div>
      </div>

      {/* Monthly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={monthly} dataKey="views" label="Monthly Views" color="bg-blue-500" />
        <BarChart data={monthly} dataKey="watchHours" label="Monthly Watch Hours" color="bg-emerald-500" />
      </div>

      {/* Full Video Table */}
      {data.videos?.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="text-white font-semibold">All Videos ({filteredVideos.length})</h3>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search titles..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-gray-500"
              />
              <div className="flex gap-1">
                {(['all', 'shorts', 'longform'] as VideoFilter[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setPage(0); }}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'shorts' ? 'Shorts' : 'Long-form'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase border-b border-gray-800">
                  <SortHeader label="Title" sortField="title" className="text-left" />
                  <th className="pb-2 pr-3 text-left text-gray-400">Type</th>
                  <SortHeader label="Views" sortField="lifetimeViews" className="text-right" />
                  <SortHeader label="Yr Views" sortField="yearViews" className="text-right" />
                  <SortHeader label="Yr Watch" sortField="yearWatchMins" className="text-right" />
                  <SortHeader label="Yr Subs" sortField="yearSubsGained" className="text-right" />
                  <SortHeader label="Likes" sortField="lifetimeLikes" className="text-right" />
                  <SortHeader label="Duration" sortField="duration" className="text-right" />
                </tr>
              </thead>
              <tbody>
                {paginatedVideos.map(v => (
                  <tr key={v.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                    <td className="py-2 pr-3">
                      <a
                        href={`https://youtube.com/watch?v=${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-white truncate block max-w-[350px]"
                        title={v.title}
                      >
                        {v.title}
                      </a>
                    </td>
                    <td className="py-2 pr-3"><VideoType duration={v.duration} /></td>
                    <td className="py-2 pr-3 text-right text-gray-400 tabular-nums">{v.lifetimeViews.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right text-gray-400 tabular-nums">{v.yearViews.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right text-gray-400 tabular-nums">{(v.yearWatchMins / 60).toFixed(1)}h</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {v.yearSubsGained > 0 ? (
                        <span className="text-green-400">+{v.yearSubsGained}</span>
                      ) : (
                        <span className="text-gray-600">0</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right text-gray-400 tabular-nums">{v.lifetimeLikes.toLocaleString()}</td>
                    <td className="py-2 text-right text-gray-500 tabular-nums">{formatDuration(v.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
              <p className="text-gray-500 text-xs">
                Showing {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filteredVideos.length)} of {filteredVideos.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="text-gray-500 text-xs leading-7">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-1 text-xs rounded bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
