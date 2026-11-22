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

  const user = await prisma.user.upsert({
    where: { clerkUserId: userId },
    create: {
      clerkUserId: userId,
      email,
      firstName,
      lastName,
      imageUrl,
      role,
    },
    update: {
      email,
      firstName,
      lastName,
      imageUrl,
      role,
    },
  });

  // Set Clerk public metadata for role
  if (role === 'ADMIN') {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'admin' },
    });
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
