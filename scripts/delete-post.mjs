#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });
const prisma = new PrismaClient();
const post = await prisma.post.delete({ where: { slug: 'why-nyc-subway-trains-still-arent-automated' } });
console.log('✅ Deleted post:', post.id);
await prisma.$disconnect();
