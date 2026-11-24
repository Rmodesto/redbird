'use client';

import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  title: string;
}

interface ArticleRailProps {
  items: TocItem[];
  /** id of the element the progress bar measures. */
  targetId: string;
}

/**
 * "In this post" — the table of contents for the article, with a lace progress
 * bar tracking how far through the body the reader is. Headings are read from
 * the published post itself; nothing is listed that is not in the article.
 */
export default function ArticleRail({ items, targetId }: ArticleRailProps) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        if (scrollable > 0) {
          setProgress(Math.min(1, Math.max(0, -rect.top / scrollable)));
        } else {
          setProgress(rect.bottom <= window.innerHeight ? 1 : 0);
        }
      }

      let current = items[0]?.id ?? null;
      for (const item of items) {
        const heading = document.getElementById(item.id);
        if (heading && heading.getBoundingClientRect().top <= window.innerHeight / 3) {
          current = item.id;
        }
      }
      setActive(current);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [items, targetId]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="In this post" className="flex flex-col gap-f13">
      <span className="quoted text-label font-bold uppercase text-muted">In this post</span>
      <div className="h-f3 w-full bg-seam">
        <div
          className="surface-lace h-f3 transition-[width] duration-150"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {items.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={item.id === active ? 'true' : undefined}
          className={`flex gap-f13 border-b border-seam py-f8 text-body leading-[21px] no-underline transition-colors ${
            item.id === active ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          <span className="shrink-0 text-label font-bold tabular-nums text-muted">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0">{item.title}</span>
        </a>
      ))}
    </nav>
  );
}
