import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site/SiteHeader';
import { generateSEOMetadata } from '@/lib/seo';
import {
  generateOrganizationSchema,
  generatePersonSchema,
  generateStructuredDataScript,
} from '@/lib/structured-data';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Subway Sounds',
  description:
    'Subway Sounds is the home for the @SubwaySounds YouTube channel — NYC subway recordings, station guides, and transit history, run by Rafael Modesto.',
  keywords: ['about Subway Sounds', 'Subway Sounds Media', 'NYC subway recordings', 'Rafael Modesto'],
  canonical: '/about',
});

const organizationSchema = generateOrganizationSchema();
const personSchema = generatePersonSchema();

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(organizationSchema)}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateStructuredDataScript(personSchema)}
      />
      <SiteHeader />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">About Subway Sounds</h1>
            <p className="text-gray-600">
              The home for the{' '}
              <a
                href="https://www.youtube.com/@SubwaySounds"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                @SubwaySounds
              </a>{' '}
              YouTube channel — NYC subway recordings, station guides, and transit history.
            </p>
          </div>

          {/* Story */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What this site is</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Subway Sounds pairs the channel&apos;s recordings with a full directory of New York
                City subway stations and lines: real-time arrivals, an interactive map, accessibility
                details, and the sounds of each platform in one place.
              </p>
              <p>
                {/* TODO(rafael): replace with your own story — why you started recording the
                    subway, what you want visitors to get out of the site. */}
                TODO(rafael): Add a short personal note here about why the channel and site exist.
              </p>
            </div>
          </div>

          {/* The person behind it */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Who runs it</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Subway Sounds is created and run by <strong>Rafael Modesto</strong>, who records the
                channel&apos;s audio and video across the system.
              </p>
              <p>
                {/* TODO(rafael): add a sentence or two of bio — background, where in the city you
                    record most, anything you want readers to know. */}
                TODO(rafael): Add a short bio.
              </p>
            </div>
          </div>

          {/* Business / contact */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The business</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-semibold text-gray-900">Subway Sounds Media LLC</span>
                <br />
                New York City, USA
              </p>
              <p>
                Email:{' '}
                <a href="mailto:info@subwaysounds.net" className="text-blue-600 hover:underline">
                  info@subwaysounds.net
                </a>
              </p>
              <p>
                Questions or feedback? Head to the{' '}
                <Link href="/contact" className="text-blue-600 hover:underline">
                  contact page
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Explore links */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Start exploring</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/subway-sounds"
                className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Subway sounds library →
              </Link>
              <Link
                href="/stations"
                className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors"
              >
                Browse all stations →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
