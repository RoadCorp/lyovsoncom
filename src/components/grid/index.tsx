import type { ReactNode } from "react";

export const Grid = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {/* Theme-aware page ambience */}
      <div className="site-backdrop pointer-events-none fixed inset-0 -z-10" />
      <div className="site-spotlight pointer-events-none fixed inset-0 -z-10 opacity-30" />

      <main className="relative mx-auto grid min-h-screen g2:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)] g3:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g4:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g5:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] g6:grid-cols-[var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)_var(--grid-card-1x1)] grid-cols-[minmax(0,min(100%,var(--grid-card-1x1)))] place-items-center justify-center gap-[var(--grid-gap)] p-[var(--grid-gap)] [container-type:inline-size] g2:[grid-auto-rows:max-content]">
        {children}
      </main>
    </>
  );
};

export { GridCard, GridCardContent } from "./card";
export {
  ACTIVITIES_PREVIEW_PAGINATION_CLASS_NAME,
  GridCardActivitiesPreview,
  GridCardActivityFull,
  GridCardActivityReview,
  HOME_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
  LYOVSON_ACTIVITIES_PREVIEW_RAIL_CLASS_NAME,
} from "./card/activity";
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
