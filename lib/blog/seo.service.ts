import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';
import type { BlogPost } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.nyc';

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  return generateSEOMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || `Read "${post.title}" on Subway Sounds NYC blog`,
    keywords: post.keywords,
    ogImage: post.ogImage || post.featuredImage || undefined,
    ogType: 'article',
    canonical: post.canonicalUrl || `/blog/${post.slug}`,
  });
}

export function generateBlogPostJsonLd(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage ? `${SITE_URL}${post.featuredImage}` : undefined,
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Subway Sounds NYC',
      url: SITE_URL,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    wordCount: post.readingTimeMinutes * 200,
    keywords: post.keywords.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateBlogListMetadata(page: number = 1): Metadata {
  const title = page > 1 ? `Blog - Page ${page}` : 'Blog';
  return generateSEOMetadata({
    title: `${title} | Subway Sounds NYC`,
    description: 'Stories, guides, and insights about the NYC subway system — from hidden station secrets to daily commuter tips.',
    keywords: ['NYC subway blog', 'subway stories', 'MTA news', 'NYC transit blog'],
    canonical: page > 1 ? `/blog?page=${page}` : '/blog',
  });
}
