import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

const ADMIN_EMAIL = '01streetware@gmail.com';

export async function PUT() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Never trust client-sent profile data for authorization decisions.
  // Fetch the verified identity from Clerk directly.
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);

  const primaryEmail = clerkUser.emailAddresses.find(
    (e) => e.id === clerkUser.primaryEmailAddressId
  );
  const email = primaryEmail?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const isVerified = primaryEmail?.verification?.status === 'verified';
  const role = isVerified && email === ADMIN_EMAIL ? 'ADMIN' : 'AUTHOR';

  const firstName = clerkUser.firstName;
  const lastName = clerkUser.lastName;
  const imageUrl = clerkUser.imageUrl;

  // Match on clerkUserId OR email. If the Clerk instance is ever rebuilt the
  // user gets a new clerkUserId while the email stays the same; keying the
  // upsert on clerkUserId alone would then try to INSERT a duplicate email and
  // fail the unique constraint (P2002). Find the existing row by either unique
  // field and relink it, otherwise create.
  const existing = await prisma.user.findFirst({
    where: { OR: [{ clerkUserId: userId }, { email }] },
    select: { id: true },
  });

  const data = { clerkUserId: userId, email, firstName, lastName, imageUrl, role };
  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data })
    : await prisma.user.create({ data });

  // Set Clerk public metadata for role. Best-effort — a metadata failure must
  // not 500 the sync after the user row is already persisted.
  if (role === 'ADMIN') {
    try {
      await clerk.users.updateUserMetadata(userId, {
        publicMetadata: { role: 'admin' },
      });
    } catch (e) {
      console.error('[auth/sync] updateUserMetadata failed:', e);
    }
  }

  return NextResponse.json({ user });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
