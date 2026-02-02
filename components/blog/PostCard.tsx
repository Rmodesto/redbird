import Link from 'next/link';
import type { BlogPost } from '@/lib/types';

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`}>
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full h-48 object-cover"
          />
        </Link>
      )}
      <div className="p-5">
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-xl font-semibold text-white mb-2 hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{post.authorName}</span>
          <span>{post.readingTimeMinutes} min read</span>
          {post.publishedAt && (
            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </article>
  );
}
