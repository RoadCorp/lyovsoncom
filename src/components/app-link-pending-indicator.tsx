"use client";

import { useLinkStatus } from "next/link";
import { cn } from "@/lib/utils";

interface AppLinkPendingIndicatorProps {
  className?: string;
}

export function AppLinkPendingIndicator({
  className,
}: AppLinkPendingIndicatorProps) {
  const { pending } = useLinkStatus();

  return (
    <>
      {pending ? <span className="sr-only">Loading page</span> : null}
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-0 transition-opacity duration-200",
          pending && "opacity-100",
          className
        )}
      />
    </>
  );
}
