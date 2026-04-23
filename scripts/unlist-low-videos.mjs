import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json'); // uses the write-access token
const ANALYTICS_PATH = path.join(__dirname, 'channel-analytics.json');
const DELAY_MS = 300;

function getAuth() {
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const creds = raw.installed || raw.web;
  const oauth2 = new OAuth2Client(creds.client_id, creds.client_secret, 'http://localhost:8090');
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oauth2.setCredentials(token);
  return oauth2;
}

async function main() {
  console.log('=== Unlist Low-View Videos ===\n');

  if (!fs.existsSync(ANALYTICS_PATH)) {
    console.error('Missing channel-analytics.json. Run channel-analytics.mjs first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(ANALYTICS_PATH, 'utf-8'));
  const lowVideos = data.lowViewVideos || [];

  if (lowVideos.length === 0) {
    console.log('No low-view videos found.');
    return;
  }

  console.log(`Found ${lowVideos.length} videos with < 100 lifetime views.\n`);

  // Preview
  for (const v of lowVideos) {
    const type = v.duration <= 60 ? 'Short' : v.duration > 3600 ? 'Long ' : 'Vid  ';
    console.log(`  [${type}] ${v.views.toString().padStart(3)} views | ${v.title}`);
  }

  console.log(`\nUnlisting ${lowVideos.length} videos...\n`);

  const auth = getAuth();
  const yt = google.youtube({ version: 'v3', auth });

  let success = 0;
  let failed = 0;
  const remaining = [];

  for (const video of lowVideos) {
    try {
      await yt.videos.update({
        part: ['status'],
        requestBody: {
          id: video.id,
          status: {
            privacyStatus: 'unlisted',
          },
        },
      });
      console.log(`  ✅ Unlisted: ${video.title} (${video.id})`);
      success++;
    } catch (err) {
      const isQuota = /quota/i.test(err.message);
      console.log(`  ❌ Failed: ${video.title} — ${isQuota ? 'QUOTA' : err.message}`);
      failed++;
      remaining.push(video);

      if (isQuota) {
        // Save remaining for retry
        const leftover = lowVideos.slice(lowVideos.indexOf(video));
        const retryPath = path.join(__dirname, 'unlist-remaining.json');
        fs.writeFileSync(retryPath, JSON.stringify(leftover, null, 2));
        console.log(`\n  ⏸  Quota hit. ${leftover.length} remaining saved to unlist-remaining.json`);
        console.log(`     Run again after quota resets.`);
        break;
      }
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n=== Done ===`);
  console.log(`✅ Unlisted: ${success}`);
  console.log(`❌ Failed:   ${failed}`);
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
