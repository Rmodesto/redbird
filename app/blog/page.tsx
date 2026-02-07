import { Metadata } from 'next';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { generateBlogListMetadata } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, category } = await searchParams;
  return generateBlogListMetadata(Number(page) || 1, category);
}

export default async function BlogListPage({ searchParams }: Props) {
  const { category } = await searchParams;
  // Fetch all published posts for client-side filtering
  const data = await postService.getPublicPosts(1, 100, category);
  const categoryCounts = await postService.getCategoryCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm font-medium uppercase tracking-wide">Subway Sounds Blog</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stories from the Underground
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover guides, tips, and fascinating stories about the NYC subway system — from hidden station secrets to daily commuter wisdom.
          </p>
        </div>
      </section>

      {/* Client Component for Search/Filter/Grid */}
      <BlogListingClient
        initialPosts={data.posts}
        categoryCounts={categoryCounts}
        totalPosts={data.total}
      />
    </div>
  );
}
