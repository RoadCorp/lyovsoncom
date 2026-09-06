# Linting

Reviewed September 6, 2026 against the installed Biome 2.5.12 and Ultracite 7.10.8 presets.

`pnpm lint` runs Biome through Ultracite and fails on errors **or warnings**. `pnpm lint:fix` applies automatic fixes. CI runs lint separately from the build, as Next.js 16 no longer runs lint during `next build`.

## Presets and framework guidance

| Source | Project configuration |
| --- | --- |
| [Next.js](https://nextjs.org/docs/app/getting-started/installation#choose-a-linter) supports Biome or ESLint. Its [ESLint guide](https://nextjs.org/docs/app/api-reference/config/eslint) recommends Core Web Vitals and TypeScript presets. | Ultracite's `core` and `next` Biome presets. This is the Biome option, not `eslint-config-next`. Type checking runs separately and during the build. |
| [Ultracite](https://www.ultracite.ai/) provides separate framework and testing presets. | Explicitly include `core`, `next`, `react`, and `vitest`. The Next preset does not include the React preset. |
| [Payload's website template](https://github.com/payloadcms/payload/blob/main/templates/website/eslint.config.mjs) extends Next Core Web Vitals and TypeScript rules. | Keep the existing Biome stack. Payload does not add a separate lint plugin in that template. Generated CMS files remain excluded. |
| [React's official Hooks plugin](https://react.dev/reference/eslint-plugin-react-hooks) includes hook rules and React Compiler diagnostics. | Biome checks hook ordering/dependencies, component definitions, JSX keys and other React rules. It does **not** implement all official compiler diagnostics. React Compiler is enabled for the build, but that is not full lint parity with Meta's plugin. |

## Deliberate exceptions

Most rules use the preset's error severity, including accessibility, security, unused code, hook dependencies, and test correctness. Local overrides preserve established formatting, file naming, nullish checks, Lexical bit masks, Tailwind directives, grouped exports, and ordered CMS operations.

Two optional Biome rules are disabled after checking their diagnostics against this code:

- [`noUnnecessaryConditions`](https://biomejs.dev/linter/rules/no-unnecessary-conditions/javascript/) treats mutable React refs as their initial values. It incorrectly flags timer cleanup, clipboard cancellation, and navigation focus restoration. Generated CMS types also do not validate stored or external data; preserve necessary runtime guards.
- [`noLeakedRender`](https://biomejs.dev/linter/rules/no-leaked-render/javascript/) flags boolean `useState` values and intentional string children, including the copy-status and submit-button labels. These do not leak numeric values into the UI. Keep checking numeric conditional renders during review.

Both rules are outside Biome's recommended set, although Ultracite enables them. Reassess these exceptions when upgrading Biome. The `noMagicNumbers` rule uses Ultracite's default of off; named limits remain useful, while HTTP status assertions and image-size lists do not need suppression comments.

The existing exclusions also cover Shadcn primitives, Payload scaffolding, and one-off maintenance scripts. They are not a claim that those files have been linted. Review changes to them directly; never exclude application code simply to make lint pass.
