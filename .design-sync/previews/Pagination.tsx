import { Pagination } from "redbird";

const caption = {
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase" as const,
  color: "#6b7280",
};

/** Page 1 of 6 — no Previous link, Next only. */
export function FirstPage() {
  return (
    <div>
      <div style={caption}>page 1 of 6</div>
      <Pagination currentPage={1} totalPages={6} basePath="/blog" />
    </div>
  );
}

/** A middle page — both Previous and Next render. */
export function MiddlePage() {
  return (
    <div>
      <div style={caption}>page 3 of 6</div>
      <Pagination currentPage={3} totalPages={6} basePath="/blog" />
    </div>
  );
}

/** The last page — Next drops away. */
export function LastPage() {
  return (
    <div>
      <div style={caption}>page 6 of 6</div>
      <Pagination currentPage={6} totalPages={6} basePath="/blog" />
    </div>
  );
}

/** Smallest run that still renders: two pages, from a tag archive. */
export function TwoPages() {
  return (
    <div>
      <div style={caption}>/blog/tag/rolling-stock — page 1 of 2</div>
      <Pagination currentPage={1} totalPages={2} basePath="/blog/tag/rolling-stock" />
    </div>
  );
}
