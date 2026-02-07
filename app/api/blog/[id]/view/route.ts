export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, notFound, serverError } from '@/lib/api/responses';
import * as postService from '@/lib/blog/post.service';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const post = await postService.getPostById(id);
    if (!post) return notFound('Post not found');

    await postService.incrementViews(id);
    return apiSuccess({ success: true });
  } catch (e) {
    console.error('POST /api/blog/[id]/view error:', e);
    return serverError();
  }
}
