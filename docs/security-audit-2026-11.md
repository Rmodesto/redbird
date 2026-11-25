# Security Audit & Next.js Upgrade — November 2026

Living document. Phase 0 (inventory) is complete; later phases are appended as
their branches land.

---

## Phase 0 — Inventory (no code changes)

Baseline taken 2026-11-24, local, on branch `feat/station-page-redesign`
(working tree clean).

### Package roots

| Path | Purpose | Built by Amplify? | Deploy / run |
| --- | --- | --- | --- |
| `./package.json` | The Next.js app (subwaysounds.net) | **Yes** | `amplify.yml`: `npm ci` → `prisma generate` → `next build` at repo root |
| `./cloudflare-worker/package.json` | MTA GTFS-RT decode worker | No | `wrangler deploy`, separate |
| `./red-claw/package.json` | Blog-drafting agent | No | run locally / `node dist/server.js` |
| `./cdk/package.json` | Legacy AWS CDK infra | No | `cdk deploy` — **flagged for removal** (Phase 4), not deleted |
| `./.ds-sync/package.json` | Design-sync tooling | No | not shipped |
| `./out/package.json`, `./out/types/package.json` | Stale static-export artifacts | No | ignore |

Amplify only ever builds the repo-root app. The worker, the agent, and CDK each
have their own lifecycle.

### Versions (root app)

| Package | Declared | Installed | Note |
| --- | --- | --- | --- |
| next | `^14.2.35` | 14.2.35 | already the last 14.x security release |
| react / react-dom | `^18` | 18.3.1 | |
| @clerk/nextjs | `^6.37.1` | 6.39.9 | Clerk 6 spans Next 14/15/16 |
| prisma / @prisma/client | `^6.19.2` | 6.19.2 | |
| react-map-gl | `^8.0.4` | 8.x | `react-map-gl/maplibre` subpath |
| maplibre-gl | `^5.7.0` | 5.24.1 | **critical XSS advisory open** (see below) |
| sharp | — | not installed | image optimizer is disabled (`images.unoptimized: true`) |
| typescript | `^5.7.2` | 5.7.2 | |
| eslint-config-next | `14.2.25` | — | **mismatched** to next 14.2.35 (align in Phase 1) |
| @types/react / @types/react-dom | `^18.3.12` / `^18` | 18.x | React 19 bump lands in Phase 3 |

- **Node — local:** v20.19.6, npm 10.8.2.
- **Node — Amplify:** build-image default (not pinned; `engines` is `{}`). Must
  be confirmed in the console before Phase 3. **Do not change without asking.**
- **Package manager:** npm (`package-lock.json` only; no `packageManager` field;
  pnpm not installed). The pnpm migration is Phase 2.

### Baseline build

`npm run build`, local:

- Exit 0, **36s**, **zero warnings or deprecations**.
- **965 static pages** generated. Of these, **890 are `/station/[id]`** paths
  (the handoff's "~445" estimate is low — the real baseline to preserve across
  the upgrade is **890 station paths / 965 total**). Also ~20 `/line/[line-id]`
  and ~17 `/neighborhood/[slug]`.
- Route mix: 4 SSG groups, 19 fully-static, 39 dynamic (`force-dynamic` API
  routes + per-request pages).
- First Load JS shared: 88 kB. Middleware bundle: 79 kB. Heaviest route:
  `/subway-map` at 410 kB (MapLibre).

This is the parity target: any upgrade must keep 965/890 and a clean build.

### `npm audit` summary

13 advisories: **2 critical, 8 high, 3 moderate**.

| Severity | Package | Advisory | Runtime path? | Resolved by |
| --- | --- | --- | --- | --- |
| critical | next | Image Optimizer `remotePatterns` DoS; RSC HTTP-deserialization DoS | yes | **no 14.x fix** → Next 15/16 (Phase 3) |
| critical | maplibre-gl | XSS sanitizer bypass in `DOM.sanitize()` (live NamedNodeMap removal skip) | yes (map tooltips sanitize) | patched maplibre-gl release — **can fix now** (Phase 1 candidate) |
| high | postcss | XSS via unescaped `</style>`; file read via `sourceMappingURL` | build-time only | dep bump |
| high | glob / minimatch | CLI command injection; AbortSignal bypass; globparts DoS | dev CLI only | transitive bump |
| high | eslint-config-next → @next/eslint-plugin-next → glob | (as above) | dev/lint only | align eslint-config-next |
| high | prisma → @prisma/config → deepmerge-ts, effect | stack exhaustion; ReDoS | build-time only | prisma bump |
| moderate | @tailwindcss/typography → postcss-selector-parser | quadratic selector parsing | build-time only | dep bump |

