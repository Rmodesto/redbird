'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import PostCard from './PostCard';
import type { BlogPost } from '@/lib/types';

interface BlogListingClientProps {
  initialPosts: BlogPost[];
  categoryCounts: Record<string, number>;
  totalPosts: number;
}

const CATEGORIES = ['GUIDES', 'CULTURE', 'HISTORY', 'TIPS'];
const LABEL = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';

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

  const pillClass = (active: boolean) =>
    `${LABEL} rounded-full px-f13 py-f8 transition-colors ${
      active ? 'bg-paper text-ink' : 'border border-ripstop text-graphite hover:text-paper'
    }`;

  return (
    <>
      {/* Search & Filters */}
      <section className="border-b border-ripstop">
        <div className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55">
          <input
            type="text"
            placeholder="Search articles…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-f21 w-full max-w-f377 rounded-seam border border-ripstop bg-suede px-f13 py-f8 text-paper placeholder:text-muted focus:border-graphite focus:outline-none"
          />

          <div className="flex flex-wrap gap-f8">
            <button onClick={() => setActiveCategory(null)} className={pillClass(activeCategory === null)}>
              All Posts ({totalPosts})
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
        </div>
      </section>

      {/* Featured Article */}
      {featuredPost && !activeCategory && !searchQuery && (
        <section className="mx-auto max-w-[1440px] px-f21 py-f34 md:px-f55 md:py-f55">
          <span className={`quoted ${LABEL} mb-f21 block text-graphite`}>Featured</span>

          <div className="grid overflow-hidden border border-ripstop bg-suede md:grid-cols-5">
            {featuredPost.featuredImage && (
              <div className="relative md:col-span-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.featuredImageAlt || featuredPost.title}
                  className="h-full min-h-[300px] w-full object-cover"
                />
                {featuredPost.category && (
                  <span className={`absolute left-f13 top-f13 ${LABEL} bg-tag px-f8 py-f5 text-ink`}>
                    {featuredPost.category}
                  </span>
                )}
              </div>
            )}
            <div className="flex flex-col justify-center gap-f13 p-f34 md:col-span-2">
              <div className={`flex flex-wrap items-center gap-f13 ${LABEL} text-muted`}>
                {featuredPost.publishedAt && (
                  <span>
                    {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
                <span>{featuredPost.readingTimeMinutes} min read</span>
                <span>{featuredPost.views} views</span>
              </div>

              <h2 className="m-0 text-[26px] font-bold leading-[32px] text-paper">{featuredPost.title}</h2>

              {featuredPost.excerpt && (
                <p className="m-0 line-clamp-3 text-[16px] leading-[24px] text-graphite">{featuredPost.excerpt}</p>
              )}

              <div className="flex items-center gap-f13">
                {featuredPost.authorImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredPost.authorImage} alt={featuredPost.authorName} className="h-[40px] w-[40px] rounded-full object-cover" />
                ) : (
                  <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-ripstop font-bold text-paper">
                    {featuredPost.authorName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-[14px] font-bold text-paper">{featuredPost.authorName}</div>
                  <div className={`${LABEL} text-muted`}>{featuredPost.authorRole}</div>
                </div>
              </div>

              <Link
                href={`/blog/${featuredPost.slug}`}
                className={`${LABEL} mt-f8 inline-flex w-fit items-center gap-f8 bg-paper px-f21 py-f13 text-ink no-underline transition-colors hover:bg-seam`}
              >
                Read article &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Article Grid — hidden when the only post is already the featured one */}
      {!(filteredPosts.length === 0 && !activeCategory && !searchQuery) && (
        <section className="mx-auto max-w-[1440px] px-f21 pb-f89 md:px-f55">
          <div className={`mb-f21 ${LABEL} text-graphite`}>
            Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-f55 text-center text-graphite">No articles found matching your criteria.</div>
          ) : (
            <div className="grid gap-f21 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
