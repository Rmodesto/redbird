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
    select: { id: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }

  return { userId: user.id, sessionClaims };
}

/**
 * Non-throwing admin check for routes that serve both public and admin callers
 * (e.g. the shared video list). Returns false for anonymous or non-admin users.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
