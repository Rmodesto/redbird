'use client';

import { useEffect, useState, useMemo } from 'react';

interface Video {
  id: string;
  title: string;
  duration: number;
  lifetimeViews: number;
  likes: number;
}

type ViewMode = 'grid' | 'list';
type SortKey = 'title' | 'lifetimeViews' | 'duration';
type TypeFilter = 'all' | 'shorts' | 'videos' | 'longform';

function formatDuration(secs: number): string {
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m`;
}

function VideoCard({ video, playing, onPlay }: { video: Video; playing: boolean; onPlay: () => void }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden group">
      <div className="relative aspect-video bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <button onClick={onPlay} className="absolute inset-0 w-full h-full cursor-pointer">
            <img
              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-500 transition-colors">
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white text-sm font-medium truncate" title={video.title}>{video.title}</h3>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
          <span>{video.lifetimeViews.toLocaleString()} views</span>
          <span>{video.likes} likes</span>
          <span className={`px-1.5 py-0.5 rounded ${
            video.duration <= 60 ? 'bg-blue-900/40 text-blue-400' :
            video.duration > 3600 ? 'bg-purple-900/40 text-purple-400' :
            'bg-gray-800 text-gray-500'
          }`}>
            {video.duration <= 60 ? 'Short' : video.duration > 3600 ? 'Long' : 'Video'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UnlistedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortKey, setSortKey] = useState<SortKey>('lifetimeViews');
  const [sortAsc, setSortAsc] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/unlisted-videos')
      .then(r => r.json())
      .then(d => setVideos(d.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let vids = [...videos];

    if (typeFilter === 'shorts') vids = vids.filter(v => v.duration <= 60);
    else if (typeFilter === 'videos') vids = vids.filter(v => v.duration > 60 && v.duration <= 3600);
    else if (typeFilter === 'longform') vids = vids.filter(v => v.duration > 3600);

    if (search) {
      const q = search.toLowerCase();
      vids = vids.filter(v => v.title.toLowerCase().includes(q));
    }

    vids.sort((a, b) => {
      const av = sortKey === 'title' ? a.title.toLowerCase() : a[sortKey];
      const bv = sortKey === 'title' ? b.title.toLowerCase() : b[sortKey];
      return sortAsc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });

    return vids;
  }, [videos, typeFilter, search, sortKey, sortAsc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading unlisted videos...</div>
      </div>
    );
  }

  const shorts = videos.filter(v => v.duration <= 60).length;
  const vids = videos.filter(v => v.duration > 60 && v.duration <= 3600).length;
  const long = videos.filter(v => v.duration > 3600).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Unlisted Videos</h1>
        <p className="text-gray-400 text-sm mt-1">
          {videos.length} videos — {shorts} Shorts, {vids} Videos, {long} Long-form
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 w-48 focus:outline-none focus:border-gray-500"
          />

          {/* Type filter */}
          <div className="flex gap-1">
            {([['all', 'All'], ['shorts', 'Shorts'], ['videos', 'Videos'], ['longform', 'Long']] as [TypeFilter, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={`px-3 py-1.5 text-xs rounded transition-colors ${
                  typeFilter === key ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as SortKey)}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:outline-none"
          >
            <option value="lifetimeViews">Views</option>
            <option value="duration">Duration</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="bg-gray-800 text-gray-400 hover:text-white px-2 py-1.5 rounded text-xs"
          >
            {sortAsc ? '▲ Asc' : '▼ Desc'}
          </button>

          {/* View mode */}
          <div className="flex gap-1 border border-gray-700 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1.5 text-xs ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-gray-500 text-xs">{filtered.length} videos</p>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(v => (
            <VideoCard
              key={v.id}
              video={v}
              playing={playingId === v.id}
              onPlay={() => setPlayingId(v.id)}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filtered.map(v => (
            <div
              key={v.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center gap-4 hover:bg-gray-800/50 transition-colors"
            >
              <button
                onClick={() => setPlayingId(playingId === v.id ? null : v.id)}
                className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-black"
              >
                {playingId === v.id ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                      alt={v.title}
                      className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-sm font-medium truncate">{v.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>{v.lifetimeViews.toLocaleString()} views</span>
                  <span>{v.likes} likes</span>
                  <span>{formatDuration(v.duration)}</span>
                  <span className={`px-1.5 py-0.5 rounded ${
                    v.duration <= 60 ? 'bg-blue-900/40 text-blue-400' :
                    v.duration > 3600 ? 'bg-purple-900/40 text-purple-400' :
                    'bg-gray-800 text-gray-500'
                  }`}>
                    {v.duration <= 60 ? 'Short' : v.duration > 3600 ? 'Long' : 'Video'}
                  </span>
                </div>
              </div>
              <a
                href={`https://youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-white text-xs flex-shrink-0"
              >
                Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
