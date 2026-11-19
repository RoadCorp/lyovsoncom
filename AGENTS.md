# Lyovson.com instructions

Use mise and pnpm with the committed versions. [package.json](package.json) owns commands. [biome.jsonc](biome.jsonc) and [linting notes](docs/linting.md) own style rules and deliberate exceptions; do not duplicate the Ultracite rule catalog in agent files. Use Conventional Commits.

## Project contracts

- Payload collections and hooks own content publication, access, embeddings, and invalidation. Preserve public-read predicates, private-field filtering, paid-work authorization, unchanged-content skips, and recursion guards. Inspect current hooks/jobs before changing these paths.
- Lexical editors share `src/fields/default-lexical.ts` and `src/fields/lexical-configs.ts`. Update these owners rather than duplicating editor configs. Regenerate Payload types/import maps when their inputs change using `pnpm generate:types` and `pnpm generate:importmap`.
- Consult [README.md](README.md) for setup and database discovery. Never touch production machines or the production database. Run no migrations. Use no paid APIs. A `POSTGRES_URL` used for a build or preview must be a Neon development branch, never the production `main` branch.

## Design

- **Tokens:** [`src/app/(frontend)/globals.css`](src/app/(frontend)/globals.css) is the only source. The named palette (`--paper`, `--ink`, `--wave-blue`, `--cedar-gold` and the rest, in OKLCH) sits in `:root` and `.dark`; the shadcn semantic and `--accent-*` tokens mix from it in Oklab; `@theme inline` exposes them to Tailwind with the type scale and the grid breakpoints `g1`–`g5` (420–2100px). Style with token utilities, add a token there before using a new colour, and keep raw colours out of components. Light and dark both ship.
- **Layout:** preserve the responsive grid-card design and reuse `src/components/grid/`. Desktop grid units are 400px; mobile cards fit their container.
- **Type:** IBM Plex Sans, Serif and Mono, self-hosted through `next/font/local` in `src/app/(frontend)/fonts.ts` (`--font-sans`, `--font-serif`, `--font-display`, `--font-mono`).
- **Components:** shadcn/ui, style `new-york` on Radix ([components.json](components.json)), icons from lucide. Add primitives with the shadcn CLI. Avenews uses `base-nova` on Base UI on purpose; do not convert either project to match the other.
- **Mark:** the crest. `src/components/Logo/logo.tsx` renders `public/crest-dark-simple.webp` and inverts it for dark mode; the full marks are in `public/brand/`.
- **Assets:** site icons and the OG image live in `public/`; editorial media goes through Payload's Media collection to Vercel Blob, not the repo.
- **AI imagery:** none is in use. Adding any needs Rafa's approval; it must not depict a real person or imitate a real brand, and the commit records the tool and prompt. Label it visibly when it shows realistic people, places or events (EU AI Act Art. 50).
- **Proof:** visual changes go through the `visual-review` skill (desktop and phone, light and dark).

## Verification

Use focused checks during edits. Before pushing to `main`, run:

```sh
pnpm lint
pnpm test
pnpm seo:check
pnpm build
```

`pnpm lint` fails on warnings. `pnpm test` and `pnpm seo:check` do not need a database. `pnpm build` needs the cloud `PAYLOAD_SECRET` and a non-production `POSTGRES_URL`. Follow [test coverage](docs/test-coverage.md) for browser scope and safe preview commands; inspect affected views, themes, keyboard behavior, and narrow layouts.

Work in batches. Test. Push straight to `main`. Verify the live deploy. Fix forward.

Documentation-only edits need formatting and reference checks. Do not clear build caches or delete lockfiles as routine setup; use those repairs only for a diagnosed problem.

## Cursor Cloud

[`.cursor/install.sh`](.cursor/install.sh) installs Node 24.21.0 and pnpm 10.30.0, then `pnpm install --frozen-lockfile`. It does not migrate, seed, or call providers. Secret names and the checks are in [`.cursor/README.md`](.cursor/README.md). Never touch production machines or the production database. Run no migrations. Use no paid APIs.
