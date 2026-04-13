import type { ReactNode } from "react";
import { ViewTransition } from "react";
import { frontendViewTransitionClasses } from "@/utilities/view-transitions";

export default function FrontendTemplate({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ViewTransition
      default={frontendViewTransitionClasses.page.default}
      enter={frontendViewTransitionClasses.page.enter}
      exit={frontendViewTransitionClasses.page.exit}
    >
      {children}
    </ViewTransition>
  );
}
