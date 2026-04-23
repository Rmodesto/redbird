import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const REVIEW_PATH = path.join(__dirname, 'shorts-review.json');
const APPLIED_PATH = path.join(__dirname, 'shorts-applied.json');
const CHANNEL_ID = 'UCteXdWuT-IRRAVCg8ofeZBw';
const SCOPES = ['https://www.googleapis.com/auth/youtube'];
const APPLY = process.env.APPLY === 'true';
const ALL_VIDEOS = process.env.ALL_VIDEOS === 'true';
const CALLBACK_PORT = 8090;
const DELAY_MS = 300;

// ─── OAuth2 ───────────────────────────────────────────────

async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('\n  Missing scripts/credentials.json');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const creds = raw.installed || raw.web;
  const redirectUri = `http://localhost:${CALLBACK_PORT}`;
  const oauth2 = new OAuth2Client(creds.client_id, creds.client_secret, redirectUri);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oauth2.setCredentials(token);
    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log('Token expired — refreshing...');
      const { credentials } = await oauth2.refreshAccessToken();
      oauth2.setCredentials(credentials);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials, null, 2));
    }
    return oauth2;
  }

  const authUrl = oauth2.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  console.log('\nOpen this URL to authorize:\n');
  console.log(authUrl);
  console.log(`\nWaiting for callback on ${redirectUri} ...\n`);

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url, true);
      if (parsed.query.code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Authorized! You can close this tab.</h1>');
        server.close();
        resolve(parsed.query.code);
      } else {
        res.writeHead(400);
        res.end('Missing code');
      }
    });
    server.listen(CALLBACK_PORT);
    server.on('error', reject);
  });

  const { tokens } = await oauth2.getToken(code);
  oauth2.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('Token saved.\n');
  return oauth2;
}

// ─── YouTube helpers ──────────────────────────────────────

async function fetchAllVideoIds(yt) {
  const channelRes = await yt.channels.list({
    part: ['contentDetails'],
    id: [CHANNEL_ID],
  });
  const uploadsPlaylistId = channelRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    console.error('Could not find uploads playlist.');
    process.exit(1);
  }
  console.log(`Uploads playlist: ${uploadsPlaylistId}`);

  const ids = [];
  let pageToken;
  console.log('Fetching all channel videos...');
  do {
    const res = await yt.playlistItems.list({
      part: ['contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults: 50,
      pageToken,
    });
    for (const item of res.data.items || []) {
      const videoId = item.contentDetails?.videoId;
      if (videoId) ids.push(videoId);
    }
    pageToken = res.data.nextPageToken || undefined;
    process.stdout.write(`  ${ids.length} videos found...\r`);
  } while (pageToken);
  console.log(`  ${ids.length} videos found.      \n`);
  return ids;
}

async function getVideoDetails(yt, videoIds) {
  const results = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const res = await yt.videos.list({
      part: ['snippet', 'contentDetails'],
      id: batch,
    });
    for (const item of res.data.items || []) {
      results.push({
        id: item.id,
        title: item.snippet?.title || '',
        description: (item.snippet?.description || '').trim(),
        durationSeconds: parseDuration(item.contentDetails?.duration || ''),
        categoryId: item.snippet?.categoryId || '22',
        tags: item.snippet?.tags || [],
        defaultLanguage: item.snippet?.defaultLanguage,
        defaultAudioLanguage: item.snippet?.defaultAudioLanguage,
      });
    }
  }
  return results;
}

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

// ─── SEO Description Generator (4-Part AI-Era Formula) ───
//
// PART 1 — Hook: What the video shows (1-2 sentences, conversational)
// PART 2 — Context: Why it matters, historical/transit angle (2-3 sentences)
// PART 3 — Keywords: Train model, line, station, borough mentioned naturally
// PART 4 — Hashtags: Brand → topical → broad (6-10 max)

