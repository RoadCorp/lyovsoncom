# Master Plan: Uniform Card-Grid, Edgy Personal Aesthetic, Full Card-System Optimization

## Summary
This is the official redesign plan for Lyovson.com. The site keeps one shared card-grid as its core identity, with modern/edgy editorial glass styling that stays fast, readable, and practical in both light and dark modes.

## Locked Decisions
1. The grid/card gimmick is non-negotiable and remains the foundation on every frontend route.
2. Allowed card footprints are locked to `1x1`, `1x2`, `2x1`, and `2x2` only.
3. Internal card sectioning remains uniform, with `1x1` cards using a `3x3` section lattice.
4. The homepage remains a single mixed chronological feed of posts, notes, and activities.
5. Longform should use longer parent cards with section-card structure, not freeform page layouts.
6. On larger screens, the left-side utility rail is intentionally preserved for detail pages.
7. Motion should feel cool but not heavy; UX and responsiveness win over visual excess.
8. Utility and document routes must use the same card-grid language as primary content routes.
9. Delivery model is one large redesign pass in one branch, executed in phased order internally.

## Implementation Findings (Post-Pass Status)
1. Geometry tokenization is now standardized and card sizing is driven by shared grid tokens (`1x1`, `1x2`, `2x1`, `2x2`).
2. Grid/card primitives are now explicit and safer:
`GridCardSection` uses explicit modes (`static`, `button`), and `GridCardNavItem` uses explicit variants (`link`, `button`, `static`).
3. Known correctness fixes are implemented:
hero post destination, project destination, and nav/menu client navigation behavior are corrected.
4. Utility/document routes (`ai-docs`, `privacy-policy`, `offline`) are now first-class card-grid surfaces.
5. Longform now uses a shared `glass-longform` system across RichText + Lexical serialization + longform blocks.
6. Duplicate card implementation paths were reduced (including removal of an unused duplicate post-meta hero file).
7. Remaining work is now primarily visual QA/polish, not foundational architecture changes.

## In-Scope Surfaces
1. Frontend routes in `src/app/(frontend)/**`.
2. Grid and card primitives in `src/components/grid/**`.
3. All card families in `src/components/grid/card/**`.
4. Archive and pagination adapters:
`src/components/CollectionArchive/index.tsx`
`src/components/NotesArchive/index.tsx`
`src/components/ActivitiesArchive/index.tsx`
`src/components/Pagination/index.tsx`
5. Lexical rendering and content styling:
`src/components/RichText/index.tsx`
`src/components/RichText/serialize.tsx`
6. Longform block components:
`src/blocks/Banner/component.tsx`
`src/blocks/Quote/component.tsx`
`src/blocks/MediaBlock/component.tsx`
`src/blocks/YouTube/component.tsx`
`src/blocks/YouTube/you-tube-player.tsx`
`src/blocks/XPost/component.tsx`
`src/blocks/GIF/component.tsx`
`src/blocks/Code/component.client.tsx`

## Out of Scope
1. Shadcn internals in `src/components/ui/**` (usage updates are allowed).
2. Payload admin route group `(payload)`, except indirect style integration if needed.

## Public API / Interface Changes
1. `GridCardSection` in `src/components/grid/card/section/index.tsx` moves to explicit interaction modes to remove wrapper-button ambiguity.
2. `GridCardNavItem` in `src/components/grid/card/nav/grid-card-nav-item.tsx` moves to explicit variants (`link`, `button`, `static`) to prevent nested interactive conflicts.
3. No Payload schema changes.
4. No URL scheme changes; incorrect destinations and client navigation behavior are corrected.

## Master Execution Plan

## Phase 1: Token and Geometry Foundation
1. Reorganize `src/app/(frontend)/globals.css` into clean token/component/utility/accessibility layers.
2. Establish canonical geometry tokens for the locked size matrix (`1x1`, `1x2`, `2x1`, `2x2`).
3. Replace repeated literal geometry values (`400`, `816`, ad hoc gaps) with shared tokens.
4. Keep compatibility aliases for existing glass variables during migration.
5. Standardize surface tiers (`base`, `interactive`, `premium/hero`) and reduce default effect cost.
6. Improve light/dark parity so both themes feel equally polished and readable.

## Phase 2: Grid and Primitive Hardening
1. Refactor `src/components/grid/index.tsx` to consume geometry tokens consistently.
2. Refactor `src/components/grid/card/index.tsx` for token-driven sizing and responsive safety.
3. Refactor `GridCardSection` semantics for valid keyboard/focus behavior and no role misuse.
4. Refactor `GridCardNavItem` composition to enforce structurally valid link/button/static usage.
5. Fix primitive-level interaction bugs that affect navigation and pagination behavior.

