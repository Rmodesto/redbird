export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, notFound, serverError } from '@/lib/api/responses';
import { requireAdmin } from '@/lib/blog/auth';
import * as postService from '@/lib/blog/post.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await postService.getPostById(id);
    if (!existing) return notFound('Post not found');

    const post =
      existing.status === 'PUBLISHED'
        ? await postService.unpublishPost(id)
        : await postService.publishPost(id);

    return apiSuccess(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('PATCH /api/blog/[id]/publish error:', e);
    return serverError();
  }
}
