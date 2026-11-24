import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { generateBlogPostMetadata, generateBlogPostJsonLd } from '@/lib/blog/seo.service';
import * as postService from '@/lib/blog/post.service';
import { sanitizeHtml } from '@/lib/blog/utils';
import ViewTracker from '@/components/blog/ViewTracker';
import AdSlot from '@/components/blog/AdSlot';
import ArticleRail, { type TocItem } from '@/components/blog/ArticleRail';
import PostSoundCard from '@/components/blog/PostSoundCard';
import SiteHeader from '@/components/site/SiteHeader';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const slugs = await postService.getAllPublishedSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // Database not available during build (e.g., missing DATABASE_URL)
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);
  if (!post) return {};
  return generateBlogPostMetadata(post);
}

export const revalidate = 60;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** Plain text of a heading, for the contents list. */
function headingText(inner: string): string {
  return inner
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim();
}

/** Anchor ids are generated, never taken from content — only [a-z0-9-] survives. */
function slugifyHeading(text: string, used: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'section';
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

/**
 * Adds anchor ids to the article's h2s and returns the contents list.
 * Runs on already-sanitized markup; the only thing it injects is a slug built
 * from characters we generated ourselves.
 */
function withHeadingAnchors(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  const out = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (match, attrs: string, inner: string) => {
      const text = headingText(inner);
      if (!text) return match;

      const existing = /\sid=["']([^"']*)["']/i.exec(attrs);
      if (existing) {
        used.add(existing[1]);
        toc.push({ id: existing[1], title: text });
        return match;
      }

      const id = slugifyHeading(text, used);
      toc.push({ id, title: text });
      return `<h2${attrs} id="${id}">${inner}</h2>`;
    },
  );

  return { html: out, toc };
}

