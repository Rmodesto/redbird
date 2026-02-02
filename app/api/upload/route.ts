export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { apiSuccess, apiError, serverError } from '@/lib/api/responses';
import { requireAdmin } from '@/lib/blog/auth';
import { imageService } from '@/lib/blog/image.service';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return apiError('No file provided', 400);
    if (!ALLOWED_TYPES.includes(file.type)) return apiError('Invalid file type', 400);
    if (file.size > MAX_SIZE) return apiError('File too large (max 5MB)', 400);

    const url = await imageService.upload(file);
    return apiSuccess({ url });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'UNAUTHORIZED') return apiError('Unauthorized', 401);
    if (msg === 'FORBIDDEN') return apiError('Forbidden', 403);
    console.error('POST /api/upload error:', e);
    return serverError();
  }
}
