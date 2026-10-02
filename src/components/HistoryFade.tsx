"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const FADE_ATTRIBUTE = "data-history-fade";
// Matches the 120ms animation in globals.css, plus a frame of slack.
const FADE_CLEANUP_MS = 160;

/**
 * Back and Forward restore the previous page without a view transition, so
 * it used to appear abruptly. Fade the page content in over 120ms instead.
 * The attribute is set in a layout effect so the restored page never paints
 * at full opacity first.
 */
export function HistoryFade() {
  const pathname = usePathname();
  const traversing = useRef(false);

  useEffect(() => {
    const onTraverse = () => {
      traversing.current = true;
    };
    const onNavigate = (event: Event) => {
      if ((event as NavigateEvent).navigationType === "traverse") {
        onTraverse();
      }
    };
    // React renders popstate transitions synchronously inside the router's
    // listener, so the flag must be set before that listener runs. The
    // Navigation API's navigate event fires before popstate; without it, a
    // capture listener runs before the router's. Listening to both in
    // Chromium would leave a stale flag behind for the next link click.
    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    if (navigation) {
      navigation.addEventListener("navigate", onNavigate);
      return () => navigation.removeEventListener("navigate", onNavigate);
    }
    window.addEventListener("popstate", onTraverse, { capture: true });
    return () =>
      window.removeEventListener("popstate", onTraverse, { capture: true });
  }, []);

  const lastPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (lastPathname.current === pathname) {
      return;
    }
    lastPathname.current = pathname;
    const isTraversal = traversing.current;
    traversing.current = false;
    if (!isTraversal) {
      return;
    }

    const root = document.documentElement;
    root.setAttribute(FADE_ATTRIBUTE, "");
    const timer = window.setTimeout(
      () => root.removeAttribute(FADE_ATTRIBUTE),
      FADE_CLEANUP_MS
    );
    return () => {
      window.clearTimeout(timer);
      root.removeAttribute(FADE_ATTRIBUTE);
    };
  }, [pathname]);

  return null;
}
