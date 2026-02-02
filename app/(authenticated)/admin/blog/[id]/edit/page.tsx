'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostForm from '@/components/blog/PostForm';
import type { BlogPost } from '@/lib/types';

export default function EditPostPage() {
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
      <h1 className="text-2xl font-bold text-white mb-6">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}
