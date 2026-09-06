# Public experience implementation and verification

Date: September 6, 2026. Baseline commit: `655c07e67a2bd6fc1eb2e4e7cb638e26ddaa2b01`.
Status: Implementation and final polish verified locally. Push to `main` authorized on September 6; production verification is tracked separately.

## Implemented

- Enabled Partial Prefetching on 35 frontend pages. Both playground routes retain their existing utility/authentication behavior. The global flag remains off and Payload admin routes are unchanged.
- Added page-local Suspense around URL-dependent work, a correctly placed author-layout boundary, and dimensioned profile/detail placeholders. Existing Cache Components, cache profiles, compiler and view transitions remain enabled.
- Replaced the navigation's empty skeleton with useful branding and links while URL-specific navigation state resolves. Navigation is now present without JavaScript. The equal 3×3 menu and existing shared-element timing/styles remain intact.
- Intent links now prepare a reusable shell automatically and warm URL-specific cached content on hover, focus or touch. Existing native links and bounded pagination prefetch remain intact.
- Cached public related posts/notes, added the missing public-note predicate, selected public profile fields, omitted embedding internals from public note/activity reads, and reused project/topic entity lookups. Author post feeds use summaries and invalid mixed-feed pages are rejected before fetching arbitrarily large windows. Portfolio reads select project membership only.
- Centralized publication invalidation: new publication, withdrawal, deletion and old/new slug or activity-date identities expire immediately; ordinary edits retain existing freshness profiles. Media/reference/author changes invalidate populated public dependencies. Activity URL dates use UTC consistently.
- Deduplicated normalized searches within a React render request; typing and shell prefetch remain free of semantic search. Added search completion/pending announcements and protected early input from arriving before hydration attaches its handler.
- Moved Prism tokenization to the server, retained copy as a client control with error feedback/timer cleanup, isolated X embeds behind their own Suspense, paused hidden videos and reset hidden YouTube playback to its facade. Corrected shared image loading hints without broad preloading.
- Kept dormant UI components inactive, existing theme/analytics behavior, preview authorization, public API guards and content structure. Corrected the offline page's unsupported blanket cache claim.

## Final polish

The menu button now waits until its route-aware controls are hydrated; the temporary shell retains usable native links. This fixes an early keyboard action being lost as the shell resolves. Clipboard requests carry a version so a delayed result cannot restore stale feedback after an Activity hide/show or a newer copy operation. The regression test failed before this fix and passed afterward in all three browsers.

## Verification performed

| Check | Result |
| --- | --- |
| Unit suite | 84 tests passed across 9 files; baseline was 68 across 6. New coverage includes publication/withdrawal/slug/date invalidation, public read contracts, UTC URL dates and server code rendering. |
| Browser suite | 150 cases passed across Chromium, WebKit and Firefox in one full run: 138 page/navigation cases and 12 isolated media/clipboard cases. Settled 320px screenshots and keyboard focus checks cover both themes. Firefox requires explicit theme selection in this runtime. |
| Instant navigation | Deterministic `@next/playwright` checks pass for initial navigation and menu-to-posts navigation while dynamic content is withheld. The test API is enabled only by `NEXT_TEST_MODE=1`; a separate normal production build passed with it disabled. |
| Page coverage | All 37 frontend page definitions have direct-load or protected-redirect coverage. Published build fixtures exercise dynamic routes; families with placeholder-only pagination exercise page-one redirects. Activities provide populated page-two coverage. |
| Interaction coverage | Article → Back, author section changes, a journey beyond three retained routes, typing without submission, Escape, no-JavaScript navigation, dark mobile menu, reduced-motion configuration, missing-page metadata and protected utility redirect. |
| Build and type checks | Normal and test-enabled production builds passed; 173 generated routes. Type checking passed. |
| Lint and SEO | Lint passed with warnings; SEO coverage passed. The SEO source scan no longer treats an ignored local environment file as application source. No environment values were changed. |
| Visual review | Desktop light home/article and mobile dark menu inspected. Existing crest/grid/typography remain intact; sampled mobile and desktop pages have no horizontal overflow. |
| Read-only verification | PostgreSQL reported `default_transaction_read_only = on` for the preview connection. Schema push and paid search were disabled. Publication mutation tests used isolated mocks, not CMS writes. |

## Measurements and limits

Before the final menu/clipboard polish, on one unthrottled Chromium run at 1440×1000, the initial document's requested JavaScript transferred **183,759 bytes before** and **184,688 bytes after** (+929 bytes). The revised page also fetched **10,834 bytes in two later chunks**, bringing the observed total to 195,522 bytes. The later chunks were not script tags in the initial document. This is a small initial-script increase plus additional preparation work, not evidence of a smaller total download. No experimental chunking option was enabled.

The baseline delivered no visible navigation or links with JavaScript disabled; the revised build delivers usable navigation. Instant tests establish the shell's rendering contract, not a measured 100ms latency guarantee. Field Core Web Vitals, production cold-instance cache reuse, distributed invalidation, database savings, image decoding under constrained networks and paused-frame transition audits remain release/performance checks. Local Vercel analytics script availability is not evidence about deployed analytics.

No real CMS publication/deletion was performed. Successful paid semantic-search/provider execution and authenticated playground flows were not exercised against live services. Empty/long/missing-media and every rich-text/media variation are not all represented in the current published browser fixtures; code highlighting has isolated server-rendering tests. Isolated browser fixtures verify video pause is called on hiding, the YouTube iframe is removed before returning, and clipboard denial/reset is announced correctly. Actual audio playback and external YouTube service behavior were not exercised. Do not interpret route-file coverage as exhaustive content-fixture coverage.

## Repeat the checks

Use `mise exec -- pnpm test`, `mise exec -- pnpm lint`, `mise exec -- pnpm seo:check`, and `mise exec -- pnpm exec tsc --noEmit` for local checks.

For browser checks, run `mise exec -- pnpm preview:experience:build`, then `mise exec -- pnpm preview:experience`, then `mise exec -- pnpm test:browser`. The preview script uses an unpooled read-only connection, disables schema push and paid search, enables the controlled testing API, and binds to localhost port 3100. Blob configuration stays available for normal public media URLs. Install browser runtimes with `mise exec -- pnpm exec playwright install chromium firefox webkit` when needed.

A release uses the normal build command with `NEXT_TEST_MODE` unset. Do not deploy a testing-API build. Publishing, deployment promotion and live CMS mutation tests are separate from this local implementation.

## Rollback and deferred decisions

Revert route exports and the corresponding intent-link policy together to undo the new prefetch behavior. Keep public visibility and withdrawal fixes independent where practical. Existing Cache Components and transitions do not need to be disabled. No schema migration was introduced.

Remote/private caches, experimental Turbopack tuning, a service worker, framework upgrades, new forms/features and Payload admin work remain deferred. The small measured initial-script increase does not justify a new caching service or an app-wide bundler experiment by itself.
