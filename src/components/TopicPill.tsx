import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopicPillProps {
  children: ReactNode;
  className?: string;
}

export function TopicPill({ children, className }: TopicPillProps) {
  return (
    <span
      className={cn(
        "surface-chip topic-pill tone-heading flex w-full items-center justify-center",
        className
      )}
    >
      {children}
    </span>
  );
}
