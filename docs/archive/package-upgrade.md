# Dependency refresh — September 5, 2026

Updated the application and its development tools together, preserving the site simplification work and existing CMS data.

## Main versions

| Package | Before | After |
| --- | --- | --- |
| Next.js / third-party integrations | 16.2.3 / 16.2.6 | 16.3.4 |
| React / React DOM | April 9 React 19.3 canary | 19.2.8 stable |
| Payload and its plugins | 3.84.1 | 3.88.0 |
| Tailwind CSS | 4.2.4 | 4.3.3 |
| AI SDK / OpenAI provider | 6.0.175 / 3.0.62 | 7.0.92 / 4.0.58 |
| TypeScript | 6.0.3 | 7.0.2 |
| Vitest | 4.1.5 | 5.0.0 |
| Biome / Ultracite | 2.4.11 / 7.5.6 | 2.5.12 / 7.10.8 |
| Sharp | 0.34.5 | 0.35.4 |
| Feed | 5.2.1 | 6.0.0 |
| React DayPicker | 9.14.0 | 10.0.1 |

Other compatible dependencies and transitive packages were refreshed in the lockfile. Next, React, and the Payload family have explicit matching versions. Radix uses a version range instead of the moving `latest` tag. Node types now match the project's Node 24 runtime. GraphQL stays on the latest compatible 16.x release, 16.14.2; Payload 3.88 requires GraphQL 16.

## Compatibility changes

- Next 16.3 supplies the App Router's React runtime, including view transitions. Removed the direct React canary pins, peer overrides, and obsolete `experimental.viewTransition` option. The React canary type references remain necessary for transition types. See the [Next.js transition guide](https://nextjs.org/docs/app/guides/view-transitions).
- Error recovery now uses `catchError` and `retry`; fallback rendering handles an unknown thrown value.
- DayPicker's calendar class key changed from `table` to `month_grid`.
- Biome configuration uses the new rule locations. Explicit compatibility settings retain existing object grouping and callback conventions while keeping security and correctness checks enabled. A small set of new lint findings received local fixes.
- TypeScript 7 uses the native compiler CLI supported by Next 16.3. Its editor does not load the Next language-service plugin; the existing plugin entry is retained for compatible editors. Type checking and Next's build validation remain enabled. See [Next's compiler configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli).
- Vite and esbuild are explicit development dependencies to satisfy Vitest's peers with current patched versions.
- Removed unused direct dependencies: Motion, Resend, Svix, React Email components/render, and the broken local `biome` link. Payload's configured email adapter and cloud plugin remain.

The embedding model and vector dimensions are unchanged. This update requires no identified data migration; no migrations, CMS writes, or embedding regeneration were performed. Local preview and build use `PAYLOAD_DB_PUSH=false`.

## Audit status

The refreshed dependency tree reports **zero high or critical findings and two moderate upstream advisories**. Neither is suppressed:

- [esbuild development-server CORS](https://github.com/advisories/GHSA-67mh-4wv8-2f99): Payload's pinned Drizzle tool includes an older esbuild through `@esbuild-kit`. That loader uses transformation APIs; this site's development server is Next, and no esbuild `serve` call was found. Retain the adapter's supported dependency chain rather than force an unrelated compiler upgrade inside it.
- [Payload account-unlock defaults](https://github.com/advisories/GHSA-jg8r-5jh2-v2xj): the only authenticated collection is Lyovsons, whose accounts already have full administrative access. Contacts cannot log in. There is no additional privilege boundary exposed by this default in the current model. Reassess before introducing restricted login accounts, and update when an upstream fix is available.

## Verification

Verified locally with Node 24.18.0 and pnpm 10.30.0:

- Frozen-lockfile installation succeeds without peer dependency warnings.
- Project lint passes with 41 warnings; all 58 tests in five files pass.
- TypeScript checks and the production build pass, including all 173 generated routes.
- Payload type generation succeeds to a temporary file; generated field types are unchanged (three descriptions differ).
- Production browser checks pass for the homepage, article navigation, search submission, keyboard focus recovery, a 320px viewport without horizontal overflow, visible images, and the CMS login page. No browser errors were observed during these flows.
- Development mode loads content and opens search correctly.
- RSS, Atom, and JSON feeds return 200 with 14 posts each and retain author metadata. An invalid search limit returns 400; unauthenticated embedding access returns 401.
- Local Sharp conversion produces valid WebP and AVIF at the requested dimensions.

No CMS login or content-editing form was submitted. The production-mode preview is available at `http://localhost:3100`; changes have not been deployed.
