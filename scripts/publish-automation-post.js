/**
 * Publish "Why NYC Subway Trains Still Aren't Automated" blog post to production.
 * Usage: node scripts/publish-automation-post.js
 */

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Load .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'subway-sounds-images';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-e840d0273cf34b648e38bac3383b2fa1.r2.dev';

async function uploadImage(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);
  const hash = crypto.randomBytes(8).toString('hex');
  const key = `blog/${Date.now()}-${hash}${ext}`;

  const mimeTypes = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif',
  };

  await r2Client.send(new PutObjectCommand({
    Bucket: BUCKET_NAME, Key: key, Body: buffer,
    ContentType: mimeTypes[ext.toLowerCase()] || 'image/jpeg',
  }));

  const url = `${PUBLIC_URL}/${key}`;
  console.log(`  Uploaded: ${path.basename(filePath)} -> ${url}`);
  return url;
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').trim();
}

function calcReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, '');
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length / 200));
}

async function main() {
  console.log('🚇 Publishing: "Why NYC Subway Trains Still Aren\'t Automated"\n');

  // 1. Find admin user
  const user = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!user) { console.error('No admin user found.'); process.exit(1); }
  console.log(`Found admin: ${user.firstName} ${user.lastName} (${user.email})\n`);

  // 2. Upload images if available
  const imagesDir = path.join(__dirname, 'images');
  const imageUrls = [];

  if (fs.existsSync(imagesDir)) {
    console.log('Uploading images to R2...');
    const files = fs.readdirSync(imagesDir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f)).sort();
    for (const file of files) {
      const url = await uploadImage(path.join(imagesDir, file));
      imageUrls.push(url);
    }
    console.log(`Uploaded ${imageUrls.length} images.\n`);
  } else {
    console.log('No scripts/images/ directory — creating post without images.\n');
  }

  // 3. Build content blocks
  const blocks = [];
  let bc = 0;
  const bid = () => `block-${Date.now()}-${++bc}`;

  blocks.push({ id: bid(), type: 'text', html: '<p>New York runs trains the old way. A person drives. A person closes doors. That is not an accident. It is a system choice.</p><p>The reasons come down to three things. Signals. Labor. Law.</p>' });

  if (imageUrls[0]) {
    blocks.push({ id: bid(), type: 'full-width-image', src: imageUrls[0], alt: 'R160 subway train operator cab viewed through the front window', caption: 'The R160 operator cab — still very much human-operated.' });
  }

  blocks.push({ id: bid(), type: 'text', html: '<h2>The Signals Are the Real Floor</h2><p>Most of the subway still uses fixed-block signaling. That means the system knows a train is "in a block," not exactly where it is. Blocks can be long. Safety margins have to be wide.</p><p>If you want real automation, you need continuous position tracking. That is what Communications-Based Train Control does. CBTC brings Automatic Train Operation with it.</p><p>CBTC is not everywhere. It is limited compared to the size of the system.</p><p>The MTA\'s own description is blunt. CBTC provides precise train location. ATO controls acceleration and braking for consistency.</p>' });

  if (imageUrls.length >= 3) {
    blocks.push({ id: bid(), type: 'image-grid', columns: 2, images: [
      { src: imageUrls[1], alt: 'R160 operator cab interior showing dual display screens and controls', caption: 'R160 cab interior with CBTC-ready displays' },
      { src: imageUrls[2], alt: 'Detailed view of R160 operator console with CBTC screens', caption: 'The R160 CBTC console up close' },
    ]});
  }

  blocks.push({ id: bid(), type: 'text', html: '<h2>CBTC Exists. Policy Keeps Humans in the Loop.</h2><p>Two lines matter here.</p><p>The L train and the 7 train got full CBTC rollouts. That is where New York has the machinery for modern automation.</p><p>On the L, trains operate under full Automatic Train Operation at Grade of Automation 2. A human operator still rides on every train. They are there to supervise and intervene. The train can handle speed control and station stopping under ATO.</p><p>So the question is not "can the train do it." The question is "will New York let staffing change when it can."</p>' });

  if (imageUrls[3]) {
    blocks.push({ id: bid(), type: 'full-width-image', src: imageUrls[3], alt: 'L train arriving at a station platform', caption: 'An L train pulls into the station — one of two lines with full CBTC.' });
  }

  blocks.push({ id: bid(), type: 'text', html: '<h2>The Crew Is a Contract Issue</h2><p>New York is unusual in keeping two-person crews as the norm. Operator plus conductor.</p><p>The union argument is safety. Doors. Evacuations. Emergencies.</p><p>The management argument is cost and flexibility. One-person operation is common elsewhere. Driverless lines exist across the world.</p><p>In New York, this fight does not live in a lab. It lives in labor negotiations.</p>' });

  if (imageUrls[4]) {
    blocks.push({ id: bid(), type: 'full-width-image', src: imageUrls[4], alt: 'Subway conductor leaning out of the train window to check the platform', caption: 'A conductor checks the platform — a role labor wants to keep.' });
  }

  blocks.push({ id: bid(), type: 'text', html: '<h2>The Law Got Close to Freezing It</h2><p>This is where the 2025 update matters.</p><p>New York lawmakers advanced bills that would require a conductor onboard. In the 2025 session, S4091 / A4873 would require at least one conductor on trains over two cars.</p><p>That legislation passed the full Legislature in 2025. Governor Hochul vetoed it in December 2025.</p><p>So it did not just "stall" as an idea. It nearly became permanent policy.</p><p>That matters because CBTC upgrades take years. A conductor mandate would lock in staffing rules while technology changes around it.</p>' });

  blocks.push({ id: bid(), type: 'text', html: '<h2>The 42nd Street Shuttle Test Didn\'t "Blend" Into One Event</h2><p>New York tested automation before. The 42nd Street Shuttle was the showcase.</p><p>But two separate incidents in 1964 helped end that chapter.</p><ul><li>April 16, 1964: an automated shuttle train derailed east of Times Square during the morning rush.</li><li>April 21, 1964: a severe fire at Grand Central destroyed the demonstration train. The fire began under a shuttle train on track 3.</li></ul><p>Five days apart. Different failures. Same outcome: the appetite for automation collapsed.</p>' });

  blocks.push({ id: bid(), type: 'text', html: '<h2>Global Comparisons Without Overreach</h2><p>Many peer systems run one-person operation as normal. Some run driverless.</p><p>Paris converted Metro Line 1 to driverless service. Copenhagen opened as driverless from day one.</p><p>London is more complicated line-by-line, but the broader point holds. Large legacy metros have moved to one-person operation and partial automation in places. New York has been slower, and its staffing norms are tighter.</p>' });

  blocks.push({ id: bid(), type: 'text', html: '<h2>What Actually Blocks Automation Here</h2><p>It is not that the subway is "too big" or "too dangerous" in some unique way. It is that the prerequisites and incentives do not line up.</p><ol><li>Most lines lack CBTC, so full automation can\'t scale yet.</li><li>Labor agreements protect crew roles, and changing them is politically costly.</li><li>State policy keeps trying to mandate conductors, and it nearly succeeded in 2025.</li></ol><p>The city can modernize signals. It can keep upgrading lines. But until labor and law move with the hardware, the cab stays staffed.</p><p>That is what "manual operation" means in New York. Not just a person at the controls. A whole structure that keeps them there.</p>' });

  // 4. Build flat HTML
  const fullHtml = blocks.filter(b => b.type === 'text').map(b => b.html).join('');
  const title = "Why NYC Subway Trains Still Aren't Automated";
  const slug = generateSlug(title);
  const readingTime = calcReadingTime(fullHtml);

  // 5. Check for duplicate
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Post "${slug}" already exists (id: ${existing.id}, status: ${existing.status}).`);
    console.log('Delete it first if you want to recreate.');
    await prisma.$disconnect(); return;
  }

  // 6. Create + publish
  console.log('Creating blog post...');
  const post = await prisma.post.create({
    data: {
      title, slug,
      excerpt: 'New York runs trains the old way. A person drives. A person closes doors. The reasons come down to three things: signals, labor, and law.',
      content: fullHtml,
      contentBlocks: JSON.stringify(blocks),
      featuredImage: imageUrls[0] || null,
      featuredImageAlt: 'R160 subway train operator cab viewed through the front window',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user.id,
      authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Admin',
      readingTimeMinutes: readingTime,
      metaTitle: "Why NYC Subway Trains Still Aren't Automated",
      metaDescription: 'The NYC subway keeps humans in the cab. It comes down to signals, labor contracts, and state law — not just technology.',
      ogImage: imageUrls[0] || null,
      keywords: JSON.stringify(['NYC subway', 'automation', 'CBTC', 'MTA', 'subway operations', 'transit technology']),
      category: 'HISTORY',
      tags: JSON.stringify(['automation', 'CBTC', 'signals', 'labor', 'operations', 'MTA']),
      views: 0, featured: false,
      authorImage: user.imageUrl || null,
      authorRole: 'Contributing Writer',
    },
  });

  console.log(`\n✅ Post published!`);
  console.log(`   ID:    ${post.id}`);
  console.log(`   Slug:  ${post.slug}`);
  console.log(`   URL:   https://www.subwaysounds.net/blog/${post.slug}`);
  console.log(`   Edit:  https://www.subwaysounds.net/admin/blog/${post.id}/edit`);
  if (!imageUrls.length) console.log('\n⚠️  No images uploaded. Add them via the admin editor.');

  await prisma.$disconnect();
}

main().catch(async (e) => { console.error('Failed:', e); await prisma.$disconnect(); process.exit(1); });
