'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

/**
 * OAuth return handler. Clerk's custom flow sends the user here after Google;
 * this component completes the handshake and forwards to redirectUrlComplete.
 */
export default function SSOCallbackPage() {
  return (
    <main className="surface-ripstop flex min-h-screen flex-col items-center justify-center gap-f13 px-f21 text-paper">
      <span className="text-[13px] font-bold uppercase tracking-[.08em] text-graphite">
        Signing you in
      </span>
      <span className="text-[18px] font-bold">One moment…</span>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/admin"
        signUpFallbackRedirectUrl="/admin"
      />
    </main>
  );
}
