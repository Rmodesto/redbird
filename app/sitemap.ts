import { MetadataRoute } from 'next';
import stationsData from '@/data/stations-normalized.json';
import neighborhoodsData from '@/data/neighborhoods.json';
import { prisma } from '@/lib/db';

// Import JSON directly (not fs.readFileSync) so the data is bundled into the
// Amplify SSR Lambda, same fix as app/api/arrivals.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.subwaysounds.net').replace(/\/$/, '');

// Regenerate at most once an hour (picks up newly published blog posts).
export const revalidate = 3600;

const SUBWAY_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z',
];

const STATIC_PAGES: { url: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { url: '', priority: 1.0, changeFrequency: 'daily' },
  { url: '/stations', priority: 0.9, changeFrequency: 'weekly' },
  { url: '/lines', priority: 0.9, changeFrequency: 'weekly' },
  { url: '/subway-map', priority: 0.95, changeFrequency: 'weekly' },
  { url: '/subway-sounds', priority: 0.8, changeFrequency: 'weekly' },
  { url: '/blog', priority: 0.8, changeFrequency: 'daily' },
  { url: '/culture', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/operations', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/history', priority: 0.7, changeFrequency: 'monthly' },
  { url: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { url: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    entries.push({
      url: `${SITE_URL}${page.url}`,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // Station pages: slug URLs only (matches the canonical set in app/station/[id]/page.tsx)
  for (const station of stationsData as { slug: string }[]) {
    if (!station.slug) continue;
    entries.push({
      url: `${SITE_URL}/station/${station.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  for (const line of SUBWAY_LINES) {
    entries.push({
      url: `${SITE_URL}/line/${line.toLowerCase()}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  for (const neighborhood of (neighborhoodsData as { neighborhoods: { slug: string }[] }).neighborhoods) {
    entries.push({
      url: `${SITE_URL}/neighborhood/${neighborhood.slug}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Published blog posts (DB may be unavailable at build time — don't fail the sitemap)
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    for (const post of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  } catch {
    // ignore
  }

  return entries;
}
