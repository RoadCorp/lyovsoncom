# SEO + AI Audit and Implementation Plan (2026-02-20)

## Scope
- Technical SEO (indexing, canonicalization, robots, sitemap, crawl efficiency)
- Structured data coverage (JSON-LD by content type and template)
- AI discovery surfaces (`llms.txt`, `/.well-known/ai-resources`, `/api/docs`, feeds, embedding APIs)
- Public content type coverage: authors (`lyovsons`), topics (categories), posts, activities, notes, projects

## Current Findings

### High-impact items implemented
- Sitemap now pulls complete datasets with explicit `pagination: false`, avoiding default-limit truncation.
- Sitemap now includes:
  - Core section pagination URLs for indexable pages (`/posts/page/2..3`, `/notes/page/2..3`, `/activities/page/2..3` when available)
  - Project pagination URLs for indexable pages (`/projects/{slug}/page/2..3` when available)
  - Topic pagination URLs for indexable pages (`/topics/{slug}/page/2..3` when available)
  - Author profile URLs from CMS users
- Canonical hygiene and page-1 redirect normalization are in place for archive/taxonomy/project/home pagination.
- JSON-LD now covers paginated archives for:
  - posts
  - notes
  - activities
  - project-post archives
  - topic archives
- `playground` is now explicitly non-indexable (`robots: noindex, nofollow, noarchive`).
- Added `X-Robots-Tag` noindex headers for `/admin/:path*` (and already for `/api/:path*`).
- AI docs and AI resources now align better with actual schema coverage.
- `/api/docs` now documents notes/activities/authors content surfaces and expanded content statistics.
- Mixed homepage feeds now have collection JSON-LD on both `/` and `/page/{n}`.
- Global 404 handling now uses `global-not-found` + `metadataBase` with clean non-indexable metadata.
- Removed legacy file-based `src/app/opengraph-image.png` route to prevent fallback metadata side effects.

### Existing strengths confirmed
- Per-content canonical URLs on detail pages.
- JSON-LD on detail pages for posts, notes, activities, and author profiles.
- Collection JSON-LD on primary index pages (posts, notes, activities, projects, topics).
- Robot rules include explicit AI bot allowlist + machine-readable discovery endpoints.
- Feed and embeddings URLs are normalized to canonical post paths.

### Residual issue to close
- No blocking residual issue remains from this audit cycle.
- Build warnings about `metadataBase` have been eliminated in current implementation.

## Content-Type Coverage Matrix

| Content type | Public route(s) | Sitemap | JSON-LD | Canonical/meta | AI/feed/API discoverability | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Authors (`lyovsons`) | `/{username}` | Yes | Person | Yes | Mentioned in AI docs + API docs | Good |
| Topics (categories) | `/topics/{slug}`, `/topics/{slug}/page/{n}` | Yes | CollectionPage + Breadcrumb | Yes | Mentioned in docs + feeds metadata | Good |
| Posts | `/posts/{slug}`, `/posts`, `/posts/page/{n}` | Yes | Article / CollectionPage / Breadcrumb | Yes | Feeds + embeddings + search + docs | Good |
| Activities | `/activities/{date}/{slug}`, `/activities`, `/activities/page/{n}` | Yes | Article / CollectionPage / Breadcrumb | Yes | Embeddings + search + docs | Good |
| Notes | `/notes/{slug}`, `/notes`, `/notes/page/{n}` | Yes | Article / CollectionPage / Breadcrumb | Yes | Embeddings + search + docs | Good |
| Projects | `/projects`, `/projects/{slug}`, `/projects/{slug}/page/{n}` | Yes | CollectionPage + Breadcrumb | Yes | Mentioned in docs + feeds categories | Good |
| Search (utility) | `/search` | Yes (base only) | N/A | Canonical normalized + query noindex | Search endpoint documented | Good |
| Transactional/utility (`/subscription-confirmed`, `/playground`) | direct routes | Excluded | N/A | Noindex on transactional/private | N/A | Good |

## Prioritized Next Actions

### P0 (recommended to finish this cycle)
- None pending from this audit cycle.

### P1 (recommended)
- Automated SEO regression checks are now in place via `pnpm seo:check`:
  - canonical exists on key public templates
  - `metadataBase` is present on metadata-exporting app files
  - noindexed utility routes are excluded from sitemap
  - required JSON-LD wiring exists on detail and archive templates
- CI enforcement is configured in `.github/workflows/seo-ai-quality.yml`:
  - runs `pnpm seo:check`
  - runs `pnpm build`
  - triggers on PRs and pushes to `main`

### P2 (optional but valuable)
- Add explicit hreflang strategy only if multilingual support is introduced (skip for now).
- Consider sitemap index sharding if URL count approaches large-scale thresholds.

## Validation Checklist
- `pnpm build` passes.
- `sitemap.xml` includes expected content types and indexable pagination pages.
- `robots.txt` contains explicit rules for standard crawlers and AI crawlers.
- `/llms.txt`, `/.well-known/ai-resources`, and `/api/docs` are internally consistent.
- Structured data appears on representative routes:
  - post detail + paginated posts
  - note detail + paginated notes
  - activity detail + paginated activities
  - topic/project detail + paginated topic/project archives
  - author profile
