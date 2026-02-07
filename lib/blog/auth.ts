import { auth } from '@clerk/nextjs/server';

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  if (role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return { userId, sessionClaims };
}
