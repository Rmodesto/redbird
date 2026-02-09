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

      {/* Analytics Placeholder */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-1">Site Analytics</h2>
        <p className="text-gray-500 text-sm mb-6">Coming Soon</p>
        <div className="h-40 flex items-center justify-center border border-dashed border-gray-700 rounded-lg">
          <p className="text-gray-600 text-sm">Chart placeholder</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
        >
          New Post
        </Link>
        <Link
          href="/admin/blog"
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          View All Posts
        </Link>
        <Link
          href="/"
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          View Site
        </Link>
      </div>

      {/* Recent Posts */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Posts</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : !recentPosts.length ? (
          <p className="text-gray-400">No posts yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post: BlogPost) => (
              <div
                key={post.id}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3"
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
