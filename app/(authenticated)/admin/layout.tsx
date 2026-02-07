'use client';

import Link from 'next/link';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper requireAdmin fallbackUrl="/sign-in">
      <div className="min-h-screen bg-gray-950">
        <nav className="bg-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="text-white font-semibold">
                Admin
              </Link>
              <Link href="/admin" className="text-gray-400 hover:text-white text-sm">
                Dashboard
              </Link>
              <Link href="/admin/blog" className="text-gray-400 hover:text-white text-sm">
                Blog Posts
              </Link>
              <Link href="/admin/blog/new" className="text-gray-400 hover:text-white text-sm">
                New Post
              </Link>
            </div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm">
              Back to Site
            </Link>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </div>
    </AuthWrapper>
  );
}
