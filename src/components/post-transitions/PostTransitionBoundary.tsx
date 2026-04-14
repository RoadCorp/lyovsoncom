"use client";

import type { ReactNode } from "react";
import { ViewTransition, type ViewTransitionInstance } from "react";
import { transitionTypes } from "@/utilities/routes";
import {
  frontendViewTransitionClasses,
  getPostMediaTransitionName,
  getPostTitleTransitionName,
} from "@/utilities/view-transitions";

const POST_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";
const POST_MEDIA_EXIT_DURATION_MS = 360;
const POST_MEDIA_ENTER_DURATION_MS = 420;
const POST_TITLE_EXIT_DURATION_MS = 220;
const POST_TITLE_ENTER_DURATION_MS = 300;

interface ViewTransitionAnimateTarget {
  animate: (
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ) => Animation;
}

type ViewTransitionRuntimeInstance = ViewTransitionInstance & {
  new?: ViewTransitionAnimateTarget;
  old?: ViewTransitionAnimateTarget;
};

type PostTransitionVariant =
  | "body"
  | "cardShell"
  | "dek"
  | "heroShell"
  | "media"
  | "rail"
  | "title";

interface PostTransitionBoundaryProps {
  children: ReactNode;
  slug?: string;
  variant: PostTransitionVariant;
}

function hasPostDrillIn(types: string[]) {
  return types.includes(transitionTypes.postDrillIn);
}

function shouldSkipJsTransition(types: string[]) {
  return (
    !hasPostDrillIn(types) ||
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getPseudoElementName(name: string, kind: "new" | "old") {
  const escapedName = typeof CSS === "undefined" ? name : CSS.escape(name);
  return `::view-transition-${kind}(${escapedName})`;
}

function animateFallbackPseudoElement(
  pseudoElementName: string,
  keyframes: Keyframe[],
  duration: number
) {
  try {
    return document.documentElement.animate(keyframes, {
      duration,
      easing: POST_EASING,
      fill: "both",
      pseudoElement: pseudoElementName,
    });
  } catch {
    return null;
  }
}

function animateTransitionTarget(
  instance: ViewTransitionInstance,
  kind: "new" | "old",
  keyframes: Keyframe[],
  duration: number
) {
  const target = (instance as ViewTransitionRuntimeInstance)[kind];

  if (target) {
    try {
      return target.animate(keyframes, {
        duration,
        easing: POST_EASING,
        fill: "both",
      });
    } catch {
      return animateFallbackPseudoElement(
        getPseudoElementName(instance.name, kind),
        keyframes,
        duration
      );
    }
  }

  return animateFallbackPseudoElement(
    getPseudoElementName(instance.name, kind),
    keyframes,
    duration
  );
}

function animatePostMediaShare(
  instance: ViewTransitionInstance,
  types: string[]
) {
  if (shouldSkipJsTransition(types)) {
    return;
  }

  const oldAnimation = animateTransitionTarget(
    instance,
    "old",
    [
      { opacity: 1, transform: "scale(1)" },
      { opacity: 0.82, transform: "scale(0.985)" },
    ],
    POST_MEDIA_EXIT_DURATION_MS
  );

  const newAnimation = animateTransitionTarget(
    instance,
    "new",
    [
      { opacity: 0.72, transform: "scale(1.035)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    POST_MEDIA_ENTER_DURATION_MS
  );

  return () => {
    oldAnimation?.cancel();
    newAnimation?.cancel();
  };
}

function animatePostTitleShare(
  instance: ViewTransitionInstance,
  types: string[]
) {
  if (shouldSkipJsTransition(types)) {
    return;
  }

  const oldAnimation = animateTransitionTarget(
    instance,
    "old",
    [
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-6px)" },
    ],
    POST_TITLE_EXIT_DURATION_MS
  );

  const newAnimation = animateTransitionTarget(
    instance,
    "new",
    [
      { opacity: 0, transform: "translateY(8px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    POST_TITLE_ENTER_DURATION_MS
  );

  return () => {
    oldAnimation?.cancel();
    newAnimation?.cancel();
  };
}

export function PostTransitionBoundary({
  children,
  slug,
  variant,
}: PostTransitionBoundaryProps) {
  if (variant === "media") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.sharedMedia.default}
        name={slug ? getPostMediaTransitionName(slug) : "auto"}
        onShare={animatePostMediaShare}
        share={frontendViewTransitionClasses.sharedMedia.share}
      >
        {children}
      </ViewTransition>
    );
  }

  if (variant === "title") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.sharedTitle.default}
        name={slug ? getPostTitleTransitionName(slug) : "auto"}
        onShare={animatePostTitleShare}
        share={frontendViewTransitionClasses.sharedTitle.share}
      >
        {children}
      </ViewTransition>
    );
  }

  if (variant === "cardShell") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.postCardShell.default}
        exit={frontendViewTransitionClasses.postCardShell.exit}
      >
        {children}
      </ViewTransition>
    );
  }

  if (variant === "heroShell") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.postHeroShell.default}
        enter={frontendViewTransitionClasses.postHeroShell.enter}
      >
        {children}
      </ViewTransition>
    );
  }

  if (variant === "dek") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.postDek.default}
        enter={frontendViewTransitionClasses.postDek.enter}
      >
        {children}
      </ViewTransition>
    );
  }

  if (variant === "body") {
    return (
      <ViewTransition
        default={frontendViewTransitionClasses.postBody.default}
        enter={frontendViewTransitionClasses.postBody.enter}
      >
        {children}
      </ViewTransition>
    );
  }

  return (
    <ViewTransition
      default={frontendViewTransitionClasses.postRail.default}
      enter={frontendViewTransitionClasses.postRail.enter}
    >
      {children}
    </ViewTransition>
  );
}
