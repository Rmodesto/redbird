import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).default(''),
  featuredImage: z.string().url().nullable().optional(),
  featuredImageAlt: z.string().max(200).nullable().optional(),
  metaTitle: z.string().max(70).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  keywords: z.array(z.string()).default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const blogListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type BlogListQuery = z.infer<typeof blogListQuery>;