The two criticals are the only ones on a runtime path. Everything else is
dev/build toolchain — tracked, low urgency.

### Secret hygiene (quick pass — full history scan is Phase 4)

`.gitignore` covers `.env*`, `n8n/.env*`, `scripts/credentials.json`,
`scripts/token.json`, `scripts/token-analytics.json`. Gap: the handoff names
`scripts/token*.json` — the glob would also catch any future `token-*.json`;
widen in Phase 4. No secret values appear in this document by rule.

### Amplify environment drift (pre-existing, being corrected)

`staging` carries 12 branch env vars; `main` currently carries 7. Missing on
`main`: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (the production
Clerk live keys — owner must paste from the Clerk dashboard) and the three
`R2_*` keys (copyable from staging). Live prod is unaffected because env vars
are read at build time and no build has run since; **do not redeploy `main`
until these are restored.** Tracked outside the git phases (console-only).

---

## Phase 1 — Interim 14.x hotfix  *(branch `sec/next-14-hotfix` → staging)*

Goal was to cut exposure on 14.x before the major upgrade. Most of the heavy
work turned out to already be in place; this phase is small as a result.

### Findings

**Auth is enforced inside handlers, not only in middleware — the
CVE-2025-29927 concern is already mitigated.** Every mutating route was checked:

| Route (mutating) | Guard |
| --- | --- |
| `auth/sync` PUT | Clerk — role read server-side from Clerk, not the request body |
| `blog` POST, `blog/[id]` PUT/DELETE, `blog/[id]/publish` PATCH | Clerk `requireAdmin` |
| `videos/sync` POST, `videos/tag` POST/DELETE, `upload` POST | Clerk `requireAdmin` |
| `internal/blog*` POST/PUT/DELETE/PATCH | `validateApiKey` (X-API-Key) |
| `blog/[id]/view` POST, `contact` POST | rate-limited, no privileged writes |
| `station-stats` / `subway-trains` / `transit` POST | **no DB writes** — read-only proxies/aggregators |

`validateApiKey` (`app/api/internal/_auth.ts`) is sound: fails closed when the
server key is absent or < 16 chars, length-checks before comparing, and uses
`crypto.timingSafeEqual`.

`/api/transit` fetches a **hardcoded** MTA URL — no user input in the fetch
target, so no SSRF. (It ignores its request body and arguably should be a GET;
flagged for Phase 4 along with its likely dead-route status.)

### Changes shipped

- **`eslint-config-next` 14.2.25 → 14.2.35** — aligns with `next`, clears the
  dev-only `glob`/`minimatch` advisories coming through `@next/eslint-plugin-next`.
- **`next.config.mjs` image hardening** — made the safe posture explicit:
  `dangerouslyAllowSVG: false`, `contentDispositionType: 'attachment'`, a locked
  image CSP, and `remotePatterns: []`. The optimizer stays disabled
  (`unoptimized: true`), so the 2026-10 Image Optimization RCE and the
  remotePatterns DoS are not reachable; these settings are defense-in-depth if
  that flag is ever flipped.
- **`/api/transit`** — removed a `console.log` that serialized the entire decoded
  GTFS feed on every request (log spam + per-request CPU).

### Verification
`npm run build` green, 39s, **965/965** static pages (parity with baseline),
zero warnings.

### Advisories still open on 14.2.35 after this phase
- **next (critical)** — Image Optimizer DoS + RSC HTTP-deserialization DoS. No
  14.x fix exists. The optimizer DoS is not reachable here (optimizer disabled);
  the RSC deserialization DoS remains until the Next 15/16 upgrade (Phase 3).
- **maplibre-gl (critical)** — `DOM.sanitize()` XSS bypass. Left for its own
  branch (`sec/maplibre-xss`) because the fix may alter tooltip rendering and
  needs a visual check on staging before merge.
- Remaining highs/moderates are all build/dev toolchain (postcss, prisma's
  effect/deepmerge-ts, tailwind typography) — addressed by the dependency bumps
  that ride along with Phases 2–3.
## Phase 2 — npm → pnpm  *(pending — branch `chore/pnpm`)*
## Phase 3 — Next.js 16 upgrade  *(pending — branch `feat/next-16`)*
## Phase 4 — Wider security audit  *(pending)*

### Open follow-ups for the owner
- [ ] Restore `main` env vars: R2 (`restore-r2.sh`), Clerk live keys (dashboard).
- [ ] Confirm Amplify Node version before Phase 3 (do not change without asking).
