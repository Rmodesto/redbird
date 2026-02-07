import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.net';
const SITE_NAME = 'Subway Sounds NYC';
const SITE_DESCRIPTION = 'Your comprehensive guide to NYC subway with real-time arrivals, subway sounds, interactive maps, and station information';

interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noIndex?: boolean;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
  const {
    title = SITE_NAME,
    description = SITE_DESCRIPTION,
    keywords = [],
    ogImage = '/og-image.png',
    ogType = 'website',
    canonical,
    noIndex = false,
    alternates,
  } = config;

  // Combine default and custom keywords
  const defaultKeywords = [
    'NYC subway',
    'subway sounds',
    'subway map',
    'New York subway',
    'MTA',
    'real-time arrivals',
    'subway stations',
    'NYC transit',
    'subway schedule',
    'train times',
    'metro NYC',
    'public transportation NYC',
  ];
  
  const allKeywords = Array.from(new Set([...defaultKeywords, ...keywords]));
  
  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: allKeywords.join(', '),
    authors: [{ name: 'Subway Sounds NYC' }],
    creator: 'Subway Sounds NYC',
    publisher: 'Subway Sounds NYC',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SITE_URL),
    alternates: alternates || {
      canonical: canonical || '/',
    },
    openGraph: {
      title,
      description,
      url: canonical || SITE_URL,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: ogType as any,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@subwaysoundsnyc',
      site: '@subwaysoundsnyc',
    },
// viewport removed - should be exported separately in layout.tsx
    manifest: '/manifest.json',
    icons: {
      icon: [
        { url: '/favicon.ico' },
        { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
        { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png' },
      ],
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
    },
    category: 'transportation',
  };

  return metadata;
}

// Specific metadata generators for different page types
export function generateStationMetadata(stationName: string, stationSlug: string, lines: string[], borough: string): Metadata {
  const linesList = lines.join(', ');
  return generateSEOMetadata({
    title: `${stationName} Subway Station - ${linesList} Train${lines.length > 1 ? 's' : ''} | NYC Subway Sounds`,
    description: `${stationName} station in ${borough} serves the ${linesList} line${lines.length > 1 ? 's' : ''}. Get real-time arrivals, platform sounds, directions, nearby attractions, and accessibility info for ${stationName} subway station.`,
    keywords: [
      `${stationName} subway`,
      `${stationName} station`,
      `${stationName} train`,
      ...lines.map(l => `${l} train`),
      `${borough} subway`,
      `${stationName} arrivals`,
      `${stationName} subway sounds`,
    ],
    canonical: `/station/${stationSlug}`,
    ogType: 'place',
  });
}

export function generateLineMetadata(lineId: string): Metadata {
  return generateSEOMetadata({
    title: `${lineId} Train Line - Route Map, Stations & Schedule | NYC Subway`,
    description: `Complete guide to the ${lineId} train line in NYC. View all stations, real-time arrivals, service alerts, route map, and subway sounds for the ${lineId} line.`,
    keywords: [
      `${lineId} train`,
      `${lineId} line NYC`,
      `${lineId} subway map`,
      `${lineId} train schedule`,
      `${lineId} train stops`,
      `${lineId} line stations`,
      `${lineId} train sounds`,
    ],
    canonical: `/line/${lineId.toLowerCase()}`,
  });
}

export function generatePageMetadata(pageName: string, pageDescription: string, keywords: string[] = []): Metadata {
  return generateSEOMetadata({
    title: pageName,
    description: pageDescription,
    keywords,
  });
}

// Helper function for FAQ schema
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}