'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { BlogPost } from '@/lib/types';

interface BlogListingClientProps {
  initialPosts: BlogPost[];
  categoryCounts: Record<string, number>;
  totalPosts: number;
}

const CATEGORIES = ['GUIDES', 'CULTURE', 'HISTORY', 'TIPS'];
const EYEBROW = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';
const PILL = 'inline-flex h-[34px] items-center px-f13 text-[11px] font-bold uppercase tracking-[.08em] transition-colors';

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogListingClient({
  initialPosts,
  categoryCounts,
  totalPosts,
}: BlogListingClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const featuredPost = useMemo(() => {
    return initialPosts.find((p) => p.featured) || initialPosts[0];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    let posts = initialPosts;

    if (activeCategory) {
      posts = posts.filter((p) => p.category === activeCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(query) || p.excerpt.toLowerCase().includes(query)
      );
    }

    // The featured card is only shown with no filter/search active; only then
    // drop it from the grid to avoid duplicating it (otherwise a single post
    // would vanish from the grid entirely).
    const featuredShown = !activeCategory && !searchQuery;
    return featuredShown ? posts.filter((p) => p.id !== featuredPost?.id) : posts;
  }, [initialPosts, activeCategory, searchQuery, featuredPost]);

  const featuredShown = !activeCategory && !searchQuery;

  const pillClass = (active: boolean) =>
    `${PILL} border border-ink ${
      active ? 'bg-jet text-paper' : 'bg-paper text-ink hover:bg-seam'
    }`;

  return (
    <>
      {/* ── Controls: filter pills + search ──────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-f21 border-b border-ink pb-f21">
        <div className="flex flex-wrap gap-f8">
          <button onClick={() => setActiveCategory(null)} className={pillClass(activeCategory === null)}>
            All ({totalPosts})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={pillClass(activeCategory === cat)}
            >
              {cat.charAt(0) + cat.slice(1).toLowerCase()} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
        <input
          type="text"
          aria-label="Search articles"
          placeholder="Search articles"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-[44px] w-full max-w-[340px] border border-ink bg-paper px-f13 text-[14px] text-ink outline-none placeholder:text-muted focus:border-graphite"
        />
      </div>

      {/* ── Featured article ─────────────────────────────────── */}
      {featuredPost && featuredShown && (
        <section className="grid items-center gap-f34 md:grid-cols-[1.618fr_minmax(0,1fr)] md:gap-f55">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="relative block aspect-[16/10] overflow-hidden border border-ripstop bg-[#1C1C1C] no-underline"
            style={{ backgroundImage: 'linear-gradient(160deg,#5A5A5A 0%,#262626 45%,#0B0B0B 100%)' }}
          >
            {featuredPost.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featuredPost.featuredImage}
                alt={featuredPost.featuredImageAlt || featuredPost.title}
                className="h-full w-full object-cover"
              />
            )}
            <span className="panel-tag" aria-hidden="true" />
          </Link>

          <div className="flex flex-col gap-f21">
            <span className={`quoted ${EYEBROW} text-muted`}>
              Featured{featuredPost.category ? ` · ${featuredPost.category}` : ''}
            </span>

            <h2 className="m-0 text-[34px] font-bold leading-[42px] tracking-[-.01em] text-ink [text-wrap:balance]">
              {featuredPost.title}
            </h2>

            {featuredPost.excerpt && (
              <p className="m-0 line-clamp-3 text-[16px] leading-[26px] text-muted">
                {featuredPost.excerpt}
              </p>
            )}

            <div className="flex items-center gap-f13">
              {featuredPost.authorImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredPost.authorImage}
                  alt={featuredPost.authorName}
                  className="h-[40px] w-[40px] rounded-full object-cover"
                />
              ) : (
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ink font-bold text-paper">
                  {featuredPost.authorName.charAt(0)}
                </div>
              )}
              <span className="text-[13px] leading-[21px] text-muted">
                {featuredPost.authorName}
                {formatDate(featuredPost.publishedAt) ? ` · ${formatDate(featuredPost.publishedAt)}` : ''}
                {` · ${featuredPost.readingTimeMinutes} min read`}
              </span>
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="inline-flex h-[55px] w-fit items-center gap-f8 bg-jet px-f34 text-[13px] font-bold uppercase tracking-[.08em] text-paper no-underline transition-colors hover:bg-ink"
            >
              Read article &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* ── All articles — list ──────────────────────────────── */}
      {!(filteredPosts.length === 0 && featuredShown) && (
        <section className="flex flex-col gap-f21">
          <div className="flex items-end justify-between gap-f21">
            <div className="flex flex-col gap-f8">
              <span className={`quoted ${EYEBROW} text-muted`}>Latest</span>
              <h2 className="m-0 text-[26px] font-bold leading-[34px] text-ink">All articles</h2>
            </div>
            <span className="text-[13px] text-muted">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-f55 text-center text-muted">No articles found matching your criteria.</div>
          ) : (
            <div className="border-t border-ink">
              {filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-f21 border-b border-seam py-f21 text-ink no-underline transition-colors hover:bg-[#FAFAFA] md:grid-cols-[144px_minmax(0,1fr)_auto] md:gap-f34"
                >
                  <span
                    className="relative block aspect-[16/10] overflow-hidden bg-[#1C1C1C]"
                    style={{ backgroundImage: 'linear-gradient(160deg,#5A5A5A 0%,#262626 45%,#0B0B0B 100%)' }}
                  >
                    {post.featuredImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featuredImage}
                        alt={post.featuredImageAlt || post.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </span>

                  <span className="flex flex-col gap-f8">
                    {post.category && (
                      <span className="text-[11px] font-bold uppercase leading-[21px] tracking-[.08em] text-muted">
                        {post.category}
                      </span>
                    )}
                    <span className="text-[18px] font-bold leading-[26px] text-ink md:text-[21px]">
                      {post.title}
                    </span>
                    <span className="text-[13px] text-muted">
                      {formatDate(post.publishedAt) ? `${formatDate(post.publishedAt)} · ` : ''}
                      {post.readingTimeMinutes} min read
                    </span>
                  </span>

                  <span className="hidden text-[13px] font-bold uppercase tracking-[.08em] text-ink md:block">
                    Read &rarr;
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
