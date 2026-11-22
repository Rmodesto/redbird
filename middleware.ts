import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  // Public API routes, listed explicitly. Admin-only APIs (upload, videos/sync,
  // videos/tag, youtube-analytics, unlisted-videos, auth/sync) are NOT listed,
  // so Clerk requires a session at the middleware layer before the route's own
  // requireAdmin() check runs.
  '/api/arrivals(.*)',
  '/api/stations(.*)',
  '/api/subway-stations(.*)',
  '/api/subway-trains(.*)',
  '/api/transit(.*)',
  '/api/line-stations(.*)',
  '/api/lines(.*)',
  '/api/station-stats(.*)',
  '/api/blog(.*)',      // GETs are public; writes enforce requireAdmin() in-route
  '/api/contact(.*)',
  '/api/videos',        // public video list; /api/videos/sync and /tag stay protected
  '/api/videos/station(.*)',
  '/api/internal(.*)',  // authenticated by X-API-Key, not Clerk sessions
  '/station(.*)',
  '/line(.*)',
  '/lines(.*)',
  '/stations(.*)',
  '/map(.*)',
  '/culture(.*)',
  '/subway-sounds(.*)',
  '/subway-map(.*)',
  '/blog(.*)',
  '/contact(.*)',
  '/privacy-policy(.*)',
  '/terms(.*)',
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return NextResponse.next();
  }
  return clerkHandler(req, {} as any);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
