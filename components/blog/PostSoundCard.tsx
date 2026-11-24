'use client';

import { useState } from 'react';
import VideoCard from '@/components/station/VideoCard';

interface PostSoundCardProps {
  /** YouTube id lifted from the post's own embed — never guessed. */
  youtubeId: string;
  title: string;
}

/**
 * The rail's "sound" card: the recording the article embeds, playable without
 * scrolling back into the body.
 */
export default function PostSoundCard({ youtubeId, title }: PostSoundCardProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="flex flex-col gap-f13">
        <div className="aspect-video w-full border border-ink bg-jet">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <button
          type="button"
          onClick={() => setPlaying(false)}
          className="flex h-f34 w-fit items-center border border-ink px-f21 text-label font-bold uppercase text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Close player
        </button>
      </div>
    );
  }

  return (
    <VideoCard
      youtubeId={youtubeId}
      title={title}
      label="SOUND"
      meta="The recording in this post"
      onPlay={() => setPlaying(true)}
    />
  );
}
