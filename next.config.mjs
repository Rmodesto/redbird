/** @type {import('next').NextConfig} */
const nextConfig = {
  // SEO and performance optimizations
  poweredByHeader: false,
  compress: true,
  
  // ESLint configuration for build
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Headers for SEO and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
        ],
      },
      // Note: Individual API routes set their own cache headers via the response.
      // Real-time endpoints (arrivals) use no-cache, static data uses appropriate TTLs.
      {
        source: '/stations',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Redirect common misspellings and variations
      {
        source: '/map',
        destination: '/subway-map',
        permanent: true,
      },
      {
        source: '/sounds',
        destination: '/subway-sounds',
        permanent: true,
      },
      {
        source: '/station',
        destination: '/stations',
        permanent: true,
      },
      {
        source: '/line',
        destination: '/lines',
        permanent: true,
      },
      // Station slug redirects - common alternate URL patterns
      {
        source: '/station/times-square-42-st',
        destination: '/station/times-sq-42-st',
        permanent: true,
      },
      {
        source: '/station/union-square-14-st',
        destination: '/station/14-st-union-sq',
        permanent: true,
      },
      {
        source: '/station/herald-square',
        destination: '/station/34-st-herald-sq',
        permanent: true,
      },
      {
        source: '/station/fulton-st',
        destination: '/station/fulton-st-2345acjz',
        permanent: true,
      },
      {
        source: '/station/atlantic-ave-barclays',
        destination: '/station/atlantic-av-barclays-ctr',
        permanent: true,
      },
      {
        source: '/station/penn-station',
        destination: '/station/34-st-penn-station',
        permanent: true,
      },
      {
        source: '/station/world-trade-center',
        destination: '/station/wtc-cortlandt',
        permanent: true,
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.nyc',
    NEXT_PUBLIC_SITE_NAME: 'Subway Sounds NYC',
    NEXT_PUBLIC_SITE_DESCRIPTION: 'Your comprehensive guide to NYC subway with real-time arrivals, subway sounds, interactive maps, and station information',
  },
  
  // Build configuration
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // trailingSlash: true,
  // distDir: 'out',
  
  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - causing critters dependency issues
  },
};

export default nextConfig;
