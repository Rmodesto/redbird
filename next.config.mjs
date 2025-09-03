/** @type {import('next').NextConfig} */
const nextConfig = {
  // SEO and performance optimizations
  poweredByHeader: false,
  compress: true,
  
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
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
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
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.nyc',
    NEXT_PUBLIC_SITE_NAME: 'Subway Sounds NYC',
    NEXT_PUBLIC_SITE_DESCRIPTION: 'Your comprehensive guide to NYC subway with real-time arrivals, subway sounds, interactive maps, and station information',
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
