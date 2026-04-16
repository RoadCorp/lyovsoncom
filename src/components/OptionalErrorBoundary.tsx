"use client";

import type { ErrorInfo } from "next/error";
import { unstable_catchError } from "next/error";
import type { ReactNode } from "react";

function OptionalErrorBoundaryImpl(
  props: {
    children: ReactNode;
    title?: string;
  },
  { unstable_retry }: ErrorInfo
) {
  const title = props.title || "Unable to load this section right now.";

  return (
    <div className="surface-panel flex h-[var(--grid-card-1x1)] w-[var(--grid-card-1x1)] flex-col items-center justify-center gap-4 rounded-xl p-6 text-center">
      <p className="tone-muted text-sm">{title}</p>
      <button
        className="ui-action-button ui-focus-ring ui-interactive"
        onClick={() => unstable_retry()}
        type="button"
      >
        Retry
      </button>
    </div>
  );
}

export const OptionalErrorBoundary = unstable_catchError(
  OptionalErrorBoundaryImpl
);
