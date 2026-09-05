# Light and dark theme refinement

The light palette uses warm ivory, blue ink, and restrained cool accents. Dark mode uses midnight slate, pearl text, and lighter blue accents. The crest, typography, nine-cell menu, grid, and motion behavior are preserved.

## Changes

- Keep the base swatches in OKLCH, but interpolate mixtures in Oklab. This removes unintended pink and green intermediate hues when combining blue accents with warm neutrals.
- Give dark backgrounds and surfaces explicit, separated lightness levels. Remove the generic dark panel override that previously masked the navigation, title, and metadata surface treatments.
- Soften decorative borders, shadows, and embossing while keeping input borders and keyboard outlines distinct.
- Increase muted-text and link contrast; give light-mode status text and review scores darker colors instead of using pastel surface accents as text.
- Use CSS-variable Prism highlighting so code, comments, and line numbers follow the active theme without new state or a hydration-dependent theme switch.
- Remove extra hover opacity from article and documentation links. Use opaque input backgrounds and semantic foreground/background pairs for destructive buttons and badges.
- Scope navigation icon accents to tile contents so the search-submit icon inherits its button's contrasting foreground.
- Align browser chrome and manifest swatches with the new page backgrounds: light `#f8f5ed`, dark `#0b1219`.

## Contrast checks

Local measurements use browser-computed text colors and the least favorable opaque gradient endpoint. They are targeted checks, not a whole-site WCAG certification. Transparent decorative overlays are excluded from these endpoint calculations; both themes are also reviewed visually.

| Sample | Previous light | Refined light | Refined dark |
| --- | ---: | ---: | ---: |
| Article type label | 2.87:1 | 5.07:1 | 5.87:1 |
| Activity date | 3.21:1 | 5.31:1 | 5.42:1 |
| Navigation label | 5.28:1 | 8.10:1 | 6.94:1 |
| Code syntax, minimum sampled | — | 5.10:1 | 6.29:1 |
| Primary button label | — | 11.18:1 | 9.53:1 |

Additional checks cover status colors, ratings, placeholders, destructive/secondary buttons, focus states, theme switching, and narrow screens. Rare states and Prism token colors were rendered in a temporary local fixture, which was removed before the production build. No subscription or CMS forms were submitted.

Validation: 58 tests pass; lint has no errors and 42 existing warnings; the production build and its TypeScript check pass with all 173 routes. The temporary fixture is absent from the production route manifest.

## References

- [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html): 4.5:1 for ordinary text, 3:1 for large text; include hover and placeholder text.
- [W3C non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html): distinguish necessary controls and states from adjacent colors.
- [MDN color interpolation](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color-interpolation-method): rectangular Oklab and polar OKLCH interpolation behave differently.
- [Tailwind outline styles](https://tailwindcss.com/docs/outline-style): preserve visible custom keyboard-focus styling.
