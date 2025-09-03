const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.nyc';
const SITE_NAME = 'Subway Sounds NYC';

interface StationData {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  borough: string;
  lines: string[];
  amenities?: string[];
}

interface Platform {
  stopId: string;
  direction: string;
  lines: string[];
}

// Generate TransitStation schema for individual stations
export function generateStationSchema(station: StationData, platforms?: Platform[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TransitStation',
    '@id': `${SITE_URL}/station/${station.slug}`,
    name: `${station.name} Subway Station`,
    alternateName: station.name,
    description: `${station.name} subway station in ${station.borough}, NYC. Serving ${station.lines.join(', ')} train lines with real-time arrivals and station information.`,
    url: `${SITE_URL}/station/${station.slug}`,
    identifier: station.id,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: station.latitude,
      longitude: station.longitude,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: station.borough,
      addressRegion: 'NY',
      addressCountry: 'US',
    },
    publicAccess: true,
    isAccessibleForFree: false, // MTA requires fare
    maximumAttendeeCapacity: platforms ? platforms.length * 1000 : 2000, // Estimate
    amenityFeature: station.amenities?.map(amenity => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })) || [],
    containedInPlace: {
      '@type': 'City',
      name: 'New York City',
    },
    serviceLocation: {
      '@type': 'ServiceChannel',
      name: 'MTA Subway',
      serviceUrl: 'https://new.mta.info',
      availableLanguage: ['en', 'es', 'zh', 'ko', 'ru', 'fr'],
    },
  };
}

// Generate LocalBusiness schema for the entire website
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_URL,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Comprehensive NYC subway directory with real-time arrivals, subway sounds archive, interactive maps, and detailed station information.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/stations?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2', '.station-name', '.announcement'],
    },
    inLanguage: 'en-US',
    copyrightYear: new Date().getFullYear(),
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString(),
  };
}

// Generate CollectionPage schema for listing pages
export function generateCollectionPageSchema(
  title: string,
  description: string,
  itemType: 'stations' | 'lines',
  itemCount: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: `${SITE_URL}/${itemType}`,
    numberOfItems: itemCount,
    hasPart: {
      '@type': 'ItemList',
      numberOfItems: itemCount,
      itemListElement: [], // This would be populated with actual items
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: SITE_URL,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: title,
          item: `${SITE_URL}/${itemType}`,
        },
      ],
    },
  };
}

// Generate Service schema for subway lines
export function generateLineSchema(lineId: string, stations: StationData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_URL}/line/${lineId.toLowerCase()}`,
    name: `${lineId} Train Line`,
    description: `NYC Subway ${lineId} train line serving ${stations.length} stations across New York City. View real-time arrivals, service alerts, and station information.`,
    url: `${SITE_URL}/line/${lineId.toLowerCase()}`,
    provider: {
      '@type': 'Organization',
      name: 'MTA New York City Transit',
      url: 'https://new.mta.info',
    },
    areaServed: {
      '@type': 'City',
      name: 'New York City',
    },
    serviceType: 'Public Transportation',
    serviceOutput: {
      '@type': 'TransitRoute',
      name: `${lineId} Line Route`,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'MTA Fares',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Single Ride',
          price: '2.90',
          priceCurrency: 'USD',
        },
      ],
    },
  };
}

// Generate AudioObject schema for subway sounds
export function generateAudioSchema(
  name: string,
  description: string,
  audioUrl: string,
  duration?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: name,
    description: description,
    contentUrl: audioUrl,
    encodingFormat: 'audio/mpeg',
    duration: duration || 'PT1M', // ISO 8601 duration format
    uploadDate: new Date().toISOString(),
    inLanguage: 'en-US',
    accessMode: 'auditory',
    accessibilityFeature: ['captions', 'transcript'],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

// Generate Map schema for the subway map page
export function generateMapSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Map',
    name: 'NYC Subway Map - Interactive Real-Time Transit Map',
    description: 'Interactive NYC subway map showing all lines, stations, real-time arrivals, and service alerts. Plan your journey with our comprehensive subway map.',
    url: `${SITE_URL}/subway-map`,
    mapType: 'TransitMap',
    hasMap: {
      '@type': 'URL',
      url: `${SITE_URL}/subway-map`,
    },
    spatialCoverage: {
      '@type': 'Place',
      name: 'New York City',
      geo: {
        '@type': 'GeoShape',
        box: '40.4774 -74.2591 40.9176 -73.7004', // NYC bounding box
      },
    },
  };
}

// Generate Event schema for service alerts
export function generateServiceAlertSchema(
  alertType: string,
  affectedLines: string[],
  description: string,
  startDate?: string,
  endDate?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Service Alert: ${alertType}`,
    description: description,
    eventStatus: 'EventScheduled',
    eventAttendanceMode: 'OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: `${affectedLines.join(', ')} Line${affectedLines.length > 1 ? 's' : ''}`,
    },
    startDate: startDate || new Date().toISOString(),
    endDate: endDate,
    organizer: {
      '@type': 'Organization',
      name: 'MTA',
      url: 'https://new.mta.info',
    },
  };
}

// Helper function to generate breadcrumb structured data
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
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

// Helper function to inject structured data into page
export function generateStructuredDataScript(data: any) {
  return {
    __html: JSON.stringify(data),
  };
}