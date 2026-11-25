# Security Audit & Next.js Upgrade — November 2026

Consolidated report across all phases. Baselines taken 2026-11-24/25 on the
`staging` lineage.

| Phase | Branch / PR | Status |
| --- | --- | --- |
| 0 Inventory | — | ✅ |
| 1 Interim 14.x hotfix | `sec/next-14-hotfix` → #15 | ✅ merge-ready |
| 2 npm → pnpm | `chore/pnpm` → #16 | ✅ merge-ready |
| 3 Next.js 15.5.29 (not 16, per owner) | `feat/next-15` → #17 | ✅ merge-ready |
| maplibre-gl XSS | `sec/maplibre-xss` → #18 | ✅ pending visual check |
| 4 Wider audit | `sec/phase4-audit` | ✅ this document + small fixes |

Merge order: **#15 → #16 → #17** (retarget #17 to staging after #16), plus #18
independently once tooltips are verified on staging.

---

## Phase 0 — Inventory

### Package roots
| Path | Purpose | Built by Amplify? |
| --- | --- | --- |
| `./` | Next.js app (subwaysounds.net) | **Yes** (`amplify.yml`) |
| `./cloudflare-worker` | MTA GTFS-RT decode worker | No — `wrangler deploy` |
| `./red-claw` | Blog-drafting agent | No |
| `./cdk` | Legacy AWS CDK infra | No — **flag for removal** |
| `./.ds-sync`, `./out` | Tooling / stale artifacts | No |

