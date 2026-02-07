'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export default function UserSync() {
  const { user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || hasSynced.current) return;
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
    }).catch(console.error);
  }, [isLoaded, user]);

  return null;
}
