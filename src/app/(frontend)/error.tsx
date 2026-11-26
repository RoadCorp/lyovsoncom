"use client";

import type { ErrorInfo } from "next/error";
import { GRID_SLOTS } from "@/components/grid/layout";
import { CornerKnots, EternityKnot } from "@/components/ornaments";
import { cn } from "@/lib/utils";

export default function FrontendError({ error, retry }: ErrorInfo) {
  return (
    <div
      className={cn(
        "surface-card flex flex-col items-center justify-center gap-5 p-8 text-center",
        GRID_SLOTS.hero
      )}
    >
      <CornerKnots inset="sm" variant="triquetra" />
      <EternityKnot className="ornament-accent relative z-1" size={24} />
      <div className="relative z-1 space-y-2">
        <h1 className="tone-heading text-2xl font-bold">
          Something went wrong
        </h1>
        <p className="tone-muted text-sm">
          {error instanceof Error && error.message
            ? error.message
            : "The page failed to render."}
        </p>
      </div>
      <button
        className="ui-action-button ui-focus-ring ui-interactive relative z-1"
        onClick={retry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
