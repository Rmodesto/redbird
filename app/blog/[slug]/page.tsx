import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostPreview from '@/components/blog/PostPreview';
import AdSlot from '@/components/blog/AdSlot';
import { generateBlogPostMetadata, generateBlogPostJsonLd } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await postService.getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);
  if (!post) return {};
  return generateBlogPostMetadata(post);
}

export const revalidate = 60;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  const jsonLd = generateBlogPostJsonLd(post);

  return (
    <div className="min-h-screen bg-gray-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <AdSlot placement="blog-header" className="mb-8" />
        <PostPreview post={post} />
        <AdSlot placement="blog-footer" className="mt-8" />
      </div>
    </div>
  );
}
