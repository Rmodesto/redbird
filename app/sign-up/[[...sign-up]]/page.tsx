import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignUp } from '@clerk/nextjs';

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect('/admin');

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <SignUp />
    </div>
  );
}
