'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import { STATION_COUNT } from '@/lib/constants/site';

export type NavKey = '' | 'stations' | 'lines' | 'map' | 'sounds' | 'blog' | 'history' | 'culture';

interface SiteHeaderProps {
  /** Highlights the matching item with the orange marker. */
  active?: NavKey;
}

const NAV: { key: NavKey; label: string; href: string; quoted?: boolean }[] = [
  { key: 'stations', label: 'STATIONS', href: '/stations' },
  { key: 'lines', label: 'LINES', href: '/lines' },
  { key: 'map', label: 'MAP', href: '/subway-map' },
  { key: 'sounds', label: 'SOUNDS', href: '/subway-sounds', quoted: true },
  { key: 'blog', label: 'BLOG', href: '/blog' },
  { key: 'history', label: 'HISTORY', href: '/history' },
  { key: 'culture', label: 'CULTURE', href: '/culture' },
];

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center text-paper no-underline ${compact ? 'gap-f8' : 'gap-f13'}`}
    >
      <Logo size={34} />
      <span className={`font-bold tracking-[.08em] ${compact ? 'text-label' : 'text-body'}`}>
        SUBWAY SOUNDS
      </span>
    </Link>
  );
}

export default function SiteHeader({ active = '' }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="surface-ripstop relative border-b border-ripstop font-sans text-paper">
      {/* Desktop */}
      <div className="mx-auto hidden h-f89 max-w-[1440px] items-center gap-f55 px-f55 lg:flex">
        <Wordmark />

        <nav className="flex min-w-0 flex-1 items-center gap-f34">
          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-f8 whitespace-nowrap text-label font-bold no-underline transition-colors ${
                  isActive ? 'text-paper' : 'text-graphite hover:text-paper'
                }`}
              >
                {isActive && <span aria-hidden="true" className="h-f5 w-f5 bg-tag" />}
                <span className={item.quoted ? 'quoted' : undefined}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/stations"
          className="flex h-f34 w-f233 shrink-0 items-center justify-between gap-f8 border border-ripstop bg-suede pl-f13 pr-f8 no-underline"
        >
          <span className="text-label normal-case tracking-normal text-graphite">
            Search {STATION_COUNT} stations
          </span>
          <span className="flex h-f21 w-f21 items-center justify-center border border-ripstop text-micro font-bold text-graphite">
            /
          </span>
        </Link>
      </div>

      {/* Mobile */}
      <div className="flex h-[68px] items-center justify-between gap-f13 px-f21 pb-f5 lg:hidden">
        <Wordmark compact />
        <div className="flex items-center gap-f8">
          <Link
            href="/stations"
            aria-label="Search stations"
            className="flex h-[44px] w-[44px] items-center justify-center border border-ripstop bg-suede"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#FFFFFF" strokeWidth="1.6">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l4 4" />
            </svg>
          </Link>
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-[44px] w-[44px] flex-col items-center justify-center gap-f5 border border-ripstop bg-suede"
          >
            <span className="h-[2px] w-[18px] bg-paper" />
            <span className="h-[2px] w-[18px] bg-paper" />
            <span className="h-[2px] w-[18px] bg-paper" />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-ripstop bg-jet px-f21 py-f13 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`py-f13 text-label font-bold no-underline ${
                item.key === active ? 'text-paper' : 'text-graphite'
              }`}
            >
              <span className={item.quoted ? 'quoted' : undefined}>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* Stitched edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-f5 h-f8 bg-stitch bg-repeat-x opacity-90"
      />
    </header>
  );
}
