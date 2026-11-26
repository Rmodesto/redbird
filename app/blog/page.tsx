import { Metadata } from 'next';
import SiteHeader from '@/components/site/SiteHeader';
import BlogListingClient from '@/components/blog/BlogListingClient';
import { generateBlogListMetadata } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';

const LABEL = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';

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
    <div className="min-h-screen bg-jet font-sans">
      <SiteHeader active="blog" />

      {/* ── Masthead — dark ripstop grid ─────────────────────── */}
      <section className="surface-ripstop text-paper">
        <div className="mx-auto max-w-[1440px] px-f21 py-f55 md:px-f55 md:py-f89">
          <div className="flex max-w-f610 flex-col gap-f21">
            <span className={`quoted ${LABEL} text-graphite`}>Blog</span>
            <h1 className="m-0 text-[clamp(40px,8vw,68px)] font-bold uppercase leading-[1] tracking-[-.02em] text-paper">
              Stories from the Underground
            </h1>
            <p className="m-0 max-w-[440px] text-[18px] leading-[29px] text-paper [text-wrap:pretty]">
              Guides, history and field notes on the NYC subway — hidden station details, how the
              system works, and the sounds beneath the street.
            </p>
          </div>
        </div>
      </section>

      {/* ── White paper body ─────────────────────────────────── */}
      <div className="mx-auto max-w-[1440px] px-f21 pb-f55 md:px-f55 md:pb-f89">
        <main className="panel flex flex-col gap-f34 p-f34 text-ink md:gap-f55 md:p-f89">
          <BlogListingClient
            initialPosts={data.posts}
            categoryCounts={categoryCounts}
            totalPosts={data.total}
          />
        </main>
      </div>
    </div>
  );
}
