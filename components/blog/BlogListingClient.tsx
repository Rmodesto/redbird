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
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query)
      );
    }

    return posts.filter((p) => p.id !== featuredPost?.id);
  }, [initialPosts, activeCategory, searchQuery, featuredPost]);

  return (
    <>
      {/* Search & Filters */}
      <section className="bg-white py-8 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search */}
          <div className="relative max-w-md mb-6">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === null
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All Posts ({totalPosts})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.charAt(0) + cat.slice(1).toLowerCase()} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredPost && !activeCategory && !searchQuery && (
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
              <span className="font-medium">Featured Article</span>
            </div>

            <div className="grid md:grid-cols-5 gap-8 bg-gray-50 rounded-2xl overflow-hidden">
              {featuredPost.featuredImage && (
                <div className="md:col-span-3 relative">
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.featuredImageAlt || featuredPost.title}
                    className="w-full h-full min-h-[300px] object-cover"
                  />
                  {featuredPost.category && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                      {featuredPost.category}
                    </span>
                  )}
                </div>
              )}
              <div className="md:col-span-2 p-8 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {featuredPost.publishedAt && new Date(featuredPost.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>{featuredPost.readingTimeMinutes} min read</span>
                  <span>{featuredPost.views} views</span>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h2>

                {featuredPost.excerpt && (
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                )}

                <div className="flex items-center gap-3 mb-6">
                  {featuredPost.authorImage ? (
                    <img
                      src={featuredPost.authorImage}
                      alt={featuredPost.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                      {featuredPost.authorName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{featuredPost.authorName}</div>
                    <div className="text-sm text-gray-500">{featuredPost.authorRole}</div>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors w-fit"
                >
                  Read Article
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-sm text-gray-500 mb-6">
            Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No articles found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
