import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/blog/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const UNLISTED_PATH = path.join(process.cwd(), 'scripts', 'unlisted-videos.json');

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!fs.existsSync(UNLISTED_PATH)) {
    return NextResponse.json({ videos: [] });
  }

  const videos = JSON.parse(fs.readFileSync(UNLISTED_PATH, 'utf-8'));
  return NextResponse.json({ videos });
}
