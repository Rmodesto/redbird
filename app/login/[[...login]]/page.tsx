import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect('/admin');

  // LoginForm reads redirect_url via useSearchParams → needs a Suspense boundary.
  return (
    <Suspense fallback={<div className="min-h-screen bg-jet" />}>
      <LoginForm />
    </Suspense>
  );
}