/** The first YouTube id the post itself embeds, if any. */
function firstYouTubeId(html: string): string | null {
  const m = html.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m ? m[1] : null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SS';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

const ZIGZAG =
  "url(data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%278%27%20height=%278%27%3E%3Cpath%20d=%27M0%207L4%201L8%207%27%20fill=%27none%27%20stroke=%27%23111%27%20stroke-width=%271.3%27/%3E%3C/svg%3E)";

/** Typography for the post's own HTML, mapped onto the design system. */
const ARTICLE_PROSE = [
  'prose max-w-none text-ink',
  'prose-headings:font-bold prose-headings:text-ink prose-headings:tracking-[-.01em]',
  'prose-h2:text-h3 prose-h2:scroll-mt-f89 prose-h3:text-h4 prose-h4:text-body-lg',
  'prose-p:text-body-lg prose-p:text-ink prose-p:[text-wrap:pretty]',
  'prose-li:text-body-lg prose-li:text-ink prose-strong:text-ink',
  'prose-a:text-ink prose-a:underline hover:prose-a:text-muted',
  'prose-hr:border-seam',
  'prose-img:w-full prose-img:border prose-img:border-ink prose-img:rounded-none',
  'prose-figcaption:text-label prose-figcaption:normal-case prose-figcaption:tracking-normal prose-figcaption:text-muted',
  'prose-blockquote:not-italic prose-blockquote:font-bold prose-blockquote:text-ink',
  'prose-blockquote:border-l-0 prose-blockquote:border-y prose-blockquote:border-ink',
  'prose-blockquote:px-0 prose-blockquote:py-f34 prose-blockquote:text-h3 lg:prose-blockquote:text-h2',
  '[&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none',
  '[&_pre]:border [&_pre]:border-ink [&_pre]:rounded-none [&_pre]:bg-suede',
  '[&_iframe]:w-full [&_iframe]:aspect-video [&_iframe]:border [&_iframe]:border-ink',
].join(' ');

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await postService.getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') {
    notFound();
  }

  const jsonLd = generateBlogPostJsonLd(post);

  // Content — sanitized again at render as a backstop for write paths that
  // bypass the API (e.g. scripts writing via Prisma directly).
  const safeHtml = sanitizeHtml(post.content);
  const { html: articleHtml, toc } = withHeadingAnchors(safeHtml);
  const embeddedVideoId = firstYouTubeId(safeHtml);

  const published =
    post.publishedAt &&
    new Date(post.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewTracker postId={post.id} />

      <SiteHeader active="blog" />

      <div className="min-w-0 bg-jet font-sans text-ink">
        {/* ── Masthead ─────────────────────────────────────────────── */}
        <section className="surface-ripstop text-paper">
          <div
            className={`mx-auto flex max-w-[1262px] flex-col gap-f21 px-f21 pt-f21 lg:gap-f55 lg:px-f55 lg:pt-f34 ${
              post.featuredImage ? 'pb-f55 lg:pb-f233' : 'pb-f34 lg:pb-f89'
            }`}
          >
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-f13 text-label font-bold uppercase text-graphite"
            >
              <Link href="/" className="text-graphite no-underline hover:text-paper">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="text-graphite no-underline hover:text-paper">
                Blog
              </Link>
              {post.category && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="text-paper">{post.category}</span>
                </>
              )}
            </nav>

            <div className="flex max-w-[890px] flex-col gap-f13 lg:gap-f21">
              {post.category && (
                <span className="quoted text-label font-bold uppercase text-graphite">
                  {post.category}
                </span>
              )}
              <h1 className="m-0 text-[clamp(34px,7vw,68px)] font-bold uppercase leading-[1] tracking-[-.02em] [text-wrap:balance]">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-f13 text-label normal-case tracking-normal text-graphite">
                {post.authorImage ? (
                  <img
                    src={post.authorImage}
                    alt=""
                    className="h-f34 w-f34 shrink-0 object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-f34 w-f34 shrink-0 items-center justify-center bg-paper text-label font-bold tracking-[.02em] text-jet"
                  >
                    {initials(post.authorName)}
                  </span>
                )}
                <span className="font-bold text-paper">{post.authorName}</span>
                {post.authorRole && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{post.authorRole}</span>
                  </>
                )}
                {published && (
                  <>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.publishedAt ?? undefined}>{published}</time>
                  </>
                )}
                {post.readingTimeMinutes > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{post.readingTimeMinutes} min read</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Paper panel ──────────────────────────────────────────── */}
        <div className="mx-auto max-w-[1440px] px-f8 pb-f34 lg:px-f55 lg:pb-f89">
          <main
            className={`panel relative flex flex-col items-center gap-f34 px-f21 pb-f55 lg:gap-f55 lg:px-f89 lg:pb-f89 ${
              post.featuredImage ? 'pt-f21 lg:pt-0' : 'pt-f34 lg:pt-f55'
            }`}
          >
            {/* Stitched tag pinning the panel to the frame */}
            <span
              aria-hidden="true"
              className="absolute right-[-13px] top-f89 hidden h-f21 w-f55 bg-tag lg:block"
            />
            <span
              aria-hidden="true"
              className="absolute right-f21 top-f89 hidden h-f21 w-f8 bg-stitch-seam bg-repeat-y lg:block"
            />

            {post.featuredImage && (
              <figure className="m-0 flex w-full max-w-[1042px] flex-col gap-f13 lg:-mt-[178px]">
                <div className="relative border border-jet bg-jet">
                  <img
                    src={post.featuredImage}
                    alt={post.featuredImageAlt || post.title}
                    className="block aspect-video w-full object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -top-f8 left-f34 hidden h-f8 w-f55 bg-jet lg:block"
                  />
                </div>
                {post.featuredImageAlt && (
                  <figcaption className="text-label normal-case tracking-normal text-muted">
                    {post.featuredImageAlt}
                  </figcaption>
                )}
              </figure>
            )}

            <AdSlot placement="blog-header" className="w-full" />

            <div className="grid w-full grid-cols-1 gap-f34 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:gap-f55 xl:grid-cols-article xl:justify-center">
              {/* ── Article ────────────────────────────────────────── */}
              <article id="post-body" className="flex min-w-0 flex-col gap-f34">
                {post.excerpt && (
                  <p className="m-0 text-h4 font-bold leading-[29px] text-ink [text-wrap:pretty] lg:leading-[34px]">
                    {post.excerpt}
                  </p>
                )}

                <div className={ARTICLE_PROSE} dangerouslySetInnerHTML={{ __html: articleHtml }} />

                <div
                  aria-hidden="true"
                  className="h-f8"
                  style={{ backgroundImage: ZIGZAG, backgroundRepeat: 'repeat-x' }}
                />

                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-f8 border-t border-seam pt-f21">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex h-f34 items-center border border-ink px-f13 text-label font-bold uppercase text-ink"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <AdSlot placement="blog-inline" className="w-full" />

                <Link
                  href="/blog"
                  className="flex h-f55 w-fit items-center border border-ink px-f34 text-label font-bold uppercase text-ink no-underline transition-colors hover:bg-ink hover:text-paper"
                >
                  ← All articles
                </Link>
              </article>

              {/* ── Rail ───────────────────────────────────────────── */}
              <aside className="flex min-w-0 flex-col gap-f34">
                <div className="lg:sticky lg:top-f21 lg:flex lg:flex-col lg:gap-f34">
                  {toc.length > 1 && <ArticleRail items={toc} targetId="post-body" />}

                  <AdSlot placement="blog-sidebar" className="w-full" />

                  {embeddedVideoId && (
                    <div className="flex flex-col gap-f13">
                      <span className="quoted text-label font-bold uppercase text-muted">
                        Sound
                      </span>
                      <PostSoundCard youtubeId={embeddedVideoId} title={post.title} />
                    </div>
                  )}
                </div>
              </aside>
            </div>

            <AdSlot placement="blog-footer" className="w-full" />
          </main>
        </div>
      </div>
    </>
  );
}
