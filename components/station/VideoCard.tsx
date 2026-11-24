'use client';

export type VideoCardVariant = 'featured' | 'default' | 'short';

interface VideoCardProps {
  youtubeId: string;
  title: string;
  /** Kicker shown in the smoke bar. Rendered inside quotes. */
  label?: string;
  /** Already formatted, e.g. "4:12". */
  duration?: string | null;
  /** Secondary line under the title, e.g. "Queensboro Plaza · Queens". */
  meta?: string | null;
  variant?: VideoCardVariant;
  onPlay?: (youtubeId: string) => void;
}

/** YouTube serves 16:9; the short frame crops it. */
function thumbnail(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function VideoCard({
  youtubeId,
  title,
  label = 'AMBIENCE',
  duration,
  meta,
  variant = 'default',
  onPlay,
}: VideoCardProps) {
  const featured = variant === 'featured';
  const short = variant === 'short';

  // The smoke bar is taller on the featured card to seat the play block.
  const barHeight = featured ? 'h-f55' : 'h-f34';
  const barPad = featured ? 'pl-f34 pr-f13' : short ? 'pl-f8 pr-f5' : 'pl-f13 pr-f8';

  return (
    <button
      type="button"
      onClick={() => onPlay?.(youtubeId)}
      aria-label={`Play ${title}`}
      className={`group flex min-w-0 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-tag focus-visible:ring-offset-2 ${
        featured ? 'gap-f21' : 'gap-f13'
      }`}
    >
      <div
        className={`relative border border-jet bg-jet ${short ? 'aspect-[9/16]' : 'aspect-video'}`}
      >
        <img
          src={thumbnail(youtubeId)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Black corner tab — the card reads as a filed card */}
        <span
          aria-hidden="true"
          className={`absolute bg-jet ${featured ? '-top-f8 right-f21 h-f8 w-f34' : '-top-[6px] right-f13 h-[6px] w-f21'}`}
        />

        {/* Featured carries a stitched spine down its left edge */}
        {featured && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-f13 top-0 w-f8 bg-stitch bg-repeat-y opacity-90"
          />
        )}

        <span
          className={`absolute text-micro font-bold text-graphite ${
            featured ? 'left-f34 top-f13' : 'left-f13 top-f8'
          }`}
        >
          {short ? '9:16' : 'VIDEO STILL'}
        </span>

        {/* Smoke bar */}
        <div
          className={`surface-smoke absolute inset-x-0 bottom-0 flex items-center justify-between ${barHeight} ${barPad} ${
            short ? 'gap-f5' : featured ? 'gap-f13' : 'gap-f8'
          }`}
        >
          <div className="flex min-w-0 items-center gap-f13">
            {featured && (
              <span
                aria-hidden="true"
                className="flex h-f34 w-f34 shrink-0 items-center justify-center bg-jet"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#FFFFFF" aria-hidden="true">
                  <path d="M1 0l10 6-10 6z" />
                </svg>
              </span>
            )}
            <span className="quoted whitespace-nowrap text-label font-bold text-paper">{label}</span>
          </div>

          {duration && (
            <span
              className={`surface-lace flex h-f21 items-center border border-jet text-label font-bold tabular-nums text-paper ${
                short ? 'px-f5' : 'px-f8'
              }`}
            >
              {duration}
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-col ${featured ? 'gap-f8' : short ? 'gap-f3' : 'gap-f5'}`}>
        <h3
          className={`m-0 font-bold text-ink [text-wrap:pretty] ${
            featured ? 'text-h3 tracking-[-.01em]' : 'text-body font-bold leading-[21px]'
          }`}
        >
          {title}
        </h3>
        {meta && (
          <p className={`m-0 text-muted ${featured ? 'text-body' : 'text-label normal-case tracking-normal'}`}>
            {meta}
          </p>
        )}
      </div>
    </button>
  );
}
