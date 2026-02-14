import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)',  // All API routes should be public
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