### Versions (before → after upgrades)
| Package | Baseline | After Phases 1–3 |
| --- | --- | --- |
| next | 14.2.35 | 15.5.29 |
| react / react-dom | 18.3.1 | 19.3.1 |
| @types/react(-dom) | 18 | 19 |
| eslint-config-next | 14.2.25 | 15.5.29 |
| @clerk/nextjs | 6.39.9 | 6.39.9 (spans 14/15/16) |
| prisma / @prisma/client | 6.19.2 | 6.19.3 |
| maplibre-gl | 5.24.1 | 6.19.0 (#18) |
| Node (local / Amplify) | 20.19.6 / image default | pinned 20 via `.nvmrc` |
| Package manager | npm | pnpm 10.34.9 |

### Build baseline
`npm run build`: clean, ~36s, **965 static pages** — 890 `/station/[id]`, 20
`/line/[line-id]`, 17 `/neighborhood/[slug]`, the rest static. This 890/965 is
the parity target preserved through every phase.

### `npm audit` baseline
13 advisories: 2 critical, 8 high, 3 moderate. The two criticals (`next` RSC
DoS, `maplibre-gl` XSS) are the only ones on a runtime path; the 8 highs are all
build/dev toolchain.

---

## Phase 1 — Interim 14.x hotfix (#15)

**Finding: auth is already enforced in-handler, not middleware-only** — the
CVE-2025-29927 bypass is mitigated. Every mutating route checks Clerk
`requireAdmin` or the internal `validateApiKey` (fail-closed, length-checked,
`timingSafeEqual`). `/api/transit` fetches a hardcoded MTA URL → no SSRF.

Shipped: `eslint-config-next` → 14.2.35; explicit image hardening
(`dangerouslyAllowSVG:false`, locked image CSP, `remotePatterns:[]`; optimizer
stays disabled so the Image RCE is unreachable); dropped a full-feed
`console.log` in `/api/transit`. Build parity 965/965.

---

## Phase 2 — npm → pnpm (#16)

pnpm 10.34.9 (not 12 — it relocated config and its corepack binary wouldn't
fetch here). `pnpm.onlyBuiltDependencies` re-enables Prisma/protobufjs/clerk
build scripts. Two real bugs surfaced by pnpm's strict `node_modules`:
`@tiptap/core` was a **phantom dependency** (added explicitly), and jsdom's
`default-stylesheet.css` broke under bundling (fixed by externalizing
`isomorphic-dompurify`/`jsdom`). `amplify.yml` rewritten for pnpm. Build parity
965/965.

**Note — build without `DATABASE_URL` hangs** (SSG pages block on live data)
rather than failing fast. Pre-existing, not caused by pnpm; Amplify always sets
the var. See Phase 4 recommendations.

---

## Phase 3 — Next.js 15.5.29 + React 19 (#17)

Retargeted from 16 to **15.5.29** (owner decision). Fixes both runtime
criticals. Migration: async `params` codemod on `[param]` route handlers; React
19 `children.props` casts in Button/Card; `next/dynamic` `ssr:false` moved out
of two Server Components into client wrappers; `serverComponentsExternalPackages`
→ `serverExternalPackages`. No `cookies`/`headers`/`geo`/`ip`/`@next/font`/
`useFormState` in the codebase. `.nvmrc` pins Node 20.

Build parity **exact** on fixed routes (890/20/17); total prerender count varies
only on the DB-driven, now-ISR `/blog/[slug]`.

**Deploy note:** the repo `amplify.yml` takes precedence over the (ignored)
app-level console buildSpec — verified from staging's last build log — so the
pnpm build applies on merge with no console change. Node is handled by `.nvmrc`.

---

## Phase 4 — Wider audit

### Findings table
| Area | Finding | Severity | Status |
| --- | --- | --- | --- |
| Secrets (history + tree) | **No real credential ever committed.** The prod Neon host appears in neither tree nor history. `postgresql://…` pattern hits are Neon's bundled skill-doc examples (`ep-raspy-glade`, `ep-round-unit`, `@host`) + `.env.example` placeholders. | — | ✅ clean |
| `.gitignore` | Covered `.env*`, `n8n/.env*`, `scripts/{credentials,token,token-analytics}.json`. Widened globs for `token*.json`, `*credential*.json`, `*.key`, `*.pem`. | low | ✅ fixed |
| `NEXT_PUBLIC_*` | All 9 are legitimately public (AdSense, Clerk publishable, GTM, site-verification, hero id, site URL). No server secret mis-prefixed; none reachable as a secret in the client bundle. | — | ✅ clean |
| R2 upload (`/api/upload`) | `requireAdmin`, 5 MB cap, MIME whitelist, random-hash object key (no overwrite/traversal). | — | ✅ good |
| API auth | Every mutating route guarded in-handler (Phase 1). | — | ✅ good |
| Security headers | HSTS, `X-Content-Type-Options`, `X-Frame-Options`, Referrer-Policy, Permissions-Policy present; CSP is **report-only**. | low | ⏩ recommend promoting to enforce after a clean report window |
| Cloudflare worker | CORS uses an `ALLOWED_ORIGINS` allowlist (not wildcard); feeds are a fixed map (no SSRF); MTA feeds are public (no server key to leak). **No rate limiting** on the public proxy. | medium | ⏩ recommend a KV/rate-limit guard |
| `/api/transit` | Unauthenticated public proxy that refetches MTA per call; ignores its body; likely a dead duplicate of the worker path. | low | ⏩ recommend removal or GET + cache |
| Build resilience | `next build` hangs without `DATABASE_URL` instead of failing fast. | low | ⏩ recommend a fast-fail guard in SSG data loads |
| red-claw | Secrets via env (`.env` gitignored); `TELEGRAM_WEBHOOK_SECRET ?? 'default-secret'` fallback is weak. | low | ⏩ recommend fail-closed |
| Supply chain | No CI, no Dependabot. | low | ✅ added `.github/dependabot.yml` (npm + worker + red-claw + actions) |
| Legacy | `/cdk` unused. | — | ⏩ flag for removal (not deleted) |

### Fixes shipped in this phase
- `.gitignore` secret globs widened.
- `.github/dependabot.yml` added (weekly, grouped dev deps, all three package roots + actions).

### Recommendations (owner, not auto-fixed)
1. Promote CSP from report-only to enforced after watching the console for a clean window.
2. Add rate limiting to the Cloudflare worker (KV counter + 429 + `Retry-After`).
3. Remove or convert `/api/transit` (dead/duplicate, unauthenticated refetch).
4. Fast-fail SSG data loads when `DATABASE_URL` is absent so a mis-configured build errors in seconds, not minutes.
5. red-claw: make `TELEGRAM_WEBHOOK_SECRET` required (no default).
6. Remove the legacy `/cdk` tree.
7. Add a CI step running `pnpm audit --prod` once #16 lands.

---

## Open follow-ups for the owner
- [ ] Amplify `main`: add the 2 Clerk **live** keys (dashboard → Production). R2 + DB + config already restored (10/12 keys).
- [ ] Merge #15 → #16 → #17; retarget #17 to staging after #16.
- [ ] Visually verify map tooltips on staging, then merge #18.
- [ ] Decide on the Phase 4 recommendations above.
