'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

export default function AuthWrapper({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallbackUrl = '/sign-in',
}: AuthWrapperProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if ((requireAuth || requireAdmin) && !user) {
      router.push(fallbackUrl);
      return;
    }

    if (user && !hasSynced.current) {
      hasSynced.current = true;
      fetch('/api/auth/sync', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (requireAdmin && data.user?.role !== 'ADMIN') {
            router.push('/');
            return;
          }
          setIsReady(true);
        })
        .catch(() => {
          setIsReady(true);
        });
    } else if (user) {
      if (requireAdmin) {
        const role = user.publicMetadata?.role;
        if (role !== 'admin') {
          router.push('/');
          return;
        }
      }
      setIsReady(true);
    }
  }, [isLoaded, user, requireAuth, requireAdmin, fallbackUrl, router]);

  if (!isLoaded || !isReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" />
      </div>
    );
  }

  return <>{children}</>;
}
