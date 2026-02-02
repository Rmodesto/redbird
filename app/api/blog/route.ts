export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, validationError, serverError } from '@/lib/api/responses';
import { blogListQuery, createPostSchema } from '@/lib/blog/schemas';
import { requireAdmin } from '@/lib/blog/auth';
import * as postService from '@/lib/blog/post.service';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = blogListQuery.safeParse(params);
    if (!parsed.success) return validationError(parsed.error);

    const { page, limit, status } = parsed.data;

    // Check if admin request (has auth + status filter)
    let data;
    if (status) {
      try {
        await requireAdmin();
        data = await postService.getAdminPosts(page, limit, status);
      } catch {
        data = await postService.getPublicPosts(page, limit);
      }
    } else {
      // Check auth optionally for admin listing
      try {
        const { userId } = await auth();
        if (userId) {
          data = await postService.getAdminPosts(page, limit);
        } else {
          data = await postService.getPublicPosts(page, limit);
        }
      } catch {
        data = await postService.getPublicPosts(page, limit);
      }
    }

    return apiSuccess(data);
  } catch (e) {
    console.error('GET /api/blog error:', e);
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await requireAdmin();
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const authorName =
      ((sessionClaims as Record<string, unknown>)?.fullName as string) ||
      ((sessionClaims as Record<string, unknown>)?.firstName as string) ||
      'Admin';

    const post = await postService.createPost(parsed.data, userId, authorName);
    return apiSuccess(post);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('POST /api/blog error:', e);
    return serverError();
  }
}
