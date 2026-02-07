import { prisma } from '@/lib/db';
import type { Post, Prisma } from '@prisma/client';

export interface FindManyOptions {
  page: number;
  limit: number;
  status?: string;
  category?: string;
  search?: string;
}

export async function findMany({ page, limit, status, category, search }: FindManyOptions) {
  const where: Prisma.PostWhereInput = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: { select: { imageUrl: true } } },
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, total };
}

export async function findBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { imageUrl: true } } },
  });
}

export async function findById(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: { select: { imageUrl: true } } },
  });
}

export async function create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  return prisma.post.create({ data });
}

export async function update(id: string, data: Partial<Post>): Promise<Post> {
  return prisma.post.update({ where: { id }, data });
}

export async function remove(id: string): Promise<Post> {
  return prisma.post.delete({ where: { id } });
}

export async function getAllSlugs(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true },
  });
  return posts.map((p) => p.slug);
}

export async function incrementViews(id: string): Promise<void> {
  await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const results = await prisma.post.groupBy({
    by: ['category'],
    where: { status: 'PUBLISHED' },
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.category || ''] = r._count._all;
  }
  return counts;
}
