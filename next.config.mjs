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
  // The optimizer is disabled: nothing in this app uses next/image (all images
  // are plain <img> tags), but /_next/image stays reachable while it is on, and
  // Next 14 has unpatched RCE advisories in that endpoint's AVIF/SVG paths.
  // With unoptimized:true the optimizer never runs, so the 2026-10 Image
  // Optimization RCE and the remotePatterns DoS are not reachable here. The
  // settings below are explicit defense-in-depth in case unoptimized is ever
  // flipped back: no SVG passthrough, no wildcard remote hosts.
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [],
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
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), payment=(), usb=()'
          },
          // Report-only while tuning: watch the browser console for violations,
          // then promote to Content-Security-Policy once clean.
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              // 'unsafe-inline'/'unsafe-eval' needed by GTM, AdSense, and Next.js inline scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://www.google.com https://*.clerk.accounts.dev https://*.clerk.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://basemaps.cartocdn.com https://demotiles.maplibre.org https://data.cityofnewyork.us https://nominatim.openstreetmap.org https://*.clerk.accounts.dev https://*.clerk.com https://img.clerk.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              // MapLibre GL uses blob: web workers
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
            ].join('; ')
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
      // SEO keyword-optimized URL redirect
      {
        source: '/nyc-subway-map',
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
  
  // Environment variables - explicitly define for AWS Amplify SSR
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://subwaysounds.net',
    NEXT_PUBLIC_SITE_NAME: 'Subway Sounds NYC',
    NEXT_PUBLIC_SITE_DESCRIPTION: 'Your comprehensive guide to NYC subway with real-time arrivals, subway sounds, interactive maps, and station information',
    // Clerk Configuration - critical for SSR middleware
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    // Database Configuration
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // Build configuration
  // output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  // trailingSlash: true,
  // distDir: 'out',
  
  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled - causing critters dependency issues
    // Exclude protobuf packages from bundling - fixes MTA GTFS decode issues in AWS Lambda
    // These packages rely on global state and dynamic property access that gets mangled by bundling
    serverComponentsExternalPackages: ['protobufjs', 'gtfs-realtime-bindings'],
  },
};

export default nextConfig;
