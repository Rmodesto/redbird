import * as repo from './post.repository';
import { generateSlug, calculateReadingTime, sanitizeHtml } from './utils';
import type { BlogPost, BlogListResponse } from '@/lib/types';
import type { CreatePostInput, UpdatePostInput } from './schemas';
import type { Post } from '@prisma/client';

type PostWithAuthor = Post & { author?: { imageUrl: string | null } | null };

function toApiBlogPost(post: PostWithAuthor): BlogPost {
  return {
    ...post,
    status: post.status as BlogPost['status'],
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    keywords: JSON.parse(post.keywords),
    tags: JSON.parse(post.tags),
    authorImage: post.authorImage || post.author?.imageUrl || null,
  };
}

export async function createPost(
  input: CreatePostInput,
  authorId: string,
  authorName: string,
): Promise<BlogPost> {
  const content = sanitizeHtml(input.content);
  const slug = generateSlug(input.title);
  const readingTimeMinutes = calculateReadingTime(content);

  const post = await repo.create({
    title: input.title,
    slug,
    excerpt: input.excerpt || '',
    content,
    featuredImage: input.featuredImage ?? null,
    featuredImageAlt: input.featuredImageAlt ?? null,
    status: 'DRAFT',
    publishedAt: null,
    authorId,
    authorName,
    readingTimeMinutes,
    metaTitle: input.metaTitle ?? null,
    metaDescription: input.metaDescription ?? null,
    ogImage: input.ogImage ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    keywords: JSON.stringify(input.keywords || []),
    category: input.category || '',
    tags: JSON.stringify(input.tags || []),
    views: 0,
    featured: input.featured || false,
    authorImage: input.authorImage ?? null,
    authorRole: input.authorRole || 'Contributing Writer',
  });

  return toApiBlogPost(post);
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<BlogPost> {
  const data: Record<string, unknown> = {};

  if (input.title !== undefined) {
    data.title = input.title;
    data.slug = generateSlug(input.title);
  }
  if (input.content !== undefined) {
    data.content = sanitizeHtml(input.content);
    data.readingTimeMinutes = calculateReadingTime(data.content as string);
  }
  if (input.excerpt !== undefined) data.excerpt = input.excerpt;
  if (input.featuredImage !== undefined) data.featuredImage = input.featuredImage;
  if (input.featuredImageAlt !== undefined) data.featuredImageAlt = input.featuredImageAlt;
  if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
  if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;
  if (input.ogImage !== undefined) data.ogImage = input.ogImage;
  if (input.canonicalUrl !== undefined) data.canonicalUrl = input.canonicalUrl;
  if (input.keywords !== undefined) data.keywords = JSON.stringify(input.keywords);
  if (input.category !== undefined) data.category = input.category;
  if (input.tags !== undefined) data.tags = JSON.stringify(input.tags);
  if (input.featured !== undefined) data.featured = input.featured;
  if (input.authorImage !== undefined) data.authorImage = input.authorImage;
  if (input.authorRole !== undefined) data.authorRole = input.authorRole;

  const post = await repo.update(id, data);
  return toApiBlogPost(post);
}

export async function publishPost(id: string): Promise<BlogPost> {
  const post = await repo.update(id, { status: 'PUBLISHED', publishedAt: new Date() });
  return toApiBlogPost(post);
}

export async function unpublishPost(id: string): Promise<BlogPost> {
  const post = await repo.update(id, { status: 'DRAFT', publishedAt: null });
  return toApiBlogPost(post);
}

export async function getPublicPosts(
  page: number,
  limit: number,
  category?: string,
  search?: string,
): Promise<BlogListResponse> {
  const { posts, total } = await repo.findMany({ page, limit, status: 'PUBLISHED', category, search });
  return {
    posts: posts.map(toApiBlogPost),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAdminPosts(page: number, limit: number, status?: string): Promise<BlogListResponse> {
  const { posts, total } = await repo.findMany({ page, limit, status });
  return {
    posts: posts.map(toApiBlogPost),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = await repo.findBySlug(slug);
  return post ? toApiBlogPost(post) : null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const post = await repo.findById(id);
  return post ? toApiBlogPost(post) : null;
}

export async function deletePost(id: string): Promise<void> {
  await repo.remove(id);
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  return repo.getAllSlugs();
}

export async function incrementViews(id: string): Promise<void> {
  return repo.incrementViews(id);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  return repo.getCategoryCounts();
}
