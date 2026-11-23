export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { createPostSchema } from '@/lib/blog/schemas';
import { validateApiKey } from '../_auth';
import * as postService from '@/lib/blog/post.service';

export async function POST(req: NextRequest) {
  try {
    if (!validateApiKey(req)) {
      return apiError('Unauthorized', 401);
    }

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const post = await postService.createPost(parsed.data, 'red-claw', 'Red Claw');
    return apiSuccess(post);
  } catch (e) {
    console.error('POST /api/internal/blog error:', e);
    return serverError();
  }
}
