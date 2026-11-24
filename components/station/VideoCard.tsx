'use client';

export type VideoCardVariant = 'featured' | 'default' | 'short';

interface VideoCardProps {
  youtubeId: string;
  title: string;
  /** Kicker above the title — ARRIVAL, AMBIENCE, SHORT, RIDE-ALONG. */
  label?: string;
  /** Already formatted, e.g. "11:04". */
  duration?: string | null;
  /** Secondary line, e.g. "Uptown platform · Recorded Nov 2026". */
  meta?: string | null;
  variant?: VideoCardVariant;
  onPlay?: (youtubeId: string) => void;
}

const FRAME: Record<VideoCardVariant, string> = {
  featured: 'aspect-video',
  default: 'aspect-video',
  short: 'aspect-[9/16]',
};

const TITLE: Record<VideoCardVariant, string> = {
  featured: 'text-[26px] leading-[34px]',
  default: 'text-[18px] leading-[26px]',
  short: 'text-[16px] leading-[21px]',
};

/** YouTube serves a 16:9 thumbnail; shorts are cropped to fill their frame. */
function thumbnail(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function VideoCard({
  youtubeId,
  title,
  label,
  duration,
  meta,
  variant = 'default',
  onPlay,
}: VideoCardProps) {
  return (
    <button
      type="button"
      onClick={() => onPlay?.(youtubeId)}
      aria-label={`Play ${title}`}
      className="group flex w-full flex-col border border-station-ink bg-station-paper text-left transition-colors hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-station-ink focus-visible:ring-offset-2"
    >
      <div className={`relative w-full overflow-hidden bg-station-ink ${FRAME[variant]}`}>
        <img
          src={thumbnail(youtubeId)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {label && (
          <span className="absolute left-0 top-0 bg-station-ground px-[13px] py-[6px] text-[13px] font-bold uppercase leading-[21px] tracking-[.08em] text-white">
            {label}
          </span>
        )}

        {duration && (
          <span className="absolute bottom-0 right-0 bg-station-ground px-[8px] py-[4px] text-[13px] font-bold leading-[21px] tabular-nums text-white">
            {duration}
          </span>
        )}

        {/* Play affordance — the whole card is the control, this marks it. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="flex h-[55px] w-[55px] items-center justify-center bg-station-accent text-station-ground">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor" aria-hidden="true">
              <path d="M0 0l18 10L0 20z" />
            </svg>
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-[8px] p-[21px]">
        <h3 className={`m-0 font-bold tracking-[-.01em] text-station-ink ${TITLE[variant]}`}>
          {title}
        </h3>
        {meta && <p className="m-0 text-[13px] leading-[21px] text-station-muted">{meta}</p>}
      </div>
    </button>
  );
}
