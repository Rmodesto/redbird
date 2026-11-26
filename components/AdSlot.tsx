'use client';

import { useEffect, useRef } from 'react';

interface AdSlotProps {
  /** Controls the reserved min-height so the unit doesn't shift layout when it fills. */
  size?: 'banner' | 'square' | 'leaderboard' | 'mobile_banner';
  /** AdSense ad-unit slot id. Optional — without it the unit renders as a responsive auto ad. */
  slot?: string;
  className?: string;
}

// Single gate for the whole site. Format: ca-pub-XXXXXXXXXXXXXXXX.
// When unset, every AdSlot renders null — no box, no label, no reserved space.
const AD_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

const minHeights: Record<NonNullable<AdSlotProps['size']>, string> = {
  banner: 'min-h-24 md:min-h-32',
  square: 'min-h-[250px] max-w-xs',
  leaderboard: 'min-h-20',
  mobile_banner: 'min-h-16 md:min-h-24',
};

export default function AdSlot({ size = 'banner', slot, className = '' }: AdSlotProps) {
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!AD_CLIENT) return;
    try {
      ((window as unknown as Record<string, unknown[]>).adsbygoogle =
        (window as unknown as Record<string, unknown[]>).adsbygoogle || []).push({});
    } catch {
      // adsbygoogle.js not loaded yet
    }
  }, []);

  // No publisher id configured → render nothing at all.
  if (!AD_CLIENT) return null;

  return (
    <div className={`flex w-full flex-col items-center ${minHeights[size]} ${className}`}>
      {/* AdSense permits only "Advertisements" or "Sponsored Links" as a label. */}
      <span className="mb-1 text-[10px] uppercase tracking-wide text-gray-400">Advertisements</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
        ref={insRef}
      />
    </div>
  );
}
