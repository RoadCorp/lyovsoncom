# View transitions: completed plan and verification

September 5, 2026. Audited all 37 public frontend page definitions, their layouts and state fallbacks, and the shared card renderers. Implemented the selected improvements in the existing grid design. No deployment or database migration is included.

Notion task: [Polish shared-element transitions across all public views](https://app.notion.com/p/3d2a881304bb816699d0e91f7aa77fcb). Status: Done for local implementation and verification; not deployed.

## Completed implementation

| Area | Existing behavior | Implemented refinement |
| --- | --- | --- |
| Post detail | Matching image/title names existed, but group geometry was disabled; JavaScript supplied scale and opacity effects. | Restore actual image/title movement into the hero. Replace custom animation callbacks with the shared CSS system. |
| Archives | Individual content sometimes matched; the complete card did not retain its position across lists. | Stable collection/ID identities move retained cards between archive, author, topic, project, and search layouts. Incoming/removed cards fade. |
| Navigation | Hero, Menu, and Search swapped abruptly; menu links used the detail transition type. | Short local crossfades, moving Search/Close controls, and a distinct section transition. Preserve typing, keyboard navigation, Escape, and query restoration. |
| Notes | Excerpt/body sharing existed; related titles and metadata did not match. | Related-note title to heading, plus topic/byline/type continuity. Crossfade long text without stretching it. Deduplicate related-note identities. |
| Detail loading | Notes, activities, and projects disabled prefetch; a loading commit could break the shared pair. | Full prefetch on hover, focus, or touch intent, following the post pattern. Fade loading/result/detail panels when a matching pair is unavailable. |
| Search | Query changes lacked a coordinated result transition. | Query/scoped result boundaries with overlapping-card continuity. Input remains immediate and browser history restores the correct query. |
| Pagination | Next/previous types looked identical; the pager had no stable identity. | Opposing short movements, stable pager frame, and shared active-page marker. Retain the project hero on later pages. |
| Persistent panels | Repeated frames could fade or participate in broad content changes. | Keep navigation, unchanged author profiles, and repeated activity rail anchored. Author sections transition below the profile. Different authors retain distinct identities. |
| Motion consistency | Separate post animations and delayed body effects competed with shared transitions. | One timing/easing system, shorter mobile movement, and zero transition duration under reduced motion. Remove competing body/row stagger effects in the affected flows. |

### Motion rules

- Shared geometry: 280ms desktop, 220ms on small screens; `cubic-bezier(0.22, 1, 0.36, 1)`.
- Content changes: 180ms; exits: 120ms. Pagination moves 18px desktop / 10px mobile in opposing directions.
- List changes move whole cards; detail navigation moves inner image/title/metadata pairs. Avoid two competing transformations of the same card.
- Long text and navigation content crossfade without interpolating their entire height. Persistent anchors do not fade.
- Reduced motion sets all view-transition groups and snapshots to zero duration, including browser-generated defaults. Snapshot overlays do not intercept input.
- Names encode punctuation and Unicode without collapsing distinct identities. Collection and metadata roles keep simultaneous participants separate.

### Deliberate exclusions

These decisions resolve the optional audit ideas; they are not unfinished work.

- Do not additionally stretch a full archive-card frame into a large detail hero; the selected image/title movement carries the relationship.
- Keep repeated author/project metadata labels as ordinary links. Multiple occurrences can remain visible at the destination, and their size differs greatly from profile/hero headings. Whole-card continuity already covers these archive changes.
- Do not create visible topic headings solely to provide animation targets; those headings are currently visually hidden.
- Leave unmounted subscription/settings/author-section components, external links, and the separate Payload admin outside this public-view pass.
- Keep static documents, placeholders, and recovery states restrained. Do not introduce elaborate morphs without a shared object.

## View coverage

Every frontend route definition was inspected. Browser verification sampled real journeys through the shared renderers; it did not visit every possible content slug.

| View family | Final treatment |
| --- | --- |
| Home and paginated home | Shared archive cards, stable activity rail, directional pagination. |
| Posts archive and pagination | Whole-card continuity and image/title detail sharing. |
| Post detail and related posts | Image/title geometry; restrained body/rail reveals. |
| Notes archive and pagination | Whole-card continuity and note metadata/content sharing. |
| Note detail and related notes | Related-title sharing; readable body crossfade and panel reveals. |
| Activities archive and pagination | Shared cards and directional pagination. |
| Activity detail | Image/title sharing with coordinated info/review panel arrival. |
| Projects index | Card continuity and project image/title detail sharing. |
| Project archive and pagination | Shared hero, stable later-page header, archive-card transitions. |
| Topic archive and pagination | Shared post cards; no invented heading morph. |
| Author home and pagination | Distinct persistent author profile, shared cards/activity rail. |
| Author posts, notes, activities, and pagination | Profile remains anchored while archive content changes. |
| Author bio, portfolio, contact | Content reveal below the profile; portfolio retains project-card sharing. |
| Global and author search | Query/scoped result changes, retained cards, stable search controls. |
| About, Armenian placeholder, contact | Brief section/content changes. |
| Privacy policy and AI documentation | Restrained page entrance. |
| Offline, empty, error, and not-found states | Existing recovery behavior and restrained state treatment; errors inspected without deliberately triggering server failures. |
| Playground and skeleton demo | Inspected; no additional public animation scope. |

## Verification

- Recorded actual browser animation keyframes in a local production build: post, project, activity, and related-note image/title pairs move between their source/destination geometry. Post media expands from a 244px square to its larger hero region; the title moves into its separate heading cell.
- Confirmed retained archive cards move across home/author lists and changing search queries. Verified both pagination directions, navigation mode/control transitions, note metadata sharing, and unchanged profile anchoring.
- Exercised real global/scoped search submissions, overlapping results, closing search, browser Back/Forward query restoration, keyboard focus, Escape, and rapid mode changes.
- Inspected desktop and 390px mobile layouts in light/dark themes. No horizontal overflow in the sampled flows. Recorded zero-duration view-transition animations with reduced motion enabled.
- Checked warm intent-prefetched detail navigation and uncached/loading paths. Development prefetch behavior differs, so shared-pair verification also used the production build.
- Type checking passes. All 60 tests in six files pass, including new identity-collision tests. Production build generates 173 routes with `PAYLOAD_DB_PUSH=false`. Lint has zero errors and 43 warnings in the current working tree. Whitespace/diff checks pass.

### Practical limits

Fully cached browser Back navigation can restore immediately without starting a view transition in the installed React/Next.js runtime. History and query restoration work, but reverse animation is not guaranteed. Preserve native history behavior rather than intercepting it to force an effect.

Motion was verified in Chromium; this is not a claim of Safari/Firefox animation parity. Unsupported browsers retain normal navigation. Sparse project pagination was checked in source/build; actual directional pagination was exercised with activity pages. Error handling was inspected without creating server failures.

Implementation follows the installed Next.js view-transition documentation and the [React ViewTransition reference](https://react.dev/reference/react/ViewTransition). The central policy lives in `src/utilities/view-transitions.ts` and the view-transition section of `src/app/(frontend)/globals.css`.
