import { flushSync } from "react-dom";

type ResolvedTheme = "dark" | "light";

interface ThemeRevealOptions {
  /** Commits the new theme choice (next-themes `setTheme`). */
  apply: () => void;
  /** The element the circle grows from. */
  origin: HTMLElement;
  /** What the page will look like after `apply`. */
  resolvedNext: ResolvedTheme;
}

const REVEAL_ATTRIBUTE = "data-theme-reveal";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Switches theme behind a view transition so the new theme grows as a circle
 * from the Theme button. Falls back to an instant switch when nothing visible
 * changes, motion is reduced, or the browser has no view transitions.
 */
export function revealTheme({
  apply,
  origin,
  resolvedNext,
}: ThemeRevealOptions) {
  const root = document.documentElement;
  const changesPage = !root.classList.contains(resolvedNext);

  if (
    !changesPage ||
    typeof document.startViewTransition !== "function" ||
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  ) {
    apply();
    return;
  }

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  // Reach the farthest viewport corner exactly, so the whole duration shows.
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  root.style.setProperty("--theme-reveal-x", `${x}px`);
  root.style.setProperty("--theme-reveal-y", `${y}px`);
  root.style.setProperty("--theme-reveal-r", `${radius}px`);
  root.setAttribute(REVEAL_ATTRIBUTE, "");

  const transition = document.startViewTransition(() => {
    flushSync(apply);
    // next-themes applies the class in an effect; set it here so the new
    // snapshot is already in the new theme.
    root.classList.remove("light", "dark");
    root.classList.add(resolvedNext);
    root.style.colorScheme = resolvedNext;
  });

  // A navigation can start mid-reveal and skip it; that is not an error.
  transition.ready.catch(() => undefined);
  transition.finished
    .catch(() => undefined)
    .finally(() => root.removeAttribute(REVEAL_ATTRIBUTE));
}
