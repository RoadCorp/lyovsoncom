import { type ReactNode, ViewTransition } from "react";

export function LoadingTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="none" enter="vt-enter" exit="vt-exit">
      {children}
    </ViewTransition>
  );
}
