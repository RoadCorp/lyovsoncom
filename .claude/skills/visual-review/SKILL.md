---
name: visual-review
description: Before/after review of a lyovson.com change against real content on a Neon dev branch — seed stress content, build the read-only preview, crawl-diff every sitemap page against production, and screenshot routes in both themes at desktop and phone width. Use for design, layout, metadata, routing or data-path changes before opening a PR.
---

# Visual review on a dev branch

Never point local commands at production: `.env.local` holds the production `POSTGRES_URL`. Every step below runs with a Neon **dev branch** in the shell environment, which overrides `.env.local`.

## 1. Point the shell at a dev branch

Create a branch of production main in Neon (README → Database discovery), then export its URLs in the same shell as every later command:

```sh
export POSTGRES_URL='postgresql://…@ep-<branch>-pooler…/verceldb?sslmode=require'
export POSTGRES_URL_NON_POOLING='postgresql://…@ep-<branch>…/verceldb?sslmode=require'
export PAYLOAD_DB_PUSH=false OPENAI_API_KEY='' RESEND_API_KEY=''
echo "$POSTGRES_URL" | sed -E 's#.*@([^/]+)/.*#\1#'   # must be the branch host
```

Build any env file for another branch with a small script, not `sed` substitution: connection URLs contain `&`, which `sed` treats as "the matched text".

## 2. Seed stress content (optional, dev branch only)

A post with a very long title, no image, six topics, banner and code blocks, and a nine-paragraph note. The script refuses any host not listed in `STRESS_SEED_ALLOWED_HOSTS` and is safe to re-run.

```sh
STRESS_SEED_ALLOWED_HOSTS=ep-<branch> mise exec -- pnpm payload run scripts/seed-stress-content.ts
```

## 3. Build and serve the read-only preview

```sh
mise exec -- pnpm preview:experience:build
mise exec -- pnpm preview:experience   # http://127.0.0.1:3100, read-only database session
```

The bot guard returns 403 to curl-like user agents; the scripts send a browser user agent.

## 4. Crawl and diff

```sh
node .claude/skills/visual-review/scripts/crawl-snapshot.mjs https://www.lyovson.com /tmp/before.json
node .claude/skills/visual-review/scripts/crawl-snapshot.mjs http://127.0.0.1:3100 /tmp/after.json
node .claude/skills/visual-review/scripts/crawl-snapshot.mjs --diff /tmp/before.json /tmp/after.json
```

Expect differences only where the change intends them. Stress pages exist only on branches that were seeded, and `/search` differs when the local preview has no OpenAI key (it falls back to full-text search).

## 5. Screenshots

```sh
OUT=/tmp/shots TAG=my-change ROUTES=/,/posts,/notes \
  node .claude/skills/visual-review/scripts/screenshots.mjs https://www.lyovson.com http://127.0.0.1:3100
```

Review desktop and phone, light and dark. Then run the standard gate from AGENTS.md (`pnpm lint` last) and `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 pnpm test:browser`.
