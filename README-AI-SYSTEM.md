# Embedding and search system

Posts, notes and activities carry an OpenAI `text-embedding-3-small` vector (1536 dimensions, stored with pgvector). Search combines those vectors with Postgres full-text and trigram matching. Posts and notes also store their nearest neighbours as recommendations.

## How embeddings stay current

- **Stale marker.** When a published document's embedded fields change, the collection hooks clear its `embedding_text_hash` (`src/utilities/mark-embedding-stale.ts`). Draft saves and autosaves don't.
- **Daily sync.** Vercel Cron calls `GET /api/embeddings/sync` at 04:00 UTC with `Authorization: Bearer $CRON_SECRET` (`vercel.json`). It embeds only stale or missing documents, up to 25 per collection.
- **One write path.** `generateEmbeddingFor(collection, id, payload)` in `src/utilities/generate-embedding-helpers.ts` builds the text, skips it if the hash of the embedded text is unchanged, calls OpenAI, and writes the vector directly to the table. The write is conditional on `updatedAt`, so a save during generation leaves the document stale for the next run, and no version row is created. Recommendations for posts and notes are refreshed after a successful write.
- **No key, no calls.** Without `OPENAI_API_KEY`, nothing calls the provider. Search falls back to full-text and trigram ranking.

## Search

- `src/search/service.ts` runs the `hybrid_search_*` SQL functions, defined in the `20261002_150000_search_functions` migration.
- Query embeddings are cached by normalized query, and queries are capped at 200 characters.
- A missing or failed query embedding falls back to full-text and trigram ranking, never to arbitrary semantic matches.
- Only publicly visible documents are returned.

## Endpoints

Every embedding endpoint requires an authenticated Payload admin or `Authorization: Bearer $CRON_SECRET`, and responds with `Cache-Control: private, no-store`. None of them are public.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/embeddings/sync` (cron), `POST /api/embeddings/sync` | Embed stale or missing documents. The POST body may set `collections`, `limitPerCollection` and `force`. |
| `POST /api/embeddings/regenerate` | Re-embed one document: `{ "collection", "id", "force" }`. |
| `GET /api/embeddings/{posts,notes,activities}/{id}` | One document's stored embedding. Takes `format=full\|vector-only\|metadata-only`, `content=true`, and `regenerate=true`. |
| `GET /api/embeddings?type=all\|posts\|notes\|activities` | Bulk listing of stored embeddings (`vector=true` includes vectors). Add `id=` for one item, or `q=` to embed a query on demand. |
| `GET /api/embeddings/status` | Coverage per collection and system health. |

The public search page is `/search?q=…`. Bots are blocked from it, and from `/api`, by the request guard in `src/utilities/request-guards.ts`.

## Discovery for crawlers and agents

`/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/.well-known/ai-resources`, `/api/docs` (OpenAPI), `/ai-docs`, and full-content feeds at `/feed.json`, `/feed.xml` and `/atom.xml`.

## Operating it

- Check coverage: `GET /api/embeddings/status` with the cron secret.
- Backfill after a model or text-builder change: `POST /api/embeddings/sync` with `{ "force": true }`. This costs OpenAI usage, so confirm first.
- Local work uses a Neon dev branch and a blank `OPENAI_API_KEY` (see README → Database discovery and the visual-review skill), so it never spends provider credits.
