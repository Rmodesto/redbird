import fs from 'fs';
import path from 'path';

const INTRO_DIR = path.join(process.cwd(), 'data', 'station-intros');

/**
 * Optional hand-written editorial intro for a station, keyed by slug
 * (data/station-intros/<slug>.md). Read at build time (station pages are
 * statically generated). Returns the file's text split into paragraphs on blank
 * lines, or null when no intro has been written. Never throws — a missing file
 * or unreadable directory simply means "no override".
 */
export function getStationIntro(slug: string): string[] | null {
  if (!slug) return null;
  try {
    const file = path.join(INTRO_DIR, `${slug}.md`);
    if (!fs.existsSync(file)) return null;
    const text = fs.readFileSync(file, 'utf8').trim();
    if (!text) return null;
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return paragraphs.length ? paragraphs : null;
  } catch {
    return null;
  }
}
