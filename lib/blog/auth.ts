import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function requireAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  // Check database for admin role
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }

  return { userId, sessionClaims };
}