function generateDescription(title, durationSeconds) {
  const t = title.toLowerCase();
  const isShort = durationSeconds <= 60;

  // ── Detection ──────────────────────────────────────────

  // Train model (R46, R62A, R142, R179, R188, R211, etc.)
  const trainModelMatch = t.match(/\b(r\d{1,3}[a-z]?)\b/i);
  const model = trainModelMatch ? trainModelMatch[1].toUpperCase() : null;

  // Line detection — handle "(2)" and "2 train" and "D train" patterns
  const linePatterns = [
    /\(([1-7ABCDEFGJLMNQRSWZ])\)/i,
    /\b([1-7ABCDEFGJLMNQRSWZ])\s*(?:train|line)\b/i,
  ];
  let lineName = null;
  for (const pat of linePatterns) {
    const m = pat.exec(title);
    if (m) { lineName = m[1].toUpperCase(); break; }
  }

  // Station / location
  const stationMatch = t.match(/(?:@|at|in)\s+(.+?)(?:\s*[#|!?]|$)/i);
  const stationFromTitle = stationMatch ? stationMatch[1].trim().replace(/\b\w/g, c => c.toUpperCase()) : null;

  // Borough
  const boroughMatch = t.match(/\b(brooklyn|bronx|queens|manhattan|staten\s*island|harlem|washington\s*heights|inwood|upper\s*west|upper\s*east|midtown|downtown|uptown)\b/i);
  const borough = boroughMatch ? boroughMatch[0].replace(/\b\w/g, c => c.toUpperCase()) : null;

  // Category detection (ordered by specificity)
  const isSafety = /\b(fall|safe|safety|tracks?|rescue|danger|close\s*call|save[ds]?|careful|watch\s*out|tip[s]?)\b/i.test(t);
  const isQuestion = /^(how|why|what|when|where|did|is|are|do|does|can|top\s*\d)\b/i.test(title.trim());
  const isHistory = /\b(history|historic|first|oldest|original|inventor|invented|created|founded|story\s*of|origin|century|years?\s*of|memorial|tribute|rememb|honoring|legacy|pioneer|legend)\b/i.test(t);
  const isCulture = /\b(graffiti|art|hip\s*hop|paint|tag|bomb|street\s*art|music|perform|busker|dancer|pizza|food|movie|film)\b/i.test(t);
  const isAmbient = /\b(asmr|ambien|sound[s]?\s*(for|of)|white\s*noise|sleep|relax|rain|hours?\b|study|focus|calm)\b/i.test(t);
  const isAction = /\b(race|racing|fast|fastest|speed|dime|fly|flying|rip|express|horn|honk|skip|blast)\b/i.test(t);
  const isInternational = /\b(santo\s*domingo|metro\b|london|tokyo|paris|mexico|madrid|moscow|puerto\s*rico|tren\s*urban|dominican)\b/i.test(t) && !/metro.?north|metro.?card/i.test(t);
  const isDerail = /\b(derail|crash|accident|incident|collision)\b/i.test(t);
  const isNotInService = /not\s*in\s*service/i.test(t);
  const isDelay = /\b(delay|late|stuck|held|wait|signal|congestion)\b/i.test(t);
  const isDoor = /\b(door|closing|chime|conductor)\b/i.test(t);
  const isCaught = /caught\s*on\s*camera|caught|rare|unusual|crazy|wild|insane|dang|omg|wtf/i.test(t);
  const isEtiquette = /\b(etiquette|rule|tip|manner|don't|please|stop)\b/i.test(t);
  const isFare = /\b(fare|metrocard|omny|swipe|tap|evasi|payment|price|cost|congestion\s*pric)\b/i.test(t);
  const isAccessibility = /\b(ada|accessibility|elevator|wheelchair|disab|ramp)\b/i.test(t);
  const isConstruction = /\b(construc|work|repair|renovat|restor|new\s*station|upgrade)\b/i.test(t);

  // ── Build 4-part description ───────────────────────────

  let hook = '';
  let context = '';
  let keywords = '';
  const hashtags = ['#SubwaySounds', '#NYCSubway', '#MTA'];

  // ── TRAIN MODEL SPOTTING ──
  if (model) {
    const modelLine = lineName ? ` on the ${lineName} line` : '';
    const modelStation = stationFromTitle ? ` at ${stationFromTitle}` : '';

    if (isNotInService) {
      hook = `${model}${modelLine} spotted Not in Service${modelStation}. You don't see these out of revenue service every day.`;
      context = `When MTA pulls a consist off the line, it's usually heading to the yard for maintenance, testing, or crew training. These moments are rare catches for anyone watching the system.`;
    } else if (isAction || isCaught) {
      hook = `${model}${modelLine} caught in action${modelStation} — fast, loud, and unmistakable.`;
      context = `The ${model} fleet is one of the workhorses of the New York City subway system. Every car model sounds different at speed — and this one delivers.`;
    } else if (isDoor) {
      hook = `${model} door action${modelStation}. That chime, the hydraulic close, the conductor's call — pure MTA.`;
      context = `Door sounds vary across the NYC subway fleet. The ${model} has its own distinct sequence that riders hear millions of times a day.`;
    } else {
      hook = `${model}${modelLine} spotted${modelStation}. This is what ${model} cars look and sound like in active service on the NYC subway.`;
      context = `The MTA operates one of the most diverse subway car fleets in the world. Each model — from the classic R46 to the brand new R211 — has its own character, sound, and feel.`;
    }
    keywords = `NYC subway ${model} train${lineName ? ` ${lineName} train` : ''}${borough ? ` ${borough}` : ''} MTA train spotting New York City transit.`;
    hashtags.push('#RailFan', '#TrainSpotting', `#${model}`);
    if (lineName) hashtags.push(`#${lineName}Train`);

  // ── SAFETY ──
  } else if (isSafety) {
    hook = `${title.replace(/[!🛑⚠️]+/g, '').trim()} — this is real, and every NYC subway rider should know it.`;
    context = `The New York City subway moves over 3.6 million riders daily across 472 stations. Knowing what to do in an emergency — especially on the platform and near the tracks — can save your life. The MTA has safety infrastructure most riders never notice until they need it.`;
    keywords = `NYC subway safety tips MTA platform safety New York City transit emergency subway tracks.`;
    hashtags.push('#SubwaySafety', '#StaySafe', '#PlatformSafety', '#TransitSafety');

  // ── HISTORY & TRIBUTES ──
  } else if (isHistory) {
    hook = `${title.replace(/[‼️!]+/g, '').trim()} — a piece of New York City transit history most people don't know about.`;
    context = `The NYC subway system opened in 1904 and has been shaping the city ever since. From the workers who built it to the communities it connected, every tunnel and tile wall has a story. These are the moments that made the system what it is today.`;
    keywords = `NYC subway history MTA transit history New York City subway facts historical subway moments.`;
    hashtags.push('#TransitHistory', '#NYCHistory', '#DidYouKnow', '#SubwayFacts');

  // ── QUESTIONS & EXPLAINERS ──
  } else if (isQuestion) {
    const cleanTitle = title.replace(/[!?‼️⁉️]+/g, '').trim();
    hook = `${cleanTitle}? Real answers from someone who rides and documents the NYC subway every day.`;
    context = `The New York City subway is one of the oldest and most complex transit systems in the world — 472 stations, 245 miles of routes, running 24/7. There's an engineering story, a design reason, or a piece of history behind almost everything you see underground.`;
    keywords = `NYC subway facts how the subway works MTA explained New York City transit questions.`;
    hashtags.push('#TransitFacts', '#DidYouKnow', '#TransitHistory', '#SubwayFacts');

  // ── CULTURE ──
  } else if (isCulture) {
    hook = `${title.replace(/[!🍕🎵]+/g, '').trim()} — the NYC subway isn't just transportation, it's culture.`;
    context = `From graffiti writers in the '70s to buskers performing for rush hour crowds, the subway has always been New York's most democratic stage. It shaped hip hop, street art, and the way the city eats, moves, and creates. The underground is where NYC culture lives.`;
    keywords = `NYC subway culture MTA art music New York City subway history street art transit.`;
    hashtags.push('#SubwayCulture', '#NYCCulture', '#StreetArt', '#NYCHistory');

  // ── AMBIENT / ASMR ──
  } else if (isAmbient) {
    if (durationSeconds > 3600) {
      const hours = Math.round(durationSeconds / 3600);
      hook = `${hours}+ hours of real NYC subway sounds recorded aboard the MTA — the rumble, screech, and rhythm of a city that never stops moving.`;
      context = `Perfect for sleep, study, or deep focus. The New York City subway runs 24/7 across all five boroughs, and its ambient soundscape is unlike anything else. This recording captures the authentic sounds of steel on rail, air brakes, distant announcements, and the constant hum of a system carrying millions.`;
    } else {
      hook = `Authentic NYC subway ambience — raw, unprocessed audio straight from the platform and the train car.`;
      context = `The New York City subway has its own soundscape. Steel wheels on century-old rail, hydraulic doors, ventilation echoes, the distant rumble of a train three stations away. Some call it noise — others call it the city breathing.`;
    }
    keywords = `NYC subway ASMR subway train sounds MTA ambient noise New York subway sounds for sleep study focus white noise.`;
    hashtags.push('#ASMR', '#SubwayASMR', '#WhiteNoise', '#Ambience', '#SleepSounds', '#StudyMusic');

  // ── INTERNATIONAL TRANSIT ──
  } else if (isInternational) {
    hook = `Transit beyond the five boroughs — a look at how other cities move their people.`;
    context = `Every metro system in the world has its own sound, its own rhythm, its own personality. Comparing NYC's MTA to systems in the Caribbean, Europe, and Asia puts the scale and character of New York's subway into perspective. Different city, same love for trains.`;
    keywords = `metro transit international subway train comparison world metro systems.`;
    hashtags.push('#MetroWorld', '#Transit', '#TrainSpotting', '#InternationalTransit');

  // ── DERAILMENTS / INCIDENTS ──
  } else if (isDerail) {
    hook = `${title.replace(/[!⁉️]+/g, '').trim()} — when things go wrong underground, this is what it looks like.`;
    context = `NYC subway derailments are rare but impactful — they disrupt service for millions and expose the engineering challenges of running a 120-year-old system 24/7. Understanding how and why they happen is part of understanding how the MTA works.`;
    keywords = `NYC subway derailment MTA incident subway accident New York transit.`;
    hashtags.push('#SubwaySafety', '#TransitNews', '#MTA');

  // ── DELAYS ──
  } else if (isDelay) {
    hook = `${title.replace(/[!?⁉️]+/g, '').trim()} — if you ride the NYC subway, you've lived this.`;
    context = `Signal problems, sick passengers, police activity, overcrowding — the MTA juggles a century-old infrastructure with modern ridership demands across 472 stations. Delays aren't random; there's always a reason, and usually a story.`;
    keywords = `NYC subway delays MTA service disruption why trains are late New York subway problems.`;
    hashtags.push('#SubwayDelay', '#MTA', '#NYCCommute');

  // ── FARE / METROCARD / OMNY ──
  } else if (isFare) {
    hook = `${title.replace(/[!💰]+/g, '').trim()} — the economics of riding the New York City subway.`;
    context = `From the original 5-cent fare to OMNY's tap-to-pay system, how New Yorkers pay to ride has evolved alongside the city itself. The MTA's fare system funds the largest public transit network in North America.`;
    keywords = `NYC subway fare MetroCard OMNY MTA payment New York transit cost.`;
    hashtags.push('#MetroCard', '#OMNY', '#TransitFare', '#MTA');

  // ── ACCESSIBILITY ──
  } else if (isAccessibility) {
    hook = `${title.replace(/[!]+/g, '').trim()} — accessibility on the NYC subway is still a work in progress.`;
    context = `Only about 28% of NYC subway stations are ADA accessible. For millions of riders with disabilities, strollers, or heavy luggage, the system presents daily challenges that most commuters never think about. The MTA is investing billions to change that — slowly.`;
    keywords = `NYC subway accessibility ADA elevator MTA disabled riders New York transit.`;
    hashtags.push('#Accessibility', '#ADA', '#TransitEquity', '#MTA');

  // ── CONSTRUCTION / UPGRADES ──
  } else if (isConstruction) {
    hook = `${title.replace(/[!⁉️]+/g, '').trim()} — the MTA is constantly rebuilding the system from the inside out.`;
    context = `The NYC subway never stops running, which means every repair, upgrade, and renovation happens around live service. Track work, signal modernization, station overhauls — it's a 24/7 construction project on a system that's over a century old.`;
    keywords = `NYC subway construction MTA renovation station upgrade New York transit infrastructure.`;
    hashtags.push('#MTA', '#TransitInfrastructure', '#Construction');

  // ── ETIQUETTE ──
  } else if (isEtiquette) {
    hook = `${title.replace(/[!]+/g, '').trim()} — unwritten rules of riding the NYC subway.`;
    context = `There's no official handbook, but every New Yorker knows the code: don't block the doors, move to the center, let people off first. These aren't just manners — they keep a system moving 3.6 million people a day from grinding to a halt.`;
    keywords = `NYC subway etiquette rules tips MTA rider guide New York transit manners.`;
    hashtags.push('#SubwayEtiquette', '#NYCTips', '#MTA');

  // ── ACTION / EXPRESS / SPEED ──
  } else if (isAction) {
    hook = `${title.replace(/[!‼️]+/g, '').trim()} — NYC subway in full send mode.`;
    context = `When an express train hits top speed through the tunnel, the sound is something else entirely. Air pressure, steel grinding on rail, that doppler shift as it blows past a local platform. The MTA's system tops out around 55 mph — and it feels every bit of it underground.`;
    keywords = `NYC subway express train fast MTA speed New York transit action.`;
    hashtags.push('#RailFan', '#TrainSpotting', '#Express', '#SubwaySpeed');

  // ── "CAUGHT ON CAMERA" / VIRAL MOMENTS ──
  } else if (isCaught) {
    hook = `${title.replace(/[!]+/g, '').trim()} — the kind of thing you only see on the New York City subway.`;
    context = `The MTA carries 3.6 million riders a day across 472 stations. With that many people underground, every ride has the potential for something you've never seen before. This is what makes the NYC subway endlessly watchable.`;
    keywords = `NYC subway caught on camera viral moment MTA New York transit.`;
    hashtags.push('#CaughtOnCamera', '#NYCSubway', '#Viral');

  // ── STATION / LOCATION SPECIFIC ──
  } else if (stationFromTitle || borough) {
    const loc = stationFromTitle || borough;
    hook = `${loc} — captured on the platform, exactly as it sounds and looks.`;
    context = `Every one of the NYC subway's 472 stations has its own acoustics, its own architecture, and its own energy. The tiles, the curves, the depth underground — they all shape the experience. ${loc} is one of those stops that has a feel you recognize the moment you step off the train.`;
    keywords = `NYC subway ${loc} station MTA New York City transit ${borough || 'New York'}.`;
    hashtags.push('#TrainSpotting', '#StationLife');
    if (/brooklyn/i.test(t)) hashtags.push('#Brooklyn');
    if (/bronx/i.test(t)) hashtags.push('#Bronx');
    if (/queens/i.test(t)) hashtags.push('#Queens');
    if (/harlem/i.test(t)) hashtags.push('#Harlem');
    if (/manhattan/i.test(t)) hashtags.push('#Manhattan');

  // ── LINE-SPECIFIC ──
  } else if (lineName) {
    const lineNames = {
      '1': 'Broadway–7th Avenue Local', '2': '7th Avenue Express', '3': '7th Avenue Express',
      '4': 'Lexington Avenue Express', '5': 'Lexington Avenue Express', '6': 'Lexington Avenue Local',
      '7': 'Flushing Local/Express',
      'A': '8th Avenue Express', 'B': '6th Avenue Express', 'C': '8th Avenue Local',
      'D': '6th Avenue Express', 'E': '8th Avenue Local', 'F': '6th Avenue Local',
      'G': 'Brooklyn–Queens Crosstown', 'J': 'Nassau Street Express', 'L': '14th Street–Canarsie Local',
      'M': '6th Avenue Local', 'N': 'Broadway Express', 'Q': 'Broadway Express',
      'R': 'Broadway Local', 'S': 'Shuttle', 'W': 'Broadway Local', 'Z': 'Nassau Street Express',
    };
    const fullName = lineNames[lineName] || '';
    hook = `The ${lineName} train${fullName ? ` (${fullName})` : ''} — captured in the New York City subway system.`;
    context = `The MTA's ${lineName} line is one of ${lineName <= '7' ? 'the IRT division\'s numbered routes, running through some of the oldest tunnels in the system' : 'the IND/BMT lettered routes that expanded the subway across the boroughs'}. Every line has its own rhythm, its own crowd, and its own sound — shaped by the tunnels it runs through and the cars it uses.`;
    keywords = `NYC subway ${lineName} train MTA ${fullName} New York City transit ${lineName} line.`;
    hashtags.push('#RailFan', `#${lineName}Train`, '#TrainSpotting');

  // ── FALLBACK — still 4-part, still SEO-rich ──
  } else {
    const fallbacks = [
      {
        hook: `Real footage from inside the New York City subway system — no commentary, no edits, just the MTA as it is.`,
        context: `The NYC subway is the largest rapid transit system in the world by number of stations (472) and one of the few that runs 24/7. It moves 3.6 million people every day through tunnels that are over a century old. Every ride sounds different, looks different, and tells a different story.`,
      },
      {
        hook: `Another moment captured underground in New York City — the subway never stops delivering.`,
        context: `With 245 miles of routes across all five boroughs, the MTA's subway is the backbone of New York. The sounds you hear down here — steel on rail, air brakes, garbled announcements — are the ambient soundtrack of the city itself.`,
      },
      {
        hook: `The NYC subway, documented. Raw, unfiltered, straight from the platform.`,
        context: `There's no transit system in the world quite like New York's. Built in 1904 and expanded ever since, it's a living museum of engineering, design, and urban grit. These are the sights and sounds that millions of New Yorkers experience every single day.`,
      },
      {
        hook: `Straight from the New York City underground — the MTA in motion.`,
        context: `The subway is more than transportation. It's where New York happens — between the turnstile and the platform, in the space between stops, surrounded by the mechanical heartbeat of a system that never sleeps. This is what it actually looks and sounds like.`,
      },
      {
        hook: `You either love the NYC subway or you ride it long enough to love it. This is the real thing.`,
        context: `Over 3.6 million daily riders share these tunnels, platforms, and train cars across 472 stations in all five boroughs. The MTA subway has been running since 1904, and every inch of it has a story. No two rides are exactly the same.`,
      },
    ];
    const pick = fallbacks[title.length % fallbacks.length];
    hook = pick.hook;
    context = pick.context;
    keywords = `NYC subway MTA New York City transit subway sounds train New York underground.`;
    hashtags.push('#RailFan', '#Transit', '#NewYorkCity');
  }

  // ── Assemble ───────────────────────────────────────────
  return `${hook}\n\n${context}\n\n${keywords}\n\n${hashtags.join(' ')}`;
}

// ─── Determine if a description needs updating ───────────

function needsNewDescription(desc) {
  if (!desc) return true;
  // Hashtag-only descriptions (just tags + maybe a Spotify link)
  const stripped = desc
    .replace(/#\w+/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/🎧|🎞|SPOTIFY|APPLE|Stream\s*Us/gi, '')
    .trim();
  // If after removing hashtags, links, and streaming refs there's less than 50 chars of real content
  if (stripped.length < 50) return true;
  return false;
}

// ─── STEP 2: Apply ───────────────────────────────────────

async function applyDescriptions(yt) {
  if (!fs.existsSync(REVIEW_PATH)) {
    console.error('No shorts-review.json found. Run discover step first.');
    process.exit(1);
  }

  const entries = JSON.parse(fs.readFileSync(REVIEW_PATH, 'utf-8'));
  console.log(`Applying descriptions to ${entries.length} videos...\n`);

  const ids = entries.map(e => e.id);
  const details = await getVideoDetails(yt, ids);
  const detailMap = Object.fromEntries(details.map(d => [d.id, d]));

  let success = 0;
  let failed = 0;
  const failedEntries = [];

  for (const entry of entries) {
    const detail = detailMap[entry.id];
    if (!detail) {
      console.log(`❌ ${entry.title} (${entry.id}) — video not found`);
      failedEntries.push(entry);
      failed++;
      continue;
    }

    try {
      await yt.videos.update({
        part: ['snippet'],
        requestBody: {
          id: entry.id,
          snippet: {
            title: detail.title,
            description: entry.proposedDescription,
            categoryId: detail.categoryId,
            tags: detail.tags,
            defaultLanguage: detail.defaultLanguage,
            defaultAudioLanguage: detail.defaultAudioLanguage,
          },
        },
      });
      console.log(`✅ ${entry.title} (${entry.id})`);
      success++;
    } catch (err) {
      const isQuota = /quota/i.test(err.message);
      console.log(`❌ ${entry.title} (${entry.id}) — ${isQuota ? 'QUOTA EXCEEDED' : err.message}`);
      failedEntries.push(entry);
      failed++;

      // If quota hit, save remaining and stop
      if (isQuota) {
        const remaining = entries.slice(entries.indexOf(entry));
        fs.writeFileSync(REVIEW_PATH, JSON.stringify(remaining, null, 2));
        console.log(`\n⏸  Quota hit. ${remaining.length} remaining saved to shorts-review.json`);
        console.log(`   Run again after quota resets (midnight Pacific).`);
        break;
      }
    }

    await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // If we completed everything without quota issues, rename
  if (failedEntries.length === 0 || !failedEntries.some(e => /quota/i.test(e.error))) {
    if (fs.existsSync(REVIEW_PATH)) {
      fs.renameSync(REVIEW_PATH, APPLIED_PATH);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`✅ Updated: ${success}`);
  console.log(`❌ Failed:  ${failed}`);
}

// ─── STEP 1: Discover & Propose ──────────────────────────

async function discoverAndPropose(yt) {
  const videoIds = await fetchAllVideoIds(yt);
  if (videoIds.length === 0) {
    console.log('No videos found on channel.');
    return;
  }

  console.log('Fetching video details...');
  const videos = await getVideoDetails(yt, videoIds);

  // Filter based on mode
  let targets;
  if (ALL_VIDEOS) {
    // ALL videos (Shorts + long-form) that need better descriptions
    targets = videos.filter(v => needsNewDescription(v.description));
    console.log(`\nTotal videos:              ${videos.length}`);
    console.log(`Videos with good desc:     ${videos.length - targets.length}`);
    console.log(`Videos needing SEO update: ${targets.length}\n`);
  } else {
    // Default: only Shorts
    const shorts = videos.filter(v => v.durationSeconds <= 60);
    targets = shorts.filter(v => needsNewDescription(v.description));
    console.log(`\nTotal videos:              ${videos.length}`);
    console.log(`Shorts (<= 60s):           ${shorts.length}`);
    console.log(`Shorts needing SEO update: ${targets.length}\n`);
  }

  if (targets.length === 0) {
    console.log('All videos already have optimized descriptions. Nothing to do.');
    return;
  }

  const proposals = targets.map(v => ({
    id: v.id,
    title: v.title,
    durationSeconds: v.durationSeconds,
    currentDescription: v.description,
    proposedDescription: generateDescription(v.title, v.durationSeconds),
  }));

  fs.writeFileSync(REVIEW_PATH, JSON.stringify(proposals, null, 2));
  console.log(`Wrote ${proposals.length} proposals to scripts/shorts-review.json\n`);

  // Print sample
  console.log('=== SAMPLE PROPOSED DESCRIPTIONS (first 10) ===\n');
  for (const p of proposals.slice(0, 10)) {
    console.log(`[${p.durationSeconds}s] ${p.title}`);
    console.log(`  ID: ${p.id}`);
    console.log(`  CURRENT: ${p.currentDescription ? p.currentDescription.substring(0, 60) + '...' : '(empty)'}`);
    console.log(`  PROPOSED:`);
    for (const line of p.proposedDescription.split('\n')) {
      console.log(`    ${line}`);
    }
    console.log('');
  }

  console.log(`Total proposals: ${proposals.length}`);
  console.log(`\nReview scripts/shorts-review.json, then run: APPLY=true node scripts/update-shorts.mjs`);
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('=== Subway Sounds — YouTube SEO Description Optimizer ===\n');

  const auth = await authorize();
  const yt = google.youtube({ version: 'v3', auth });

  if (APPLY) {
    console.log('MODE: APPLY (writing descriptions to YouTube)\n');
    await applyDescriptions(yt);
  } else {
    console.log(`MODE: DISCOVER ${ALL_VIDEOS ? '(ALL videos)' : '(Shorts only)'}\n`);
    await discoverAndPropose(yt);
  }
}

main().catch(err => {
  console.error('Fatal:', err.message || err);
  process.exit(1);
});
