import { Children, isValidElement, type ReactNode } from "react";

const MAX_STAGGER_INDEX = 6;
const STAGGERED_ENTRANCE_ITEMS = 6;

function getStaggerClass(index: number): string {
  if (index >= STAGGERED_ENTRANCE_ITEMS) {
    return "reveal-none";
  }

  return `reveal-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

export const Grid = ({ children }: { children: ReactNode }) => {
  const childrenArray = Children.toArray(children);

  return (
    <main className="relative mx-auto grid min-h-screen g2:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)] g3:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g4:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g5:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g6:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] grid-cols-[minmax(0,clamp(18rem,100vw-2rem,var(--grid-card-1x1)))] place-items-center justify-center gap-[var(--grid-gap)] p-[var(--grid-gap)] g2:[grid-auto-rows:max-content]">
      {/* Theme-aware page ambience */}
      <div className="site-backdrop pointer-events-none fixed inset-0 -z-10" />
      <div className="site-spotlight pointer-events-none fixed inset-0 -z-10 opacity-30" />

      {/* Enhanced children with staggered entrance motion */}
      {Array.isArray(childrenArray)
        ? childrenArray.map((child, index) => {
            const childKey =
              isValidElement(child) && child.key != null
                ? String(child.key)
                : undefined;
            const fallbackKey =
              typeof child === "string" || typeof child === "number"
                ? `grid-child-${child}`
                : "grid-child";

            return (
              <div
                className={`${getStaggerClass(index)} contents`}
                key={childKey ?? fallbackKey}
              >
                {child}
              </div>
            );
          })
        : children}
    </main>
  );
};

export { GridCard, GridCardContent } from "./card";
export { GridCardActivityFull, GridCardActivityReview } from "./card/activity";
export { GridCardEmptyState } from "./card/empty-state";
export {
  GridCardHero,
  GridCardHeroActivity,
  GridCardHeroNote,
} from "./card/hero";
export { GridCardLyovsonSections } from "./card/lyovson-sections";
export { GridCardNav, GridCardNavItem } from "./card/nav";
export { GridCardNotFound } from "./card/not-found";
export { GridCardNoteFull } from "./card/note";
export { GridCardPostFull } from "./card/post";
export { GridCardProject, GridCardProjectHero } from "./card/project";
export { GridCardReferences } from "./card/references";
export { GridCardRelatedNotes, GridCardRelatedPosts } from "./card/related";
export { GridCardSection } from "./card/section";
export { GridCardSubscribe } from "./card/subscribe";
export { GridCardUser } from "./card/user";
export { GridCardUserSocial } from "./card/user-social";
export { SkeletonCard, SkeletonGrid } from "./skeleton";
