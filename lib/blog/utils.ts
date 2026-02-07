import slugifyLib from 'slugify';
import readingTimeLib from 'reading-time';
import DOMPurify from 'isomorphic-dompurify';

export function generateSlug(title: string): string {
  return slugifyLib(title, { lower: true, strict: true, trim: true });
}

export function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '');
  const result = readingTimeLib(text);
  return Math.max(1, Math.ceil(result.minutes));
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'code', 'pre',
      'blockquote', 'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'iframe', 'video', 'source',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'target', 'rel', 'class',
      'width', 'height', 'frameborder', 'allowfullscreen', 'allow',
      'autoplay', 'controls', 'type', 'data-youtube-video',
    ],
  });
}
