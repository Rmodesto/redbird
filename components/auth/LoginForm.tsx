'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSignIn } from '@clerk/nextjs';

const LABEL = 'text-[13px] font-bold uppercase leading-[21px] tracking-[.08em]';

/**
 * Keep the post-login redirect same-origin: take only the path + query from
 * whatever `redirect_url` carries, so a crafted absolute URL can't bounce the
 * user off-site after authenticating.
 */
function safeTarget(raw: string | null): string {
  if (!raw) return '/admin';
  try {
    const u = new URL(raw, 'https://www.subwaysounds.net');
    const path = u.pathname + u.search;
    return path.startsWith('/') ? path : '/admin';
  } catch {
    return raw.startsWith('/') ? raw : '/admin';
  }
}

export default function LoginForm() {
  const { isLoaded, signIn } = useSignIn();
  const params = useSearchParams();
  const target = safeTarget(params.get('redirect_url'));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function continueWithGoogle() {
    if (!isLoaded || !signIn) return;
    setBusy(true);
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: target,
      });
    } catch (e: unknown) {
      const msg =
        (e as { errors?: { message?: string }[] })?.errors?.[0]?.message ||
        'Could not start Google sign-in. Try again.';
      setError(msg);
      setBusy(false);
    }
  }

  return (
    <main className="surface-ripstop flex min-h-screen items-center justify-center px-f21 py-f55 text-paper">
      <div className="w-full max-w-[420px]">
        {/* Wordmark */}
        <Link href="/" className="mb-f34 flex items-center gap-f8 no-underline">
          <span className="flex h-[32px] w-[32px] items-center justify-center bg-paper text-[15px] font-bold text-ink">
            SS
          </span>
          <span className="text-[15px] font-bold uppercase tracking-[.08em] text-paper">
            Subway Sounds
          </span>
        </Link>

        <div className="border border-ripstop bg-suede p-f34">
          <span className={`quoted ${LABEL} text-graphite`}>Admin</span>
          <h1 className="mb-f13 mt-f13 text-[34px] font-bold uppercase leading-[1] tracking-[-.02em]">
            Sign in
          </h1>
          <p className="m-0 mb-f34 text-[15px] leading-[24px] text-graphite">
            Restricted to authorized editors. Sign in with the Google account on file
            to reach the admin tools.
          </p>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={!isLoaded || busy}
            className="flex w-full items-center justify-center gap-f13 bg-paper px-f21 py-f13 text-label font-bold uppercase tracking-[.08em] text-ink transition-colors hover:bg-seam disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleMark />
            {busy ? 'Redirecting…' : 'Continue with Google'}
          </button>

          {error && (
            <p role="alert" className="m-0 mt-f21 text-[13px] leading-[21px] text-tag">
              {error}
            </p>
          )}
        </div>

        <Link
          href="/"
          className={`${LABEL} mt-f21 inline-block text-graphite no-underline transition-colors hover:text-paper`}
        >
          &larr; Back to site
        </Link>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
