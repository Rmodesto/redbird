#!/usr/bin/env node
/**
 * Script to create the "Why NYC Subway Trains Still Aren't Automated" blog post
 * with images uploaded to Cloudflare R2.
 *
 * Run from the redbird project root:
 *   node scripts/create-automation-blog.mjs
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { config } from 'dotenv';

// Load .env.local (Next.js convention)
config({ path: '.env.local' });

const prisma = new PrismaClient();

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate credentials loaded
if (!R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ R2 credentials not found. Make sure .env.local exists in project root.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

// ── Image Upload ──────────────────────────────────────────────
const IMG_DIR = path.join(process.cwd(), 'public', 'blog-images');

const imageFiles = [
  'featured-cab-interior.jpg',
  'cab-controls-closeup.jpg',
  'l-train-station.jpg',
  'conductor-platform-check.jpg',
  'lex-ave-53-platform.jpg',
  'a-train-next-stop.jpg',
  'elevated-train-curve.jpg',
];

async function uploadImages() {
  const urls = {};
  for (const img of imageFiles) {
    const filePath = path.join(IMG_DIR, img);
    const buffer = readFileSync(filePath);
    const hash = createHash('md5').update(buffer).digest('hex').slice(0, 8);
    const key = `blog/${Date.now()}-${hash}-${img}`;

    await s3.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
    }));

    urls[img] = `${R2_PUBLIC_URL}/${key}`;
    console.log(`  ✓ ${img} → ${urls[img]}`);
  }
  return urls;
}

// ── Blog Content ──────────────────────────────────────────────
function buildContentBlocks(urls) {
  return [
    {
      id: 'block-intro-1',
      type: 'text',
      html: `<p>New York runs trains the old way. A person drives. A person closes doors. That is not an accident. It is a system choice.</p><p>The reasons come down to three things. Signals. Labor. Law.</p>`,
    },
    {
      id: 'block-signals-heading',
      type: 'text',
      html: `<h2>The Signals Are the Real Floor</h2>`,
    },
    {
      id: 'block-signals-img',
      type: 'image-text-wrap',
      src: urls['cab-controls-closeup.jpg'],
      alt: 'R160 subway cab control panel with dual display screens and manual controls',
      caption: 'R160 operator cab — manual controls still at the center of every run.',
      alignment: 'left',
      size: '50',
      html: `<p>Most of the subway still uses fixed-block signaling. That means the system knows a train is "in a block," not exactly where it is. Blocks can be long. Safety margins have to be wide.</p><p>If you want real automation, you need continuous position tracking. That is what Communications-Based Train Control does. CBTC brings Automatic Train Operation with it.</p><p>CBTC is not everywhere. It is limited compared to the size of the system.</p><p>The MTA's own description is blunt. CBTC provides precise train location. ATO controls acceleration and braking for consistency.</p>`,
    },
    {
      id: 'block-cbtc-heading',
      type: 'text',
      html: `<h2>CBTC Exists. Policy Keeps Humans in the Loop.</h2>`,
    },
    {
      id: 'block-cbtc-img',
      type: 'full-width-image',
      src: urls['l-train-station.jpg'],
      alt: 'L train arriving at a station platform with passengers walking nearby',
      caption: 'The L train — one of only two lines with full CBTC, and the proving ground for automation in New York.',
    },
    {
      id: 'block-cbtc-text',
      type: 'text',
      html: `<p>Two lines matter here. The L train and the 7 train got full CBTC rollouts. That is where New York has the machinery for modern automation.</p><p>On the L, trains operate under full Automatic Train Operation at Grade of Automation 2. A human operator still rides on every train. They are there to supervise and intervene. The train can handle speed control and station stopping under ATO.</p><p>So the question is not "can the train do it." The question is "will New York let staffing change when it can."</p>`,
    },
    {
      id: 'block-crew-heading',
      type: 'text',
      html: `<h2>The Crew Is a Contract Issue</h2>`,
    },
    {
      id: 'block-crew-img',
      type: 'full-width-image',
      src: urls['conductor-platform-check.jpg'],
      alt: 'NYC subway conductor leaning out of the center door performing a platform safety check',
      caption: 'A conductor does the classic platform check — the human ritual that automation would replace.',
    },
    {
      id: 'block-crew-text',
      type: 'text',
      html: `<p>New York is unusual in keeping two-person crews as the norm. Operator plus conductor.</p><p>The union argument is safety. Doors. Evacuations. Emergencies.</p><p>The management argument is cost and flexibility. One-person operation is common elsewhere. Driverless lines exist across the world.</p><p>In New York, this fight does not live in a lab. It lives in labor negotiations.</p>`,
    },
    {
      id: 'block-law-heading',
      type: 'text',
      html: `<h2>The Law Got Close to Freezing It</h2>`,
    },
    {
      id: 'block-law-img',
      type: 'image-text-wrap',
      src: urls['a-train-next-stop.jpg'],
      alt: 'LED display inside an A train showing "The Next Stop Is" with train interior visible',
      caption: 'The A train\'s automated announcement system — technology moves forward, but policy holds the line.',
      alignment: 'right',
      size: '50',
      html: `<p>This is where the 2025 update matters.</p><p>New York lawmakers advanced bills that would require a conductor onboard. In the 2025 session, S4091 / A4873 would require at least one conductor on trains over two cars.</p><p>That legislation passed the full Legislature in 2025. Governor Hochul vetoed it in December 2025.</p><p>So it did not just "stall" as an idea. It nearly became permanent policy.</p><p>That matters because CBTC upgrades take years. A conductor mandate would lock in staffing rules while technology changes around it.</p>`,
    },
    {
      id: 'block-shuttle-heading',
      type: 'text',
      html: `<h2>The 42nd Street Shuttle Test Didn't "Blend" Into One Event</h2>`,
    },
    {
      id: 'block-shuttle-text',
      type: 'text',
      html: `<p>New York tested automation before. The 42nd Street Shuttle was the showcase.</p><p>But two separate incidents in 1964 helped end that chapter.</p><ul><li><strong>April 16, 1964:</strong> an automated shuttle train derailed east of Times Square during the morning rush.</li><li><strong>April 21, 1964:</strong> a severe fire at Grand Central destroyed the demonstration train. The fire began under a shuttle train on track 3.</li></ul><p>Five days apart. Different failures. Same outcome: the appetite for automation collapsed.</p>`,
    },
    {
      id: 'block-global-heading',
      type: 'text',
      html: `<h2>Global Comparisons Without Overreach</h2>`,
    },
    {
      id: 'block-global-img',
      type: 'full-width-image',
      src: urls['lex-ave-53-platform.jpg'],
      alt: 'E train approaching Lexington Ave-53rd St station with passengers on the platform and tunnel visible',
      caption: 'Lexington Ave–53 St — a train emerges from the tunnel into a busy platform. This is still manual operation at scale.',
    },
    {
      id: 'block-global-text',
      type: 'text',
      html: `<p>Many peer systems run one-person operation as normal. Some run driverless.</p><p>Paris converted Metro Line 1 to driverless service. Copenhagen opened as driverless from day one.</p><p>London is more complicated line-by-line, but the broader point holds. Large legacy metros have moved to one-person operation and partial automation in places. New York has been slower, and its staffing norms are tighter.</p>`,
    },
    {
      id: 'block-conclusion-heading',
      type: 'text',
      html: `<h2>What Actually Blocks Automation Here</h2>`,
    },
    {
      id: 'block-conclusion-img',
      type: 'full-width-image',
      src: urls['elevated-train-curve.jpg'],
      alt: 'Elevated subway train on a curved track with NYC skyline in the background',
      caption: 'A train rounds the elevated curve — moving forward, destination uncertain.',
    },
    {
      id: 'block-conclusion-text',
      type: 'text',
      html: `<p>It is not that the subway is "too big" or "too dangerous" in some unique way. It is that the prerequisites and incentives do not line up.</p><ol><li><strong>Most lines lack CBTC</strong>, so full automation can't scale yet.</li><li><strong>Labor agreements protect crew roles</strong>, and changing them is politically costly.</li><li><strong>State policy keeps trying to mandate conductors</strong>, and it nearly succeeded in 2025.</li></ol><p>The city can modernize signals. It can keep upgrading lines. But until labor and law move with the hardware, the cab stays staffed.</p><p>That is what "manual operation" means in New York. Not just a person at the controls. A whole structure that keeps them there.</p>`,
    },
  ];
}

function blocksToHtml(blocks) {
  const sizeMap = { '25': 'image-size-small', '50': 'image-size-medium', '75': 'image-size-large' };
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  return blocks.map(block => {
    switch (block.type) {
      case 'text':
        return block.html;
      case 'full-width-image': {
        const cap = block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '';
        return `<figure data-type="image" data-alignment="center" data-size="full" class="figure-image image-align-center image-size-full"><img src="${esc(block.src)}" alt="${esc(block.alt)}" />${cap}</figure>`;
      }
      case 'image-text-wrap': {
        const alignClass = block.alignment === 'left' ? 'image-align-left' : 'image-align-right';
        const sizeClass = sizeMap[block.size] || 'image-size-medium';
        const cap = block.caption ? `<figcaption>${esc(block.caption)}</figcaption>` : '';
        return `<figure data-type="image" data-alignment="${block.alignment}" data-size="${block.size}" class="figure-image ${alignClass} ${sizeClass}"><img src="${esc(block.src)}" alt="${esc(block.alt)}" />${cap}</figure>${block.html}<div style="clear:both"></div>`;
      }
      case 'image-grid': {
        const figs = block.images.map(img => {
          const cap = img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : '';
          return `<figure data-type="image" data-alignment="center" data-size="full" class="figure-image image-align-center image-size-full"><img src="${esc(img.src)}" alt="${esc(img.alt)}" />${cap}</figure>`;
        }).join('');
        return `<div data-type="image-gallery" data-columns="${block.columns}" class="image-gallery image-gallery-${block.columns}">${figs}</div>`;
      }
    }
  }).join('\n');
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('🚇 Creating blog post: Why NYC Subway Trains Still Aren\'t Automated\n');

  // 1. Upload images
  console.log('📸 Uploading images to R2...');
  const urls = await uploadImages();
  console.log('');

  // 2. Build content
  const blocks = buildContentBlocks(urls);
  const html = blocksToHtml(blocks);

  // 3. Get or create author
  let author = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!author) {
    author = await prisma.user.findFirst();
  }
  if (!author) {
    console.error('❌ No users found in database. Please log into the admin first to create your user record.');
    process.exit(1);
  }
  console.log(`👤 Author: ${author.firstName || ''} ${author.lastName || ''} (${author.email})`);

  // 4. Create or update post (upsert)
  const slug = 'why-nyc-subway-trains-still-arent-automated';
  const postData = {
      title: "Why NYC Subway Trains Still Aren't Automated",
      slug,
      excerpt: "New York runs trains the old way. A person drives. A person closes doors. That is not an accident. It is a system choice shaped by signals, labor, and law.",
      content: html,
      contentBlocks: JSON.stringify(blocks),
      featuredImage: urls['featured-cab-interior.jpg'],
      featuredImageAlt: 'Inside an NYC subway operator cab showing manual controls and empty seat',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: author.id,
      authorName: `${author.firstName || ''} ${author.lastName || ''}`.trim() || 'SubwaySounds',
      authorImage: author.imageUrl || null,
      authorRole: 'Editor',
      readingTimeMinutes: 6,
      metaTitle: "Why NYC Subway Trains Still Aren't Automated | SubwaySounds",
      metaDescription: "CBTC exists on the L and 7 trains, but signals, labor contracts, and state law keep human operators in every cab. Here is why.",
      ogImage: urls['featured-cab-interior.jpg'],
      keywords: JSON.stringify(['NYC subway automation', 'CBTC', 'subway signals', 'MTA', 'L train', 'subway conductor', 'train operator', 'ATO', 'GoA2']),
      category: 'HISTORY',
      tags: JSON.stringify(['automation', 'CBTC', 'signals', 'labor', 'MTA', 'technology']),
      featured: true,
  };

  const post = await prisma.post.upsert({
    where: { slug },
    update: postData,
    create: postData,
  });

  console.log(`\n✅ Blog post created!`);
  console.log(`   ID: ${post.id}`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   Status: ${post.status}`);
  console.log(`   URL: https://www.subwaysounds.net/blog/${post.slug}`);
  console.log(`   Admin: https://www.subwaysounds.net/admin/blog/${post.id}/edit`);

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
