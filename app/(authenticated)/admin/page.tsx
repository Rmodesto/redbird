'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BlogPost, BlogListResponse } from '@/lib/types';

export default function AdminDashboard() {
  const [data, setData] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const posts = data?.posts ?? [];
  const totalPosts = posts.length;
  const published = posts.filter((p) => p.status === 'PUBLISHED').length;
  const drafts = posts.filter((p) => p.status === 'DRAFT').length;
  const recentPosts = posts.slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/blog/new"
          className="bg-blue-600 hover:bg-blue-500 border border-blue-500 rounded-lg p-6 transition-colors group"
        >
          <div className="text-3xl mb-2">+</div>
          <h3 className="text-lg font-semibold text-white">New Post</h3>
          <p className="text-blue-200 text-sm">Create a new blog article</p>
        </Link>

        <Link
          href="/admin/blog"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-2">&#x1F4DD;</div>
          <h3 className="text-lg font-semibold text-white">Blog Posts</h3>
          <p className="text-gray-400 text-sm">Manage all articles</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-2">&#x1F4CA;</div>
          <h3 className="text-lg font-semibold text-white">Analytics</h3>
          <p className="text-gray-400 text-sm">View site statistics</p>
        </Link>

        <Link
          href="/"
          className="bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg p-6 transition-colors"
        >
          <div className="text-3xl mb-2">&#x1F310;</div>
          <h3 className="text-lg font-semibold text-white">View Site</h3>
          <p className="text-gray-400 text-sm">Open public website</p>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Total Posts</p>
          <p className="text-3xl font-bold text-white mt-1">
            {loading ? '—' : totalPosts}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Published</p>
          <p className="text-3xl font-bold text-green-400 mt-1">
            {loading ? '—' : published}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <p className="text-gray-400 text-sm">Drafts</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">
            {loading ? '—' : drafts}
          </p>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Posts</h2>
          <Link href="/admin/blog" className="text-blue-400 hover:text-blue-300 text-sm">
            View all
          </Link>
        </div>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : !recentPosts.length ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No posts yet</p>
            <Link
              href="/admin/blog/new"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
            >
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post: BlogPost) => (
              <div
                key={post.id}
                className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      post.status === 'PUBLISHED'
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="text-white text-sm">{post.title}</span>
                </div>
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
