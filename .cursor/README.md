# Cursor cloud agents

`.cursor/install.sh` prepares a cloud agent to build and test this repository. Cursor runs it from [environment.json](environment.json) while creating a Build. The script is safe to run again: it installs Node 24.21.0 and pnpm 10.30.0 when they are missing, then runs `pnpm install --frozen-lockfile`.

The script does not start the app, migrate, seed, or call a provider. Builds keep the installed files. They do not keep exported shell variables or running processes.

## Checks

From the repository root:

```sh
pnpm lint
pnpm test
pnpm seo:check
pnpm build
```

`pnpm lint` fails on warnings. `pnpm test` is Vitest. Database and provider calls in that suite are mocked, so it does not need `POSTGRES_URL`. `pnpm seo:check` reads the source tree. `pnpm build` is the production Next.js build and needs the two secrets below. The database it reads must already have the schema. Do not run `pnpm payload migrate`.

`pnpm test:browser` stays a local pre-release check against the read-only preview. It is outside this cloud gate.

If `node -v` is not 24, run `export PATH="/usr/local/bin:$PATH"` in that shell. Login shells load this path from `/etc/profile.d/cursor-node.sh`.

## Secrets

Add these names in Cursor Cloud Agents settings. This file lists names only. Never commit values, and never paste values into the repository.

| Name             | When it is required                         |
| ---------------- | ------------------------------------------- |
| `PAYLOAD_SECRET` | `pnpm build` and any Payload process       |
| `POSTGRES_URL`   | `pnpm build` and any read of site content  |

`PAYLOAD_SECRET` is a non-production placeholder. It does not need to match production.

`POSTGRES_URL` must be a Neon development branch. Never use the production `main` branch (`br-frosty-field-04223759` on `lyovsoncom-neon`). Leave `PAYLOAD_DB_PUSH` unset.

Do not add these names. They call paid providers or can write production resources, and cloud agents must leave them unset:

- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `CRON_SECRET`

`NEXT_PUBLIC_SERVER_URL` is a public origin, not a secret. Omit it unless a task needs a specific origin.

## Safety

Never touch production machines or the production database. Run no migrations. Use no paid APIs.

Work in batches. Test. Push straight to `main` (this repository has no `master` branch; `main` is the branch that deploys). Verify the live deploy. Fix forward.
