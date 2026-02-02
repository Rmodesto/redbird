import type { BlogPost } from '@/lib/types';

export default function PostPreview({ post }: { post: BlogPost }) {
  return (
    <article className="max-w-3xl mx-auto">
      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.featuredImageAlt || post.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
      <div className="flex gap-4 text-sm text-gray-400 mb-6">
        <span>{post.authorName}</span>
        <span>{post.readingTimeMinutes} min read</span>
        {post.publishedAt && (
          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
        )}
      </div>
      {post.excerpt && <p className="text-gray-300 text-lg mb-8">{post.excerpt}</p>}
      <div
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
