# Site simplification

This pass preserves the crest, colors, typography, content, and modular card grid while making browsing more direct and reducing unnecessary work.

## User-facing behavior

- The main navigation preserves the crest and large opening tiles. Menu opens nine equal tiles in a 3×3 grid, including Posts, Notes, Activities, and Search. On Rafa and Jess pages, archive links stay within that person's content.
- Post titles use the full bottom row of each card. The content type appears as a small label instead of a separate tile linking to the same article.
- Search runs on submission. Typing no longer starts a second, paid semantic search for previews. Enter submits; Escape closes the search and restores keyboard focus.
- Cards fit narrow screens instead of retaining a 400px minimum width.
- [Interaction polish](interaction-polish.md) adds subtle tile, title, and image feedback while preserving fixed grid geometry, touch behavior, and reduced-motion preferences.
- [Theme refinement](theme-refinement.md) improves light/dark surface colors, muted text, form focus, and syntax highlighting while keeping the site's personality.

## Data and loading

- Homepage, post archive, topic, and project queries select the fields needed by post cards. Full article queries retain their content. Author IDs remain selected for Payload's public author population hook.
- RSS, Atom, and JSON share one cached query and serialization helper. Existing content hooks invalidate its posts, projects, topics, and lyovsons tags. The production build prerenders all three feeds.
- Invalid search limits are rejected before embedding or database work.
- Image size hints reflect their actual slots: approximately 250px card covers, 400px hero areas, and 120px thumbnails, with larger files selected automatically for denser displays.
- Serif fonts load when used instead of preloading three files totaling 60,404 bytes on every page. Sans and mono preloads remain.
- Removed the unused global toast component and unnecessary grid wrappers.

## Local preview

To inspect existing content without development schema synchronization:

```sh
PAYLOAD_DB_PUSH=false pnpm dev
```

Normal development schema behavior is preserved when this variable is absent. This option disables automatic schema push, not all application writes; do not submit CMS or other mutating forms during a read-only preview.

## Verification

The changes are checked with project lint, TypeScript, Vitest, and a production build, plus browser checks for archive navigation, article reading, search submission, keyboard return, and narrow-screen layout. The tests mock external dependencies and do not call the embedding provider or database.

This pass does not migrate data, regenerate embeddings, or deploy the site. The accompanying [dependency refresh](package-upgrade.md) documents framework and tooling upgrades. Production latency and billing improvements need measurements after deployment. The existing global search ranking function remains in the database and has not been changed. Browser testing exposed weak semantic matches for a broad query; repository SQL ranks matches separately within content types without a minimum similarity. Improving relevance needs a separate, data-backed review of the deployed ranking function.

## Reference documentation

- [Payload field selection](https://payloadcms.com/docs/queries/select)
- [Next.js Route Handlers with Cache Components](https://nextjs.org/docs/app/getting-started/route-handlers#with-cache-components)
- [Next.js font options](https://nextjs.org/docs/app/api-reference/components/font)
- [Payload Postgres configuration](https://payloadcms.com/docs/database/postgres)
