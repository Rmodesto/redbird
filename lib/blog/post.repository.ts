import { prisma } from '@/lib/db';
import type { Post } from '@prisma/client';

export interface FindManyOptions {
  page: number;
  limit: number;
  status?: string;
}

export async function findMany({ page, limit, status }: FindManyOptions) {
  const where = status ? { status } : {};
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);
  return { posts, total };
}

export async function findBySlug(slug: string): Promise<Post | null> {
  return prisma.post.findUnique({ where: { slug } });
}

export async function findById(id: string): Promise<Post | null> {
  return prisma.post.findUnique({ where: { id } });
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
