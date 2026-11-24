interface LogoProps {
  /** Rendered size in px. The mark is drawn on a 32×32 grid. */
  size?: number;
  className?: string;
}

/**
 * The Subway Sounds mark: a white panel carrying a lowercase "ss", with the
 * orange tag breaking its bottom-right corner — the same panel-and-tag
 * language the pages use.
 *
 * Inlined rather than linked so it costs no request and inherits no caching
 * surprises. Kept in sync with public/favicon.svg, which is the same artwork.
 *
 * Note the orange is #FF8200, the brand asset's own value — slightly warmer
 * than the `tag` token (#F7931E) used for panel tags. The mark keeps its own.
 */
export default function Logo({ size = 34, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Subway Sounds"
      className={className}
    >
      <rect x="0" y="2.5" width="27" height="27" fill="#FFFFFF" />
      <g fill="#0B0B0B" stroke="#0B0B0B" strokeWidth="0.25" strokeLinejoin="round">
        <path d="M9.42 10A3.6 3.6 0 0 0 9.42 17.2L9.42 14.8A1.2 1.2 0 0 1 9.42 12.4Z" />
        <path d="M9.42 12.4H13.26V10H9.42Z" />
        <path d="M9.408 17.2H9.672V14.8H9.408Z" />
        <path d="M9.66 22A3.6 3.6 0 0 0 9.66 14.8L9.66 17.2A1.2 1.2 0 0 1 9.66 19.6Z" />
        <path d="M5.82 22H9.66V19.6H5.82Z" />
        <path d="M17.34 10A3.6 3.6 0 0 0 17.34 17.2L17.34 14.8A1.2 1.2 0 0 1 17.34 12.4Z" />
        <path d="M17.34 12.4H21.18V10H17.34Z" />
        <path d="M17.328 17.2H17.592V14.8H17.328Z" />
        <path d="M17.58 22A3.6 3.6 0 0 0 17.58 14.8L17.58 17.2A1.2 1.2 0 0 1 17.58 19.6Z" />
        <path d="M13.74 22H17.58V19.6H13.74Z" />
      </g>
      <rect x="23" y="19.5" width="9" height="6" fill="#FF8200" />
    </svg>
  );
}
