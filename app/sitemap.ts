import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/db';

interface Station {
  slug: string;
  name: string;
}

interface StationsData {
  stations: Station[];
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.net';

// All subway lines in NYC
const SUBWAY_LINES = [
  '1', '2', '3', '4', '5', '6', '7',
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'J', 'L', 'M', 'N', 'Q', 'R', 'S', 'W', 'Z'
];

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { url: '', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/stations', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/lines', priority: 0.9, changeFrequency: 'weekly' as const },
  { url: '/subway-map', priority: 0.95, changeFrequency: 'weekly' as const },
  { url: '/subway-sounds', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/culture', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/operations', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/history', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  
  // Add static pages
  STATIC_PAGES.forEach(page => {
    entries.push({
      url: `${SITE_URL}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  });

  // Load station data
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const stationsPath = path.join(dataDir, 'stations-normalized.json');
    const stationsData: Station[] = JSON.parse(fs.readFileSync(stationsPath, 'utf8'));
    
    // Add all station pages
    stationsData.forEach((station: Station) => {
      entries.push({
        url: `${SITE_URL}/station/${station.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Error loading station data for sitemap:', error);
  }

  // Add all line pages
  SUBWAY_LINES.forEach(line => {
    entries.push({
      url: `${SITE_URL}/line/${line.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  // Add borough-specific pages
  const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten-island'];
  boroughs.forEach(borough => {
    entries.push({
      url: `${SITE_URL}/stations?borough=${borough}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  });

  // Add neighborhood GEO hub pages
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const neighborhoodsPath = path.join(dataDir, 'neighborhoods.json');
    const neighborhoodsData = JSON.parse(fs.readFileSync(neighborhoodsPath, 'utf8'));

    neighborhoodsData.neighborhoods.forEach((neighborhood: { slug: string }) => {
      entries.push({
        url: `${SITE_URL}/neighborhood/${neighborhood.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch (error) {
    console.error('Error loading neighborhood data for sitemap:', error);
  }

  // Add published blog posts
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    });
    posts.forEach((post) => {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  } catch {
    // DB may not be available during build
  }

  // Add blog index page
  entries.push({
    url: `${SITE_URL}/blog`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  });

  return entries;
}