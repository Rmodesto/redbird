import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { requireAdmin } from '@/lib/blog/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const CREDENTIALS_PATH = path.join(process.cwd(), 'scripts', 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'scripts', 'token-analytics.json');
const CACHE_PATH = path.join(process.cwd(), 'scripts', 'channel-analytics.json');
const REPORT_PATH = path.join(process.cwd(), 'scripts', 'full-video-report.json');
const CHANNEL_ID = 'UCteXdWuT-IRRAVCg8ofeZBw';

function getAuth(): OAuth2Client | null {
  try {
    const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const creds = raw.installed || raw.web;
    const oauth2 = new OAuth2Client(creds.client_id, creds.client_secret);
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2.setCredentials(token);
    return oauth2;
  } catch {
    return null;
  }
}

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || '0') * 3600) + (parseInt(m[2] || '0') * 60) + parseInt(m[3] || '0');
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const auth = getAuth();
  if (!auth) {
    // Fall back to cached data if no auth available
    if (fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
      return NextResponse.json({ ...cached, source: 'cache' });
    }
    return NextResponse.json({ error: 'YouTube credentials not configured' }, { status: 500 });
  }

  try {
    const ytAnalytics = google.youtubeAnalytics({ version: 'v2', auth });
    const yt = google.youtube({ version: 'v3', auth });

    const today = new Date().toISOString().split('T')[0];
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Channel-level stats (2 API calls)
    const [allTimeRes, yearRes] = await Promise.all([
      ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: '2015-01-01',
        endDate: today,
        metrics: 'estimatedMinutesWatched,views,subscribersGained,subscribersLost',
      }),
      ytAnalytics.reports.query({
        ids: 'channel==MINE',
        startDate: oneYearAgo,
        endDate: today,
        metrics: 'estimatedMinutesWatched,views,subscribersGained,subscribersLost',
      }),
    ]);

    const at = allTimeRes.data.rows?.[0] || [0, 0, 0, 0];
    const yr = yearRes.data.rows?.[0] || [0, 0, 0, 0];

    // Monthly breakdown (1 API call)
    const monthStart = oneYearAgo.substring(0, 8) + '01';
    const now = new Date();
    const monthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const monthRes = await ytAnalytics.reports.query({
      ids: 'channel==MINE',
      startDate: monthStart,
      endDate: monthEnd,
      dimensions: 'month',
      metrics: 'views,estimatedMinutesWatched',
      sort: 'month',
    });

    const monthly = (monthRes.data.rows || []).map((r: any) => ({
      month: r[0],
      views: r[1],
      watchMinutes: r[2],
      watchHours: +(r[2] / 60).toFixed(1),
    }));

    // Load full video report if available
    let totalVideos = 0;
    let totalShorts = 0;
    let totalLongForm = 0;
    let videosUnder100Views = 0;
    let unlistedCount = 0;
    let allVideos: any[] = [];

    if (fs.existsSync(REPORT_PATH)) {
      const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf-8'));
      totalVideos = report.summary?.totalVideos || 0;
      totalShorts = report.summary?.totalShorts || 0;
      totalLongForm = report.summary?.totalLongForm || 0;
      videosUnder100Views = report.summary?.videosUnder100Views || 0;
      unlistedCount = report.summary?.unlistedCount || 0;
      allVideos = report.videos || [];
    } else if (fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
      totalVideos = cached.totalVideos || 0;
      totalShorts = cached.totalShorts || 0;
      videosUnder100Views = cached.videosUnder100Views || 0;
    }

    const data = {
      generatedAt: new Date().toISOString(),
      source: 'live',
      channel: {
        allTime: {
          views: at[1],
          watchMinutes: at[0],
          watchHours: +(at[0] / 60).toFixed(1),
          subsGained: at[2],
          subsLost: at[3],
        },
        last365: {
          views: yr[1],
          watchMinutes: yr[0],
          watchHours: +(yr[0] / 60).toFixed(1),
          subsGained: yr[2],
          subsLost: yr[3],
        },
      },
      monthly,
      totalVideos,
      totalShorts,
      totalLongForm,
      videosUnder100Views,
      unlistedCount,
      videos: allVideos,
    };

    // Update cache
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json(data);
  } catch (err: any) {
    // Fall back to cache on error
    if (fs.existsSync(CACHE_PATH)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
      return NextResponse.json({ ...cached, source: 'cache', warning: err.message });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
