import AuthenticatedShell from './AuthenticatedShell';

// These routes are auth-gated and call useUser() while rendering, which needs
// ClerkProvider — and therefore the Clerk publishable key — to be present.
// Static prerendering runs at build time, where that key may not be set, so
// the whole group renders on demand instead. Route segment config only applies
// in a server component, which is why the client half lives in the shell.
export const dynamic = 'force-dynamic';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
