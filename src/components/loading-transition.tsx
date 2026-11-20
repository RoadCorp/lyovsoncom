import type { ReactNode } from "react";
import { ViewTransition } from "react";

export function LoadingTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="vt-enter" exit="vt-exit">
      {children}
    </ViewTransition>
  );
}
