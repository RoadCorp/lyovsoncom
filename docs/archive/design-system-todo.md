# Design System Improvement To‑Do

[x] Add missing grid background tokens and ensure both light and dark themes define the values consumed by `Grid`.
[x] Refine `GridCard` to expose layout flexibility, optional ARIA role, and an auto-height content variant while keeping the 400 px base rhythm responsive.
[x] Replace rigid 400 px sizing with responsive behaviour so cards scale on narrow viewports without breaking the grid aesthetic.
[x] Update `GridCardSection` interactivity to avoid nested buttons/links and provide required keyboard handlers only when needed.
[x] Consolidate the `cn` helper into a single module and switch all imports to the shared utility.
[x] Clean up className composition by favouring the helper over string concatenation.
[x] Extend `RenderBlocks` (and related serializers) to support the full set of registered Lexical blocks.
[x] Remove unused or empty grid helpers and align skeletons/fallbacks with the updated card API.
[x] Polish light/dark visuals with refined gradients and consistent glass tokens while preserving a11y guarantees.
