'use client';

import Link from 'next/link';
import { useState } from 'react';
import VideoCard from '@/components/station/VideoCard';

export interface HomeVideo {
  id: string;
  youtubeId: string;
  title: string;
  /** Kicker. Derived from the video's own tags — never invented. */
  label: string;
  /** Already formatted, e.g. "4:12". */
  duration: string | null;
  /** Station · borough · upload date, assembled from real records only. */
  meta: string | null;
}

interface HomeVideoSectionsProps {
  featured: HomeVideo | null;
  /** The two cards stacked beside the featured one. */
  rest: HomeVideo[];
  shorts: HomeVideo[];
}

function SectionHead({
  eyebrow,
  title,
  href,
  linkLabel,
  shortLinkLabel,
  rule = false,
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel: string;
  shortLinkLabel: string;
  rule?: boolean;
}) {
  return (
    <div
      className={`flex items-end justify-between gap-f21 lg:gap-f34 ${
        rule ? 'border-b border-ink pb-f13 lg:pb-f21' : ''
      }`}
    >
      <div className="flex min-w-0 flex-col gap-f5 lg:gap-f8">
        <span className="quoted text-label font-bold text-muted">{eyebrow}</span>
        <h2 className="m-0 text-h3 font-bold text-ink lg:text-h2 lg:tracking-[-.01em]">{title}</h2>
      </div>
      <Link
        href={href}
        className="whitespace-nowrap text-label font-bold text-ink no-underline transition-colors hover:text-muted"
      >
        <span className="lg:hidden">{shortLinkLabel} &rarr;</span>
        <span className="hidden lg:inline">{linkLabel} &rarr;</span>
      </Link>
    </div>
  );
}

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-seam p-f34 text-center lg:p-f55">
      <p className="m-0 text-body text-muted lg:text-body-lg">{children}</p>
    </div>
  );
}

export default function HomeVideoSections({ featured, rest, shorts }: HomeVideoSectionsProps) {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <>
      {/* ── New uploads ─────────────────────────────────────────── */}
      <section className="flex flex-col gap-f21 lg:gap-f34">
        <SectionHead
          eyebrow="LATEST"
          title="New uploads"
          href="/subway-sounds"
          linkLabel="VIEW LIBRARY"
          shortLinkLabel="ALL"
          rule
        />

        {playing ? (
          <div className="flex flex-col items-start gap-f13">
            <div className="aspect-video w-full border border-ink bg-jet">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing}?autoplay=1&rel=0`}
                title="Subway recording"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <button
              type="button"
              onClick={() => setPlaying(null)}
              className="border border-ink px-f21 py-f8 text-label font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              CLOSE PLAYER
            </button>
          </div>
        ) : featured ? (
          <div className="grid grid-cols-1 gap-f21 lg:grid-cols-golden lg:gap-f55">
            <VideoCard
              variant="featured"
              youtubeId={featured.youtubeId}
              title={featured.title}
              label={featured.label}
              duration={featured.duration}
              meta={featured.meta}
              onPlay={setPlaying}
            />
            {rest.length > 0 && (
              <div className="flex flex-col gap-f21 lg:gap-f34">
                {rest.map((v) => (
                  <VideoCard
                    key={v.id}
                    youtubeId={v.youtubeId}
                    title={v.title}
                    label={v.label}
                    duration={v.duration}
                    meta={v.meta}
                    onPlay={setPlaying}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyBlock>No recordings published yet.</EmptyBlock>
        )}
      </section>

      {/* ── Shorts ──────────────────────────────────────────────── */}
      {shorts.length > 0 && (
        <section className="flex flex-col gap-f21 lg:gap-f34">
          <SectionHead
            eyebrow="SHORT"
            title="Shorts"
            href="/subway-sounds"
            linkLabel="ALL SHORTS"
            shortLinkLabel="ALL"
          />
          <div className="-mr-f21 flex gap-f13 overflow-x-auto pr-f21 pt-f8 lg:mr-0 lg:grid lg:grid-cols-5 lg:gap-f21 lg:overflow-visible lg:pr-0 lg:pt-0">
            {shorts.map((v) => (
              <div key={v.id} className="w-[144px] shrink-0 lg:w-auto">
                <VideoCard
                  variant="short"
                  youtubeId={v.youtubeId}
                  title={v.title}
                  label={v.label}
                  duration={v.duration}
                  meta={v.meta}
                  onPlay={setPlaying}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
