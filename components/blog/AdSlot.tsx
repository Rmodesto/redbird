'use client';

import { useEffect, useRef } from 'react';
import type { AdSlotProps } from '@/lib/types';

const SLOT_SIZES: Record<AdSlotProps['placement'], { width: number; height: number }> = {
  'blog-header': { width: 728, height: 90 },
  'blog-inline': { width: 336, height: 280 },
  'blog-sidebar': { width: 300, height: 250 },
  'blog-footer': { width: 728, height: 90 },
};

// Single site-wide gate, shared with components/AdSlot.tsx (ca-pub-XXXXXXXXXXXXXXXX).
const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSlot({ placement, className }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!AD_CLIENT || !adRef.current) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  if (!AD_CLIENT) return null;

  const size = SLOT_SIZES[placement];

  return (
    <div className={`flex flex-col items-center ${className || ''}`}>
      <span className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Advertisements</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: size.width, height: size.height }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={placement}
        ref={adRef as unknown as React.RefObject<HTMLModElement>}
      />
    </div>
  );
}
