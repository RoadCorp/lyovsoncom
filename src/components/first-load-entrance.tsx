"use client";

import { useEffect } from "react";

const ENTERED_ATTRIBUTE = "data-entered";
// The last of the six staggered cards finishes at 150ms + 340ms.
const ENTRANCE_MS = 520;

/**
 * The first cards rise in on a full page load only (globals.css scopes the
 * animation to `:root:not([data-entered])`). Marking the document as
 * entered stops cards that arrive later by client navigation from
 * animating again.
 */
export function FirstLoadEntrance() {
  useEffect(() => {
    const timer = window.setTimeout(
      () => document.documentElement.setAttribute(ENTERED_ATTRIBUTE, ""),
      ENTRANCE_MS
    );
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
