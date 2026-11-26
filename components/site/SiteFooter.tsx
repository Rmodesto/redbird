'use client';

import Link from 'next/link';
import Logo from './Logo';

interface SiteFooterProps {
  onOpenCookieSettings?: () => void;
}

const COLUMNS: { title: string; links: { label: string; href?: string; action?: 'cookies' }[] }[] = [
  {
    title: 'EXPLORE',
    links: [
      { label: 'Subway Lines', href: '/lines' },
      { label: 'Stations', href: '/stations' },
      { label: 'Interactive Map', href: '/subway-map' },
      { label: 'Subway Sounds', href: '/subway-sounds' },
    ],
  },
  {
    title: 'READ',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'History', href: '/history' },
      { label: 'Culture', href: '/culture' },
      { label: 'Operations', href: '/operations' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Preferences', action: 'cookies' },
      { label: 'info@subwaysounds.net', href: 'mailto:info@subwaysounds.net' },
    ],
  },
];

export default function SiteFooter({ onOpenCookieSettings }: SiteFooterProps) {
  const linkClass =
    'text-body text-graphite no-underline transition-colors hover:text-paper text-left';

  const columns = COLUMNS.map((col) => (
    <div key={col.title} className="flex flex-col gap-f21">
      <span className="quoted text-label font-bold text-paper">{col.title}</span>
      <div className="flex flex-col gap-f8">
        {col.links.map((l) =>
          l.action === 'cookies' ? (
            <button key={l.label} type="button" onClick={onOpenCookieSettings} className={linkClass}>
              {l.label}
            </button>
          ) : (
            <Link key={l.label} href={l.href ?? '#'} className={linkClass}>
              {l.label}
            </Link>
          )
        )}
      </div>
    </div>
  ));

  const brand = (
    <div className="flex max-w-f377 flex-col gap-f21">
      <Link href="/" className="flex items-center gap-f13 text-paper no-underline">
        <Logo size={34} />
        <span className="text-body font-bold tracking-[.08em]">SUBWAY SOUNDS</span>
      </Link>
      <p className="m-0 text-body text-graphite">
        Your comprehensive guide to NYC subway stations, real-time arrivals, and subway culture.
      </p>
      <p className="m-0 text-label normal-case tracking-normal text-graphite">
        Subway Sounds Media LLC
        <br />
        New York City, USA
      </p>
    </div>
  );

  const legal = (
    <>
      <span className="whitespace-nowrap text-graphite">
        © 2026 Subway Sounds Media LLC. All rights reserved.
      </span>
      <span className="max-w-f610 text-graphite lg:text-right">
        This site displays Google AdSense advertisements and may contain affiliate links. By using
        this site, you agree to our Privacy Policy and Terms of Service.
      </span>
    </>
  );

  return (
    <footer className="surface-suede-grid relative border-t border-ripstop font-sans text-graphite">
      {/* Desktop */}
      <div className="mx-auto hidden max-w-[1440px] flex-col gap-f55 px-f55 pb-f55 pt-f89 lg:flex">
        <div className="grid grid-cols-[minmax(0,1.618fr)_repeat(3,minmax(0,1fr))] gap-f55">
          {brand}
          {columns}
        </div>

        {/* Oversized ghost wordmark, cut off by the frame */}
        <div
          aria-hidden="true"
          className="quoted overflow-hidden whitespace-nowrap text-mega font-bold text-ripstop"
        >
          SUBWAY SOUNDS
        </div>

        <div className="flex items-start justify-between gap-f55 border-t border-ripstop pt-f21 text-label normal-case tracking-normal">
          {legal}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-f34 px-f21 pb-f34 pt-f55 lg:hidden">
        <div className="flex flex-col gap-f13">
          <Link href="/" className="flex items-center gap-f8 text-paper no-underline">
            <Logo size={34} />
            <span className="text-label font-bold tracking-[.08em]">SUBWAY SOUNDS</span>
          </Link>
          <p className="m-0 text-body text-graphite">
            Your comprehensive guide to NYC subway stations, real-time arrivals, and subway culture.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-f21 gap-y-f34">{columns}</div>
        <div className="flex flex-col gap-f13 border-t border-ripstop pt-f21 text-label normal-case tracking-normal">
          {legal}
        </div>
      </div>
    </footer>
  );
}
