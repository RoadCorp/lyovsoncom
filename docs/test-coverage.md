# Test coverage

Reviewed September 6, 2026. The suite targets public behavior, privacy, freshness, and paid-work boundaries. There is no blanket line-coverage target.

## What runs where

| Layer | Scope | Reason |
| --- | --- | --- |
| Vitest | Input validation, public reads, cache invalidation, search and embedding contracts, feeds, content rendering, transition identity | Fast, deterministic checks of business rules and failure paths. Database and provider operations are mocked. |
| Chromium | Every frontend route definition, plus navigation and media interactions | Each route has its own wiring and needs a direct-load or protected-redirect check. |
| WebKit and Firefox | Navigation, Back, retained content, keyboard focus, narrow layouts in both themes, reduced-motion navigation, no-JavaScript navigation, video and clipboard lifecycle | These depend on browser behavior. Repeating every route's identical smoke assertions adds little coverage. |
| CI | Lint, Vitest, SEO checks, migrations on the CI database, production build | The fast contract tests run on pull requests and pushes to main. The browser suite remains a local pre-release check. |

## Required behavior

| Risk | Coverage |
| --- | --- |
| Unauthorized embedding reads or paid mutations | Every embedding GET/POST handler rejects missing and invalid credentials; missing credentials do not initialize Payload. Shared auth accepts the configured cron secret or an authenticated Payload session and fails closed on auth errors. |
| Duplicate paid work or recursive writes | The embedding task skips unchanged or ineligible content, rejects incompatible output, persists recursion guards, and propagates provider failures for retries. |
| Search failures or mixed-up results | Input validation, repeated query parameters on global/profile pages, crawler rejection before work, global/scoped response serialization and parameter binding, invalid vectors, provider/database failure responses, public hydration predicates, rank order, and removed-document handling. |
| Private content in public pages | Public note/activity predicates, excluded embedding fields, public profile selection, recommended-note access, and activity date identity. |
| Stale withdrawn or renamed content | Publication, privacy withdrawal, deletion, slug/date changes, dependency invalidation, and feed freshness. |
| Invalid archive URLs | Full integer parsing, safe numeric bounds, canonical page-one redirects, and last-page boundaries. Regression inputs include `2junk`, `2.5`, and `2e3`. |
| Lost or unsafe article content | Escaping and syntax highlighting, combined rich-text formatting, line breaks, unsupported-block fallback, and article-title identity after navigation. |
| Broken public navigation | Route smoke checks, missing-page metadata, actual playground-to-admin redirect, initial shell and partial navigation, Back, author context, keyboard focus, themes, and narrow layouts. |
| Hidden media or stale clipboard feedback | Video pause, YouTube reset, clipboard failure announcements, and delayed completion after hiding. |
| Broken syndication and shared transitions | Feed formats/headers/fallbacks, relation deduplication, unique transition names, and UTC activity paths. |

## Keeping the suite proportionate

- Add a test for a distinct user-visible contract, boundary, or demonstrated regression.
- Prefer a few representative inputs per behavior; avoid repeated examples of the same branch.
- Keep business-rule cases in Vitest and browser-specific behavior in Playwright.
- Do not snapshot entire pages, duplicate library internals, test unused helpers, or manufacture assertions just to raise coverage.
- A route smoke pass proves routing and rendering, not every possible content variation.

Paid provider success, real pgvector ranking/SQL execution, authenticated CMS editing, external YouTube playback, and deployed analytics remain integration or release checks. Mocked tests do not establish those outcomes. The public browser suite uses a read-only preview and never submits CMS changes.

## Latest local verification

- 128 Vitest cases passed across 12 files.
- 72 Playwright cases passed across Chromium, WebKit, and Firefox in 44.2 seconds; the prior 150-case run took about 78 seconds.
- The build generated all 173 routes; type checking and SEO checks passed.
- Lint passed with zero warnings or errors using the core, Next.js, React, and Vitest presets. See [linting](linting.md) for the documented rule exceptions.
- Four new pagination cases failed against the old parser and passed after the fix.
- The repeated-search-parameter browser check reproduced a `trim is not a function` crash before the fix and passed afterward on global and profile search pages.

## Run

```sh
mise exec -- pnpm test
mise exec -- pnpm lint
mise exec -- pnpm seo:check
mise exec -- pnpm preview:experience:build
mise exec -- pnpm preview:experience
# In another terminal:
mise exec -- pnpm test:browser
```

Set `PLAYWRIGHT_BASE_URL` if the preview runs on another port. No additional test packages or coverage instrumentation were introduced by this review.
