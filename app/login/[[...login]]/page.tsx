import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignIn } from '@clerk/nextjs';

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect('/admin');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <SignIn />
    </div>
  );
}
