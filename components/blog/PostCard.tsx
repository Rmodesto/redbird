import Link from 'next/link';
import type { BlogPost } from '@/lib/types';

export default function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {post.featuredImage && (
        <Link href={`/blog/${post.slug}`} className="block relative">
          <img
            src={post.featuredImage}
            alt={post.featuredImageAlt || post.title}
            className="w-full aspect-[16/10] object-cover"
          />
          {post.category && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
              {post.category}
            </span>
          )}
        </Link>
      )}
      <div className="p-5">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {post.readingTimeMinutes} min read
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {post.views} views
          </span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {post.authorImage ? (
              <img
                src={post.authorImage}
                alt={post.authorName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                {post.authorName.charAt(0)}
              </div>
            )}
            <span className="text-sm text-gray-700">{post.authorName}</span>
          </div>
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Read More &rarr;
          </Link>
        </div>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
