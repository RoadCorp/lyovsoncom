"use client";

import type { ErrorInfo } from "next/error";

export default function FrontendError({ error, unstable_retry }: ErrorInfo) {
  return (
    <div className="surface-card col-start-1 g2:col-start-2 col-end-2 g2:col-end-3 g2:row-start-1 row-start-2 g2:row-end-3 row-end-4 flex min-h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="space-y-2">
        <h1 className="tone-heading font-bold text-2xl">
          Something went wrong
        </h1>
        <p className="tone-muted text-sm">
          {error.message || "The page failed to render."}
        </p>
      </div>
      <button
        className="ui-action-button ui-focus-ring ui-interactive"
        onClick={() => unstable_retry()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
