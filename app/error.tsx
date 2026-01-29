'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console in development
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Subway-themed error icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 text-white text-4xl font-bold">
            !
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. This has been logged and we&apos;ll look into it.
        </p>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>

          <Link
            href="/"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go home
          </Link>
        </div>

        {/* Decorative subway lines */}
        <div className="mt-12 flex justify-center gap-2">
          <span className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">1</span>
          <span className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">4</span>
          <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">A</span>
        </div>
      </div>
    </div>
  );
}
