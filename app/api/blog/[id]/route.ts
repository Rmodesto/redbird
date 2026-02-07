export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, notFound, validationError, serverError } from '@/lib/api/responses';
import { updatePostSchema } from '@/lib/blog/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as postService from '@/lib/blog/post.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const post = await postService.getPostById(id);
    if (!post) return notFound('Post not found');
    return apiSuccess(post);
  } catch (e) {
    console.error('GET /api/blog/[id] error:', e);
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await postService.getPostById(id);
    if (!existing) return notFound('Post not found');

    const body = await req.json();
    const parsed = updatePostSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const post = await postService.updatePost(id, parsed.data);
    return apiSuccess(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('PUT /api/blog/[id] error:', e);
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await postService.getPostById(id);
    if (!existing) return notFound('Post not found');

    await postService.deletePost(id);
    return apiSuccess({ deleted: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('DELETE /api/blog/[id] error:', e);
    return serverError();
  }
}
