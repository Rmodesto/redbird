'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostPreview from '@/components/blog/PostPreview';
import type { BlogPost } from '@/lib/types';

export default function PreviewPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${id}`)
      .then((r) => r.json())
      .then(setPost)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (!post) return <p className="text-red-400">Post not found</p>;

  return (
    <div>
      <div className="mb-4 px-3 py-1.5 bg-yellow-900/50 border border-yellow-600 text-yellow-300 text-sm rounded inline-block">
        Preview Mode
      </div>
      <PostPreview post={post} />
    </div>
  );
}
