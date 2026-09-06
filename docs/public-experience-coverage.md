# Public experience coverage

The later [test coverage review](test-coverage.md) describes the current suite; counts below record the earlier implementation verification.
Date: September 6, 2026. Baseline: `655c07e67a2bd6fc1eb2e4e7cb638e26ddaa2b01`.

Notion: [Page and component coverage](https://app.notion.com/p/3d3a881304bb81cdbfd8f9636e399893).

Companion to [Public experience integration plan](public-experience-plan.md). This ledger accounts for every frontend page and all non-app TSX modules, including the social-icon helper and the admin slug field. A file inventory is not a claim that every file ships or has been tested in a browser. Implementation is complete locally; executed checks and remaining release scenarios are recorded below and in `docs/public-experience-verification.md`. Payload admin is excluded.

## Implementation result — September 6, 2026

Implemented locally: 35 public pages now opt into Partial Prefetching, with page/profile boundaries, useful navigation before hydration, shell-first intent links, cached public related content, narrower public reads and immediate publication/withdrawal invalidation. Code highlighting runs on the server; search feedback, embed isolation and hidden-media cleanup are integrated. Existing view transitions, the equal menu grid, framework versions and Payload admin experience are retained. Final polish prevents premature menu activation and stale clipboard feedback after returning; the 320px menu and keyboard focus restoration are covered in both themes.

Verification: 84 unit tests passed; 150 browser cases passed across Chromium, WebKit and Firefox in the final full run (138 page/navigation cases and 12 isolated media/clipboard cases). All 37 frontend page definitions are represented. Normal and test-enabled production builds passed with 173 generated routes; type, lint and SEO checks passed, with lint warnings remaining. The preview database connection was verified read-only; no live CMS mutations or paid search were performed.

Before final polish, the initial document's JavaScript increased by 929 bytes (183,759 → 184,688); two later chunks added 10,834 bytes. The shell tests prove useful rendering while dynamic content is withheld, not a measured 100ms guarantee or production cost reduction. Production cache behavior, field performance, paid-search success, exhaustive content fixtures and paused-frame transition review remain release checks. Push to `main` was authorized on September 6; deployed behavior must be verified separately.

Evidence, repeatable commands and rollback notes: `docs/public-experience-verification.md`. Browser cases: `e2e/public-pages.spec.ts`, `e2e/public-navigation.spec.ts`, `e2e/media.spec.ts`.

## Shared acceptance across the inventory

Apply the main plan's rendering, privacy, cache and accessibility contracts to every applicable row. In particular: inspect the real first-load navigation HTML; distinguish CDN/function/browser/image caches; test cold serverless instances and cache-profile shell eligibility; verify populated public data and publication invalidation; and check streamed metadata/robots/status behavior. Route retention is bounded, so include an eviction journey. Search submits, direct query URLs and refresh are intentional executions; typing and prefetch are not.

The table maps implementation ownership, not a requirement to add caching or animation to every file. Keep server-only presentation on the server and dormant modules dormant. All new framework experiments remain conditional on the measured pilot.

## All 37 frontend page definitions

Each row covers its page-local helper components and metadata/static-parameter functions as well as its exported page. Dynamic route rows cover patterns, not every possible CMS slug. Tests need representative fixtures, including slugs absent at build time.

| Route | Group | Observed baseline | Planned work | Required evidence |
| --- | --- | --- | --- | --- |
| `/` | R01: Home | Post summaries and activity preview are cached and fetched in parallel. | Keep navigation immediately usable; separate feed and activity slots; prepare likely detail links. | Home → post → Back; warm/cold rail and scroll. |
| `/[lyovson]` | R12: Author home | Author layout awaits profile; cached mixed feed/activity reads. | Profile-slot boundary at layout level plus child boundaries; retain profile across sections. | Enter author from global route; switch Rafa/Jess; Back and scroll. |
| `/[lyovson]/activities` | R15: Author activities | Cached participant-filtered activities. | Public activity projections; preserve participant filtering. | Shared activity appears for correct participants only. |
| `/[lyovson]/activities/page/[pageNumber]` | R15: Author activity pagination | Cached scoped activity results. | URL boundary; date/slug-safe identities and pager. | Populated second page; last page; author switch. |
| `/[lyovson]/bio` | R16: Author biography | Cached profile shared with layout; rich-text biography or empty card. | Reuse profile read; stream only dependent blocks; keep profile frame. | Long biography, empty biography, embedded blocks. |
| `/[lyovson]/contact` | R18: Author contact | Cached public profile and contact/social display. | Ready public contact card under author boundary; native external/mailto behavior. | Missing optional contact fields; keyboard links; no new form. |
| `/[lyovson]/notes` | R14: Author notes | Cached username-filtered notes. | Retain author mapping and public predicate; shaped child list shell. | Both supported authors; quote/excerpt references; empty author list. |
| `/[lyovson]/notes/page/[pageNumber]` | R14: Author note pagination | Cached scoped notes and pagination. | Retain author key and child-state contract; no full profile remount. | Correct author/query restoration and page validation. |
| `/[lyovson]/page/[pageNumber]` | R12: Author home pagination | Cached mixed feed slices merged results; fetch volume can grow with page. | Bound measured feed work while retaining ordering/totals; preserve profile and rail. | Deep-page mixed-content fixture; no skipped/duplicated items. |
| `/[lyovson]/portfolio` | R17: Author portfolio | Cached portfolio helper reads up to 500 posts to infer projects. | Measure and reduce fields/read volume without changing project membership. | No projects; shared projects; duplicate project membership; correct author. |
| `/[lyovson]/posts` | R13: Author posts | Shared author layout and filtered cached feed. | Profile stays anchored; child list shell; public summary reads. | Correct author scope; change section without profile flash. |
| `/[lyovson]/posts/page/[pageNumber]` | R13: Author post pagination | Author/page/filter keyed cached feed. | URL boundary below shared layout; same summary/pager contract. | Author-specific total; first/last/invalid page. |
| `/[lyovson]/search` | R19: Scoped search | Suspense around params/query, cached profile, submit-only search. | Account for author layout boundary separately; shell must not execute embeddings; direct query URLs and scope-aware pending announcements remain correct. | Rafa/Jess/global query switch; no cross-author results; Back. |
| `/about` | R20: About placeholder | Synchronous placeholder card and static metadata. | Retain lightweight static content; instant menu destination. | Correct heading/canonical; small screen and theme; no new content project. |
| `/activities` | R06: Activities archive | Cached activity query with populated relationships. | Shape public card projection around reference/review/participant needs. | Different activity types; missing dates/media; correct order. |
| `/activities/[date]/[slug]` | R07: Activity detail | Cached date+slug helper; multiple review/info panels. | Date+slug URL boundary; stable hero shell; preserve participants/references and sharing. | Same slug on different dates; changed date; missing reference; reviews. |
| `/activities/page/[pageNumber]` | R06: Activities pagination | Params gate cached results. | URL boundary and preserved directional pager. | Forward/backward, last page and empty fixture. |
| `/ai-docs` | R22: AI access guidance | Static guide with cached last-updated label. | Keep simple cached/static rendering and canonical discovery links. | Date freshness semantics; feeds/docs references; no unnecessary client module. |
| `/am` | R20: Armenian section placeholder | Synchronous English placeholder for future Armenian section. | Retain static shell; do not introduce language model/routing changes. | Preserve current content/lang semantics; no implied completed translation. |
| `/contact` | R20: Global contact placeholder | Synchronous placeholder; no active contact form. | Retain static destination; no optimistic submission work. | Keyboard/menu navigation; existing content only. |
| `/notes` | R04: Notes archive | Cached depth-2 notes; full documents passed to cards. | Inventory excerpt/quote fields; evaluate summary projection; stable shell. | All note types; source references; empty list. |
| `/notes/[slug]` | R05: Note detail | Cached note; separate loading; uncached RelatedNotes ID lookup. | Public-filter related results before caching; body/metadata sharing; independent recommendations. | Private/draft fixture excluded; missing reference; duplicate related item; long quote. |
| `/notes/page/[pageNumber]` | R04: Notes pagination | Params gate cached notes; shared pagination. | URL boundary; same summary contract; directional continuity. | Page-one redirect; page beyond total; notes → detail → Back. |
| `/offline` | R23: Offline information | Existing recovery/information page; no offline retry rollout here. | Keep lightweight; distinguish informational page from guaranteed offline availability. | Links work when connected; no new service worker or fake offline guarantee. |
| `/page/[pageNumber]` | R01: Home pagination | URL params gate cached posts/activity reads. | Route-local URL boundary; preserve rail; directional page change. | Page 1 redirect; invalid/out-of-range page; Back to prior scroll. |
| `/playground` | R24: Protected utility | Suspense then headers/auth; redirects unauthenticated visitors to admin. | Retain auth-only behavior; no shared public cache or eager prefetch; no admin work. | Unauthenticated redirect; isolated authenticated fixture if needed. |
| `/playground/skeleton` | R25: Skeleton utility | Existing skeleton demonstration. | Use for geometry review; do not convert into a new product feature. | Card dimensions/light-dark/reduced motion; retain existing visibility. |
| `/posts` | R02: Posts archive | Cached summary query; shared archive cards and pager. | Instant archive shell; selective detail prefetch; preserve real counts. | First/last page; overlap; empty fixture. |
| `/posts/[slug]` | R03: Post detail | Cached article; params awaited at page; inline uncached RelatedPosts in Suspense. | URL boundary; cached public recommendations; isolate external embeds; retain image/title pair. | Long article; absent-build slug; invalid slug; related failures; hero final frame. |
| `/posts/page/[pageNumber]` | R02: Posts pagination | Params gate cached summary query. | Page boundary with shaped grid fallback; page-specific content on intent. | Forward/backward; active numeral visible at every frame. |
| `/privacy-policy` | R21: Privacy document | Static document within card system. | Keep text server-rendered and selectable; restrained route fade. | Long-text mobile reading; zoom; links and headings. |
| `/projects` | R08: Project index | Cached projects rendered as shared cards. | Ready index shell; selective cached project content on intent. | Index → project; empty fixture; long project names. |
| `/projects/[project]` | R09: Project archive | Project then project-post query; project lookup repeats in helper. | Resolve entity once where possible; independent hero/results slot; keep valid-entity semantics. | Empty existing project vs missing project; image handoff. |
| `/projects/[project]/page/[pageNumber]` | R09: Project pagination | Params and project precede cached posts. | Keep hero anchored; place page-specific results below boundary; deduplicate lookup. | Populated project pagination fixture; page-one redirect; Back. |
| `/search` | R11: Global search | Suspense around query; submit-only hybrid search; result ViewTransition. | Shell only before explicit query navigation; announce pending/completed results; support bookmarked queries and refresh; no speculative embeddings. | Empty/no-result/error/invalid query; quick consecutive submits; query history. |
| `/topics/[slug]` | R10: Topic archive | Cached topic then topic posts. | Resolve topic once; cached result shell; retain current heading visibility. | Missing vs empty topic; topic pill navigation; no invented visible heading. |
| `/topics/[slug]/page/[pageNumber]` | R10: Topic pagination | Slug/page gate topic and post reads. | Route-local boundary; cache key covers topic/page/limit. | Valid second page; invalid page; reassigned post invalidation. |

## Layouts, templates and fallback boundaries

| Source | Decision and evidence required |
| --- | --- |
| `src/app/(frontend)/[lyovson]/layout.tsx` | Profile awaits URL data before children. Place profile-slot Suspense at the correct level; preserve profile across child changes and distinguish authors. |
| `src/app/(frontend)/[lyovson]/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/(frontend)/[lyovson]/template.tsx` | Retain transition policy; audit remount/key behavior against Activity and history before moving/removing this boundary. |
| `src/app/(frontend)/activities/[date]/[slug]/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/(frontend)/error.tsx` | Retain retry(); usable recovery without swallowing notFound/redirect, preserving the surrounding navigation. |
| `src/app/(frontend)/layout.tsx` | Persistent public grid/nav/theme. Audit navigation search-param suspension without blanking frame. |
| `src/app/(frontend)/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/(frontend)/not-found.tsx` | Preserve genuine missing-content semantics, metadata and route recovery; verify streamed vs pre-stream missing detection and no misleading successful page. |
| `src/app/(frontend)/notes/[slug]/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/(frontend)/projects/[project]/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/(frontend)/projects/[project]/not-found.tsx` | Preserve genuine missing-content semantics, metadata and route recovery; verify streamed vs pre-stream missing detection and no misleading successful page. |
| `src/app/(frontend)/template.tsx` | Retain transition policy; audit remount/key behavior against Activity and history before moving/removing this boundary. |
| `src/app/(frontend)/topics/[slug]/loading.tsx` | Match the destination grid slots and landmarks; verify direct load AND client entry from each shared-layout depth. Never duplicate nav/profile in fallback. |
| `src/app/global-not-found.tsx` | Preserve genuine missing-content semantics, metadata and route recovery; verify streamed vs pre-stream missing detection and no misleading successful page. |

## Component work packages

Every TSX module below has one package assignment. “Server-compatible” means the file lacks a client directive; it may still become client code when imported by a client module. Barrel exports do not prove runtime usage. Stage 0 verifies actual bundle/import reachability before changing dormant modules.

| Package | Scope and planned action |
| --- | --- |
| C01 | Link infrastructure: shell-default vs intentional URL prefetch; audit external/download/hash links, modifier/middle-click and imperative navigation. Retain typed destinations, accessible pending feedback and scope-correct results. |
| C02 | Archive composition: summary-only data where sufficient, stable collection/ID names, accurate order/counts and layout. Avoid client conversion for static cards. |
| C03 | Content cards and heroes: preserve shared title/image/metadata pairs and independent detail shells; no full-body serialization just for a card. |
| C04 | Navigation: persistent equal 3×3 grid; inspect navigation before hydration and isolate URL-dependent controls if required. Keep URL-owned context/query, immediate typing, focus restoration and corrected fade blending. |
| C05 | Pagination: ready frame, direction-aware content, correct active numeral/aria-current and bounded wider prefetch. |
| C06 | Loading, empty, not-found and optional recovery: shaped slots, semantic announcements and isolated retry. Do not turn all missing content into success. |
| C07 | Profile, references and taxonomy: cache public projections in domain helpers, propagate related-entity changes, preserve native links and stable identities. |
| C08 | Media and embeds: accurate dimensions/priority, deferred heavy assets, hidden-page pause/cleanup, per-embed Suspense and failure handling. |
| C09 | Rich text and blocks: preserve server text/semantics; assess server-side code highlighting with a small CopyButton island; stable block IDs. |
| C10 | Motion wrappers: reuse current identities/timings/blending; check warm/cold shared pairs, nested snapshots, reduced motion and history. |
| C11 | Providers, theme, discovery and cleanup: keep shell stable, avoid hydration flashes and duplicate analytics, preserve existing legacy-service-worker cleanup. |
| C12 | Dormant or alternate modules: no activation/rewrite. Verify actual reachability, then retain; apply relevant contracts only if the public build uses them. |
| C13 | UI primitives: preserve APIs and accessibility; verify only shipped consumers and hide/show cleanup of interactive primitives. No library-wide refactor. |
| C14 | Search: submit-only execution, query/scope identity, independent result shell, race/history handling and no speculative embedding call. |
| C15 | Payload admin-only modules: excluded at user request; listed solely to make scope explicit. |
| C16 | Protected playground-only display: retain authorization boundary and native external links. Do not cache user-specific output publicly. |

## Complete component-module inventory

Unused template components and UI primitives were removed during the September 6 code cleanup. This inventory lists the retained modules. Supporting non-TSX files and public data helpers follow in the next section.

| Module | Package | Direct declaration |
| --- | --- | --- |
| `src/blocks/Banner/Component.tsx` | C09 | server-compatible / helper |
| `src/blocks/Code/Code.tsx` | C09 | server-compatible; server tokenization |
| `src/blocks/Code/Component.tsx` | C09 | server-compatible / helper |
| `src/blocks/Code/CopyButton.tsx` | C09 | client |
| `src/blocks/GIF/Component.tsx` | C08 | server-compatible / helper |
| `src/blocks/GIF/GifPicker.tsx` | C15 | client |
| `src/blocks/MediaBlock/Component.tsx` | C08 | server-compatible / helper |
| `src/blocks/Quote/Component.tsx` | C09 | server-compatible / helper |
| `src/blocks/XPost/Component.tsx` | C08 | server-compatible / helper |
| `src/blocks/YouTube/Component.tsx` | C08 | server-compatible / helper |
| `src/blocks/YouTube/YouTubePlayer.tsx` | C08 | client |
| `src/components/ActivitiesArchive/index.tsx` | C02 | server-compatible / helper |
| `src/components/AppLink.tsx` | C01 | server-compatible / helper |
| `src/components/AppLinkPendingIndicator.tsx` | C01 | client |
| `src/components/ArchiveItems.tsx` | C02 | server-compatible / helper |
| `src/components/CollectionArchive/index.tsx` | C02 | server-compatible / helper |
| `src/components/IntentLink.tsx` | C01 | client |
| `src/components/JsonLd.tsx` | C11 | server-compatible / helper |
| `src/components/LazyVideo/index.tsx` | C08 | client |
| `src/components/Link/index.tsx` | C01 | server-compatible / helper |
| `src/components/LinkedInIcon.tsx` | C07 | server-compatible / helper |
| `src/components/LoadingTransition.tsx` | C10 | server-compatible / helper |
| `src/components/Logo/Logo.tsx` | C11 | server-compatible / helper |
| `src/components/Media/ImageMedia/index.tsx` | C08 | server-compatible / helper |
| `src/components/Media/VideoMedia/index.tsx` | C08 | client; hidden-media cleanup |
| `src/components/Media/index.tsx` | C08 | server-compatible / helper |
| `src/components/NotesArchive/index.tsx` | C02 | server-compatible / helper |
| `src/components/OfflinePage.tsx` | C11 | client; retained offline controls |
| `src/components/PublicPageBoundary.tsx` | C06 | server-compatible; page-local Suspense |
| `src/components/grid/skeleton/profile-skeleton.tsx` | C06 | server-compatible; dimensioned profile fallback |
| `src/components/OptionalErrorBoundary.tsx` | C06 | client |
| `src/components/Pagination/index.tsx` | C05 | server-compatible / helper |
| `src/components/PlaceholderPageCard.tsx` | C06 | server-compatible / helper |
| `src/components/RichText/index.tsx` | C09 | server-compatible / helper |
| `src/components/RichText/nodeFormat.tsx` | C09 | server-compatible / helper |
| `src/components/RichText/serialize.tsx` | C09 | server-compatible / helper |
| `src/components/ServiceWorkerCleanup.tsx` | C11 | client |
| `src/components/TopicPill.tsx` | C07 | server-compatible / helper |
| `src/components/admin/admin-font-provider.tsx` | C15 | client |
| `src/components/admin/icon.tsx` | C15 | client |
| `src/components/admin/login-text.tsx` | C15 | server-compatible / helper |
| `src/components/admin/logo.tsx` | C15 | client |
| `src/components/admin/view-site-link.tsx` | C15 | client |
| `src/components/grid/card/activity/grid-card-activities-preview.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/activity/grid-card-activity-full.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/activity/grid-card-activity-review.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/activity/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/empty-state/index.tsx` | C06 | server-compatible / helper |
| `src/components/grid/card/hero/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/lyovson-sections/index.tsx` | C12 | server-compatible / helper |
| `src/components/grid/card/nav/grid-card-nav-item.tsx` | C04 | server-compatible / helper |
| `src/components/grid/card/nav/hero-mode.tsx` | C04 | server-compatible / helper |
| `src/components/grid/card/nav/index.tsx` | C04 | client |
| `src/components/grid/card/nav/menu-mode.tsx` | C04 | server-compatible / helper |
| `src/components/grid/card/nav/search-input.tsx` | C04 | client |
| `src/components/grid/card/nav/search-mode.tsx` | C04 | server-compatible / helper |
| `src/components/grid/card/nav/site-title-section.tsx` | C04 | server-compatible / helper |
| `src/components/grid/card/nav/theme-switcher.tsx` | C04 | client |
| `src/components/grid/card/not-found/index.tsx` | C06 | server-compatible / helper |
| `src/components/grid/card/note/grid-card-note-full.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/note/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/post/grid-card-post-full.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/post/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/project/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/references/grid-card-references.tsx` | C07 | server-compatible / helper |
| `src/components/grid/card/references/index.tsx` | C07 | server-compatible / helper |
| `src/components/grid/card/related/grid-card-related-notes.tsx` | C07 | server-compatible / helper |
| `src/components/grid/card/related/index.tsx` | C07 | server-compatible / helper |
| `src/components/grid/card/section/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/card/subscribe/error-mode.tsx` | C12 | server-compatible / helper |
| `src/components/grid/card/subscribe/form-mode.tsx` | C12 | server-compatible / helper |
| `src/components/grid/card/subscribe/index.tsx` | C12 | client |
| `src/components/grid/card/subscribe/info-mode.tsx` | C12 | server-compatible / helper |
| `src/components/grid/card/subscribe/subscribe-form.tsx` | C12 | client |
| `src/components/grid/card/subscribe/success-mode.tsx` | C12 | server-compatible / helper |
| `src/components/grid/card/user/index.tsx` | C07 | server-compatible / helper |
| `src/components/grid/card/user-social/index.tsx` | C16 | server-compatible / helper |
| `src/components/grid/index.tsx` | C03 | server-compatible / helper |
| `src/components/grid/skeleton/index.tsx` | C06 | server-compatible / helper |
| `src/components/grid/skeleton/skeleton-card.tsx` | C06 | server-compatible / helper |
| `src/components/grid/skeleton/skeleton-grid.tsx` | C06 | server-compatible / helper |
| `src/components/post-transitions/PostDrillInLink.tsx` | C10 | server-compatible / helper |
| `src/components/post-transitions/PostTransitionBoundary.tsx` | C10 | server-compatible / helper |
| `src/components/ui/button.tsx` | C13 | server-compatible / helper |
| `src/components/ui/card.tsx` | C13 | server-compatible / helper |
| `src/components/ui/input.tsx` | C13 | server-compatible / helper |
| `src/components/ui/label.tsx` | C13 | client |
| `src/components/ui/skeleton.tsx` | C13 | server-compatible / helper |
| `src/providers/index.tsx` | C11 | server-compatible / helper |
| `src/search/page-content.tsx` | C14 | server-compatible / helper |

### Additional TSX modules

| Module | Package | Direct declaration |
| --- | --- | --- |
| `src/utilities/social-icons.tsx` | C07 | server-compatible / helper |
| `src/fields/slug/SlugComponent.tsx` | C15 | client; admin-only and excluded |

## Supporting files and endpoints

These files participate in the public contract even though they are not TSX components. Their treatment follows the parent plan rather than a blanket feature toggle.

| Scope | Files and decision |
| --- | --- |
| Domain reads | `src/utilities/get-post.ts`, `get-note.ts`, `get-activity.ts`, `get-project.ts`, `get-projects.ts`, `get-project-posts.ts`, `get-topic.ts`, `get-topic-posts.ts`, `get-lyovson-profile.ts`, `get-lyovson-feed.ts`: apply the parent cache table, visibility, projections, keys and invalidation tests. |
| Query dependencies | `content-queries.ts`, `post-summary.ts`, `mixed-feed.ts`, `activity-preview.ts`, `payload-client.ts`, `activity-path.ts`, `activity-type.ts`: preserve predicates, ordering, public shape, path identity and cached redirect correctness. |
| Recommendation support | `get-similar-posts.ts`, `get-similar-notes.ts` and embedding helpers: trace whether called by publication or runtime before optimizing; no regeneration or new semantic work from prefetch. Inline RelatedPosts/RelatedNotes are explicitly covered by R03/R05. |
| Public hooks | `src/collections/Posts/hooks`, `Notes/hooks`, `Activities/hooks`, plus Media, Lyovsons, Projects, Topics and References collection hooks/configs: map public invalidation dependencies. No admin UI work or schema changes. |
| Search | `src/search/service.ts`, `types.ts`, `beforeSync.ts`, `fieldOverrides.ts`, `src/app/api/search/route.ts`: retain normalization, limits, visibility and scope/ranking; deduplicate per request, support direct query URLs, and exclude typing/prefetch from embedding execution. |
| Routing/motion/style | `src/utilities/routes.ts`, `view-transitions.ts`, `src/app/(frontend)/globals.css`, navigation types, activity shared helpers: retain identity, accessibility, theme and grid contracts. |
| Media and block schemas | `src/components/Media/image-sizes.ts`, `types.ts`, `src/blocks/*/config.ts`, GIF types/actions and aspect-ratio utilities: read to understand public fields; no admin picker/schema refactor. |
| Preview boundary | `src/app/(frontend)/next/preview/route.ts`, `next/exit-preview/route.ts`: retain authorization and isolation from public caches. Do not activate the currently unmounted preview listener. |
| Feeds and metadata | `src/app/feed.xml/route.ts`, `atom.xml/route.ts`, `feed.json/route.ts`, `sitemap.ts`, `robots.ts`, `manifest.ts`, `llms.txt/route.ts`, `api/docs/route.ts`; `syndication-feed.ts`, `get-sitemap-data.ts`, metadata/JSON-LD/site-origin helpers: preserve cached public output, freshness and canonical links. |
| API boundaries | `src/app/api/embeddings/**`, `src/app/(payload)/api/**`, `src/proxy.ts`: no feature rollout or speculative calls. Preserve existing guards and media serving; only investigate a dependency if it blocks a public acceptance check. Admin/GraphQL UX remains excluded. |
| Build/runtime | `next.config.ts`, package/lock files, TypeScript config, existing test/CI setup: no version change initially; no global partialPrefetching rollout. Confirm the active bundler, default cache handler and shell-eligible profiles; evaluate app-wide chunking experiments only after measurement and shared-build compatibility checks. Add version-matched navigation tests only as needed. |
| Browser assets | `public/` images/icons/fonts and existing browser cleanup scripts: verify actually displayed asset URLs, decoding and fallbacks. No service-worker/offline storage redesign. |

## Journey and state checklist

Every route definition has a direct-load or protected-redirect case in `e2e/public-pages.spec.ts`. Focused navigation, history, no-JavaScript, mobile/theme and isolated media cases passed. The compound scenarios below remain the broader release checklist; an unchecked row may include tested subcases and does not imply that implementation is pending. See the verification report for exact coverage and fixture limitations.

- [ ] Main menu → each destination; Hero/Menu/Search switching; Escape and focus restoration.
- [ ] Home/archive → post/note/activity → related item → Back/Forward; source scroll and card identity.
- [ ] Projects/topics → page two → article → Back; stable hero/topic context and pager.
- [ ] Global → Rafa → each author section → Jess → Back; correct profile/font/scope and no stale cross-author content.
- [ ] Global/scoped search: blank query, results/no results, invalid input, failure/retry, rapid submits, bookmarked query, refresh and Back/Forward; zero typing/hover/prefetch embeddings; pending/completion announced and late results isolated.
- [ ] Warm shell, shell-only, intent-warmed detail, cold server instance, revalidation, deployment cache reset, cold browser/image caches and unseen-at-build content; useful navigation with delayed JavaScript.
- [ ] Invalid author/topic/project/post/note/activity; invalid date and page number; old slug redirect; valid empty collection; page-one redirect.
- [ ] Long title, large article, quote note, mixed activity references, missing/slow image and every rich-text block type.
- [ ] Delayed/failed X response does not hide article text; YouTube click-to-load; GIF/video hide/show cleanup; code-copy behavior.
- [ ] Pause initial/mid/final transition frames: shared image remains visible, shell brightness constant, active page numeral present.
- [ ] Browser history, native back/forward cache and fresh push/replace have intentional state semantics; traverse beyond three routes to test eviction. Cached Back need not animate; URL reconstruction stays correct.
- [ ] Keyboard/focus/announcements, modifier/middle/hash/download links, 200% zoom, 320/390px widths, desktop, theme/font/date hydration, reduced motion, Chromium/Safari-WebKit/Firefox.
- [ ] Isolated publication/withdrawal/slug-date reassignment and related-author/media changes update public reads, metadata, archives, counts, recommendations, feeds and sitemap.
- [ ] HTML-limited crawler and delayed-JavaScript metadata checks: canonical/title/OG/JSON-LD/public visibility, search indexing policy, HTTP status and final missing-page/noindex behavior under streaming.
- [ ] Protected playground and existing preview route retain authentication; admin work remains excluded.
- [ ] All route/component rows carry a completed decision; inactive components remain inactive unless separately requested.

## Evidence template

For every completed group, record: source commit; fixtures/routes; intended initial shell; cached content; streamed content; entry method; cold/warm conditions; state/motion expectation; request/byte/query totals by cache layer, provider retries and per-request deduplication; initial HTML/metadata/status; focus/announcement and eviction behavior; before/after observations; test or screenshot links; unresolved limits. Do not mark a group complete from a build alone.

## Scope reconciliation

The checked-out public page inventory remains exactly 37 files. The component inventory above reflects the September 6 removal of unused modules. Payload admin route/layout modules remain excluded. The two frontend playground routes remain in the ledger as utility/auth-boundary checks, not an admin redesign. Pure helpers and barrel exports are counted as modules so no source file is silently omitted.
