'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { BlogPost, BlogListResponse } from '@/lib/types';

export default function AdminBlogDashboard() {
  const [data, setData] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  async function togglePublish(post: BlogPost) {
    await fetch(`/api/blog/${post.id}/publish`, { method: 'PATCH' });
    const res = await fetch('/api/blog');
    setData(await res.json());
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/blog/${id}`, { method: 'DELETE' });
    const res = await fetch('/api/blog');
    setData(await res.json());
  }

  if (loading) return <p className="text-gray-400">Loading...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          New Post
        </Link>
      </div>

      {!data?.posts.length ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="py-3 pr-4">Title</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Date</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-800/50">
                  <td className="py-3 pr-4 text-white">{post.title}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-yellow-900/50 text-yellow-400'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/preview`}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        Preview
                      </Link>
                      <button
                        onClick={() => togglePublish(post)}
                        className="text-green-400 hover:text-green-300"
                      >
                        {post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