## Phase 3: Full Card System Optimization
1. Optimize nav cards in `src/components/grid/card/nav/*`.
2. Optimize hero cards in `src/components/grid/card/hero/index.tsx`.
3. Optimize content cards:
`src/components/grid/card/post/grid-card-post-full.tsx`
`src/components/grid/card/note/grid-card-note-full.tsx`
`src/components/grid/card/activity/grid-card-activity-full.tsx`
`src/components/grid/card/activity/grid-card-activity-review.tsx`
4. Optimize relational cards:
`src/components/grid/card/references/grid-card-references.tsx`
`src/components/grid/card/related/index.tsx`
`src/components/grid/card/related/grid-card-related-notes.tsx`
5. Optimize identity cards:
`src/components/grid/card/user/index.tsx`
`src/components/grid/card/user-social/index.tsx`
`src/components/grid/card/project/index.tsx`
6. Optimize utility cards:
`src/components/grid/card/subscribe/*`
`src/components/grid/card/not-found/index.tsx`
`src/components/grid/card/admin/index.tsx`
7. Optimize loading cards in `src/components/grid/skeleton/*`.
8. Remove duplicate/dead card implementations and keep one source of truth.
9. Keep feed-card truncation behavior for overflow by design.

## Phase 4: Page-Wide Uniformity
1. Bring all frontend pages into the same card-grid language, including:
`src/app/(frontend)/ai-docs/page.tsx`
`src/app/(frontend)/privacy-policy/page.tsx`
`src/app/(frontend)/offline/page.tsx`
2. Preserve current feed/detail structure on home/posts/notes/activities/projects/topics/search.
3. Preserve the left-side utility rail on larger screens for detail pages.
4. Ensure pagination cards visually and behaviorally match primary cards.

## Phase 5: Lexical and Longform Integration
1. Establish a dedicated longform wrapper system in `src/components/RichText/index.tsx`.
2. Restyle Lexical nodes in `src/components/RichText/serialize.tsx` so headings/body/lists/quotes/links/code align with the card system.
3. Align all longform blocks to the same surface, spacing, and typography system.
4. Ensure legal/global text pages and article bodies share one longform system.

## Phase 6: Integrated Correctness and Final Polish
1. Fix hero post destination in `src/components/grid/card/hero/index.tsx`.
2. Fix project card destination in `src/components/grid/card/project/index.tsx`.
3. Replace client misuse of `redirect()` with router navigation in `src/components/grid/card/nav/menu-mode.tsx`.
4. Resolve nested interactive markup where anchors are wrapped by interactive wrappers.
5. Resolve pagination interaction/focus behavior issues in `src/components/Pagination/index.tsx`.
6. Remove invalid role usage and interaction semantics where present.

## Test Cases and Scenarios
1. Route validation:
`/`
`/page/[pageNumber]`
`/posts`
`/posts/[slug]`
`/notes`
`/notes/[slug]`
`/activities`
`/activities/[date]/[slug]`
`/projects`
`/projects/[project]`
`/topics/[slug]`
`/search?q=test`
`/ai-docs`
`/privacy-policy`
`/offline`
`/subscription-confirmed`
`/playground`
2. Geometry validation: only `1x1`, `1x2`, `2x1`, `2x2` card footprints are used.
3. Card-family validation: each card type follows tokenized sizing, interaction, and hierarchy rules.
4. Navigation validation: nav menu actions, hero CTA, project CTA, pagination transitions.
5. Accessibility validation: keyboard traversal, focus-visible clarity, semantic interaction roles, contrast in light/dark.
6. Responsive validation: 320, 375, 768, 1260, 1680 widths with no horizontal overflow and preserved geometry.
7. Motion validation: expressive default motion plus clean `prefers-reduced-motion` behavior.
8. Longform validation: post/note/activity longform, privacy policy, and AI docs all use the same typography system.
9. Build/lint validation: `pnpm build` passes and touched frontend files introduce no new lint regressions.

## Assumptions and Defaults
1. Fixed card-unit rhythm remains the core identity.
2. Existing unrelated dirty git changes remain untouched.
3. IBM Plex remains the base font stack.
4. Edginess is intentional, with readability as the hard guardrail.
5. Delivery is one large redesign pass, not staged rollout releases.
