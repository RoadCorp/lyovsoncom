# Lyóvson.com

The website of Rafa and Jess Lyóvson: posts, notes, projects, and activities in a shared card grid.

## Stack

- Next.js 16, React 19, and TypeScript
- Payload CMS 3 with Lexical rich text
- Neon Postgres with pgvector for search and recommendations
- Tailwind CSS, Shadcn UI primitives, and native view transitions
- Vercel hosting and Blob storage; Resend for email
- Biome/Ultracite, Vitest, and Playwright for validation

## Local development

Use Node.js 24 and pnpm 10.30 through `mise`.

```sh
mise exec -- pnpm install --frozen-lockfile
```

Create `.env.local` with the configuration needed for your environment:

| Variable                 | Purpose                             |
| ------------------------ | ----------------------------------- |
| `POSTGRES_URL`           | Postgres connection used by Payload |
| `PAYLOAD_SECRET`         | Payload authentication secret       |
| `NEXT_PUBLIC_SERVER_URL` | Site origin for links and metadata  |
| `BLOB_READ_WRITE_TOKEN`  | Vercel Blob media storage           |
| `OPENAI_API_KEY`         | Embedding generation                |
| `RESEND_API_KEY`         | Email delivery                      |
| `TENOR_API_KEY`          | GIF search in the CMS               |
| `CRON_SECRET`            | Authenticated job execution         |

Point `POSTGRES_URL` at a Neon development branch, never at the production `main` branch. Then start development:

```sh
mise exec -- pnpm dev --port 3100
```

Payload's development schema push is off unless `PAYLOAD_DB_PUSH=true`. Apply schema changes with migrations, and enable push only on a disposable database. Disabling push does not prevent application writes. For public browsing checks against an existing database, the preview commands also enforce read-only database transactions and clear the OpenAI and Resend keys:

```sh
mise exec -- pnpm preview:experience:build
mise exec -- pnpm preview:experience
```

The preview runs at `http://localhost:3100`. Use an isolated database for CMS edits or migration work.

## Database discovery

For Neon operations, use Neon MCP and filter by the RoadCorp organization. The existing project lookup is `org-dry-credit-92650987` → `lyovsoncom-neon` (`silent-recipe-86860418`), with recorded main branch `br-frosty-field-04223759`. These identifiers are carried forward from the previous setup notes; confirm the current project, branch, and database before running operations. Use an isolated branch for schema qualification and the read-only preview commands above for public browsing checks.

## Source layout

- `src/app/(frontend)`: public pages and layouts
- `src/app/(payload)`: CMS admin and Payload API routes
- `src/app/api`: search, documentation, and embedding endpoints
- `src/components/grid`: navigation and content cards
- `src/blocks`: rich-text block configuration and rendering
- `src/collections`: `posts`, `notes`, `activities`, `projects`, `topics`, `references`, `lyovsons`, and `media`
- `src/search`, `src/utilities`: hybrid search, embedding generation, content queries, and shared helpers
- `scripts`: one-off maintenance scripts and the dev-branch stress-content seed
- `src/migrations`: versioned database migrations
- `e2e`: browser checks for public pages, navigation, and media

## Validation

```sh
mise exec -- pnpm lint
mise exec -- pnpm test
mise exec -- pnpm seo:check
mise exec -- pnpm preview:experience:build
# With the preview running:
mise exec -- pnpm test:browser
```

`pnpm build` creates the normal production build. `pnpm generate:types` and `pnpm generate:importmap` update Payload's generated files after CMS configuration changes.

## Documentation

- [Lint configuration and framework guidance](docs/linting.md)
- [Test coverage and scope](docs/test-coverage.md)
- [Public experience coverage](docs/public-experience-coverage.md)
- [Archived plans and records](docs/archive/)
- [Embedding and search system](README-AI-SYSTEM.md)
- Visual review on a dev branch: `.claude/skills/visual-review/SKILL.md`
