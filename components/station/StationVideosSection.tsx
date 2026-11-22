'use client';

import { useState, useEffect, useCallback } from 'react';

interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string | null;
  duration: string | null;
}

interface StationVideosSectionProps {
  stationSlug: string;
}

function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = match[1] ? `${match[1]}:` : '';
  const m = match[2] || '0';
  const s = (match[3] || '0').padStart(2, '0');
  return h ? `${h}${m.padStart(2, '0')}:${s}` : `${m}:${s}`;
}

export function StationVideosSection({ stationSlug }: StationVideosSectionProps) {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await fetch(`/api/videos/station/${stationSlug}`);
      if (!response.ok) return;
      const data = await response.json();
      setVideos(data.videos || []);
    } catch {
      // Silently fail — no videos is fine
    } finally {
      setLoading(false);
    }
  }, [stationSlug]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) {
    return (
      <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
          <span className="text-3xl">🎬</span>
          STATION VIDEOS
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </section>
    );
  }

  if (!videos.length) return null;

  return (
    <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900">
        <span className="text-3xl">🎬</span>
        STATION VIDEOS
      </h2>

      {selectedVideo && (
        <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1`}
            title="Station video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {videos.map((video) => (
          <button
            key={video.id}
            onClick={() =>
              setSelectedVideo(selectedVideo === video.youtubeId ? null : video.youtubeId)
            }
            className={`group relative rounded-lg overflow-hidden border-2 transition-all text-left ${
              selectedVideo === video.youtubeId
                ? 'border-red-600 ring-2 ring-red-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="aspect-video relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
              {video.duration && (
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">
                {video.title}
              </h3>
              {video.publishedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default StationVideosSection;
