import { auth, clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_EMAIL = '01streetware@gmail.com';

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { firstName, lastName, email, imageUrl } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  const role = email === ADMIN_EMAIL ? 'ADMIN' : 'AUTHOR';

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
    const clerk = await clerkClient();
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
