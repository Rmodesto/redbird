import { Metadata } from 'next';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/blog/Pagination';
import AdSlot from '@/components/blog/AdSlot';
import { generateBlogListMetadata } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  return generateBlogListMetadata(Number(page) || 1);
}

export default async function BlogListPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const data = await postService.getPublicPosts(page, 10);

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">Blog</h1>

        <AdSlot placement="blog-header" className="mb-8" />

        {data.posts.length === 0 ? (
          <p className="text-gray-400">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Pagination currentPage={page} totalPages={data.totalPages} basePath="/blog" />

        <AdSlot placement="blog-footer" className="mt-8" />
      </div>
    </div>
  );
}
