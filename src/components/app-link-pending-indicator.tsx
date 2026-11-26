"use client";

import { useLinkStatus } from "next/link";
import { ApexLozenge } from "@/components/ornaments";
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
          "ornament-pending inline-flex shrink-0 items-center justify-center opacity-0 transition-opacity duration-200",
          pending && "ornament-pending-active opacity-100",
          className
        )}
      >
        <ApexLozenge size={10} />
      </span>
    </>
  );
}
