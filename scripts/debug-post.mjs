#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  const post = await prisma.post.findUnique({
    where: { slug: 'why-nyc-subway-trains-still-arent-automated' },
    include: { author: { select: { imageUrl: true } } },
  });

  if (!post) {
    console.log('❌ Post not found!');
    return;
  }

  console.log('📋 Post found:');
  console.log('  ID:', post.id);
  console.log('  Title:', post.title);
  console.log('  Slug:', post.slug);
  console.log('  Status:', post.status);
  console.log('  PublishedAt:', post.publishedAt);
  console.log('  AuthorId:', post.authorId);
  console.log('  AuthorName:', post.authorName);
  console.log('  AuthorImage:', post.authorImage);
  console.log('  AuthorRole:', post.authorRole);
  console.log('  Author relation:', JSON.stringify(post.author));
  console.log('  FeaturedImage:', post.featuredImage);
  console.log('  Category:', post.category);
  console.log('  ReadingTime:', post.readingTimeMinutes);
  console.log('  Views:', post.views);
  console.log('  Featured:', post.featured);

  // Test JSON parsing (what toApiBlogPost does)
  try {
    const tags = JSON.parse(post.tags);
    console.log('  Tags (parsed):', tags, '- type:', typeof tags, Array.isArray(tags) ? '(array)' : '(NOT array!)');
  } catch (e) {
    console.log('  ❌ Tags parse FAILED:', post.tags, e.message);
  }

  try {
    const keywords = JSON.parse(post.keywords);
    console.log('  Keywords (parsed):', keywords, '- type:', typeof keywords, Array.isArray(keywords) ? '(array)' : '(NOT array!)');
  } catch (e) {
    console.log('  ❌ Keywords parse FAILED:', post.keywords, e.message);
  }

  console.log('  Content length:', post.content?.length || 0);
  console.log('  Content first 200 chars:', post.content?.substring(0, 200));
  console.log('  ContentBlocks length:', post.contentBlocks?.length || 0);

  // Check if contentBlocks is valid JSON
  if (post.contentBlocks) {
    try {
      const blocks = JSON.parse(post.contentBlocks);
      console.log('  ContentBlocks (parsed): OK -', blocks.length, 'blocks');
    } catch (e) {
      console.log('  ❌ ContentBlocks parse FAILED:', e.message);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
