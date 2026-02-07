'use client';

import UserSync from '@/components/auth/UserSync';
import AuthWrapper from '@/components/auth/AuthWrapper';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper requireAuth fallbackUrl="/sign-in">
      <UserSync />
      {children}
    </AuthWrapper>
  );
}
