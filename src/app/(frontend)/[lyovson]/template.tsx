import { type ReactNode, ViewTransition } from "react";
import { frontendViewTransitionClasses } from "@/utilities/view-transitions";

// Section content changes below the persistent author profile in layout.tsx.
export default function AuthorTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition {...frontendViewTransitionClasses.page}>
      {children}
    </ViewTransition>
  );
}
