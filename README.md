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

| Variable | Purpose |
| --- | --- |
| `POSTGRES_URL` | Postgres connection used by Payload |
| `PAYLOAD_SECRET` | Payload authentication secret |
| `NEXT_PUBLIC_SERVER_URL` | Site origin for links and metadata |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob media storage |
| `OPENAI_API_KEY` | Embedding generation |
| `RESEND_API_KEY` | Email delivery |
| `TENOR_API_KEY` | GIF search in the CMS |
| `CRON_SECRET` | Authenticated job execution |

Start development with automatic schema changes disabled:

```sh
PAYLOAD_DB_PUSH=false mise exec -- pnpm dev --port 3100
```

`PAYLOAD_DB_PUSH=false` disables schema pushes; it does not prevent application writes. For public browsing checks against an existing database, the preview commands also enforce read-only database transactions and clear the OpenAI and Resend keys:

```sh
mise exec -- pnpm preview:experience:build
mise exec -- pnpm preview:experience
```

The preview runs at `http://localhost:3100`. Use an isolated database for CMS edits or migration work.

## Source layout

- `src/app/(frontend)`: public pages and layouts
- `src/app/(payload)`: CMS admin and Payload API routes
- `src/app/api`: search, documentation, and embedding endpoints
- `src/components/grid`: navigation and content cards
- `src/blocks`: rich-text block configuration and rendering
- `src/collections`: `posts`, `notes`, `activities`, `projects`, `topics`, `references`, `lyovsons`, `contacts`, and `media`
- `src/search`, `src/jobs`, `src/utilities`: search, embedding jobs, content queries, and shared helpers
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
- [Public experience verification](docs/public-experience-verification.md)
- [Theme refinement](docs/theme-refinement.md)
- [View transition audit](docs/view-transition-audit.md)
- [Embedding system](README-AI-SYSTEM.md)
