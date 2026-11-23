export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, notFound, serverError } from '@/lib/api/responses';
import { validateApiKey } from '../../../_auth';
import * as postService from '@/lib/blog/post.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: Params) {
  try {
    if (!validateApiKey(_req)) {
      return apiError('Unauthorized', 401);
    }

    const { id } = await params;
    const existing = await postService.getPostById(id);
    if (!existing) return notFound('Post not found');

    const post = await postService.publishPost(id);
    return apiSuccess(post);
  } catch (e) {
    console.error('PATCH /api/internal/blog/[id]/publish error:', e);
    return serverError();
  }
}
