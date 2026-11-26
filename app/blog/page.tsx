import { Metadata } from 'next';
import SiteHeader from '@/components/site/SiteHeader';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { generateBlogListMetadata } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';

const LABEL = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';
const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23262626%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

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
    <div className="min-h-screen bg-jet font-sans text-paper">
      <SiteHeader active="blog" />

      {/* ── Masthead ─────────────────────────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] px-f21 pb-f34 pt-f34 md:px-f55 md:pb-f55 md:pt-f55">
          <div className="flex max-w-f610 flex-col gap-f21">
            <span className={`quoted ${LABEL} text-graphite`}>Blog</span>
            <h1 className="m-0 text-[clamp(40px,8vw,89px)] font-bold uppercase leading-[1] tracking-[-.03em]">
              Stories from the Underground
            </h1>
            <p className="m-0 text-[18px] leading-[29px] text-graphite [text-wrap:pretty]">
              Guides, history and field notes on the NYC subway — hidden station details, how the
              system works, and the sounds beneath the street.
            </p>
          </div>
        </div>
      </section>

      <div aria-hidden="true" className="h-[8px]" style={{ backgroundImage: ZIGZAG, backgroundRepeat: 'repeat-x' }} />

      {/* Client Component for Search/Filter/Grid */}
      <BlogListingClient
        initialPosts={data.posts}
        categoryCounts={categoryCounts}
        totalPosts={data.total}
      />
    </div>
  );
}
