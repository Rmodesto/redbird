'use client';

import { useEffect, useRef } from 'react';
import type { AdSlotProps } from '@/lib/types';

const SLOT_SIZES: Record<AdSlotProps['placement'], { width: number; height: number }> = {
  'blog-header': { width: 728, height: 90 },
  'blog-inline': { width: 336, height: 280 },
  'blog-sidebar': { width: 300, height: 250 },
  'blog-footer': { width: 728, height: 90 },
};

export default function AdSlot({ placement, className }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const enabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true';
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  useEffect(() => {
    if (!enabled || !pubId || !adRef.current) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, [enabled, pubId]);

  if (!enabled || !pubId) return null;

  const size = SLOT_SIZES[placement];

  return (
    <div className={`flex justify-center ${className || ''}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: size.width, height: size.height }}
        data-ad-client={pubId}
        data-ad-slot={placement}
        ref={adRef as unknown as React.RefObject<HTMLModElement>}
      />
    </div>
  );
}
