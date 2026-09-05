# Interaction polish

The existing crest, colors, and nine-cell menu stay in place. Feedback is implemented in CSS with the existing 120/180/260ms timing tokens, without animation dependencies or pointer-tracking JavaScript.

- Navigation tiles fade in a soft accent highlight. Their icon and label lift 2px on hover and settle to 97% scale while pressed; the tile and hit area stay fixed.
- The crest lifts 2px. Clickable article titles and activity/related rows gain a soft highlight. Existing small control and metadata-link movement uses the same motion policy.
- Cover images zoom to 102.5% inside stationary, clipped frames. The Media component now honors callers' explicit layout classes instead of overriding them with `display: contents`, so frame borders and clipping actually apply.
- Moving hover effects require a fine pointer, hover support, and no reduced-motion preference. Touch users retain static pressed feedback. Reduced motion keeps static highlights and focus cues, disables movement, and removes route-transition delays.
- Keyboard focus has a visible outline independent of hover shadows. Removed the competing button press scale and retained reveal transforms that previously overrode hover/press states.

New decorative animations use transform and opacity. Shadows remain static; no blur animation, blanket `will-change`, perpetual animation, or new client state is added. Existing small text-color transitions remain.

## Verification

Browser checks cover desktop hover and press, keyboard focus and menu return, both themes, reduced motion, and a coarse touch pointer at 320px. The nine tiles remain equal-sized; image frames retain their dimensions during zoom. Article hero, inline media, activity thumbnails, and related rows are checked after the Media layout correction.

Project lint, TypeScript, the existing regression suite, and the production build accompany the browser checks. These are local checks, not production field-performance measurements.

## Guidance

- [web.dev: high-performance CSS animations](https://web.dev/articles/animations-guide): prefer transform and opacity, avoid expensive paint, and add layer hints only when measurement justifies them.
- [MDN: hover capability](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover) and [reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion): match input capabilities and the user's motion preference.
- [Tailwind: hover, focus, and motion states](https://tailwindcss.com/docs/hover-focus-and-other-states): maintain keyboard feedback and gate decorative movement.
- [Next.js: View Transitions](https://nextjs.org/docs/app/guides/view-transitions): preserve shared elements and remove animation delays with reduced motion. The installed Next.js 16.3 documentation was also checked.
