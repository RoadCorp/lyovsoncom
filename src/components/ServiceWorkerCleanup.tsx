"use client";

import { useEffect } from "react";
import { cleanupLegacyBrowserState } from "@/utilities/legacy-browser-cleanup";

export function ServiceWorkerCleanup() {
  useEffect(() => {
    cleanupLegacyBrowserState().catch(() => {
      // Cleanup is best-effort and should never block rendering.
    });
  }, []);

  return null;
}
