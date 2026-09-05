import { type ReactNode, ViewTransition } from "react";
import {
  frontendViewTransitionClasses,
  getPostMediaTransitionName,
  getPostTitleTransitionName,
} from "@/utilities/view-transitions";

interface PostTransitionBoundaryProps {
  children: ReactNode;
  slug?: string;
  variant:
    | "body"
    | "cardShell"
    | "dek"
    | "heroShell"
    | "media"
    | "rail"
    | "title";
}

export function PostTransitionBoundary({
  children,
  slug,
  variant,
}: PostTransitionBoundaryProps) {
  if (variant === "media" || variant === "title") {
    const getName =
      variant === "media"
        ? getPostMediaTransitionName
        : getPostTitleTransitionName;
    const name = slug ? getName(slug) : "auto";
    return (
      <ViewTransition
        name={name}
        {...(variant === "media"
          ? frontendViewTransitionClasses.sharedMedia
          : frontendViewTransitionClasses.sharedTitle)}
      >
        {children}
      </ViewTransition>
    );
  }

  // Card frames and the dek already participate through their surrounding boundary.
  if (variant === "cardShell" || variant === "dek") {
    return children;
  }

  return (
    <ViewTransition {...frontendViewTransitionClasses.reveal}>
      {children}
    </ViewTransition>
  );
}
