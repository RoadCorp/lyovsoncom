import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TopicPillProps {
  children: ReactNode;
  className?: string;
}

export function TopicPill({ children, className }: TopicPillProps) {
  return <span className={cn("glass-topic-pill", className)}>{children}</span>;
}
