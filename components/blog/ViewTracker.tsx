'use client';

import { useEffect, useRef } from 'react';

interface ViewTrackerProps {
  postId: string;
}

export default function ViewTracker({ postId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // Fire and forget view tracking
    fetch(`/api/blog/${postId}/view`, { method: 'POST' }).catch(() => {
      // Silently ignore errors
    });
  }, [postId]);

  return null;
}
