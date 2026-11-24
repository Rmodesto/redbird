import { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Stand-in for `next/link` used only when bundling the design system.
 *
 * The real `next/link` pulls in Next's client router, which needs `process.env`
 * and a router context that does not exist outside a Next app — importing it
 * made every preview fail with "process is not defined". Components in this
 * library only ever use Link to render a navigable anchor, so this renders the
 * anchor directly and keeps the same call signature.
 */
interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | { pathname?: string };
  children?: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
}

export default function Link({
  href,
  children,
  // Next-only props: accepted so call sites type-check, never forwarded to the DOM.
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  passHref: _passHref,
  legacyBehavior: _legacyBehavior,
  ...rest
}: LinkProps) {
  const url = typeof href === "string" ? href : href?.pathname ?? "#";
  return (
    <a href={url} {...rest}>
      {children}
    </a>
  );
}
